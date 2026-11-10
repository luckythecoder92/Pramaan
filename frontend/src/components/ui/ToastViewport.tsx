import {
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
  XCircle,
} from "lucide-react";
import type { ToastItem, ToastVariant } from "../../context/ToastContext";
import { cn } from "../../utils/cn";

interface ToastViewportProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

const variantStyles: Record<
  ToastVariant,
  { container: string; icon: string }
> = {
  success: {
    container: "border-success/30 bg-surface",
    icon: "text-success",
  },
  error: {
    container: "border-danger/30 bg-surface",
    icon: "text-danger",
  },
  warning: {
    container: "border-warning/40 bg-surface",
    icon: "text-warning",
  },
  info: {
    container: "border-border bg-surface",
    icon: "text-primary",
  },
};

const icons = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
} as const;

export function ToastViewport({ toasts, onDismiss }: ToastViewportProps) {
  return (
    <div
      aria-live="polite"
      aria-relevant="additions"
      className="pointer-events-none fixed inset-x-4 bottom-4 z-[100] flex flex-col items-stretch gap-2 sm:left-auto sm:right-6 sm:bottom-6 sm:w-full sm:max-w-sm"
    >
      {toasts.map((toast) => {
        const style = variantStyles[toast.variant];
        const Icon = icons[toast.variant];

        return (
          <div
            key={toast.id}
            role={toast.variant === "error" ? "alert" : "status"}
            className={cn(
              "pointer-events-auto flex items-start gap-3 rounded-xl border p-4 shadow-lg shadow-black/5 motion-safe:animate-toast-in dark:shadow-black/25",
              style.container,
            )}
          >
            <Icon
              className={cn("mt-0.5 h-[18px] w-[18px] shrink-0", style.icon)}
              strokeWidth={2}
              aria-hidden="true"
            />

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">
                {toast.title}
              </p>
              {toast.description && (
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {toast.description}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              aria-label="Dismiss notification"
              className="-mr-1 -mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
