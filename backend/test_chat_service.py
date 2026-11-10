import asyncio
import sys
from types import ModuleType, SimpleNamespace

import pytest

voyageai_stub = ModuleType("voyageai")
voyageai_stub.Client = lambda **kwargs: SimpleNamespace()
sys.modules.setdefault("voyageai", voyageai_stub)

from app.schemas.chat import LLMAnswer
from app.services import chat_service
from app.services.citation_service import CitationValidationError


def run(coroutine):
    return asyncio.run(coroutine)


def test_chat_runs_retrieval_and_context_once(monkeypatch):
    calls = {"embedding": 0, "search": 0, "context": 0}
    monkeypatch.setattr(chat_service, "generate_query_embedding", lambda query: calls.__setitem__("embedding", calls["embedding"] + 1) or [0.1] * 1024)
    monkeypatch.setattr(chat_service, "search_chunks", lambda vector, user_id, limit, document_ids: calls.__setitem__("search", calls["search"] + 1) or [{"text": "Objective text", "document_id": "doc-1", "page_number": 2, "chunk_index": 0, "score": 0.9}])
    async def owned(*args):
        return None
    monkeypatch.setattr(chat_service, "ensure_owned_documents", owned)
    original_build = chat_service.build_context
    monkeypatch.setattr(chat_service, "build_context", lambda *args: calls.__setitem__("context", calls["context"] + 1) or original_build(*args))

    async def fake_llm(*args, **kwargs):
        return LLMAnswer(answer="The objective is stated.", answerable=True, cited_source_refs=["S1"])

    monkeypatch.setattr(chat_service, "generate_answer", fake_llm)
    result = run(chat_service.answer_question("What is the objective?", "user-a", ["doc-1"]))
    assert calls == {"embedding": 1, "search": 1, "context": 1}
    assert result["sources"] == [{"document_id": "doc-1", "page_number": 2, "chunk_index": 0, "score": 0.9}]


def test_chat_skips_llm_when_no_context(monkeypatch):
    monkeypatch.setattr(chat_service, "generate_query_embedding", lambda query: [0.1] * 1024)
    monkeypatch.setattr(chat_service, "search_chunks", lambda *args: [])

    async def fail_if_called(*args, **kwargs):
        raise AssertionError("LLM should not be called")

    monkeypatch.setattr(chat_service, "generate_answer", fail_if_called)
    result = run(chat_service.answer_question("Unknown topic", "user-a"))
    assert result["answerable"] is False
    assert result["sources"] == []


def test_chat_regenerates_once_for_invalid_citation(monkeypatch):
    monkeypatch.setattr(chat_service, "generate_query_embedding", lambda query: [0.1] * 1024)
    monkeypatch.setattr(chat_service, "search_chunks", lambda *args: [{"text": "fact", "document_id": "doc-1", "page_number": 1, "chunk_index": 0, "score": 0.9}])
    answers = iter([
        LLMAnswer(answer="fact", answerable=True, cited_source_refs=["S99"]),
        LLMAnswer(answer="fact", answerable=True, cited_source_refs=["S1"]),
    ])

    async def fake_llm(*args, **kwargs):
        return next(answers)

    monkeypatch.setattr(chat_service, "generate_answer", fake_llm)
    async def owned_again(*args):
        return None
    monkeypatch.setattr(chat_service, "ensure_owned_documents", owned_again)
    assert run(chat_service.answer_question("question", "user-a"))["sources"][0]["document_id"] == "doc-1"
