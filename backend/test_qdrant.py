
from types import SimpleNamespace
from unittest.mock import MagicMock

import pytest

from app.services import qdrant_services as qdrant


def vector(value: float = 0.1) -> list[float]:
    return [value] * qdrant.VECTOR_SIZE


def test_connection_uses_qdrant_client(monkeypatch):
    client = MagicMock()
    client.get_collections.return_value = "collections"
    monkeypatch.setattr(qdrant, "client", client)
    assert qdrant.test_connection() == "collections"


def test_create_collection_when_missing(monkeypatch):
    client = MagicMock()
    client.collection_exists.return_value = False
    monkeypatch.setattr(qdrant, "client", client)
    qdrant.create_collection()
    assert client.create_collection.call_args.kwargs["vectors_config"].size == 1024


def test_create_collection_rejects_incompatible_dimension(monkeypatch):
    client = MagicMock()
    client.collection_exists.return_value = True
    client.get_collection.return_value = SimpleNamespace(
        config=SimpleNamespace(params=SimpleNamespace(vectors=SimpleNamespace(size=1536)))
    )
    monkeypatch.setattr(qdrant, "client", client)
    with pytest.raises(qdrant.QdrantServiceError, match="expected 1024"):
        qdrant.create_collection()


def test_store_chunks_batches_and_uses_deterministic_ids(monkeypatch):
    client = MagicMock()
    monkeypatch.setattr(qdrant, "client", client)
    metadata = [{"page_number": 2, "source_name": "report.pdf"}, {"page_number": 3}]
    assert qdrant.store_chunks("doc-1", "user-a", ["one", "two"], [vector(), vector()], metadata, batch_size=1) == 2
    first_ids = [call.kwargs["points"][0].id for call in client.upsert.call_args_list]
    client.reset_mock()
    qdrant.store_chunks("doc-1", "user-a", ["one", "two"], [vector(), vector()], metadata, batch_size=2)
    second_ids = [point.id for point in client.upsert.call_args.kwargs["points"]]
    assert first_ids == second_ids
    payload = client.upsert.call_args.kwargs["points"][0].payload
    assert payload["original_text"] == "one"
    assert payload["metadata"]["source_name"] == "report.pdf"


def test_store_chunks_rejects_invalid_vector_dimension():
    with pytest.raises(ValueError, match="expected 1024"):
        qdrant.store_chunks("doc-1", "user-a", ["one"], [[0.1]])


def test_search_applies_document_filter(monkeypatch):
    client = MagicMock()
    client.query_points.return_value = SimpleNamespace(
        points=[SimpleNamespace(score=0.9, payload={"original_text": "result", "document_id": "doc-1", "page_number": 1, "chunk_index": 0})]
    )
    monkeypatch.setattr(qdrant, "client", client)
    results = qdrant.search_chunks(vector(), "user-a", document_ids=["doc-1"])
    assert results[0]["text"] == "result"
    query_filter = client.query_points.call_args.kwargs["query_filter"]
    assert query_filter is not None
    assert query_filter.must[0].key == "user_id"
