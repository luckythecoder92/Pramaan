from pydantic import BaseModel, Field


class SearchRequest(BaseModel):
    query: str = Field(min_length=1)
    document_ids: list[str] | None = Field(default=None, max_length=20)
    limit: int = Field(default=5, ge=1, le=100)
