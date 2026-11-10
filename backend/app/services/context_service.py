import re
from collections.abc import Mapping, Sequence
from typing import Any

MAX_CONTEXT_CHARACTERS = 12_000
MAX_CHUNK_CHARACTERS = 2_500


def _clean_text(value: object, maximum: int) -> str:
    """Normalize retrieved text before it is placed in an LLM prompt."""
    text = str(value or "")
    text = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", " ", text)
    return re.sub(r"\s+", " ", text).strip()[:maximum]


def build_context(
    question: str,
    chunks: Sequence[dict[str, Any]],
    max_characters: int = MAX_CONTEXT_CHARACTERS,
    source_references: Mapping[tuple[object, object, object], str] | None = None,
) -> dict[str, Any]:
    """Format retrieved chunks as bounded, cited context for a future LLM request.

    The question and document text are deliberately kept as separate labelled fields.
    This makes later prompt construction explicit and prevents oversized retrieved
    content from consuming an unbounded amount of model context.
    """
    clean_question = _clean_text(question, 2_000)
    if not clean_question:
        raise ValueError("Question cannot be empty")
    if max_characters < 1:
        raise ValueError("max_characters must be greater than zero")

    remaining = max_characters
    context_blocks: list[str] = []
    sources: list[dict[str, Any]] = []
    seen_sources: set[tuple[object, object, object]] = set()

    for chunk in chunks:
        text = _clean_text(chunk.get("text"), min(MAX_CHUNK_CHARACTERS, remaining))
        if not text:
            continue
        document_id = chunk.get("document_id")
        page_number = chunk.get("page_number")
        chunk_index = chunk.get("chunk_index")
        source_key = (document_id, page_number, chunk_index)
        source_reference = source_references.get(source_key) if source_references else None
        reference_part = f"Source: {source_reference} | " if source_reference else ""
        header = f"[{reference_part}Document: {document_id or 'unknown'} | Page: {page_number or 'unknown'} | Chunk: {chunk_index if chunk_index is not None else 'unknown'}]"
        block = f"{header}\n{text}"
        if len(block) > remaining:
            break
        context_blocks.append(block)
        remaining -= len(block)

        if source_key not in seen_sources:
            source = {
                "document_id": document_id,
                "page_number": page_number,
                "chunk_index": chunk_index,
                "score": chunk.get("score"),
            }
            if source_reference:
                source["source_ref"] = source_reference
            sources.append(source)
            seen_sources.add(source_key)

    return {
        "question": clean_question,
        "context": "\n\n---\n\n".join(context_blocks),
        "sources": sources,
        "chunks_used": len(context_blocks),
    }
