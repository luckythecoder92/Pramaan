"""Evaluate Pramaan retrieval for typed and spoken questions.

The script reuses the same embedding + Qdrant retrieval path as the chat
endpoint, and the same Gnani Prisma STT client as the voice endpoint.

Input
-----
questions.json (a JSON list, or {"questions": [...]}):

    [
      {
        "question": "What is the candidate's name?",
        "correct_doc_id": "bc247246-be71-4a6f-ab8d-986c236b7c39",
        "audio_file": "1.wav"
      }
    ]

`audio_file` is optional. Without it, the script looks in the audio directory
for a file whose stem matches the entry's `id`, its 1-based position, or a
`question_<n>` / `q<n>` variant. Supported extensions: .wav, .mp3, .m4a,
.webm, .ogg, .flac, .mp4.

Metric
------
By default, hit@k is measured over unique documents: retrieved chunks are
de-duplicated by document_id and the first k documents are compared with
`correct_doc_id`. Use `--granularity chunk` to score the raw top-k chunks
instead.

Usage (from the repository root, using the root virtualenv):
    .venv\\Scripts\\python.exe backend\\scripts\\eval_retrieval.py
    .venv\\Scripts\\python.exe backend\\scripts\\eval_retrieval.py ^
        --questions backend\\questions.json --audio-dir backend\\audio

The script derives the owning user from `correct_doc_id` via Supabase. Pass
`--user-id` to override that lookup.
"""

from __future__ import annotations

import argparse
import asyncio
import json
import sys
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

SCRIPT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = SCRIPT_DIR.parent

if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from dotenv import load_dotenv

load_dotenv(BACKEND_DIR / ".env")

from app.services.embedding_services import generate_query_embedding
from app.services.qdrant_services import search_chunks
from app.services.supabase_service import get_admin_client
from app.services.voice_service import transcribe_audio

AUDIO_EXTENSIONS = {".wav", ".mp3", ".m4a", ".webm", ".ogg", ".flac", ".mp4"}


@dataclass
class Question:
    index: int
    text: str
    correct_doc_id: str
    audio_path: Path | None = None
    audio_missing_reason: str | None = None


@dataclass
class TypedResult:
    index: int
    question: str
    correct_doc_id: str
    retrieved_docs: list[str] = field(default_factory=list)
    hit: bool = False
    error: str | None = None


@dataclass
class SpokenResult:
    index: int
    question: str
    correct_doc_id: str
    transcript: str = ""
    retrieved_docs: list[str] = field(default_factory=list)
    hit: bool = False
    error: str | None = None
    audio_path: Path | None = None


def load_questions(path: Path) -> list[dict[str, Any]]:
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError as error:
        raise SystemExit(f"Questions file not found: {path}") from error
    except json.JSONDecodeError as error:
        raise SystemExit(f"Questions file is not valid JSON: {path}\n{error}") from error

    if isinstance(payload, dict):
        payload = payload.get("questions", payload.get("items"))

    if not isinstance(payload, list):
        raise SystemExit(
            "questions.json must be a list, or an object with a 'questions' list."
        )

    entries: list[dict[str, Any]] = []
    for position, raw in enumerate(payload, start=1):
        if not isinstance(raw, dict):
            raise SystemExit(f"Question #{position} must be an object.")

        question = raw.get("question")
        correct_doc_id = raw.get("correct_doc_id")

        if not isinstance(question, str) or not question.strip():
            raise SystemExit(f"Question #{position} is missing a non-empty 'question'.")
        if not isinstance(correct_doc_id, str) or not correct_doc_id.strip():
            raise SystemExit(
                f"Question #{position} is missing a non-empty 'correct_doc_id'."
            )

        entries.append(raw)

    if not entries:
        raise SystemExit("questions.json contains no questions.")

    return entries


