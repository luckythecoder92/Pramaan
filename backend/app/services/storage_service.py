import asyncio

from app.core.config import get_settings
from app.services.supabase_service import get_admin_client


async def upload_pdf(storage_path: str, content: bytes) -> None:
    bucket = get_settings().supabase_storage_bucket
    await asyncio.to_thread(lambda: get_admin_client().storage.from_(bucket).upload(storage_path, content, {"content-type": "application/pdf", "upsert": "false"}))


async def delete_pdf(storage_path: str) -> None:
    bucket = get_settings().supabase_storage_bucket
    await asyncio.to_thread(lambda: get_admin_client().storage.from_(bucket).remove([storage_path]))
