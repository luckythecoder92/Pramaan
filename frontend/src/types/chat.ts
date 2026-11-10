export interface ChatSource {
  document_id: string;
  page_number: number | null;
  chunk_index: number | null;
  score: number | null;
}

export interface ChatResponse {
  success: boolean;
  query: string;
  answer: string;
  answerable: boolean;
  sources: ChatSource[];
}

export interface ChatRequestPayload {
  query: string;
  documentIds: string[];
  limit?: number;
}

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: number;
  sources?: ChatSource[];
  answerable?: boolean;
  failed?: boolean;
}
