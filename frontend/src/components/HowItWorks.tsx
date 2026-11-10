import { BadgeCheck, MessageSquare, Upload } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Add your documents",
    description:
      "Bring contracts, policies, reports, and notes into one searchable workspace.",
  },
  {
    number: "02",
    icon: MessageSquare,
    title: "Ask in natural language",
    description:
      "Ask the question exactly as you would to a knowledgeable colleague.",
  },
  {
    number: "03",
    icon: BadgeCheck,
    title: "Verify every answer",
    description:
      "Follow each citation back to the exact source before you rely on it.",
  },
] as const;

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-heading"
      className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8 lg:pb-28"
    >
      <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm sm:p-10">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            How it works
          </p>
          <h2
            id="how-it-works-heading"
            className="mt-3 text-balance text-2xl font-semibold tracking-[-0.025em] text-foreground sm:text-3xl"
          >
            From documents to decisions in three steps.
          </h2>
          <p className="mt-4 text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
            No migrations or complicated setup. Start with a single document and
            grow the workspace as your questions do.
          </p>
        </div>

        <ol className="mt-10 grid gap-6 md:grid-cols-3">
          {steps.map(({ number, icon: Icon, title, description }) => (
            <li key={number} className="relative">
              <div className="flex items-center justify-between gap-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background text-primary">
                  <Icon className="h-5 w-5" strokeWidth={1.9} aria-hidden="true" />
                </span>
                <span className="text-xs font-semibold tracking-[0.14em] text-muted-foreground">
                  {number}
                </span>
              </div>
              <h3 className="mt-4 text-sm font-semibold text-foreground">
                {title}
              </h3>
              <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                {description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
