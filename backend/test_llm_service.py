import asyncio
import json
import sys
from types import ModuleType, SimpleNamespace

import pytest

from app.core.config import Settings
from app.services import llm_service


def run(coroutine):
    return asyncio.run(coroutine)


def settings():
    return Settings(groq_api_key="test-key")


def install_fake_groq(monkeypatch, create):
    module = ModuleType("groq")
    module.AsyncGroq = lambda **kwargs: SimpleNamespace(chat=SimpleNamespace(completions=SimpleNamespace(create=create)))
    monkeypatch.setitem(sys.modules, "groq", module)
    monkeypatch.setattr(llm_service, "get_settings", settings)


def test_llm_parses_structured_answer(monkeypatch):
    async def create(**kwargs):
        content = json.dumps({"answer": "The objective is safety.", "answerable": True, "cited_source_refs": ["S1"]})
        return SimpleNamespace(choices=[SimpleNamespace(message=SimpleNamespace(content=content))])

    install_fake_groq(monkeypatch, create)
    answer = run(llm_service.generate_answer("objective?", "context", {"S1": {"document_id": "doc", "page_number": 1, "chunk_index": 0}}))
    assert answer.cited_source_refs == ["S1"]


def test_llm_rejects_invalid_json(monkeypatch):
    async def create(**kwargs):
        return SimpleNamespace(choices=[SimpleNamespace(message=SimpleNamespace(content="not-json"))])

    install_fake_groq(monkeypatch, create)
    with pytest.raises(llm_service.LLMServiceError, match="invalid structured"):
        run(llm_service.generate_answer("q", "context", {"S1": {}}))


def test_llm_does_not_retry_authentication_errors(monkeypatch):
    class AuthenticationError(Exception):
        pass

    async def create(**kwargs):
        raise AuthenticationError()

    install_fake_groq(monkeypatch, create)
    with pytest.raises(llm_service.LLMServiceError) as error:
        run(llm_service.generate_answer("q", "context", {"S1": {}}))
    assert error.value.status_code == 401


def test_llm_retries_rate_limit_error(monkeypatch):
    class RateLimitError(Exception):
        pass

    calls = {"count": 0}
    async def create(**kwargs):
        calls["count"] += 1
        if calls["count"] == 1:
            raise RateLimitError()
        content = json.dumps({"answer": "fact", "answerable": True, "cited_source_refs": ["S1"]})
        return SimpleNamespace(choices=[SimpleNamespace(message=SimpleNamespace(content=content))])

    install_fake_groq(monkeypatch, create)
    original_sleep = asyncio.sleep
    monkeypatch.setattr(llm_service.asyncio, "sleep", lambda delay: original_sleep(0))
    assert run(llm_service.generate_answer("q", "context", {"S1": {}})).answer == "fact"
    assert calls["count"] == 2
