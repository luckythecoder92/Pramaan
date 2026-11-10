from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.questions import router as question_router
from app.routes.documents import router as document_router
from app.routes.search import router as search_router
from app.routes.chat import router as chat_router
from app.routes.auth import router as auth_router
from app.routes.voice import router as voice_router
from app.core.database import init_database
from app.core.config import get_settings
from typing import List

from fastapi import FastAPI

app = FastAPI()

# The React client is served from a different origin during local development
# and from a separate static host in production. Origins are configurable with
# FRONTEND_ORIGINS (comma-separated); the defaults cover the Vite dev server.
_configured_origins = get_settings().frontend_origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in _configured_origins.split(",") if origin.strip()],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)



app.include_router(question_router)
app.include_router(document_router)
app.include_router(search_router)
app.include_router(chat_router)
app.include_router(auth_router)
app.include_router(voice_router)


@app.on_event("startup")
def initialize_database() -> None:
    init_database()

@app.get("/")
def home():
    return {"message": "Hello, AI Engineer!"}




@app.get("/documents/{document_id}")
def get_document(document_id: int):
    return {"document_id": document_id}

@app.get("/documents")
def get_documents(limit: int=5):
    return {"limit":limit}

@app.get("/users/{user_id}")
def get_user(user_id:int, roles:str ="developer"):
    return {
        "user_id":user_id,
        "role":roles
    }
