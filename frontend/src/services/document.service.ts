import type {
  DeleteDocumentResponse,
  DocumentsResponse,
  DocumentRecord,
  UploadDocumentResponse,
} from "../types/document";
import { api } from "./api";

export async function listDocuments(): Promise<DocumentRecord[]> {
  const { data } = await api.get<DocumentsResponse>("/api/v1/documents");
  return data.documents;
}

export async function uploadDocument(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<UploadDocumentResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await api.post<UploadDocumentResponse>(
    "/documents/upload",
    formData,
    {
      timeout: 180_000,
      onUploadProgress: (event) => {
        if (!onProgress || !event.total) {
          return;
        }

        const percent = Math.round((event.loaded / event.total) * 100);
        onProgress(Math.min(100, Math.max(0, percent)));
      },
    },
  );

  return data;
}

export async function deleteDocument(
  documentId: string,
): Promise<DeleteDocumentResponse> {
  const { data } = await api.delete<DeleteDocumentResponse>(
    `/api/v1/documents/${encodeURIComponent(documentId)}`,
  );
  return data;
}
