import asyncio
from typing import Any

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.services.supabase_service import SupabaseServiceError, get_auth_client

bearer_scheme = HTTPBearer(auto_error=False)


async def get_current_user(credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme)) -> dict[str, Any]:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required", headers={"WWW-Authenticate": "Bearer"})
    try:
        response = await asyncio.to_thread(get_auth_client().auth.get_user, credentials.credentials)
        user = response.user
    except SupabaseServiceError as error:
        raise HTTPException(status_code=503, detail="Authentication is unavailable") from error
    except Exception as error:
        raise HTTPException(status_code=401, detail="Invalid or expired access token", headers={"WWW-Authenticate": "Bearer"}) from error
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired access token", headers={"WWW-Authenticate": "Bearer"})
    return {"id": user.id, "email": user.email}
