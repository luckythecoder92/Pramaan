import { Moon, Sun } from "lucide-react";
import type { Theme } from "../hooks/useTheme";

type ThemeToggleProps = {
  theme: Theme;
  onToggle: () => void;
  className?: string;
};

export function ThemeToggle({
  theme,
  onToggle,
  className = "",
}: ThemeToggleProps) {
  const isDark = theme === "dark";
  const nextTheme = isDark ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={`Switch to ${nextTheme} theme`}
      title={`Switch to ${nextTheme} theme`}
      className={`relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-foreground shadow-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background ${className}`}
    >
      <Sun
        className={`h-[18px] w-[18px] transition-all duration-300 motion-reduce:transition-none ${
          isDark
            ? "rotate-90 scale-0 opacity-0"
            : "rotate-0 scale-100 opacity-100"
        }`}
        aria-hidden="true"
      />
      <Moon
        className={`absolute h-[18px] w-[18px] transition-all duration-300 motion-reduce:transition-none ${
          isDark
            ? "rotate-0 scale-100 opacity-100"
            : "-rotate-90 scale-0 opacity-0"
        }`}
        aria-hidden="true"
      />
    </button>
  );
}
