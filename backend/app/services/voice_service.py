import asyncio

from app.core.config import get_settings


class VoiceServiceError(RuntimeError):
    pass


def _api_key() -> str:
    key = get_settings().gnani_api_key
    if not key:
        raise VoiceServiceError("Voice provider is not configured")
    return key


async def transcribe_audio(file_path: str, language: str | None = None) -> str:
    try:
        from gnani.stt import GnaniSTTClient
        client = GnaniSTTClient(api_key=_api_key())
        result = await asyncio.to_thread(client.transcribe, file_path, language_code=language or get_settings().gnani_stt_language)
        text = result.get("transcript", "")
    except VoiceServiceError:
        raise
    except Exception as error:
        raise VoiceServiceError("Speech transcription is unavailable") from error
    if not text or not text.strip():
        raise ValueError("No speech was recognized")
    return text.strip()


async def synthesize_speech(text: str, voice: str | None = None) -> bytes:
    try:
        from gnani.tts import AudioConfig, GnaniTTSClient
        client = GnaniTTSClient(api_key=_api_key())
        return await asyncio.to_thread(client.synthesize, text, voice=voice or get_settings().gnani_tts_voice, model="timbre-v2.0", audio_config=AudioConfig(sample_rate=22050, encoding="linear_pcm", container="wav"))
    except VoiceServiceError:
        raise
    except Exception as error:
        raise VoiceServiceError("Speech synthesis is unavailable") from error