def resolve_audio(
    entry: dict[str, Any],
    index: int,
    questions_dir: Path,
    audio_dir: Path,
) -> tuple[Path | None, str | None]:
    if not audio_dir.is_dir():
        return None, f"audio directory not found: {audio_dir}"

    audio_files = {
        file.stem.lower(): file
        for file in audio_dir.iterdir()
        if file.is_file() and file.suffix.lower() in AUDIO_EXTENSIONS
    }

    raw_audio = entry.get("audio_file")
    if isinstance(raw_audio, str) and raw_audio.strip():
        candidate = Path(raw_audio.strip())
        candidates = (
            [candidate]
            if candidate.is_absolute()
            else [
                questions_dir / candidate,
                audio_dir / candidate,
                audio_dir / candidate.name,
            ]
        )

        for path in candidates:
            if path.is_file() and path.suffix.lower() in AUDIO_EXTENSIONS:
                return path, None

        by_name = audio_files.get(candidate.stem.lower())
        if by_name is not None:
            return by_name, None

        return None, f"audio_file not found: {raw_audio}"

    stems = [
        entry.get("audio_id"),
        entry.get("id"),
        index,
        f"{index:02d}",
        f"question_{index}",
        f"question{index}",
        f"q{index}",
    ]

    for stem in stems:
        if stem is None:
            continue

        match = audio_files.get(str(stem).lower())
        if match is not None:
            return match, None

    return None, (
        "no audio file matched; add 'audio_file' or name files "
        f"1.wav / question_1.wav in {audio_dir}"
    )


def load_document_rows(document_ids: list[str]) -> dict[str, dict[str, Any]]:
    if not document_ids:
        return {}

    try:
        response = (
            get_admin_client()
            .table("documents")
            .select("id,user_id,filename,status,chunk_count")
            .in_("id", document_ids)
            .execute()
        )
    except Exception as error:  # noqa: BLE001 - surfaced as a warning, not fatal
        print(f"Warning: document metadata could not be loaded: {error}")
        return {}

    return {row["id"]: row for row in response.data if row.get("id")}


def retrieve_documents(
    query: str,
    user_id: str,
    top_k: int,
    scan_limit: int,
    granularity: str,
) -> list[str]:
    vector = generate_query_embedding(query)
    results = search_chunks(vector, user_id, limit=scan_limit)

    if granularity == "chunk":
        return [
            source["document_id"]
            for source in results[:top_k]
            if source.get("document_id")
        ]

    seen: list[str] = []
    for source in results:
        document_id = source.get("document_id")
        if not document_id or document_id in seen:
            continue

        seen.append(document_id)
        if len(seen) == top_k:
            break

    return seen


def is_rate_limit_error(error: Exception) -> bool:
    name = type(error).__name__.lower()
    message = str(error).lower()
    return "ratelimit" in name or "rate limit" in message or "429" in message


async def retrieve_with_retry(
    query: str,
    user_id: str,
    top_k: int,
    scan_limit: int,
    granularity: str,
    retries: int,
    retry_wait: float,
) -> list[str]:
    for attempt in range(retries + 1):
        try:
            return await asyncio.to_thread(
                retrieve_documents,
                query,
                user_id,
                top_k,
                scan_limit,
                granularity,
            )
        except Exception as error:  # noqa: BLE001 - rate limits are retried, others surface
            if attempt >= retries or not is_rate_limit_error(error):
                raise

            wait = retry_wait * (2**attempt)
            print(
                f"      provider rate limit; retrying in {wait:.0f}s "
                f"({attempt + 1}/{retries})...",
                flush=True,
            )
            await asyncio.sleep(wait)

    raise RuntimeError("unreachable")


def resolve_user_id(
    document_id: str,
    document_rows: dict[str, dict[str, Any]],
    override: str | None,
) -> str:
    if override:
        return override

    row = document_rows.get(document_id)
    if row and row.get("user_id"):
        return str(row["user_id"])

    raise LookupError(
        f"could not derive user_id for document {document_id}; "
        "pass --user-id or make sure the document still exists"
    )


def display_document(document_id: str, document_rows: dict[str, dict[str, Any]]) -> str:
    filename = document_rows.get(document_id, {}).get("filename")
    return f"{filename} ({document_id[:8]})" if filename else document_id


def format_percent(hits: int, total: int) -> str:
    if total == 0:
        return "n/a (0 evaluated)"
    return f"{hits}/{total} = {hits / total * 100:.1f}%"


def collapse(text: str) -> str:
    return " ".join(str(text).split())


def truncate(text: str, width: int) -> str:
    text = collapse(text)
    if width <= 0:
        return ""
    if len(text) <= width:
        return text
    return text[: max(width - 3, 0)] + "..."


