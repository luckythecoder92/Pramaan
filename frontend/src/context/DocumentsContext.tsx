import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  deleteDocument as deleteDocumentRequest,
  listDocuments,
  uploadDocument as uploadDocumentRequest,
} from "../services/document.service";
import type { DocumentRecord, UploadDocumentResponse } from "../types/document";
import { getApiErrorMessage } from "../utils/errors";
import { useToast } from "./ToastContext";

interface RefreshOptions {
  silent?: boolean;
}

interface DocumentsContextValue {
  documents: DocumentRecord[];
  readyDocuments: DocumentRecord[];
  counts: {
    total: number;
    ready: number;
    processing: number;
    failed: number;
  };
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  lastUpdated: number | null;
  refresh: (options?: RefreshOptions) => Promise<void>;
  uploadFile: (
    file: File,
    onProgress?: (percent: number) => void,
  ) => Promise<UploadDocumentResponse>;
  removeDocument: (documentId: string) => Promise<void>;
}

const DocumentsContext = createContext<DocumentsContextValue | null>(null);

function isPendingStatus(status: string): boolean {
  return status === "processing" || status === "pending" || status === "queued";
}

export function DocumentsProvider({ children }: { children: ReactNode }) {
  const { pushToast } = useToast();
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const inFlight = useRef(false);

  const refresh = useCallback(
    async (options?: RefreshOptions) => {
      if (inFlight.current) {
        return;
      }

      inFlight.current = true;

      if (options?.silent) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      try {
        const result = await listDocuments();
        setDocuments(result);
        setError(null);
        setLastUpdated(Date.now());
      } catch (requestError) {
        const message = getApiErrorMessage(requestError);
        setError(message);

        if (!options?.silent) {
          pushToast({
            variant: "error",
            title: "Documents could not be loaded",
            description: message,
          });
        }
      } finally {
        inFlight.current = false;
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [pushToast],
  );

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const hasPendingDocuments = useMemo(
    () => documents.some((document) => isPendingStatus(document.status)),
    [documents],
  );

  useEffect(() => {
    if (!hasPendingDocuments) {
      return;
    }

    const interval = window.setInterval(() => {
      void refresh({ silent: true });
    }, 5_000);

    return () => window.clearInterval(interval);
  }, [hasPendingDocuments, refresh]);

  const uploadFile = useCallback(
    async (file: File, onProgress?: (percent: number) => void) => {
      const result = await uploadDocumentRequest(file, onProgress);
      await refresh({ silent: true });
      return result;
    },
    [refresh],
  );

  const removeDocument = useCallback(async (documentId: string) => {
    await deleteDocumentRequest(documentId);
    setDocuments((current) =>
      current.filter((document) => document.id !== documentId),
    );
    setLastUpdated(Date.now());
  }, []);

  const readyDocuments = useMemo(
    () => documents.filter((document) => document.status === "ready"),
    [documents],
  );

  const counts = useMemo(
    () => ({
      total: documents.length,
      ready: documents.filter((document) => document.status === "ready").length,
      processing: documents.filter((document) => isPendingStatus(document.status))
        .length,
      failed: documents.filter((document) => document.status === "failed").length,
    }),
    [documents],
  );

  const value = useMemo<DocumentsContextValue>(
    () => ({
      documents,
      readyDocuments,
      counts,
      isLoading,
      isRefreshing,
      error,
      lastUpdated,
      refresh,
      uploadFile,
      removeDocument,
    }),
    [
      documents,
      readyDocuments,
      counts,
      isLoading,
      isRefreshing,
      error,
      lastUpdated,
      refresh,
      uploadFile,
      removeDocument,
    ],
  );

  return (
    <DocumentsContext.Provider value={value}>
      {children}
    </DocumentsContext.Provider>
  );
}

export function useDocuments(): DocumentsContextValue {
  const context = useContext(DocumentsContext);

  if (!context) {
    throw new Error("useDocuments must be used within a DocumentsProvider");
  }

  return context;
}
