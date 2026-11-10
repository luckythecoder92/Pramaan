import { Features } from "../components/Features";
import { Footer } from "../components/Footer";
import { Hero } from "../components/Hero";
import { HowItWorks } from "../components/HowItWorks";
import { Navbar } from "../components/Navbar";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-surface focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-foreground focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary"
      >
        Skip to content
      </a>

      <Navbar />

      <main id="main-content">
        <Hero />
        <Features />
        <HowItWorks />
      </main>

      <Footer />
    </div>
  );
}
