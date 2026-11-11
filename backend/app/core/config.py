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
    # Optional explicit origin the email-confirmation link should land on.
    # Falls back to the first FRONTEND_URL entry, which is normally the
    # production frontend.
    frontend_base_url: str | None = None

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

    @property
    def frontend_origin(self) -> str:
        """Origin used to build user-facing links (email confirmation redirect).

        Restricted to the configured CORS allow-list so a typo cannot send
        confirmation emails to an untrusted domain.
        """
        origins = self.cors_origins
        base = normalize_origin(self.frontend_base_url) if self.frontend_base_url else ""

        if not base and origins:
            base = origins[0]

        if not base:
            raise RuntimeError(
                "Cannot build the email confirmation redirect: set FRONTEND_URL "
                "or FRONTEND_BASE_URL to the public frontend origin."
            )

        if origins and base not in origins:
            raise RuntimeError(
                f"FRONTEND_BASE_URL ({base}) is not one of the origins allowed by "
                f"FRONTEND_URL ({', '.join(origins)}). Add it to FRONTEND_URL so the "
                "frontend can call this API from the confirmation page."
            )

        return base

    @property
    def email_confirmation_redirect_url(self) -> str:
        """Absolute frontend URL Supabase returns users to after confirmation."""
        return f"{self.frontend_origin}/auth/callback"


@lru_cache
def get_settings() -> Settings:
    return Settings()
