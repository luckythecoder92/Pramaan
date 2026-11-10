import { useRef, useState } from "react";
import {
  AlertCircle,
  FileText,
  UploadCloud,
  X,
} from "lucide-react";
import { useDocuments } from "../../context/DocumentsContext";
import { useToast } from "../../context/ToastContext";
import type { UploadDocumentResponse } from "../../types/document";
import { getApiErrorMessage } from "../../utils/errors";
import { formatFileSize } from "../../utils/format";
import { validatePdfFile } from "../../utils/validation";
import { Button } from "../ui/Button";
import { cn } from "../../utils/cn";

interface DocumentUploaderProps {
  compact?: boolean;
  onUploaded?: (result: UploadDocumentResponse) => void;
}

export function DocumentUploader({
  compact = false,
  onUploaded,
}: DocumentUploaderProps) {
  const { uploadFile } = useDocuments();
  const { pushToast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const selectFile = (candidate: File | undefined) => {
    if (!candidate || isUploading) {
      return;
    }

    const validationError = validatePdfFile(candidate);

    if (validationError) {
      setError(validationError);
      setFile(null);
      pushToast({
        variant: "error",
        title: "That file cannot be uploaded",
        description: validationError,
      });
      return;
    }

    setFile(candidate);
    setError(null);
    setProgress(0);
  };

  const handleUpload = async () => {
    if (!file || isUploading) {
      return;
    }

    setIsUploading(true);
    setProgress(0);
    setError(null);

    try {
      const result = await uploadFile(file, (percent) =>
        setProgress(Math.min(100, percent)),
      );

      pushToast({
        variant: "success",
        title: "Document ready",
        description: `${result.filename} was processed into ${result.stored_chunks} ${
          result.stored_chunks === 1 ? "chunk" : "chunks"
        }.`,
      });

      setFile(null);
      setProgress(0);
      onUploaded?.(result);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    } catch (uploadError) {
      const message = getApiErrorMessage(uploadError);
      setError(message);
      pushToast({
        variant: "error",
        title: "Upload failed",
        description: message,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const openPicker = () => {
    if (!isUploading) {
      inputRef.current?.click();
    }
  };

  return (
    <div className="space-y-3">
      <div
        role="button"
        tabIndex={isUploading ? -1 : 0}
        aria-label="Choose a PDF to upload"
        aria-disabled={isUploading}
        onClick={openPicker}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openPicker();
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
          if (!isUploading) {
            setIsDragging(true);
          }
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setIsDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          selectFile(event.dataTransfer.files?.[0]);
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          compact ? "px-4 py-6" : "px-6 py-9",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border bg-background/60 hover:border-primary/40 hover:bg-muted/50",
          isUploading && "pointer-events-none opacity-70",
        )}
      >
        <span
          className={cn(
            "flex items-center justify-center rounded-xl border border-border bg-surface text-primary shadow-sm",
            compact ? "h-9 w-9" : "h-11 w-11",
          )}
        >
          <UploadCloud
            className={compact ? "h-4 w-4" : "h-5 w-5"}
            strokeWidth={1.9}
            aria-hidden="true"
          />
        </span>

        <span className="mt-3 text-sm font-semibold text-foreground">
          {isDragging ? "Drop your PDF here" : "Drag & drop a PDF"}
        </span>
        <span className="mt-1 text-xs text-muted-foreground">
          or <span className="font-medium text-primary">browse files</span> ·
          PDF only, up to 10 MB
        </span>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="sr-only"
        onChange={(event) => selectFile(event.target.files?.[0])}
        disabled={isUploading}
        tabIndex={-1}
      />

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2.5 text-xs text-danger"
        >
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {file && (
        <div className="rounded-xl border border-border bg-surface p-3">
          <div className="flex items-start gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileText className="h-4 w-4" aria-hidden="true" />
            </span>

            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-foreground">
                {file.name}
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {formatFileSize(file.size)}
              </p>
            </div>

            {!isUploading && (
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setError(null);
                  if (inputRef.current) {
                    inputRef.current.value = "";
                  }
                }}
                aria-label="Remove selected file"
                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            )}
          </div>

          {isUploading ? (
            <div className="mt-3">
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span>Uploading and indexing…</span>
                <span>{progress}%</span>
              </div>
              <div
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progress}
                aria-label="Upload progress"
                className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted"
              >
                <div
                  className="h-full rounded-full bg-primary transition-[width] duration-200 motion-reduce:transition-none"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : (
            <Button
              size="sm"
              onClick={handleUpload}
              className="mt-3 w-full"
            >
              Upload and process
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
