import asyncio
from typing import Any

from app.services.supabase_service import get_admin_client


async def create_document(document_id: str, user_id: str, filename: str, storage_path: str) -> None:
    payload = {"id": document_id, "user_id": user_id, "filename": filename, "storage_path": storage_path, "chunk_count": 0, "status": "processing"}
    await asyncio.to_thread(lambda: get_admin_client().table("documents").insert(payload).execute())


async def update_document(user_id: str, document_id: str, values: dict[str, Any]) -> None:
    await asyncio.to_thread(lambda: get_admin_client().table("documents").update(values).eq("id", document_id).eq("user_id", user_id).execute())


async def get_owned_document(user_id: str, document_id: str) -> dict[str, Any] | None:
    result = await asyncio.to_thread(lambda: get_admin_client().table("documents").select("*").eq("id", document_id).eq("user_id", user_id).limit(1).execute())
    return result.data[0] if result.data else None


async def list_documents(user_id: str) -> list[dict[str, Any]]:
    result = await asyncio.to_thread(lambda: get_admin_client().table("documents").select("*").eq("user_id", user_id).order("created_at", desc=True).execute())
    return result.data or []


async def ensure_owned_documents(user_id: str, document_ids: list[str]) -> None:
    if not document_ids:
        return
    unique_ids = list(set(document_ids))
    result = await asyncio.to_thread(lambda: get_admin_client().table("documents").select("id").eq("user_id", user_id).in_("id", unique_ids).execute())
    if len(result.data or []) != len(unique_ids):
        raise LookupError("One or more selected documents are unavailable")


async def delete_document_record(user_id: str, document_id: str) -> None:
    await asyncio.to_thread(lambda: get_admin_client().table("documents").delete().eq("id", document_id).eq("user_id", user_id).execute())
