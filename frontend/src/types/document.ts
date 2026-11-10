export interface DocumentRecord {
  id: string;
  user_id: string;
  filename: string;
  storage_path: string;
  chunk_count: number;
  status: string;
  created_at: string;
}

export interface DocumentsResponse {
  success: boolean;
  documents: DocumentRecord[];
}

export interface UploadDocumentResponse {
  message: string;
  document_id: string;
  filename: string;
  size_bytes: number;
  text_length: number;
  text_chunks: number;
  stored_chunks: number;
  chunks_preview: string[];
}

export interface DeleteDocumentResponse {
  success: boolean;
  document_id: string;
}
