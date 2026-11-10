import type { LucideIcon } from "lucide-react";

type FeatureCardProps = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <article className="group flex h-full flex-col rounded-2xl border border-border bg-surface p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0">
      <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-primary/15 bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
        <Icon className="h-5 w-5" strokeWidth={1.9} aria-hidden="true" />
      </div>

      <h3 className="mt-5 text-base font-semibold tracking-[-0.01em] text-foreground">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </article>
  );
}
