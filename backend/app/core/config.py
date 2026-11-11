from functools import lru_cache
from pathlib import Path
from dotenv import load_dotenv
import os

from pydantic_settings import BaseSettings, SettingsConfigDict

load_dotenv()


def normalize_origin(origin: str) -> str:
    """Trim an origin so it matches the byte-for-byte Origin header a browser sends.

    Browsers never include a trailing slash, so 'https://app.example.com/' would
    never match and CORS preflights would fail with no Access-Control-Allow-Origin.
    """
    return origin.strip().rstrip("/")


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
    # Sourced from the environment (FRONTEND_URL, or FRONTEND_ORIGINS which
    # overrides it). Comma-separated when the app is reachable from several
    # origins, e.g. production plus the Vite dev server.
    frontend_origins: str | None = os.getenv("FRONTEND_URL")
    # Optional regex for preview deployments, e.g. https://.*\.vercel\.app
    frontend_origin_regex: str | None = None

    model_config = SettingsConfigDict(
        env_file=Path(__file__).resolve().parents[2] / ".env",
        extra="ignore",
    )

    @property
    def cors_origins(self) -> list[str]:
        """Parsed, normalized allow-list sourced from the environment.

        Raises at startup if nothing is configured: an empty allow-list makes
        every browser request fail with 'No Access-Control-Allow-Origin header',
        which is much harder to diagnose than a boot error naming the variable.
        """
        origins = [
            origin
            for origin in (
                normalize_origin(candidate)
                for candidate in (self.frontend_origins or "").split(",")
            )
            if origin
        ]
        if not origins and not self.frontend_origin_regex:
            raise RuntimeError(
                "No frontend origin configured: set FRONTEND_URL in .env "
                "(or in the deployment environment) to the origin(s) allowed to "
                "call this API, comma-separated, e.g. "
                "'https://app.example.com,http://localhost:5173'. "
                "FRONTEND_ORIGIN_REGEX is an alternative for preview domains."
            )
        return origins


@lru_cache
def get_settings() -> Settings:
    return Settings()
