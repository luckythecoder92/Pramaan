from fastapi import APIRouter, Depends, HTTPException

from app.schemas.search import SearchRequest
from app.services.embedding_services import generate_query_embedding
from app.services.qdrant_services import search_chunks
from app.services.auth_service import get_current_user
from app.services.supabase_repository_service import ensure_owned_documents

router = APIRouter(prefix="/api/v1", tags=["search"])


@router.post("/search")
async def semantic_search(data: SearchRequest, current_user: dict = Depends(get_current_user)):
    query = data.query.strip()
    if not query:
        raise HTTPException(status_code=422, detail="Query cannot be empty")
    try:
        if data.document_ids:
            await ensure_owned_documents(current_user["id"], data.document_ids)
        query_vector = generate_query_embedding(query)
        results = search_chunks(query_vector, current_user["id"], limit=data.limit, document_ids=data.document_ids)
    except LookupError as error:
        raise HTTPException(status_code=404, detail="One or more selected documents are unavailable") from error
    except Exception as error:
        raise HTTPException(status_code=502, detail="Semantic search is unavailable") from error
    return {"success": True, "query": query, "results": results}
