import {
  ArrowRight,
  CheckCircle2,
  FileText,
  Loader2,
  MessageSquareText,
  RefreshCw,
  UploadCloud,
  XCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { DocumentUploader } from "../components/documents/DocumentUploader";
import { RecentDocuments } from "../components/dashboard/RecentDocuments";
import { StatCard } from "../components/dashboard/StatCard";
import { ButtonLink } from "../components/ButtonLink";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { PageHeader } from "../components/ui/PageHeader";
import { useAuth } from "../context/AuthContext";
import { useDocuments } from "../context/DocumentsContext";
import {
  formatRelativeTime,
  getDisplayName,
  getGreeting,
} from "../utils/format";

export function DashboardPage() {
  const { user } = useAuth();
  const {
    documents,
    counts,
    isLoading,
    isRefreshing,
    error,
    lastUpdated,
    refresh,
  } = useDocuments();

  const displayName = user ? getDisplayName(user.email) : "there";
  const today = new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());
  const recentDocuments = documents.slice(0, 5);
  const lastUpdatedLabel = lastUpdated
    ? formatRelativeTime(new Date(lastUpdated).toISOString())
    : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-9 lg:px-8">
      <PageHeader
        eyebrow={today}
        title={`${getGreeting()}, ${displayName}.`}
        description="Here is the current state of your document library and a shortcut back into the conversation."
        actions={
          <>
            <Button
              variant="secondary"
              size="md"
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

      <section
        aria-label="Document statistics"
        className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4"
      >
        <StatCard
          label="Total documents"
          value={counts.total}
          icon={FileText}
          hint="In your workspace"
          isLoading={isLoading}
        />
        <StatCard
          label="Ready"
          value={counts.ready}
          icon={CheckCircle2}
          tone="success"
          hint="Searchable right now"
          isLoading={isLoading}
        />
        <StatCard
          label="Processing"
          value={counts.processing}
          icon={Loader2}
          tone="warning"
          hint="Indexing in progress"
          isLoading={isLoading}
        />
        <StatCard
          label="Failed"
          value={counts.failed}
          icon={XCircle}
          tone="danger"
          hint="Needs your attention"
          isLoading={isLoading}
        />
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.55fr_0.95fr]">
        <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-4 sm:px-5">
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Recent documents
              </h2>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {lastUpdatedLabel
                  ? `Library synced ${lastUpdatedLabel}`
                  : "Your latest uploads and their indexing status."}
              </p>
            </div>

            <Link
              to="/app/documents"
              className="inline-flex items-center gap-1 rounded-md text-xs font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Manage
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>

          {isLoading && recentDocuments.length === 0 ? (
            <div className="space-y-3 p-4 sm:p-5">
              {[0, 1, 2, 3].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="h-9 w-9 animate-pulse rounded-lg bg-muted motion-reduce:animate-none" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-2/3 animate-pulse rounded bg-muted motion-reduce:animate-none" />
                    <div className="h-2.5 w-1/3 animate-pulse rounded bg-muted motion-reduce:animate-none" />
                  </div>
                </div>
              ))}
            </div>
          ) : recentDocuments.length > 0 ? (
            <RecentDocuments documents={recentDocuments} />
          ) : (
            <div className="p-4 sm:p-5">
              <EmptyState
                icon={FileText}
                title="No documents yet"
                description="Upload a PDF to make your workspace searchable. Every answer will point back to the document it came from."
                action={
                  <ButtonLink to="/app/documents" variant="secondary">
                    <UploadCloud className="h-4 w-4" aria-hidden="true" />
                    Go to upload
                  </ButtonLink>
                }
                className="border-0 bg-transparent px-2 py-8"
              />
            </div>
          )}
        </section>

        <div className="space-y-6">
          <section className="rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-5">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <UploadCloud className="h-4 w-4" aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-sm font-semibold text-foreground">
                  Add a document
                </h2>
                <p className="text-[11px] text-muted-foreground">
                  PDF up to 10 MB
                </p>
              </div>
            </div>

            <div className="mt-4">
              <DocumentUploader compact />
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-5">
            <h2 className="text-sm font-semibold text-foreground">
              Jump back in
            </h2>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Continue with a question or review the full library.
            </p>

            <div className="mt-4 space-y-2">
              <Link
                to="/app/chat"
                className="group flex items-center gap-3 rounded-xl border border-border bg-background px-3 py-3 transition-colors hover:border-primary/30 hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <MessageSquareText className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-semibold text-foreground">
                    Ask your documents
                  </span>
                  <span className="block text-[11px] text-muted-foreground">
                    Answers with source metadata
                  </span>
                </span>
                <ArrowRight
                  className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
                  aria-hidden="true"
                />
              </Link>

              <Link
                to="/app/documents"
                className="group flex items-center gap-3 rounded-xl border border-border bg-background px-3 py-3 transition-colors hover:border-primary/30 hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <FileText className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-semibold text-foreground">
                    Manage your library
                  </span>
                  <span className="block text-[11px] text-muted-foreground">
                    Select, chat, or remove documents
                  </span>
                </span>
                <ArrowRight
                  className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
                  aria-hidden="true"
                />
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
