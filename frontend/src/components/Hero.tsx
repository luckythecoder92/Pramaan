import {
  ArrowRight,
  Check,
  Lock,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { ButtonLink } from "./ButtonLink";
import { WorkspacePreview } from "./WorkspacePreview";

const trustPoints = [
  { icon: ShieldCheck, label: "Source-grounded answers" },
  { icon: Lock, label: "Private by design" },
  { icon: Check, label: "No setup required" },
] as const;

export function Hero() {
  const { isAuthenticated } = useAuth();

  return (
    <section
      id="product"
      aria-labelledby="hero-heading"
      className="relative overflow-hidden"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 flex justify-center"
      >
        <div className="h-72 w-[42rem] max-w-full rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-14 sm:px-6 sm:pt-20 lg:grid lg:grid-cols-[1.04fr_0.96fr] lg:items-center lg:gap-16 lg:px-8 lg:pb-24 lg:pt-24">
        <div className="mx-auto max-w-2xl text-center lg:mx-0 lg:text-left">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            Document intelligence, grounded in evidence
          </span>

          <h1
            id="hero-heading"
            className="mt-6 text-balance text-4xl font-semibold leading-[1.08] tracking-[-0.035em] text-foreground sm:text-5xl lg:text-[3.4rem]"
          >
            <span className="block">Your Documents.</span>{" "}
            <span className="block text-primary">
              One Intelligent Assistant.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-pretty text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8 lg:mx-0">
            Pramaan AI reads across your files, understands the context, and
            answers with citations you can verify — so every decision is backed
            by the source.
          </p>

          <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center lg:justify-start">
            <ButtonLink
              to={isAuthenticated ? "/app" : "/register"}
              className="group w-full sm:w-auto"
            >
              {isAuthenticated ? "Open workspace" : "Get Started"}
              <ArrowRight
                className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none"
                aria-hidden="true"
              />
            </ButtonLink>

            <ButtonLink
              href="#features"
              variant="secondary"
              className="w-full sm:w-auto"
            >
              Explore Features
            </ButtonLink>
          </div>

          <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground lg:justify-start">
            {trustPoints.map(({ icon: Icon, label }) => (
              <li key={label} className="inline-flex items-center gap-1.5">
                <Icon
                  className="h-3.5 w-3.5 text-primary"
                  strokeWidth={2}
                  aria-hidden="true"
                />
                {label}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-12 lg:mt-0">
          <WorkspacePreview />
        </div>
      </div>
    </section>
  );
}
