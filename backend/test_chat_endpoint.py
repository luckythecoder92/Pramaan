import asyncio
import sys
from types import ModuleType, SimpleNamespace

from fastapi.testclient import TestClient

voyageai_stub = ModuleType("voyageai")
voyageai_stub.Client = lambda **kwargs: SimpleNamespace()
sys.modules.setdefault("voyageai", voyageai_stub)
splitter_stub = ModuleType("langchain_text_splitters")
splitter_stub.RecursiveCharacterTextSplitter = lambda **kwargs: SimpleNamespace(split_text=lambda text: [text])
sys.modules.setdefault("langchain_text_splitters", splitter_stub)

from app.main import app
from app.routes import chat


def test_chat_endpoint_uses_chat_service(monkeypatch):
    calls = []
    async def fake_answer(query, user_id, document_ids, limit):
        calls.append((query, user_id, document_ids, limit))
        return {"success": True, "query": query, "answer": "fact", "answerable": True, "sources": []}

    monkeypatch.setattr(chat, "answer_question", fake_answer)
    app.dependency_overrides[chat.get_current_user] = lambda: {"id": "user-a", "email": "a@example.com"}
    response = TestClient(app).post("/api/v1/chat", json={"query": "question", "document_ids": ["doc-1"]})
    app.dependency_overrides.clear()
    assert response.status_code == 200
    assert calls == [("question", "user-a", ["doc-1"], 5)]
