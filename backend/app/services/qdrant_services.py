
import os
import uuid
from collections.abc import Mapping, Sequence
from typing import Any

from dotenv import load_dotenv
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, FieldCondition, Filter, MatchAny, MatchValue, PayloadSchemaType, PointStruct, VectorParams

load_dotenv()

COLLECTION_NAME = "pramaan_documents"
VECTOR_SIZE = 1024
UPSERT_BATCH_SIZE = 100
_POINT_NAMESPACE = uuid.UUID("65174256-d9f3-4f43-8edc-426a20e7ac70")


class QdrantServiceError(RuntimeError):
    """Raised when the vector database cannot complete a requested operation."""


def _create_client() -> QdrantClient:
    url = os.getenv("QDRANT_URL")
    api_key = os.getenv("QDRANT_API_KEY")
    if not url or not api_key:
        raise QdrantServiceError("Qdrant credentials are not configured")
    return QdrantClient(url=url, api_key=api_key)


client = _create_client()


def test_connection() -> Any:
    try:
        return client.get_collections()
    except Exception as error:
        raise QdrantServiceError("Unable to connect to Qdrant") from error


def create_collection() -> None:
    """Create the collection once and ensure its existing vector size is compatible."""
    try:
        if not client.collection_exists(COLLECTION_NAME):
            client.create_collection(
                collection_name=COLLECTION_NAME,
                vectors_config=VectorParams(size=VECTOR_SIZE, distance=Distance.COSINE),
            )
            client.create_payload_index(COLLECTION_NAME, "user_id", PayloadSchemaType.KEYWORD)
            client.create_payload_index(COLLECTION_NAME, "document_id", PayloadSchemaType.KEYWORD)
            return
        actual_size = client.get_collection(COLLECTION_NAME).config.params.vectors.size
        if actual_size != VECTOR_SIZE:
            raise QdrantServiceError(
                f"Collection vector size is {actual_size}; expected {VECTOR_SIZE}"
            )
        client.create_payload_index(COLLECTION_NAME, "user_id", PayloadSchemaType.KEYWORD)
        # Chat can be scoped to selected documents, which filters on this key.
        client.create_payload_index(COLLECTION_NAME, "document_id", PayloadSchemaType.KEYWORD)
    except QdrantServiceError:
        raise
    except Exception as error:
        raise QdrantServiceError("Unable to create or validate Qdrant collection") from error


def _point_id(document_id: str, chunk_index: int) -> str:
    """Produce a stable ID, making repeated indexing an upsert rather than a duplicate."""
    return str(uuid.uuid5(_POINT_NAMESPACE, f"{document_id}:{chunk_index}"))


def _validate_vectors(embeddings: Sequence[Sequence[float]]) -> None:
    for index, vector in enumerate(embeddings):
        if len(vector) != VECTOR_SIZE:
            raise ValueError(
                f"Embedding at index {index} has {len(vector)} dimensions; expected {VECTOR_SIZE}"
            )


def store_chunks(
    document_id: str,
    user_id: str,
    chunks: Sequence[str],
    embeddings: Sequence[Sequence[float]],
    metadata: Sequence[Mapping[str, Any]] | None = None,
    batch_size: int = UPSERT_BATCH_SIZE,
) -> int:
    """Store chunks in batches; repeated documents replace points rather than duplicate them."""
    if not document_id or not user_id:
        raise ValueError("document_id and user_id are required")
    if len(chunks) != len(embeddings):
        raise ValueError("Chunks and embeddings count mismatch")
    if metadata is not None and len(metadata) != len(chunks):
        raise ValueError("Metadata and chunks count mismatch")
    if batch_size < 1:
        raise ValueError("batch_size must be greater than zero")
    if not chunks:
        return 0
    _validate_vectors(embeddings)

    points: list[PointStruct] = []
    for index, (chunk, vector) in enumerate(zip(chunks, embeddings)):
        extra_metadata = dict(metadata[index]) if metadata else {}
        payload = {
            "user_id": user_id,
            "document_id": document_id,
            "chunk_index": index,
            "original_text": chunk,
            "text": chunk,
            "page_number": extra_metadata.pop("page_number", None),
            "metadata": extra_metadata,
        }
        points.append(PointStruct(id=_point_id(document_id, index), vector=list(vector), payload=payload))
    try:
        for start in range(0, len(points), batch_size):
            client.upsert(collection_name=COLLECTION_NAME, points=points[start : start + batch_size], wait=True)
    except Exception as error:
        raise QdrantServiceError("Unable to store document vectors in Qdrant") from error
    return len(points)


def search_chunks(
    query_vector: Sequence[float], user_id: str, limit: int = 5, document_ids: Sequence[str] | None = None
) -> list[dict[str, Any]]:
    if len(query_vector) != VECTOR_SIZE:
        raise ValueError("Invalid query vector dimensions")
    if limit < 1:
        raise ValueError("limit must be greater than zero")
    if not user_id:
        raise ValueError("user_id is required")
    conditions = [FieldCondition(key="user_id", match=MatchValue(value=user_id))]
    if document_ids:
        conditions.append(FieldCondition(key="document_id", match=MatchAny(any=list(document_ids))))
    query_filter = Filter(must=conditions)
    try:
        response = client.query_points(
            collection_name=COLLECTION_NAME,
            query=list(query_vector),
            query_filter=query_filter,
            limit=limit,
            with_payload=True,
        )
    except Exception as error:
        raise QdrantServiceError("Unable to search Qdrant") from error
    return [
        {
            "score": point.score,
            "text": point.payload.get("original_text", point.payload.get("text")),
            "document_id": point.payload.get("document_id"),
            "page_number": point.payload.get("page_number"),
            "chunk_index": point.payload.get("chunk_index"),
        }
        for point in response.points
    ]


def delete_document_vectors(user_id: str, document_id: str) -> None:
    """Delete only vectors owned by the authenticated user."""
    if not user_id or not document_id:
        raise ValueError("user_id and document_id are required")
    try:
        client.delete(
            collection_name=COLLECTION_NAME,
            points_selector=Filter(must=[
                FieldCondition(key="user_id", match=MatchValue(value=user_id)),
                FieldCondition(key="document_id", match=MatchValue(value=document_id)),
            ]),
            wait=True,
        )
    except Exception as error:
        raise QdrantServiceError("Unable to delete document vectors") from error
