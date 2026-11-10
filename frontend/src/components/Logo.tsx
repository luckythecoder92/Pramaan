import { FileCheck2 } from "lucide-react";

type LogoProps = {
  className?: string;
  showWordmark?: boolean;
};

export function Logo({ className = "", showWordmark = true }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm ring-1 ring-inset ring-primary-foreground/10">
        <FileCheck2
          className="h-[18px] w-[18px]"
          strokeWidth={2.25}
          aria-hidden="true"
        />
      </span>

      {showWordmark && (
        <span className="flex items-center gap-1.5">
          <span className="text-[17px] font-semibold tracking-[-0.02em] text-foreground">
            Pramaan
          </span>
          <span className="rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            AI
          </span>
        </span>
      )}
    </span>
  );
}
