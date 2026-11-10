from functools import lru_cache

from app.core.config import get_settings


class SupabaseServiceError(RuntimeError):
    pass


@lru_cache
def get_auth_client():
    from supabase import create_client
    settings = get_settings()
    if not settings.supabase_url or not settings.supabase_publishable_key:
        raise SupabaseServiceError("Supabase authentication is not configured")
    return create_client(settings.supabase_url, settings.supabase_publishable_key)


@lru_cache
def get_admin_client():
    from supabase import create_client
    settings = get_settings()
    if not settings.supabase_url or not settings.supabase_secret_key:
        raise SupabaseServiceError("Supabase backend service is not configured")
    return create_client(settings.supabase_url, settings.supabase_secret_key)
