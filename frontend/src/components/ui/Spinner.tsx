import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../../utils/cn";

interface SpinnerProps {
  className?: string;
  label?: string;
}

export function Spinner({ className, label = "Loading" }: SpinnerProps) {
  return (
    <span role="status" className="inline-flex items-center gap-2">
      <Loader2
        className={cn("h-4 w-4 animate-spin text-current motion-reduce:animate-none", className)}
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </span>
  );
}

interface PageLoaderProps {
  label?: string;
  children?: ReactNode;
}

export function PageLoader({
  label = "Loading your workspace",
  children,
}: PageLoaderProps) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-surface shadow-sm">
        <Loader2
          className="h-5 w-5 animate-spin text-primary motion-reduce:animate-none"
          aria-hidden="true"
        />
      </span>
      <p className="text-sm text-muted-foreground">{label}</p>
      {children}
    </div>
  );
}
