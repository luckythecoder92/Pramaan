from pydantic import BaseModel, Field


class SpeakRequest(BaseModel):
    text: str = Field(min_length=1, max_length=8000)
    voice: str | None = Field(default=None, max_length=80)
