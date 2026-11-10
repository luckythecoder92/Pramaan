import { useEffect, useRef } from "react";
import {
  AlertCircle,
  Copy,
  FileText,
  Lightbulb,
  Quote,
  Sparkles,
  Volume2,
} from "lucide-react";
import type { ChatMessage, ChatSource } from "../../types/chat";
import type { DocumentRecord } from "../../types/document";
import { cn } from "../../utils/cn";
import { MarkdownMessage } from "./MarkdownMessage";
import { useToast } from "../../context/ToastContext";

interface ChatMessageListProps {
  messages: ChatMessage[];
  documents: DocumentRecord[];
  isSending: boolean;
  speakingMessageId: string | null;
  onOpenSources: (sources: ChatSource[]) => void;
  onSpeak: (message: ChatMessage) => void;
  onSuggestion: (prompt: string) => void;
}

const suggestions = [
  "Summarize the key points across these documents.",
  "What are the most important obligations or requirements?",
  "List every important date or deadline mentioned.",
] as const;

function formatTime(timestamp: number): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

function getSourceDocumentName(
  source: ChatSource,
  documents: DocumentRecord[],
): string {
  return (
    documents.find((document) => document.id === source.document_id)?.filename ??
    "Unknown document"
  );
}

export function ChatMessageList({
  messages,
  documents,
  isSending,
  speakingMessageId,
  onOpenSources,
  onSpeak,
  onSuggestion,
}: ChatMessageListProps) {
  const { pushToast } = useToast();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({
      behavior: messages.length > 1 ? "smooth" : "auto",
      block: "end",
    });
  }, [messages, isSending]);

  const copyAnswer = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      pushToast({ variant: "success", title: "Answer copied" });
    } catch {
      pushToast({
        variant: "error",
        title: "Could not copy",
        description: "Clipboard access is blocked in this browser.",
      });
    }
  };

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center overflow-y-auto px-4 py-10 sm:px-6">
        <div className="w-full max-w-lg text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10 text-primary">
            <Sparkles className="h-[26px] w-[26px]" strokeWidth={1.8} aria-hidden="true" />
          </span>
          <h2 className="mt-5 text-xl font-semibold tracking-[-0.03em] text-foreground">
            Ask across your library
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            Pramaan retrieves relevant passages from your documents and answers
            only when the evidence supports it. Every answer can be checked
            against its returned source metadata.
          </p>

          <div className="mt-7 space-y-2 text-left">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => onSuggestion(suggestion)}
                className="group flex w-full items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 text-left shadow-sm transition-colors hover:border-primary/30 hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <Lightbulb
                  className="h-4 w-4 shrink-0 text-primary"
                  aria-hidden="true"
                />
                <span className="flex-1 text-xs leading-5 text-foreground">
                  {suggestion}
                </span>
                <span className="text-[10px] font-medium text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                  Use prompt
                </span>
              </button>
            ))}
          </div>

          <p className="mt-6 text-[11px] text-muted-foreground">
            Answers are generated from your uploaded documents, not external
            knowledge.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-3 py-5 sm:px-6">
      <div className="mx-auto max-w-3xl space-y-5">
        {messages.map((message) => {
          const isUser = message.role === "user";
          const isSpeaking = speakingMessageId === message.id;

          if (isUser) {
            return (
              <div key={message.id} className="flex justify-end">
                <div className="max-w-[88%] sm:max-w-[78%]">
                  <div className="rounded-2xl rounded-br-md bg-primary px-4 py-3 text-sm leading-6 text-primary-foreground shadow-sm">
                    <p className="whitespace-pre-wrap break-words">
                      {message.content}
                    </p>
                  </div>
                  <p className="mt-1 text-right text-[10px] text-muted-foreground">
                    {formatTime(message.createdAt)}
                  </p>
                </div>
              </div>
            );
          }

          if (message.failed) {
            return (
              <div key={message.id} className="flex gap-2.5 sm:gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-danger/10 text-danger">
                  <AlertCircle className="h-4 w-4" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1 rounded-2xl rounded-tl-md border border-danger/30 bg-danger/5 px-4 py-3">
                  <p className="text-xs font-semibold text-danger">
                    Response failed
                  </p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {message.content}
                  </p>
                  <p className="mt-1.5 text-[10px] text-muted-foreground">
                    {formatTime(message.createdAt)}
                  </p>
                </div>
              </div>
            );
          }

          const sources = message.sources ?? [];

          return (
            <div key={message.id} className="flex gap-2.5 sm:gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-primary/15 bg-primary/10 text-primary">
                <Sparkles className="h-4 w-4" strokeWidth={1.9} aria-hidden="true" />
              </span>

              <div className="min-w-0 flex-1">
                <div className="rounded-2xl rounded-tl-md border border-border bg-surface px-4 py-3 shadow-sm">
                  {message.answerable === false && (
                    <span className="mb-2 inline-flex items-center gap-1.5 rounded-md border border-warning/30 bg-warning/10 px-2 py-1 text-[10px] font-semibold text-warning">
                      <AlertCircle className="h-3 w-3" aria-hidden="true" />
                      No supporting evidence found
                    </span>
                  )}

                  <MarkdownMessage content={message.content} />

                  {sources.length > 0 && (
                    <div className="mt-3 border-t border-border pt-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                          Sources
                        </p>
                        <button
                          type="button"
                          onClick={() => onOpenSources(sources)}
                          className="text-[10px] font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        >
                          View details
                        </button>
                      </div>

                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {sources.map((source, index) => {
                          const name = getSourceDocumentName(source, documents);
                          const page =
                            source.page_number === null
                              ? null
                              : `p. ${source.page_number}`;

                          return (
                            <button
                              key={`${source.document_id}-${source.chunk_index}-${index}`}
                              type="button"
                              onClick={() => onOpenSources(sources)}
                              className="inline-flex max-w-full items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1 text-[10px] text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                              title={name}
                            >
                              <FileText className="h-3 w-3 shrink-0" aria-hidden="true" />
                              <span className="max-w-[16rem] truncate">{name}</span>
                              {page && <span className="shrink-0">· {page}</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-1.5 flex flex-wrap items-center gap-1">
                  <span className="mr-1 text-[10px] text-muted-foreground">
                    {formatTime(message.createdAt)}
                  </span>

                  <button
                    type="button"
                    onClick={() => void copyAnswer(message.content)}
                    className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-[10px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <Copy className="h-3 w-3" aria-hidden="true" />
                    Copy
                  </button>

                  <button
                    type="button"
                    onClick={() => onSpeak(message)}
                    aria-label={
                      isSpeaking ? "Stop reading aloud" : "Read answer aloud"
                    }
                    className={cn(
                      "inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-[10px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                      isSpeaking
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <Volume2 className="h-3 w-3" aria-hidden="true" />
                    {isSpeaking ? "Stop" : "Listen"}
                  </button>

                  {sources.length > 0 && (
                    <button
                      type="button"
                      onClick={() => onOpenSources(sources)}
                      className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-[10px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      <Quote className="h-3 w-3" aria-hidden="true" />
                      {sources.length}{" "}
                      {sources.length === 1 ? "source" : "sources"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {isSending && (
          <div className="flex gap-2.5 sm:gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-primary/15 bg-primary/10 text-primary">
              <Sparkles className="h-4 w-4" strokeWidth={1.9} aria-hidden="true" />
            </span>
            <div className="flex items-center gap-2 rounded-2xl rounded-tl-md border border-border bg-surface px-4 py-3 shadow-sm">
              <span className="flex items-center gap-1" aria-hidden="true">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s] motion-reduce:animate-none" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s] motion-reduce:animate-none" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground motion-reduce:animate-none" />
              </span>
              <span className="text-xs text-muted-foreground">
                Searching your documents…
              </span>
            </div>
          </div>
        )}

        <div ref={endRef} aria-hidden="true" />
      </div>
    </div>
  );
}
