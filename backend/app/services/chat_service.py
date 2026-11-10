from fastapi.concurrency import run_in_threadpool

from app.schemas.chat import LLMAnswer
from app.services.citation_service import CitationValidationError, assign_evidence_references, source_reference_map, validate_citations
from app.services.context_service import build_context
from app.services.embedding_services import generate_query_embedding
from app.services.llm_service import generate_answer
from app.services.qdrant_services import search_chunks
from app.services.supabase_repository_service import ensure_owned_documents

NO_CONTEXT_ANSWER = "I could not find relevant information in the uploaded documents."


async def answer_question(query: str, user_id: str, document_ids: list[str] | None = None, limit: int = 5) -> dict:
    """Run one retrieval/context pass, then generate an answer with verified citations."""
    clean_query = query.strip()
    if not clean_query:
        raise ValueError("Query cannot be empty")
    if document_ids:
        await ensure_owned_documents(user_id, document_ids)
    query_vector = await run_in_threadpool(generate_query_embedding, clean_query)
    chunks = await run_in_threadpool(search_chunks, query_vector, user_id, limit, document_ids)
    if not chunks:
        return _no_context_response(clean_query)
    evidence = assign_evidence_references(chunks)
    context_result = await run_in_threadpool(build_context, clean_query, chunks, 12_000, source_reference_map(evidence))
    if not context_result["context"] or not context_result["sources"]:
        return _no_context_response(clean_query)
    for attempt in range(2):
        answer = await generate_answer(
            context_result["question"], context_result["context"], evidence,
            correction=("Use only valid source refs and cite every answerable claim." if attempt else None),
        )
        try:
            sources = validate_citations(answer.cited_source_refs, evidence, answer.answerable)
            return _response(clean_query, answer, sources)
        except CitationValidationError:
            if attempt:
                raise
    raise CitationValidationError("LLM returned invalid citations")


def _no_context_response(query: str) -> dict:
    return {"success": True, "query": query, "answer": NO_CONTEXT_ANSWER, "answerable": False, "sources": []}


def _response(query: str, answer: LLMAnswer, sources: list[dict]) -> dict:
    return {"success": True, "query": query, "answer": answer.answer, "answerable": answer.answerable, "sources": sources}
