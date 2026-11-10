import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ToastViewport } from "../components/ui/ToastViewport";

export type ToastVariant = "success" | "error" | "warning" | "info";

export interface ToastInput {
  title: string;
  description?: string;
  variant?: ToastVariant;
}

export interface ToastItem extends ToastInput {
  id: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  toasts: ToastItem[];
  pushToast: (toast: ToastInput) => string;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const DEFAULT_DURATION = 5_000;
const ERROR_DURATION = 7_500;

function createToastId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `toast-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef(new Map<string, number>());

  const dismissToast = useCallback((id: string) => {
    const timer = timers.current.get(id);

    if (timer !== undefined) {
      window.clearTimeout(timer);
      timers.current.delete(id);
    }

    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const pushToast = useCallback(
    (toast: ToastInput) => {
      const id = createToastId();
      const variant = toast.variant ?? "info";
      const item: ToastItem = { ...toast, id, variant };

      setToasts((current) => {
        const next = [...current, item];
        return next.length > 4 ? next.slice(next.length - 4) : next;
      });

      const duration =
        variant === "error" ? ERROR_DURATION : DEFAULT_DURATION;
      const timer = window.setTimeout(() => dismissToast(id), duration);
      timers.current.set(id, timer);

      return id;
    },
    [dismissToast],
  );

  useEffect(() => {
    const activeTimers = timers.current;

    return () => {
      activeTimers.forEach((timer) => window.clearTimeout(timer));
      activeTimers.clear();
    };
  }, []);

  const value = useMemo(
    () => ({ toasts, pushToast, dismissToast }),
    [toasts, pushToast, dismissToast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  return context;
}
