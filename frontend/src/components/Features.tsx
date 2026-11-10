import { FileCheck2, MessagesSquare, Search } from "lucide-react";
import { FeatureCard } from "./FeatureCard";

const features = [
  {
    icon: Search,
    title: "Intelligent Document Search",
    description:
      "Find the exact passage you need across every file with semantic search that understands meaning, not just keywords.",
  },
  {
    icon: MessagesSquare,
    title: "Context-Aware AI Chat",
    description:
      "Ask follow-up questions in plain language. Pramaan keeps the thread of the conversation and the context of your documents.",
  },
  {
    icon: FileCheck2,
    title: "Source-Based Answers",
    description:
      "Every response is tied back to the page and passage it came from, so you can verify the claim before you act on it.",
  },
] as const;

export function Features() {
  return (
    <section
      id="features"
      aria-labelledby="features-heading"
      className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24"
    >
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
          Built for document-heavy work
        </p>
        <h2
          id="features-heading"
          className="mt-3 text-balance text-2xl font-semibold tracking-[-0.025em] text-foreground sm:text-3xl"
        >
          Answers you can trace. Work you can trust.
        </h2>
        <p className="mt-4 text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
          Three capabilities work together so your team spends less time
          searching and more time making confident decisions.
        </p>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {features.map((feature) => (
          <FeatureCard
            key={feature.title}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
          />
        ))}
      </div>
    </section>
  );
}
