from pydantic import BaseModel, ConfigDict, Field


class ChatRequest(BaseModel):
    query: str = Field(min_length=1, max_length=2_000)
    document_ids: list[str] | None = Field(default=None, max_length=20)
    limit: int = Field(default=5, ge=1, le=10)


class LLMAnswer(BaseModel):
    """The only structured shape accepted from the model."""

    model_config = ConfigDict(extra="forbid")

    answer: str
    answerable: bool
    cited_source_refs: list[str]
