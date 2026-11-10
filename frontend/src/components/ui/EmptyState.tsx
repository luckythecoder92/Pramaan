import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface/60 px-6 py-12 text-center",
        className,
      )}
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-background text-muted-foreground">
        <Icon className="h-5 w-5" strokeWidth={1.9} aria-hidden="true" />
      </span>
      <h3 className="mt-4 text-sm font-semibold text-foreground">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm leading-6 text-muted-foreground">
        {description}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
