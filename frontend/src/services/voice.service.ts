import { api } from "./api";

export interface TranscribeResponse {
  status: string;
  transcription: string;
  language: string;
}

const ALLOWED_AUDIO_TYPES = new Set([
  "audio/webm",
  "audio/wav",
  "audio/x-wav",
  "audio/mpeg",
  "audio/mp4",
]);

export async function transcribeAudio(blob: Blob): Promise<TranscribeResponse> {
  const baseType = blob.type.split(";")[0].trim().toLowerCase();

  if (!ALLOWED_AUDIO_TYPES.has(baseType)) {
    throw new Error("This browser produced an unsupported recording format.");
  }

  const extension =
    baseType === "audio/mp4"
      ? "mp4"
      : baseType === "audio/mpeg"
        ? "mp3"
        : baseType === "audio/wav" || baseType === "audio/x-wav"
          ? "wav"
          : "webm";

  const file = new File([blob], `recording.${extension}`, { type: baseType });
  const formData = new FormData();
  formData.append("audio", file);

  const { data } = await api.post<TranscribeResponse>(
    "/api/v1/voice/transcribe",
    formData,
    { timeout: 120_000 },
  );

  return data;
}

export async function synthesizeSpeech(text: string): Promise<Blob> {
  const { data } = await api.post<Blob>(
    "/api/v1/voice/speak",
    { text },
    {
      responseType: "blob",
      timeout: 120_000,
    },
  );

  return data;
}
