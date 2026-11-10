import {
  CheckCircle2,
  Circle,
  Clock3,
  Loader2,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { cn } from "../../utils/cn";

interface StatusDescriptor {
  label: string;
  icon: LucideIcon;
  className: string;
  spinning?: boolean;
}

function describeStatus(status: string): StatusDescriptor {
  switch (status.toLowerCase()) {
    case "ready":
      return {
        label: "Ready",
        icon: CheckCircle2,
        className: "border-success/25 bg-success/10 text-success",
      };
    case "processing":
      return {
        label: "Processing",
        icon: Loader2,
        className: "border-warning/30 bg-warning/10 text-warning",
        spinning: true,
      };
    case "failed":
      return {
        label: "Failed",
        icon: XCircle,
        className: "border-danger/25 bg-danger/10 text-danger",
      };
    case "pending":
    case "queued":
      return {
        label: "Queued",
        icon: Clock3,
        className: "border-warning/30 bg-warning/10 text-warning",
      };
    default:
      return {
        label: status.replace(/[_-]+/g, " ").replace(/^\w/, (letter) => letter.toUpperCase()),
        icon: Circle,
        className: "border-border bg-muted text-muted-foreground",
      };
  }
}

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const descriptor = describeStatus(status);
  const Icon = descriptor.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold",
        descriptor.className,
        className,
      )}
    >
      <Icon
        className={cn(
          "h-3.5 w-3.5",
          descriptor.spinning && "animate-spin motion-reduce:animate-none",
        )}
        aria-hidden="true"
      />
      {descriptor.label}
    </span>
  );
}
