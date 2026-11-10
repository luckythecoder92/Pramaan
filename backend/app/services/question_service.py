from app.services.context_service import build_context
from app.services.embedding_services import generate_query_embedding
from app.services.qdrant_services import search_chunks


def process_question(question: str, document_id: str | None = None, limit: int = 5):
    """Retrieve relevant chunks once and build the bounded context for an LLM."""
    query_vector = generate_query_embedding(question)
    chunks = search_chunks(query_vector, limit=limit, document_id=document_id)
    context_result = build_context(question, chunks)
    return {
        "success": True,
        "question": context_result["question"],
        "context": context_result["context"],
        "sources": context_result["sources"],
        "chunks_used": context_result["chunks_used"],
        "message": "Context is ready for LLM answer generation",
    }
