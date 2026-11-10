import axios from "axios";
import { useEffect, useRef, useState } from "react";
import {
  Layers,
  MessageSquareText,
  RotateCcw,
  UploadCloud,
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { ChatComposer } from "../components/chat/ChatComposer";
import { ChatMessageList } from "../components/chat/ChatMessageList";
import { CitationPanel } from "../components/chat/CitationPanel";
import { DocumentSelector } from "../components/chat/DocumentSelector";
import { Button } from "../components/ui/Button";
import { useDocuments } from "../context/DocumentsContext";
import { useToast } from "../context/ToastContext";
import { askDocumentQuestion } from "../services/chat.service";
import { useSpeechSynthesis } from "../hooks/useSpeechSynthesis";
import type { ChatMessage, ChatSource } from "../types/chat";
import { getApiErrorMessage } from "../utils/errors";

function createMessageId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `message-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function toSpeechText(content: string): string {
  return content
    .replace(/```[\s\S]*?```/g, " Code block. ")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^>\s?/gm, "")
    .replace(/[*_~]/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function ChatPage() {
  const { documents, readyDocuments, isLoading } = useDocuments();
  const { pushToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>(() =>
    (searchParams.get("documents") ?? "").split(",").filter(Boolean),
  );
  const [showDocuments, setShowDocuments] = useState(false);
  const [sourcePanel, setSourcePanel] = useState<ChatSource[] | null>(null);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(
    null,
  );

  const abortRef = useRef<AbortController | null>(null);
  const requestSequence = useRef(0);
  const speech = useSpeechSynthesis({
    onError: (message) => {
      pushToast({
        variant: "warning",
        title: "Read aloud",
        description: message,
      });
    },
  });

  const selectionParam = searchParams.get("documents") ?? "";

  // Keep local selection in sync when the URL changes (for example, from a
  // document row or a browser back navigation).
  useEffect(() => {
    const parsed = selectionParam.split(",").filter(Boolean);
    setSelectedIds((current) => {
      if (
        parsed.length === current.length &&
        parsed.every((id, index) => id === current[index])
      ) {
        return current;
      }

      return parsed;
    });
  }, [selectionParam]);

  // Only ready documents can be sent to the chat endpoint.
  useEffect(() => {
    if (isLoading) {
      return;
    }

    const readyIds = new Set(readyDocuments.map((document) => document.id));
    setSelectedIds((current) => {
      const next = current.filter((id) => readyIds.has(id));
      return next.length === current.length ? current : next;
    });
  }, [isLoading, readyDocuments]);

  // Reflect selection changes in the URL so chat links are shareable and
  // the selection survives a page refresh.
  useEffect(() => {
    const next = selectedIds.join(",");

    if (selectionParam === next) {
      return;
    }

    const params = new URLSearchParams(searchParams);

    if (next) {
      params.set("documents", next);
    } else {
      params.delete("documents");
    }

    setSearchParams(params, { replace: true });
  }, [selectedIds, selectionParam, searchParams, setSearchParams]);

  useEffect(() => {
    return () => {
      requestSequence.current += 1;
      abortRef.current?.abort();
    };
  }, []);

  const stopResponse = () => {
    requestSequence.current += 1;
    abortRef.current?.abort();
    abortRef.current = null;
    setIsSending(false);
  };

  const ask = async (rawQuery: string) => {
    const query = rawQuery.trim();

    if (!query || isSending) {
      return;
    }

    if (readyDocuments.length === 0) {
      pushToast({
        variant: "warning",
        title: "No ready documents",
        description:
          "Upload a PDF and wait for its status to become Ready before asking a question.",
      });
      return;
    }

    const readyIds = new Set(readyDocuments.map((document) => document.id));
    const documentIds = selectedIds.filter((id) => readyIds.has(id));
    const sequence = requestSequence.current + 1;
    requestSequence.current = sequence;

    const controller = new AbortController();
    abortRef.current = controller;
    setSourcePanel(null);
    setShowDocuments(false);
    setInput("");
    setIsSending(true);
    setMessages((current) => [
      ...current,
      {
        id: createMessageId(),
        role: "user",
        content: query,
        createdAt: Date.now(),
      },
    ]);

    try {
      const response = await askDocumentQuestion(
        { query, documentIds, limit: 5 },
        controller.signal,
      );

      if (controller.signal.aborted || requestSequence.current !== sequence) {
        return;
      }

      setMessages((current) => [
        ...current,
        {
          id: createMessageId(),
          role: "assistant",
          content: response.answer,
          createdAt: Date.now(),
          sources: response.sources,
          answerable: response.answerable,
        },
      ]);
    } catch (error) {
      if (
        controller.signal.aborted ||
        requestSequence.current !== sequence ||
        axios.isCancel(error)
      ) {
        return;
      }

      const message = getApiErrorMessage(error);
      setMessages((current) => [
        ...current,
        {
          id: createMessageId(),
          role: "assistant",
          content: message,
          createdAt: Date.now(),
          failed: true,
        },
      ]);
      pushToast({
        variant: "error",
        title: "Answer could not be generated",
        description: message,
      });
    } finally {
      if (requestSequence.current === sequence) {
        setIsSending(false);
        abortRef.current = null;
      }
    }
  };

  const startNewConversation = () => {
    if (isSending) {
      stopResponse();
    }

    speech.stop();
    setSpeakingMessageId(null);
    setSourcePanel(null);
    setMessages([]);
    setInput("");
  };

  const handleSpeak = (message: ChatMessage) => {
    const isCurrent = speakingMessageId === message.id && speech.isSpeaking;

    if (isCurrent) {
      speech.stop();
      setSpeakingMessageId(null);
      return;
    }

    setSpeakingMessageId(message.id);
    void speech.speak(toSpeechText(message.content));
  };

  const activeSpeakingId = speech.isSpeaking ? speakingMessageId : null;
  const scopeLabel =
    selectedIds.length === 0
      ? `All ${readyDocuments.length} ready ${
          readyDocuments.length === 1 ? "document" : "documents"
        }`
      : `${selectedIds.length} selected ${
          selectedIds.length === 1 ? "document" : "documents"
        }`;

  return (
    <div className="flex h-[calc(100dvh-4rem)] min-h-0 flex-col overflow-hidden bg-background">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-border bg-surface/70 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <MessageSquareText className="h-4 w-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold text-foreground">
              Document chat
            </h1>
            <p className="truncate text-[11px] text-muted-foreground">
              {scopeLabel}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowDocuments((open) => !open)}
            aria-expanded={showDocuments}
            aria-controls="mobile-document-selector"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 text-xs font-medium text-foreground shadow-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary lg:hidden"
          >
            <Layers className="h-3.5 w-3.5" aria-hidden="true" />
            Documents
          </button>

          <Button
            size="sm"
            variant="secondary"
            onClick={startNewConversation}
            disabled={messages.length === 0 && input.length === 0}
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            New conversation
          </Button>
        </div>
      </div>

      {showDocuments && (
        <div
          id="mobile-document-selector"
          className="h-[min(44dvh,360px)] shrink-0 border-b border-border bg-surface lg:hidden"
        >
          <DocumentSelector
            documents={documents}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            isLoading={isLoading}
          />
        </div>
      )}

      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-72 shrink-0 border-r border-border bg-surface/60 lg:block">
          <DocumentSelector
            documents={documents}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            isLoading={isLoading}
          />
        </aside>

        <section className="flex min-w-0 flex-1 flex-col">
          <ChatMessageList
            messages={messages}
            documents={documents}
            isSending={isSending}
            speakingMessageId={activeSpeakingId}
            onOpenSources={setSourcePanel}
            onSpeak={handleSpeak}
            onSuggestion={(prompt) => void ask(prompt)}
          />

          {readyDocuments.length === 0 && !isLoading && (
            <div className="border-t border-warning/25 bg-warning/5 px-4 py-2.5 sm:px-6">
              <p className="text-[11px] leading-5 text-muted-foreground">
                {documents.length === 0
                  ? "No documents are in the library yet."
                  : "None of your documents are ready to search yet."}{" "}
                <Link
                  to="/app/documents"
                  className="inline-flex items-center gap-1 font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <UploadCloud className="h-3 w-3" aria-hidden="true" />
                  Upload a PDF
                </Link>
              </p>
            </div>
          )}

          <ChatComposer
            value={input}
            onChange={setInput}
            onSubmit={() => void ask(input)}
            onStop={stopResponse}
            isSending={isSending}
            disabled={readyDocuments.length === 0}
          />
        </section>
      </div>

      <CitationPanel
        open={sourcePanel !== null}
        onClose={() => setSourcePanel(null)}
        sources={sourcePanel ?? []}
        documents={documents}
      />
    </div>
  );
}
