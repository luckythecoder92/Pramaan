import { Loader2 } from "lucide-react";
import type {
  ButtonHTMLAttributes,
  ReactNode,
} from "react";
import { cn } from "../../utils/cn";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "subtle";

export type ButtonSize = "sm" | "md" | "lg" | "icon";

const baseStyles =
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-55";

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",
  secondary:
    "border border-border bg-surface text-foreground shadow-sm hover:border-primary/30 hover:bg-muted",
  ghost: "text-muted-foreground hover:bg-muted hover:text-foreground",
  danger:
    "bg-danger text-danger-foreground shadow-sm hover:bg-danger/90",
  subtle: "bg-muted text-foreground hover:bg-muted/80",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-sm",
  icon: "h-9 w-9",
};

export function buttonClasses(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  className?: string,
): string {
  return cn(baseStyles, variantStyles[variant], sizeStyles[size], className);
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  loadingLabel?: string;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  loadingLabel = "Loading",
  disabled,
  className,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      className={buttonClasses(variant, size, className)}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2
            className="h-4 w-4 animate-spin motion-reduce:animate-none"
            aria-hidden="true"
          />
          <span>{loadingLabel}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
