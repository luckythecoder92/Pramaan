import { ArrowRight, FileText, MessageSquareText } from "lucide-react";
import { Link } from "react-router-dom";
import type { DocumentRecord } from "../../types/document";
import { formatRelativeTime } from "../../utils/format";
import { StatusBadge } from "../ui/StatusBadge";

interface RecentDocumentsProps {
  documents: DocumentRecord[];
}

export function RecentDocuments({ documents }: RecentDocumentsProps) {
  return (
    <ul className="divide-y divide-border">
      {documents.map((document) => {
        const isReady = document.status === "ready";

        return (
          <li
            key={document.id}
            className="flex items-center gap-3 px-4 py-3.5 sm:px-5"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-primary">
              <FileText className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
            </span>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {document.filename}
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {formatRelativeTime(document.created_at)} · {document.chunk_count}{" "}
                {document.chunk_count === 1 ? "chunk" : "chunks"}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <span className="hidden sm:inline-flex">
                <StatusBadge status={document.status} />
              </span>

              {isReady && (
                <Link
                  to={`/app/chat?documents=${encodeURIComponent(document.id)}`}
                  aria-label={`Chat with ${document.filename}`}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <MessageSquareText className="h-4 w-4" aria-hidden="true" />
                </Link>
              )}
            </div>
          </li>
        );
      })}

      <li className="px-4 py-3 sm:px-5">
        <Link
          to="/app/documents"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          View all documents
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </li>
    </ul>
  );
}
