import { useEffect, useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../hooks/useTheme";
import { ButtonLink } from "./ButtonLink";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";

const navigation = [
  { label: "Product", href: "#product" },
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
] as const;

export function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const ctaLabel = isAuthenticated ? "Open workspace" : "Get started";
  const ctaTarget = isAuthenticated ? "/app" : "/register";

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isMenuOpen]);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/65">
      <nav
        aria-label="Primary navigation"
        className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8"
      >
        <Link
          to="/"
          aria-label="Pramaan AI home"
          className="shrink-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <Logo />
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {navigation.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle theme={theme} onToggle={toggleTheme} />

          <ButtonLink to={ctaTarget} className="hidden sm:inline-flex">
            {ctaLabel}
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </ButtonLink>

          <button
            type="button"
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-label={
              isMenuOpen ? "Close navigation menu" : "Open navigation menu"
            }
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-foreground shadow-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background md:hidden"
          >
            {isMenuOpen ? (
              <X className="h-[18px] w-[18px]" aria-hidden="true" />
            ) : (
              <Menu className="h-[18px] w-[18px]" aria-hidden="true" />
            )}
          </button>
        </div>
      </nav>

      {isMenuOpen && (
        <div
          id="mobile-navigation"
          className="border-t border-border bg-background md:hidden"
        >
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
            <div className="flex flex-col gap-1">
              {navigation.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={closeMenu}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  {item.label}
                </a>
              ))}
            </div>

            <ButtonLink
              to={ctaTarget}
              onClick={closeMenu}
              className="mt-4 w-full"
            >
              {ctaLabel}
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </ButtonLink>
          </div>
        </div>
      )}
    </header>
  );
}
