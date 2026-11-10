import {
  useEffect,
  useRef,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { Mic, MicOff, Send, Square } from "lucide-react";
import { useSpeechRecognition } from "../../hooks/useSpeechRecognition";
import { useToast } from "../../context/ToastContext";
import { cn } from "../../utils/cn";

const MAX_QUERY_LENGTH = 2_000;

interface ChatComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onStop: () => void;
  isSending: boolean;
  disabled?: boolean;
}

export function ChatComposer({
  value,
  onChange,
  onSubmit,
  onStop,
  isSending,
  disabled = false,
}: ChatComposerProps) {
  const { pushToast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const valueRef = useRef(value);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  const {
    supported,
    isListening,
    interimTranscript,
    start,
    stop,
  } = useSpeechRecognition({
    onFinalResult: (text) => {
      const current = valueRef.current;
      const separator = current.length > 0 && !/\s$/.test(current) ? " " : "";
      onChange(`${current}${separator}${text}`.slice(0, MAX_QUERY_LENGTH));
    },
    onError: (message) => {
      pushToast({
        variant: "warning",
        title: "Voice input",
        description: message,
      });
    },
  });

  useEffect(() => {
    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 168)}px`;
  }, [value]);

  const submitQuery = () => {
    if (isListening) {
      stop();
    }

    if (value.trim() && !isSending && !disabled) {
      onSubmit();
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submitQuery();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      if (event.nativeEvent.isComposing) {
        return;
      }

      event.preventDefault();
      submitQuery();
    }
  };

  const canSend = value.trim().length > 0 && !isSending && !disabled;

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-border bg-surface/95 px-3 py-3 backdrop-blur sm:px-5 sm:py-4"
    >
      <div
        className={cn(
          "rounded-xl border border-border bg-background shadow-sm transition-colors focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/15",
          disabled && "opacity-70",
        )}
      >
        {(isListening || interimTranscript) && (
          <div className="flex items-start gap-2 border-b border-border px-3 py-2 text-[11px] text-muted-foreground">
            <span className="mt-0.5 flex h-2 w-2 shrink-0 animate-pulse rounded-full bg-danger motion-reduce:animate-none" />
            <span className="min-w-0 break-words">
              <span className="font-medium text-foreground">Listening…</span>{" "}
              {interimTranscript || "Speak now. Your words will appear here."}
            </span>
          </div>
        )}

        <label htmlFor="chat-composer" className="sr-only">
          Ask a question about your documents
        </label>

        <textarea
          ref={textareaRef}
          id="chat-composer"
          rows={1}
          value={value}
          onChange={(event) =>
            onChange(event.target.value.slice(0, MAX_QUERY_LENGTH))
          }
          onKeyDown={handleKeyDown}
          maxLength={MAX_QUERY_LENGTH}
          disabled={disabled}
          placeholder={
            disabled
              ? "Upload and process a document to start chatting…"
              : "Ask a question about your documents…"
          }
          className="block max-h-[168px] min-h-[52px] w-full resize-none bg-transparent px-3.5 py-3 text-sm leading-6 text-foreground placeholder:text-muted-foreground/70 focus:outline-none disabled:cursor-not-allowed"
        />

        <div className="flex items-center justify-between gap-2 px-2 pb-2">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => (isListening ? stop() : start())}
              aria-label={
                !supported
                  ? "Voice input is not supported in this browser"
                  : isListening
                    ? "Stop voice input"
                    : "Start voice input"
              }
              title={
                supported
                  ? isListening
                    ? "Stop voice input"
                    : "Dictate your question"
                  : "Voice input is not supported in this browser"
              }
              disabled={disabled || !supported}
              className={cn(
                "inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-40",
                isListening
                  ? "bg-danger/10 text-danger"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {supported ? (
                <Mic className="h-4 w-4" aria-hidden="true" />
              ) : (
                <MicOff className="h-4 w-4" aria-hidden="true" />
              )}
            </button>

            <span className="hidden text-[10px] text-muted-foreground sm:inline">
              {value.length > 1_800
                ? `${value.length} / ${MAX_QUERY_LENGTH}`
                : "Enter to send · Shift + Enter for a new line"}
            </span>
          </div>

          {isSending ? (
            <button
              type="button"
              onClick={onStop}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-surface px-3 text-xs font-semibold text-foreground shadow-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Square className="h-3 w-3 fill-current" aria-hidden="true" />
              Stop
            </button>
          ) : (
            <button
              type="submit"
              disabled={!canSend}
              aria-label="Send question"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-40"
            >
              <Send className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {!supported && (
        <p className="mt-2 text-center text-[10px] text-muted-foreground">
          Voice input is not available in this browser. You can still type your
          question.
        </p>
      )}
    </form>
  );
}