def render_table(
    headers: list[str],
    rows: list[list[str]],
    max_widths: list[int],
) -> str:
    if not rows:
        return "(none)"

    truncated_rows = [
        [truncate(cell, width) for cell, width in zip(row, max_widths)]
        for row in rows
    ]

    widths = [
        min(
            max([len(headers[column])] + [len(row[column]) for row in truncated_rows]),
            max_widths[column],
        )
        for column in range(len(headers))
    ]

    def border() -> str:
        return "+" + "+".join("-" * (width + 2) for width in widths) + "+"

    def render_row(values: list[str]) -> str:
        cells = [
            f" {truncate(value, width):<{width}} "
            for value, width in zip(values, widths)
        ]
        return "|" + "|".join(cells) + "|"

    lines = [border(), render_row(headers), border()]
    lines.extend(render_row(row) for row in truncated_rows)
    lines.append(border())
    return "\n".join(lines)


async def run(args: argparse.Namespace) -> int:
    questions_path = Path(args.questions).expanduser()
    if not questions_path.is_absolute():
        questions_path = (Path.cwd() / questions_path).resolve()

    audio_dir = Path(args.audio_dir).expanduser()
    if not audio_dir.is_absolute():
        audio_dir = (questions_path.parent / audio_dir).resolve()

    raw_entries = load_questions(questions_path)
    document_ids = sorted(
        {
            str(entry["correct_doc_id"]).strip()
            for entry in raw_entries
            if str(entry.get("correct_doc_id", "")).strip()
        }
    )
    document_rows = load_document_rows(document_ids)

    if not document_rows:
        print(
            "Warning: no document metadata was resolved. Document names will be "
            "shown as IDs; pass --user-id if the Supabase lookup is unavailable."
        )

    questions: list[Question] = []
    for index, entry in enumerate(raw_entries, start=1):
        audio_path, audio_reason = resolve_audio(
            entry, index, questions_path.parent, audio_dir
        )
        questions.append(
            Question(
                index=index,
                text=str(entry["question"]).strip(),
                correct_doc_id=str(entry["correct_doc_id"]).strip(),
                audio_path=audio_path,
                audio_missing_reason=audio_reason,
            )
        )

    top_k = args.top_k
    retrieval_limit = (
        top_k if args.granularity == "chunk" else max(args.scan_limit, top_k)
    )

    print(f"Questions file : {questions_path}")
    print(f"Audio directory: {audio_dir}")
    print(
        f"Metric         : hit@{top_k} over "
        f"{'raw chunks' if args.granularity == 'chunk' else 'unique documents'}"
        f" (scanning {retrieval_limit} chunks per query)"
    )
    print()

    typed_results: list[TypedResult] = []
    print("Typed retrieval")
    for question in questions:
        try:
            user_id = resolve_user_id(
                question.correct_doc_id, document_rows, args.user_id
            )
            retrieved = await retrieve_with_retry(
                question.text,
                user_id,
                top_k,
                retrieval_limit,
                args.granularity,
                args.retries,
                args.retry_wait,
            )
            hit = question.correct_doc_id in retrieved
            result = TypedResult(
                index=question.index,
                question=question.text,
                correct_doc_id=question.correct_doc_id,
                retrieved_docs=retrieved,
                hit=hit,
            )
        except Exception as error:  # noqa: BLE001 - one failure must not stop the run
            result = TypedResult(
                index=question.index,
                question=question.text,
                correct_doc_id=question.correct_doc_id,
                error=f"{type(error).__name__}: {error}",
            )

        typed_results.append(result)
        marker = "HIT " if result.hit else "MISS"
        detail = (
            f" -> {', '.join(result.retrieved_docs)}"
            if result.retrieved_docs
            else ""
        )
        if result.error:
            detail = f" !! {result.error}"
        print(f"  [{result.index}/{len(questions)}] {marker} {question.text}{detail}")

        if args.delay > 0:
            await asyncio.sleep(args.delay)

    typed_evaluated = [result for result in typed_results if result.error is None]
    typed_hits = sum(result.hit for result in typed_evaluated)
    typed_errors = len(typed_results) - len(typed_evaluated)
    print()
    print(f"Typed hit@{top_k}: {format_percent(typed_hits, len(typed_evaluated))}")
    if typed_errors:
        print(f"Typed errors (excluded from rate): {typed_errors}")
    print()

    spoken_results: list[SpokenResult] = []
    skipped_audio: list[Question] = []
    spoken_evaluated: list[SpokenResult] = []
    spoken_hits = 0
    spoken_errors = 0

    if args.skip_spoken:
        print("Spoken retrieval skipped (--skip-spoken).")
    else:
        print("Spoken retrieval (Gnani Prisma STT)")
        for question in questions:
            if question.audio_path is None:
                skipped_audio.append(question)
                print(
                    f"  [{question.index}/{len(questions)}] SKIP {question.text}"
                    f" !! {question.audio_missing_reason}"
                )
                continue

            result = SpokenResult(
                index=question.index,
                question=question.text,
                correct_doc_id=question.correct_doc_id,
                audio_path=question.audio_path,
            )

            try:
                result.transcript = await asyncio.wait_for(
                    transcribe_audio(str(question.audio_path), language=args.language),
                    timeout=args.stt_timeout,
                )
            except Exception as error:  # noqa: BLE001 - recorded as a miss
                result.error = f"STT failed: {type(error).__name__}: {error}"
                spoken_results.append(result)
                print(
                    f"  [{question.index}/{len(questions)}] MISS {question.text}"
                    f" !! {result.error}"
                )
                continue

            try:
                user_id = resolve_user_id(
                    question.correct_doc_id, document_rows, args.user_id
                )
                result.retrieved_docs = await retrieve_with_retry(
                    result.transcript,
                    user_id,
                    top_k,
                    retrieval_limit,
                    args.granularity,
                    args.retries,
                    args.retry_wait,
                )
                result.hit = question.correct_doc_id in result.retrieved_docs
            except Exception as error:  # noqa: BLE001 - recorded as an error
                result.error = f"Retrieval failed: {type(error).__name__}: {error}"

            spoken_results.append(result)
            marker = "HIT " if result.hit else "MISS"
            detail = (
                f" -> {', '.join(result.retrieved_docs)}"
                if result.retrieved_docs
                else ""
            )
            if result.error:
                detail = f" !! {result.error}"
            print(
                f'  [{question.index}/{len(questions)}] {marker} "{result.transcript}"{detail}'
            )

            if args.delay > 0:
                await asyncio.sleep(args.delay)

        spoken_evaluated = [
            result for result in spoken_results if result.error is None
        ]
        spoken_hits = sum(result.hit for result in spoken_evaluated)
        spoken_errors = len(spoken_results) - len(spoken_evaluated)
        print()
        print(
            f"Spoken hit@{top_k}: "
            f"{format_percent(spoken_hits, len(spoken_evaluated))}"
        )
        if skipped_audio:
            print(f"Spoken skipped (no audio): {len(skipped_audio)}")
        if spoken_errors:
            print(f"Spoken errors (excluded from rate): {spoken_errors}")
        print()

        misses = [
            result for result in spoken_evaluated if not result.hit
        ]
        print(f"Missed spoken questions ({len(misses)})")
        table_rows = [
            [
                str(result.index),
                result.question,
                result.transcript or "(empty transcript)",
                display_document(result.correct_doc_id, document_rows),
                ", ".join(
                    display_document(document_id, document_rows)
                    for document_id in result.retrieved_docs
                )
                or "(no results)",
            ]
            for result in misses
        ]
        print(
            render_table(
                ["#", "Question", "Transcript", "Expected doc", f"Top {top_k} retrieved"],
                table_rows,
                [4, 42, 58, 34, 58],
            )
        )

        if spoken_errors:
            print()
            print("Spoken questions with errors (not scored)")
            for result in spoken_results:
                if result.error:
                    print(
                        f"  #{result.index} {result.question}\n"
                        f"      {result.error}"
                    )

    if args.json_out:
        payload = {
            "top_k": top_k,
            "granularity": args.granularity,
            "typed": {
                "hits": typed_hits,
                "evaluated": len(typed_evaluated),
                "total": len(typed_results),
                "errors": typed_errors,
                "items": [
                    {
                        "index": result.index,
                        "question": result.question,
                        "correct_doc_id": result.correct_doc_id,
                        "retrieved_doc_ids": result.retrieved_docs,
                        "hit": result.hit,
                        "error": result.error,
                    }
                    for result in typed_results
                ],
            },
            "spoken": {
                "hits": spoken_hits,
                "evaluated": len(spoken_evaluated),
                "total": len(spoken_results),
                "errors": spoken_errors,
                "skipped_without_audio": [question.index for question in skipped_audio],
                "items": [
                    {
                        "index": result.index,
                        "question": result.question,
                        "transcript": result.transcript,
                        "correct_doc_id": result.correct_doc_id,
                        "retrieved_doc_ids": result.retrieved_docs,
                        "hit": result.hit,
                        "error": result.error,
                        "audio_file": str(result.audio_path)
                        if result.audio_path
                        else None,
                    }
                    for result in spoken_results
                ],
            },
        }
        output_path = Path(args.json_out).expanduser()
        if not output_path.is_absolute():
            output_path = (Path.cwd() / output_path).resolve()
        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_text(
            json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8"
        )
        print()
        print(f"Wrote JSON results: {output_path}")

    if skipped_audio and not args.skip_spoken:
        print()
        print("Questions without audio:")
        for question in skipped_audio:
            print(f"  #{question.index}: {question.audio_missing_reason}")

    return 0


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Measure top-k retrieval hit rate for typed questions and for spoken "
            "questions transcribed with Gnani Prisma STT."
        ),
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument(
        "--questions",
        default=str(BACKEND_DIR / "questions.json"),
        help="Path to questions.json.",
    )
    parser.add_argument(
        "--audio-dir",
        default="audio",
        help="Audio directory. Relative paths resolve against the questions file.",
    )
    parser.add_argument(
        "--top-k",
        type=int,
        default=3,
        help="Number of documents (or chunks) used for the hit rate.",
    )
    parser.add_argument(
        "--scan-limit",
        type=int,
        default=15,
        help=(
            "Chunks retrieved per query before de-duplicating documents. "
            "Ignored with --granularity chunk."
        ),
    )
    parser.add_argument(
        "--granularity",
        choices=("document", "chunk"),
        default="document",
        help="Score unique documents or the raw top-k chunks.",
    )
    parser.add_argument(
        "--user-id",
        default=None,
        help="Override the user_id derived from correct_doc_id.",
    )
    parser.add_argument(
        "--delay",
        type=float,
        default=0.0,
        help=(
            "Seconds to wait between queries. Use ~21s to stay under Voyage's "
            "free-tier 3 requests/minute limit."
        ),
    )
    parser.add_argument(
        "--retries",
        type=int,
        default=2,
        help="Retries for provider rate-limit errors.",
    )
    parser.add_argument(
        "--retry-wait",
        type=float,
        default=20.0,
        help="Base seconds between rate-limit retries (doubles each attempt).",
    )
    parser.add_argument(
        "--language",
        default=None,
        help="Gnani STT language code (default: backend GNANI_STT_LANGUAGE).",
    )
    parser.add_argument(
        "--stt-timeout",
        type=float,
        default=120.0,
        help="Seconds to wait for one transcription.",
    )
    parser.add_argument(
        "--skip-spoken",
        action="store_true",
        help="Only evaluate typed questions.",
    )
    parser.add_argument(
        "--json-out",
        default=None,
        help="Optional path for a JSON report with transcripts and retrieved IDs.",
    )

    args = parser.parse_args()

    if args.top_k < 1:
        parser.error("--top-k must be at least 1")
    if args.scan_limit < args.top_k:
        parser.error("--scan-limit must be greater than or equal to --top-k")
    if args.stt_timeout <= 0:
        parser.error("--stt-timeout must be greater than zero")
    if args.delay < 0:
        parser.error("--delay cannot be negative")
    if args.retries < 0:
        parser.error("--retries cannot be negative")
    if args.retry_wait <= 0:
        parser.error("--retry-wait must be greater than zero")

    return args


def main() -> int:
    try:
        return asyncio.run(run(parse_args()))
    except KeyboardInterrupt:
        print("\nInterrupted.")
        return 130


if __name__ == "__main__":
    raise SystemExit(main())
