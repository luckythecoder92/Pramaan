import { ArrowLeft, FileQuestion } from "lucide-react";
import { Link } from "react-router-dom";
import { Logo } from "../components/Logo";
import { ButtonLink } from "../components/ButtonLink";
import { useAuth } from "../context/AuthContext";

export function NotFoundPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="mx-auto flex h-16 w-full max-w-7xl items-center px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          aria-label="Pramaan AI home"
          className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <Logo />
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="max-w-md text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-surface text-muted-foreground shadow-sm">
            <FileQuestion className="h-6 w-6" strokeWidth={1.9} aria-hidden="true" />
          </span>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            404
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-foreground">
            This page is not in the workspace
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            The link may be outdated, or the page may have moved. Use one of the
            options below to continue.
          </p>

          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <ButtonLink to={isAuthenticated ? "/app" : "/login"}>
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              {isAuthenticated ? "Back to workspace" : "Go to sign in"}
            </ButtonLink>
            <ButtonLink to="/" variant="secondary">
              Return home
            </ButtonLink>
          </div>
        </div>
      </main>
    </div>
  );
}
