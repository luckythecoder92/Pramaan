import {
  FileText,
  MessageSquareText,
  Trash2,
} from "lucide-react";
import { Link } from "react-router-dom";
import type { DocumentRecord } from "../../types/document";
import { formatDate } from "../../utils/format";
import { cn } from "../../utils/cn";
import { StatusBadge } from "../ui/StatusBadge";

interface DocumentListProps {
  documents: DocumentRecord[];
  selectedIds: string[];
  onToggleSelect: (documentId: string) => void;
  onDelete: (document: DocumentRecord) => void;
}

export function DocumentList({
  documents,
  selectedIds,
  onToggleSelect,
  onDelete,
}: DocumentListProps) {
  return (
    <ul className="divide-y divide-border">
      {documents.map((document) => {
        const isReady = document.status === "ready";
        const isSelected = selectedIds.includes(document.id);
        const chunkLabel = `${document.chunk_count} ${
          document.chunk_count === 1 ? "chunk" : "chunks"
        }`;

        return (
          <li
            key={document.id}
            className={cn(
              "flex flex-col gap-3 px-4 py-4 transition-colors sm:flex-row sm:items-center sm:gap-4",
              isSelected && "bg-primary/[0.04]",
            )}
          >
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={isSelected}
                disabled={!isReady}
                onChange={() => onToggleSelect(document.id)}
                aria-label={`Select ${document.filename} for chat`}
                className="h-4 w-4 shrink-0 rounded border-border text-primary accent-[hsl(var(--primary))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-40"
              />

              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-primary">
                <FileText className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {document.filename}
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Added {formatDate(document.created_at)} · {chunkLabel}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              <StatusBadge status={document.status} />

              {isReady ? (
                <Link
                  to={`/app/chat?documents=${encodeURIComponent(document.id)}`}
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 text-xs font-medium text-foreground shadow-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <MessageSquareText className="h-3.5 w-3.5" aria-hidden="true" />
                  Chat
                </Link>
              ) : (
                <span className="inline-flex h-8 items-center rounded-lg border border-border bg-muted px-2.5 text-xs font-medium text-muted-foreground">
                  Not searchable yet
                </span>
              )}

              <button
                type="button"
                onClick={() => onDelete(document)}
                aria-label={`Delete ${document.filename}`}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface text-muted-foreground shadow-sm transition-colors hover:border-danger/30 hover:bg-danger/10 hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
