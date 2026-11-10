import { useEffect, useState } from "react";
import {
  FileText,
  MessageSquareText,
  RefreshCw,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { DocumentList } from "../components/documents/DocumentList";
import { DocumentUploader } from "../components/documents/DocumentUploader";
import { ButtonLink } from "../components/ButtonLink";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { Modal } from "../components/ui/Modal";
import { PageHeader } from "../components/ui/PageHeader";
import { useDocuments } from "../context/DocumentsContext";
import { useToast } from "../context/ToastContext";
import type { DocumentRecord } from "../types/document";
import { getApiErrorMessage } from "../utils/errors";
import { formatRelativeTime } from "../utils/format";

export function DocumentsPage() {
  const {
    documents,
    readyDocuments,
    counts,
    isLoading,
    isRefreshing,
    error,
    lastUpdated,
    refresh,
    removeDocument,
  } = useDocuments();
  const { pushToast } = useToast();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [documentToDelete, setDocumentToDelete] =
    useState<DocumentRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setSelectedIds((current) => {
      const readyIds = new Set(
        readyDocuments.map((document) => document.id),
      );
      const next = current.filter((id) => readyIds.has(id));
      return next.length === current.length ? current : next;
    });
  }, [readyDocuments]);

  const toggleSelect = (documentId: string) => {
    setSelectedIds((current) =>
      current.includes(documentId)
        ? current.filter((id) => id !== documentId)
        : [...current, documentId],
    );
  };

  const selectAllReady = () => {
    setSelectedIds(readyDocuments.map((document) => document.id));
  };

  const handleDelete = async () => {
    if (!documentToDelete || isDeleting) {
      return;
    }

    setIsDeleting(true);

    try {
      await removeDocument(documentToDelete.id);
      setSelectedIds((current) =>
        current.filter((id) => id !== documentToDelete.id),
      );
      pushToast({
        variant: "success",
        title: "Document deleted",
        description: `${documentToDelete.filename} and its indexed vectors were removed.`,
      });
      setDocumentToDelete(null);
    } catch (deleteError) {
      pushToast({
        variant: "error",
        title: "Delete failed",
        description: getApiErrorMessage(deleteError),
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const lastUpdatedLabel = lastUpdated
    ? formatRelativeTime(new Date(lastUpdated).toISOString())
    : null;
  const selectedChatTarget = `/app/chat?documents=${selectedIds
    .map(encodeURIComponent)
    .join(",")}`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-9 lg:px-8">
      <PageHeader
        eyebrow="Library"
        title="Documents"
        description="Upload PDFs, track indexing status, and choose exactly which documents a conversation should search."
        actions={
          <>
            <Button
              variant="secondary"
              onClick={() => void refresh()}
              disabled={isRefreshing}
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  isRefreshing
                    ? "animate-spin motion-reduce:animate-none"
                    : ""
                }`}
                aria-hidden="true"
              />
              {isRefreshing ? "Refreshing…" : "Refresh"}
            </Button>
            <ButtonLink to="/app/chat">
              <MessageSquareText className="h-4 w-4" aria-hidden="true" />
              Open chat
            </ButtonLink>
          </>
        }
      />

      {error && (
        <div
          role="alert"
          className="mt-6 flex flex-col gap-3 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger sm:flex-row sm:items-center sm:justify-between"
        >
          <span>{error}</span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => void refresh()}
            className="w-fit"
          >
            Try again
          </Button>
        </div>
      )}

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1.6fr_0.9fr]">
        <section className="order-2 overflow-hidden rounded-2xl border border-border bg-surface shadow-sm lg:order-1">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-4 sm:px-5">
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Your library
              </h2>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {counts.total} {counts.total === 1 ? "document" : "documents"}
                {lastUpdatedLabel
                  ? ` · synced ${lastUpdatedLabel}`
                  : ""}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {readyDocuments.length > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={selectAllReady}
                  disabled={
                    selectedIds.length === readyDocuments.length &&
                    readyDocuments.length > 0
                  }
                >
                  Select all ready
                </Button>
              )}
            </div>
          </div>

          {selectedIds.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-primary/15 bg-primary/[0.05] px-4 py-3 sm:px-5">
              <p className="text-xs font-medium text-foreground">
                {selectedIds.length} selected for chat
              </p>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedIds([])}
                >
                  Clear
                </Button>
                <ButtonLink size="sm" to={selectedChatTarget}>
                  <MessageSquareText className="h-3.5 w-3.5" aria-hidden="true" />
                  Chat with selected
                </ButtonLink>
              </div>
            </div>
          )}

          {isLoading && documents.length === 0 ? (
            <div className="space-y-4 p-4 sm:p-5">
              {[0, 1, 2].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="h-9 w-9 animate-pulse rounded-lg bg-muted motion-reduce:animate-none" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-2/3 animate-pulse rounded bg-muted motion-reduce:animate-none" />
                    <div className="h-2.5 w-1/3 animate-pulse rounded bg-muted motion-reduce:animate-none" />
                  </div>
                </div>
              ))}
            </div>
          ) : documents.length > 0 ? (
            <DocumentList
              documents={documents}
              selectedIds={selectedIds}
              onToggleSelect={toggleSelect}
              onDelete={setDocumentToDelete}
            />
          ) : (
            <div className="p-4 sm:p-5">
              <EmptyState
                icon={FileText}
                title="Your library is empty"
                description="Add a PDF with the upload panel. Once indexing finishes, its status changes to Ready and it becomes searchable in chat."
                className="border-0 bg-transparent px-2 py-8"
              />
            </div>
          )}
        </section>

        <div className="order-1 space-y-4 lg:order-2">
          <section className="rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-5">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <UploadCloud className="h-4 w-4" aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-sm font-semibold text-foreground">
                  Upload a PDF
                </h2>
                <p className="text-[11px] text-muted-foreground">
                  Maximum size 10 MB
                </p>
              </div>
            </div>

            <div className="mt-4">
              <DocumentUploader compact />
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-5">
            <h2 className="text-sm font-semibold text-foreground">
              Library status
            </h2>
            <dl className="mt-3 space-y-2.5 text-xs">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted-foreground">Ready to search</dt>
                <dd className="font-semibold text-success">{counts.ready}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted-foreground">Processing</dt>
                <dd className="font-semibold text-warning">
                  {counts.processing}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted-foreground">Failed</dt>
                <dd className="font-semibold text-danger">{counts.failed}</dd>
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-border pt-2.5">
                <dt className="text-muted-foreground">Total</dt>
                <dd className="font-semibold text-foreground">
                  {counts.total}
                </dd>
              </div>
            </dl>

            <p className="mt-4 border-t border-border pt-3 text-[11px] leading-5 text-muted-foreground">
              Documents are processed with extracted text, chunked, embedded,
              and stored before they appear as ready.
            </p>
          </section>
        </div>
      </div>

      <Modal
        open={documentToDelete !== null}
        onClose={() => {
          if (!isDeleting) {
            setDocumentToDelete(null);
          }
        }}
        title="Delete this document?"
        description={
          documentToDelete
            ? `${documentToDelete.filename} will be removed from the library.`
            : undefined
        }
        size="sm"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setDocumentToDelete(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => void handleDelete()}
              isLoading={isDeleting}
              loadingLabel="Deleting…"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Delete document
            </Button>
          </>
        }
      >
        <div className="flex items-start gap-3 rounded-xl border border-danger/25 bg-danger/5 p-3.5 text-sm leading-6 text-muted-foreground">
          <Trash2
            className="mt-0.5 h-4 w-4 shrink-0 text-danger"
            aria-hidden="true"
          />
          <p>
            The stored PDF, the document record, and every indexed vector for
            this document are deleted. This action cannot be undone.
          </p>
        </div>
      </Modal>
    </div>
  );
}
