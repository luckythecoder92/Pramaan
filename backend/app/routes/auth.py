import logging

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.config import get_settings
from app.schemas.auth import ConfirmEmailRequest, LoginRequest, RegisterRequest
from app.services.auth_service import get_current_user
from app.services.supabase_service import SupabaseServiceError, get_auth_client
import asyncio

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])
logger = logging.getLogger(__name__)


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(data: RegisterRequest):
    # Where Supabase sends the user after they confirm their email. Built from
    # FRONTEND_URL/FRONTEND_BASE_URL so production never links to localhost.
    # The same URL must be allow-listed in Supabase (Authentication -> URL
    # Configuration -> Redirect URLs), otherwise Supabase silently falls back
    # to the project's Site URL.
    email_redirect_to = get_settings().email_confirmation_redirect_url
    logger.info(
        "supabase_signup_started",
        extra={"provider": "supabase", "operation": "sign_up", "email_redirect_to": email_redirect_to},
    )
    try:
        result = await asyncio.to_thread(
            get_auth_client().auth.sign_up,
            {
                "email": data.email,
                "password": data.password,
                "options": {"email_redirect_to": email_redirect_to},
            },
        )
    except ModuleNotFoundError as error:
        logger.error("supabase_signup_dependency_missing", extra={"provider": "supabase", "operation": "sign_up"})
        raise HTTPException(status_code=503, detail="Registration service is unavailable") from error
    except SupabaseServiceError as error:
        logger.error("supabase_signup_configuration_error", extra={"provider": "supabase", "operation": "sign_up"})
        raise HTTPException(status_code=503, detail="Registration service is unavailable") from error
    except Exception as error:
        error_type = type(error).__name__
        provider_status = getattr(error, "status", None)
        logger.warning("supabase_signup_failed", extra={"provider": "supabase", "operation": "sign_up", "error_type": error_type, "provider_status": provider_status})
        if provider_status == 429:
            raise HTTPException(status_code=429, detail="Too many registration attempts. Please try again later.") from error
        raise HTTPException(status_code=400, detail="Registration could not be completed. Check Supabase Auth email-provider settings.") from error
    return {"success": True, "user": {"id": result.user.id, "email": result.user.email}, "access_token": result.session.access_token if result.session else None, "token_type": "bearer"}


@router.post("/login")
async def login(data: LoginRequest):
    try:
        auth_client = get_auth_client()
        result = await asyncio.to_thread(
            auth_client.auth.sign_in_with_password,
            {"email": data.email, "password": data.password},
        )
    except ModuleNotFoundError as error:
        logger.error("supabase_login_dependency_missing", extra={"provider": "supabase", "operation": "sign_in"})
        raise HTTPException(status_code=503, detail="Authentication service is unavailable") from error
    except SupabaseServiceError as error:
        logger.error("supabase_login_configuration_error", extra={"provider": "supabase", "operation": "sign_in"})
        raise HTTPException(status_code=503, detail="Authentication service is unavailable") from error
    except Exception as error:
        message = str(error)
        logger.warning(
            "supabase_login_failed",
            extra={
                "provider": "supabase",
                "operation": "sign_in",
                "error_type": type(error).__name__,
                "provider_status": getattr(error, "status", None),
                "provider_message": message,
            },
        )
        if "email not confirmed" in message.lower():
            raise HTTPException(
                status_code=403,
                detail="Please confirm your email address before signing in.",
            ) from error
        if getattr(error, "status", None) == 429:
            raise HTTPException(
                status_code=429,
                detail="Too many sign-in attempts. Please try again later.",
            ) from error
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        ) from error

    # Supabase returns a user with no session when the email is still unconfirmed.
    if result.session is None:
        logger.warning("supabase_login_no_session", extra={"provider": "supabase", "operation": "sign_in"})
        raise HTTPException(status_code=403, detail="Please confirm your email address before signing in.")

    return {"success": True, "access_token": result.session.access_token, "token_type": "bearer"}


@router.post("/confirm")
async def confirm_email(data: ConfirmEmailRequest):
    """Exchange the code/token from a Supabase confirmation link for a session.

    The frontend callback route posts the parameters it received on
    /auth/callback; this endpoint performs the exchange server-side so no
    Supabase credentials are required in the browser bundle.
    """
    try:
        auth_client = get_auth_client()
        if data.code:
            result = await asyncio.to_thread(
                auth_client.auth.exchange_code_for_session,
                {"auth_code": data.code},
            )
        else:
            result = await asyncio.to_thread(
                auth_client.auth.verify_otp,
                {"token_hash": data.token_hash, "type": data.type or "signup"},
            )
    except ModuleNotFoundError as error:
        logger.error("supabase_confirm_dependency_missing", extra={"provider": "supabase", "operation": "confirm"})
        raise HTTPException(status_code=503, detail="Authentication service is unavailable") from error
    except SupabaseServiceError as error:
        logger.error("supabase_confirm_configuration_error", extra={"provider": "supabase", "operation": "confirm"})
        raise HTTPException(status_code=503, detail="Authentication service is unavailable") from error
    except Exception as error:
        # Never log the code/token itself; only the failure shape.
        logger.warning(
            "supabase_email_confirmation_failed",
            extra={
                "provider": "supabase",
                "operation": "confirm",
                "error_type": type(error).__name__,
                "provider_status": getattr(error, "status", None),
                "provider_message": str(error),
                "flow": "code" if data.code else "token_hash",
            },
        )
        raise HTTPException(
            status_code=400,
            detail="This confirmation link is invalid or has already been used. Please sign in instead.",
        ) from error

    user = result.user
    session = result.session

    return {
        "success": True,
        "access_token": session.access_token if session else None,
        "token_type": "bearer",
        "user": {"id": user.id, "email": user.email} if user else None,
    }


@router.get("/me")
async def me(current_user: dict = Depends(get_current_user)):
    return {"success": True, "user": current_user}
