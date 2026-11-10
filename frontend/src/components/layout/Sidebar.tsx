import {
  LayoutDashboard,
  MessageSquareText,
  FileText,
  X,
} from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { useDocuments } from "../../context/DocumentsContext";
import { cn } from "../../utils/cn";
import { Logo } from "../Logo";

const navigation = [
  { label: "Dashboard", to: "/app", icon: LayoutDashboard, end: true },
  { label: "Documents", to: "/app/documents", icon: FileText, end: false },
  { label: "Chat", to: "/app/chat", icon: MessageSquareText, end: false },
] as const;

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { counts } = useDocuments();

  return (
    <aside
      aria-label="Workspace navigation"
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-surface transition-transform duration-200 ease-out motion-reduce:transition-none lg:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full",
      )}
    >
      <div className="flex h-16 items-center justify-between border-b border-border px-4">
        <Link
          to="/app"
          aria-label="Pramaan AI workspace"
          className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <Logo />
        </Link>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close navigation"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary lg:hidden"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-5">
        <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Workspace
        </p>

        <nav aria-label="Workspace" className="mt-2 space-y-1">
          {navigation.map(({ label, to, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )
              }
            >
              <Icon className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-8 rounded-xl border border-border bg-background p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Workspace status
          </p>
          <p className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-foreground">
            {counts.total}
          </p>
          <p className="text-xs text-muted-foreground">
            {counts.total === 1 ? "document" : "documents"} in your library
          </p>

          <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-lg bg-muted/70 px-2.5 py-2">
              <dt className="text-muted-foreground">Ready</dt>
              <dd className="mt-0.5 font-semibold text-foreground">
                {counts.ready}
              </dd>
            </div>
            <div className="rounded-lg bg-muted/70 px-2.5 py-2">
              <dt className="text-muted-foreground">Processing</dt>
              <dd className="mt-0.5 font-semibold text-foreground">
                {counts.processing}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="border-t border-border px-4 py-4">
        <p className="text-[11px] leading-5 text-muted-foreground">
          Answers are generated only from your uploaded documents and include
          verifiable source metadata.
        </p>
      </div>
    </aside>
  );
}
