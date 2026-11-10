from fastapi import APIRouter, HTTPException
from app.schemas.question import QuestionRequest
from app.services.question_service import process_question
router = APIRouter()


@router.post('/ask')
def ask_question(data: QuestionRequest):
    try:
        return process_question(data.question, data.document_id, data.limit)
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error
    except Exception as error:
        raise HTTPException(status_code=502, detail="Unable to retrieve document context") from error

