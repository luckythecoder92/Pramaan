import { FileText, Hash, MapPin, Quote } from "lucide-react";
import type { ChatSource } from "../../types/chat";
import type { DocumentRecord } from "../../types/document";
import { formatScore } from "../../utils/format";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";

interface CitationPanelProps {
  open: boolean;
  onClose: () => void;
  sources: ChatSource[];
  documents: DocumentRecord[];
}

export function CitationPanel({
  open,
  onClose,
  sources,
  documents,
}: CitationPanelProps) {
  const documentNames = new Map(
    documents.map((document) => [document.id, document.filename]),
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Sources for this answer"
      description="These are the document references returned by the Pramaan API for this response."
      size="lg"
      footer={
        <Button variant="secondary" onClick={onClose}>
          Close sources
        </Button>
      }
    >
      {sources.length === 0 ? (
        <div className="flex items-start gap-3 rounded-xl border border-border bg-background p-4 text-sm text-muted-foreground">
          <Quote className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          <p>
            No sources were returned for this answer. Pramaan only cites
            retrieved evidence, so an unanswerable response has no citations.
          </p>
        </div>
      ) : (
        <ol className="space-y-3">
          {sources.map((source, index) => {
            const documentName = documentNames.get(source.document_id);
            const score = formatScore(source.score);
            const page =
              source.page_number === null
                ? "Not reported"
                : `Page ${source.page_number}`;
            const chunk =
              source.chunk_index === null
                ? "Not reported"
                : `Chunk ${source.chunk_index}`;

            return (
              <li
                key={`${source.document_id}-${source.page_number}-${source.chunk_index}-${index}`}
                className="rounded-xl border border-border bg-background p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Quote className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                    <span className="text-xs font-semibold text-foreground">
                      Source {index + 1}
                    </span>
                  </div>

                  {score && (
                    <span className="rounded-md border border-border bg-surface px-2 py-1 text-[10px] font-medium text-muted-foreground">
                      Similarity {score}
                    </span>
                  )}
                </div>

                <div className="mt-3 flex items-start gap-2.5">
                  <FileText
                    className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <p className="break-words text-sm font-medium text-foreground">
                      {documentName ?? "Document not in the current library"}
                    </p>
                    <p className="mt-0.5 break-all font-mono text-[10px] text-muted-foreground">
                      ID: {source.document_id}
                    </p>
                  </div>
                </div>

                <dl className="mt-3 grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 rounded-lg bg-surface px-2.5 py-2 text-[11px]">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                    <div>
                      <dt className="text-muted-foreground">Page</dt>
                      <dd className="font-medium text-foreground">
                        {source.page_number === null
                          ? page
                          : source.page_number}
                      </dd>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 rounded-lg bg-surface px-2.5 py-2 text-[11px]">
                    <Hash className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                    <div>
                      <dt className="text-muted-foreground">Chunk index</dt>
                      <dd className="font-medium text-foreground">
                        {source.chunk_index === null
                          ? chunk
                          : source.chunk_index}
                      </dd>
                    </div>
                  </div>
                </dl>
              </li>
            );
          })}
        </ol>
      )}

      <p className="mt-4 text-[11px] leading-5 text-muted-foreground">
        Page numbers and chunk indexes are displayed exactly as returned by the
        backend. Document names are resolved from your current library; no
        preview text or additional page content is generated by the frontend.
      </p>
    </Modal>
  );
}
