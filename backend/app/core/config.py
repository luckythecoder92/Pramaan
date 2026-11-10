from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    supabase_url: str | None = None
    supabase_publishable_key: str | None = None
    supabase_secret_key: str | None = None
    supabase_storage_bucket: str = "user-documents"
    gnani_api_key: str | None = None
    gnani_stt_language: str = "en-IN"
    gnani_tts_voice: str = "Pranav"
    database_path: Path = Path(__file__).resolve().parents[2] / "data" / "pramaan.db"
    jwt_secret_key: str | None = None
    jwt_algorithm: str = "HS256"
    jwt_access_token_minutes: int = 60
    groq_api_key: str | None = None
    groq_model: str = "openai/gpt-oss-120b"
    groq_reasoning_effort: str = "high"
    groq_timeout: float = 60.0
    groq_max_completion_tokens: int = 2048
    frontend_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    model_config = SettingsConfigDict(
        env_file=Path(__file__).resolve().parents[2] / ".env",
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()
