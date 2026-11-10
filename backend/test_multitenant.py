from types import SimpleNamespace
from pathlib import Path
from uuid import uuid4

import pytest
from fastapi import HTTPException
from fastapi.security import HTTPAuthorizationCredentials

from app.core import database
from app.services import auth_service, repository_service


@pytest.fixture
def isolated_database(monkeypatch):
    database_path = Path(__file__).parent / ".test-data" / f"{uuid4()}.db"
    settings = SimpleNamespace(database_path=database_path)
    monkeypatch.setattr(database, "get_settings", lambda: settings)
    database.init_database()
    repository_service.create_user("user-a@example.com", "hash-a")
    repository_service.create_user("user-b@example.com", "hash-b")
    user_a = repository_service.get_user_by_email("user-a@example.com")
    user_b = repository_service.get_user_by_email("user-b@example.com")
    repository_service.create_document("doc-a", user_a["id"], "a.pdf", "a.pdf", 1, 1)
    repository_service.create_document("doc-b", user_b["id"], "b.pdf", "b.pdf", 1, 1)
    yield user_a, user_b
    database_path.unlink(missing_ok=True)


def test_users_can_only_list_their_own_documents(isolated_database):
    user_a, user_b = isolated_database
    assert [document["id"] for document in repository_service.list_documents(user_a["id"])] == ["doc-a"]
    assert [document["id"] for document in repository_service.list_documents(user_b["id"])] == ["doc-b"]


def test_user_cannot_select_another_users_document(isolated_database):
    user_a, _ = isolated_database
    with pytest.raises(LookupError):
        repository_service.ensure_owned_documents(user_a["id"], ["doc-b"])
    assert repository_service.get_owned_document(user_a["id"], "doc-b") is None


def test_missing_jwt_is_rejected():
    with pytest.raises(HTTPException) as error:
        import asyncio
        asyncio.run(auth_service.get_current_user(None))
    assert error.value.status_code == 401


def test_invalid_jwt_is_rejected(monkeypatch):
    def reject_token(token):
        raise ValueError("bad token")
    monkeypatch.setattr(auth_service, "get_auth_client", lambda: SimpleNamespace(auth=SimpleNamespace(get_user=reject_token)))
    with pytest.raises(HTTPException) as error:
        import asyncio
        asyncio.run(auth_service.get_current_user(HTTPAuthorizationCredentials(scheme="Bearer", credentials="forged.token.value")))
    assert error.value.status_code == 401
