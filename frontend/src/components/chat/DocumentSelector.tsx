import { Check, FileText, Layers, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import type { DocumentRecord } from "../../types/document";
import { cn } from "../../utils/cn";

interface DocumentSelectorProps {
  documents: DocumentRecord[];
  selectedIds: string[];
  onSelectionChange: (documentIds: string[]) => void;
  isLoading: boolean;
}

export function DocumentSelector({
  documents,
  selectedIds,
  onSelectionChange,
  isLoading,
}: DocumentSelectorProps) {
  const readyDocuments = documents.filter(
    (document) => document.status === "ready",
  );

  const toggleDocument = (documentId: string) => {
    if (selectedIds.includes(documentId)) {
      onSelectionChange(selectedIds.filter((id) => id !== documentId));
    } else {
      onSelectionChange([...selectedIds, documentId]);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-border px-4 py-4">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Layers className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-xs font-semibold text-foreground">Search scope</h2>
            <p className="text-[10px] text-muted-foreground">
              Choose which documents to search
            </p>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        <button
          type="button"
          onClick={() => onSelectionChange([])}
          aria-pressed={selectedIds.length === 0}
          className={cn(
            "flex w-full items-start gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
            selectedIds.length === 0
              ? "border-primary/30 bg-primary/[0.06]"
              : "border-transparent hover:bg-muted",
          )}
        >
          <span
            className={cn(
              "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border",
              selectedIds.length === 0
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-surface",
            )}
          >
            {selectedIds.length === 0 && (
              <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
            )}
          </span>

          <span className="min-w-0">
            <span className="block text-xs font-semibold text-foreground">
              All ready documents
            </span>
            <span className="mt-0.5 block text-[10px] leading-4 text-muted-foreground">
              Search the full workspace ({readyDocuments.length} ready)
            </span>
          </span>
        </button>

        <div className="my-3 flex items-center gap-2 px-1">
          <span className="h-px flex-1 bg-border" />
          <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Or pick specific files
          </span>
          <span className="h-px flex-1 bg-border" />
        </div>

        {isLoading && documents.length === 0 ? (
          <div className="space-y-2 px-1">
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="h-9 animate-pulse rounded-lg bg-muted motion-reduce:animate-none"
              />
            ))}
          </div>
        ) : readyDocuments.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border px-3 py-4 text-center">
            <Loader2
              className="mx-auto h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
            <p className="mt-2 text-[11px] leading-5 text-muted-foreground">
              {documents.length === 0
                ? "No documents have been uploaded yet."
                : "No documents are ready to search yet."}
            </p>
            <Link
              to="/app/documents"
              className="mt-2 inline-block text-[11px] font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {documents.length === 0 ? "Upload a PDF" : "View library"}
            </Link>
          </div>
        ) : (
          <ul className="space-y-0.5">
            {readyDocuments.map((document) => {
              const isSelected = selectedIds.includes(document.id);

              return (
                <li key={document.id}>
                  <label
                    className={cn(
                      "flex cursor-pointer items-start gap-2.5 rounded-lg px-2.5 py-2 transition-colors",
                      isSelected ? "bg-primary/[0.06]" : "hover:bg-muted",
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleDocument(document.id)}
                      className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded border-border accent-[hsl(var(--primary))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    />

                    <span className="flex min-w-0 items-start gap-2">
                      <FileText
                        className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground"
                        aria-hidden="true"
                      />
                      <span className="min-w-0">
                        <span className="block truncate text-[11px] font-medium text-foreground">
                          {document.filename}
                        </span>
                        <span className="block text-[10px] text-muted-foreground">
                          {document.chunk_count}{" "}
                          {document.chunk_count === 1 ? "chunk" : "chunks"}
                        </span>
                      </span>
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="border-t border-border px-4 py-3">
        <p className="text-[10px] leading-4 text-muted-foreground">
          {selectedIds.length === 0
            ? "Every ready document is searched."
            : `${selectedIds.length} of ${readyDocuments.length} ready documents selected.`}
        </p>
      </div>
    </div>
  );
}
