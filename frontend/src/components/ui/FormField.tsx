import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

export const inputClasses =
  "w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60";

interface FormFieldProps {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

export function FormField({
  id,
  label,
  error,
  hint,
  required = false,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-foreground"
      >
        {label}
        {required && (
          <span className="ml-0.5 text-danger" aria-hidden="true">
            *
          </span>
        )}
      </label>

      {children}

      {error ? (
        <p id={`${id}-error`} className="text-xs font-medium text-danger">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="text-xs text-muted-foreground">
            {hint}
          </p>
        )
      )}
    </div>
  );
}
