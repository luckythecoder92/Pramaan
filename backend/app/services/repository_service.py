import sqlite3
import uuid
from typing import Any

from app.core.database import database_session


def create_user(email: str, password_hash: str) -> dict[str, Any]:
    user_id = str(uuid.uuid4())
    try:
        with database_session() as connection:
            connection.execute("INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)", (user_id, email, password_hash))
    except sqlite3.IntegrityError as error:
        raise ValueError("An account with this email already exists") from error
    return {"id": user_id, "email": email}


def get_user_by_email(email: str) -> dict[str, Any] | None:
    with database_session() as connection:
        row = connection.execute("SELECT id, email, password_hash FROM users WHERE email = ?", (email,)).fetchone()
    return dict(row) if row else None


def get_user_by_id(user_id: str) -> dict[str, Any] | None:
    with database_session() as connection:
        row = connection.execute("SELECT id, email FROM users WHERE id = ?", (user_id,)).fetchone()
    return dict(row) if row else None


def create_document(document_id: str, user_id: str, filename: str, storage_path: str, size_bytes: int, chunk_count: int) -> None:
    with database_session() as connection:
        connection.execute(
            "INSERT INTO documents (id, user_id, filename, storage_path, size_bytes, chunk_count) VALUES (?, ?, ?, ?, ?, ?)",
            (document_id, user_id, filename, storage_path, size_bytes, chunk_count),
        )


def list_documents(user_id: str) -> list[dict[str, Any]]:
    with database_session() as connection:
        rows = connection.execute(
            "SELECT id, filename, size_bytes, chunk_count, created_at FROM documents WHERE user_id = ? ORDER BY created_at DESC", (user_id,)
        ).fetchall()
    return [dict(row) for row in rows]


def get_owned_document(user_id: str, document_id: str) -> dict[str, Any] | None:
    with database_session() as connection:
        row = connection.execute(
            "SELECT id, user_id, filename, storage_path, size_bytes, chunk_count FROM documents WHERE id = ? AND user_id = ?", (document_id, user_id)
        ).fetchone()
    return dict(row) if row else None


def ensure_owned_documents(user_id: str, document_ids: list[str]) -> None:
    if not document_ids:
        return
    placeholders = ",".join("?" for _ in document_ids)
    with database_session() as connection:
        count = connection.execute(
            f"SELECT COUNT(*) FROM documents WHERE user_id = ? AND id IN ({placeholders})", [user_id, *document_ids]
        ).fetchone()[0]
    if count != len(set(document_ids)):
        raise LookupError("One or more selected documents are unavailable")


def delete_document_record(user_id: str, document_id: str) -> None:
    with get_connection() as connection:
        connection.execute("DELETE FROM documents WHERE id = ? AND user_id = ?", (document_id, user_id))
