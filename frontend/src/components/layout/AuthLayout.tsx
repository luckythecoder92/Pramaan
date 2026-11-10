import type { ReactNode } from "react";
import { BadgeCheck, FileCheck2, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { useTheme } from "../../hooks/useTheme";
import { Logo } from "../Logo";
import { ThemeToggle } from "../ThemeToggle";

const highlights = [
  {
    icon: FileCheck2,
    title: "Grounded answers",
    description: "Responses are built strictly from the documents you upload.",
  },
  {
    icon: BadgeCheck,
    title: "Verifiable citations",
    description: "Every source traces back to a page, chunk, and relevance score.",
  },
  {
    icon: ShieldCheck,
    title: "Private by design",
    description: "Your files stay in your workspace and are scoped to your account.",
  },
] as const;

interface AuthLayoutProps {
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthLayout({ children, footer }: AuthLayoutProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="relative min-h-dvh bg-background">
      <div className="absolute right-4 top-4 z-20 sm:right-6 sm:top-6">
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
      </div>

      <div className="mx-auto grid min-h-dvh max-w-6xl lg:grid-cols-[1.02fr_0.98fr]">
        <aside className="relative hidden overflow-hidden border-r border-border bg-surface/60 px-10 py-12 lg:flex lg:flex-col lg:justify-between">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-24 top-24 h-80 w-80 rounded-full bg-primary/10 blur-3xl"
          />

          <Link
            to="/"
            aria-label="Pramaan AI home"
            className="relative w-fit rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Logo />
          </Link>

          <div className="relative max-w-md">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
              Document intelligence
            </p>
            <h2 className="mt-3 text-balance text-3xl font-semibold leading-tight tracking-[-0.035em] text-foreground">
              Ask better questions of every document you rely on.
            </h2>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Pramaan reads across your files and answers with evidence you can
              inspect, so the source is always one step away.
            </p>

            <ul className="mt-9 space-y-5">
              {highlights.map(({ icon: Icon, title, description }) => (
                <li key={title} className="flex gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-foreground">
                      {title}
                    </span>
                    <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">
                      {description}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <p className="relative text-xs text-muted-foreground">
            © {new Date().getFullYear()} Pramaan AI
          </p>
        </aside>

        <main className="flex items-center justify-center px-4 py-12 sm:px-8">
          <div className="w-full max-w-md">
            <div className="mb-8 lg:hidden">
              <Link
                to="/"
                aria-label="Pramaan AI home"
                className="inline-flex rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <Logo />
              </Link>
            </div>

            {children}

            {footer && (
              <div className="mt-6 text-center text-sm text-muted-foreground">
                {footer}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
