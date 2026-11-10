import { FileText, Search, Send, Sparkles } from "lucide-react";

const documents = [
  { name: "Vendor_Agreement_Q3.pdf", meta: "24 pages" },
  { name: "Policy_Handbook.pdf", meta: "68 pages" },
  { name: "Board_Minutes_Sept.pdf", meta: "11 pages" },
] as const;

export function WorkspacePreview() {
  return (
    <div aria-hidden="true" className="relative mx-auto w-full max-w-xl">
      <div className="absolute -inset-6 rounded-[2.5rem] bg-primary/5 blur-2xl" />

      <div className="relative overflow-hidden rounded-2xl border border-border bg-surface shadow-xl shadow-black/5 dark:shadow-black/25">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-border" />
            <span className="h-2.5 w-2.5 rounded-full bg-border" />
            <span className="h-2.5 w-2.5 rounded-full bg-border" />
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 text-[10px] font-medium text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            Grounded in sources
          </span>
        </div>

        <div className="grid sm:grid-cols-[0.82fr_1.18fr]">
          <aside className="hidden border-r border-border bg-background/60 p-4 sm:block">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Documents
            </p>

            <ul className="mt-3 space-y-2">
              {documents.map((document) => (
                <li
                  key={document.name}
                  className="flex items-center gap-2.5 rounded-lg border border-transparent px-1.5 py-1.5"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border bg-surface text-muted-foreground">
                    <FileText className="h-3.5 w-3.5" strokeWidth={1.8} />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[11px] font-medium text-foreground">
                      {document.name}
                    </span>
                    <span className="block text-[10px] text-muted-foreground">
                      {document.meta}
                    </span>
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-4 rounded-lg border border-dashed border-border px-2.5 py-2 text-[10px] leading-4 text-muted-foreground">
              Add a document to expand the workspace.
            </div>
          </aside>

          <div className="p-4 sm:p-5">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Sparkles className="h-3.5 w-3.5" strokeWidth={1.9} />
              </span>
              <span className="text-xs font-medium text-foreground">
                Pramaan Assistant
              </span>
            </div>

            <div className="mt-4 space-y-3">
              <div className="ml-auto max-w-[92%] rounded-2xl rounded-br-sm bg-primary px-3.5 py-2.5 text-[12px] leading-5 text-primary-foreground">
                What changed in the Q3 vendor agreement?
              </div>

              <div className="max-w-[96%] rounded-2xl rounded-bl-sm border border-border bg-background px-3.5 py-3 text-[12px] leading-5 text-foreground">
                Three clauses changed: payment terms moved to net-45, the renewal
                window narrowed to 30 days, and liability was capped at 12 months
                of fees.
                <span className="mt-2 flex flex-wrap gap-1.5">
                  <span className="inline-flex items-center gap-1 rounded-md border border-border bg-surface px-1.5 py-0.5 text-[10px] text-muted-foreground">
                    <FileText className="h-2.5 w-2.5" />
                    [1] Vendor Agreement · p.4
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md border border-border bg-surface px-1.5 py-0.5 text-[10px] text-muted-foreground">
                    <FileText className="h-2.5 w-2.5" />
                    [2] Amendment · p.2
                  </span>
                </span>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2.5">
              <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span className="truncate text-[11px] text-muted-foreground">
                Ask anything about your documents…
              </span>
              <span className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Send className="h-3 w-3" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
