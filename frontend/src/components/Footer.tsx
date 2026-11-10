import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Logo } from "./Logo";

export function Footer() {
  const { isAuthenticated } = useAuth();

  return (
    <footer className="border-t border-border bg-surface/60">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div className="flex flex-col gap-2">
          <Logo />
          <p className="text-xs text-muted-foreground">
            Grounded answers for document-heavy teams.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <a
            href="#features"
            className="transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            className="transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            How it works
          </a>
          <Link
            to={isAuthenticated ? "/app" : "/login"}
            className="transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {isAuthenticated ? "Workspace" : "Sign in"}
          </Link>
          <span className="text-xs">
            © {new Date().getFullYear()} Pramaan AI
          </span>
        </div>
      </div>
    </footer>
  );
}
