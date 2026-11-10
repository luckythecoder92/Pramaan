from fastapi import APIRouter, Depends, HTTPException

from app.schemas.chat import ChatRequest
from app.services.chat_service import answer_question
from app.services.citation_service import CitationValidationError
from app.services.llm_service import LLMServiceError
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/api/v1", tags=["chat"])


@router.post("/chat")
async def chat(data: ChatRequest, current_user: dict = Depends(get_current_user)):
    try:
        return await answer_question(data.query, current_user["id"], data.document_ids, data.limit)
    except LookupError as error:
        raise HTTPException(status_code=404, detail="One or more selected documents are unavailable") from error
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error
    except CitationValidationError as error:
        raise HTTPException(status_code=502, detail="LLM returned invalid citations") from error
    except LLMServiceError as error:
        raise HTTPException(status_code=error.status_code, detail=str(error)) from error
    except Exception as error:
        raise HTTPException(status_code=502, detail="Unable to generate a document-grounded answer") from error
