from typing import Literal

from pydantic import BaseModel, EmailStr, Field, model_validator

EmailConfirmationType = Literal[
    "signup",
    "email",
    "magiclink",
    "recovery",
    "invite",
    "email_change",
]


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=12, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class ConfirmEmailRequest(BaseModel):
    """Confirmation payload taken from the Supabase redirect URL.

    Supabase can land on the frontend in two shapes:
    - ``?code=...`` (authorization code, exchanged for a session)
    - ``?token_hash=...&type=signup`` (email OTP style links)

    Exactly one of the two must be supplied.
    """

    code: str | None = Field(default=None, min_length=1, max_length=1024)
    token_hash: str | None = Field(default=None, min_length=1, max_length=1024)
    type: EmailConfirmationType | None = None

    @model_validator(mode="after")
    def _require_single_token(self) -> "ConfirmEmailRequest":
        if bool(self.code) == bool(self.token_hash):
            raise ValueError("Provide exactly one of 'code' or 'token_hash'.")
        return self
