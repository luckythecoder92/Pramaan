import type { LucideIcon } from "lucide-react";
import { cn } from "../../utils/cn";

type StatTone = "default" | "success" | "warning" | "danger";

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  tone?: StatTone;
  hint?: string;
  isLoading?: boolean;
}

const toneStyles: Record<StatTone, string> = {
  default: "border-primary/15 bg-primary/10 text-primary",
  success: "border-success/20 bg-success/10 text-success",
  warning: "border-warning/25 bg-warning/10 text-warning",
  danger: "border-danger/20 bg-danger/10 text-danger",
};

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "default",
  hint,
  isLoading = false,
}: StatCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <span
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border",
            toneStyles[tone],
          )}
        >
          <Icon className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
        </span>
      </div>

      {isLoading ? (
        <div className="mt-3 h-8 w-12 animate-pulse rounded-md bg-muted motion-reduce:animate-none" />
      ) : (
        <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-foreground">
          {value}
        </p>
      )}

      <p className="mt-1 text-[11px] text-muted-foreground">
        {hint ??
          (value === 1 ? "1 document" : `${value} documents`)}
      </p>
    </div>
  );
}
