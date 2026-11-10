import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  LogOut,
  Menu,
  UserRound,
} from "lucide-react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../hooks/useTheme";
import { getInitials } from "../../utils/format";
import { ThemeToggle } from "../ThemeToggle";

const pageTitles: Record<string, string> = {
  "/app": "Dashboard",
  "/app/documents": "Documents",
  "/app/chat": "Chat",
};

interface TopbarProps {
  onOpenSidebar: () => void;
}

export function Topbar({ onOpenSidebar }: TopbarProps) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const title = pageTitles[location.pathname] ?? "Workspace";
  const email = user?.email ?? "";

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (
        event.target instanceof Node &&
        !menuRef.current?.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-border bg-background/85 px-4 backdrop-blur-md supports-[backdrop-filter]:bg-background/70 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onOpenSidebar}
          aria-label="Open navigation"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-surface text-foreground shadow-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary lg:hidden"
        >
          <Menu className="h-[18px] w-[18px]" aria-hidden="true" />
        </button>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">{title}</p>
          <p className="hidden truncate text-[11px] text-muted-foreground sm:block">
            {email}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle theme={theme} onToggle={toggleTheme} />

        <div ref={menuRef} className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label="Open account menu"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-surface pl-1.5 pr-2 text-foreground shadow-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-[10px] font-bold text-primary">
              {email ? getInitials(email) : "PA"}
            </span>
            <ChevronDown
              className="h-3.5 w-3.5 text-muted-foreground"
              aria-hidden="true"
            />
          </button>

          {menuOpen && (
            <div
              role="menu"
              aria-label="Account menu"
              className="absolute right-0 top-11 w-64 overflow-hidden rounded-xl border border-border bg-surface shadow-xl shadow-black/10 motion-safe:animate-menu-in dark:shadow-black/30"
            >
              <div className="border-b border-border px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Signed in as
                </p>
                <p className="mt-1 truncate text-sm font-medium text-foreground">
                  {email}
                </p>
              </div>

              <div className="p-1.5">
                <div className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs text-muted-foreground">
                  <UserRound className="h-4 w-4" aria-hidden="true" />
                  <span className="truncate">Supabase account</span>
                </div>

                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    logout();
                  }}
                  className="mt-0.5 flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm font-medium text-danger transition-colors hover:bg-danger/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
