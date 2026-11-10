import type { ChatRequestPayload, ChatResponse } from "../types/chat";
import { api } from "./api";

export async function askDocumentQuestion(
  payload: ChatRequestPayload,
  signal?: AbortSignal,
): Promise<ChatResponse> {
  const { data } = await api.post<ChatResponse>(
    "/api/v1/chat",
    {
      query: payload.query.trim(),
      document_ids:
        payload.documentIds.length > 0 ? payload.documentIds : undefined,
      limit: payload.limit,
    },
    {
      timeout: 120_000,
      signal,
    },
  );

  return data;
}
