
import sys
from types import ModuleType, SimpleNamespace

import pytest

# Keep unit tests independent from the optional external SDK installation.
voyageai_stub = ModuleType("voyageai")
voyageai_stub.Client = lambda **kwargs: SimpleNamespace()
sys.modules.setdefault("voyageai", voyageai_stub)

from app.services import embedding_services


def test_generate_embeddings_returns_provider_vectors(monkeypatch):
    monkeypatch.setattr(
        embedding_services.client,
        "embed",
        lambda **kwargs: SimpleNamespace(embeddings=[[0.1] * 1024]),
        raising=False,
    )
    assert len(embedding_services.generate_embeddings(["document text"])[0]) == 1024


def test_empty_document_does_not_call_provider():
    assert embedding_services.generate_embeddings([]) == []


def test_empty_query_is_rejected():
    with pytest.raises(ValueError, match="cannot be empty"):
        embedding_services.generate_query_embedding("   ")
