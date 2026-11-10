import os
import tempfile

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.responses import Response

from app.schemas.voice import SpeakRequest
from app.services.auth_service import get_current_user
from app.services.voice_service import VoiceServiceError, synthesize_speech, transcribe_audio

router = APIRouter(prefix="/api/v1/voice", tags=["voice"])
MAX_AUDIO_SIZE = 10 * 1024 * 1024
ALLOWED_AUDIO_TYPES = {"audio/wav", "audio/x-wav", "audio/mpeg", "audio/webm", "audio/mp4"}


@router.post("/transcribe")
async def transcribe(audio: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    if audio.content_type not in ALLOWED_AUDIO_TYPES:
        raise HTTPException(status_code=415, detail="Unsupported audio format")
    content = await audio.read(MAX_AUDIO_SIZE + 1)
    if not content:
        raise HTTPException(status_code=400, detail="Audio file is empty")
    if len(content) > MAX_AUDIO_SIZE:
        raise HTTPException(status_code=413, detail="Audio file exceeds 10 MB limit")
    handle = tempfile.NamedTemporaryFile(suffix=".wav", delete=False)
    try:
        handle.write(content)
        handle.close()
        text = await transcribe_audio(handle.name)
        return {"status": "success", "transcription": text, "language": "en"}
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error
    except VoiceServiceError as error:
        raise HTTPException(status_code=502, detail=str(error)) from error
    finally:
        if not handle.closed:
            handle.close()
        os.unlink(handle.name)
        await audio.close()


@router.post("/speak")
async def speak(data: SpeakRequest, current_user: dict = Depends(get_current_user)):
    try:
        audio = await synthesize_speech(data.text, data.voice)
    except VoiceServiceError as error:
        raise HTTPException(status_code=502, detail=str(error)) from error
    return Response(content=audio, media_type="audio/wav")
