import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="py-20 px-6 sm:py-24 lg:py-28">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Practice System Design Interviews with AI Feedback
          </h1>
          <p className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto">
            Draw architectures on a live blueprint canvas, get scored by two debating AI judges, and improve your skills with instant feedback.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                href="/problems"
                className="flex h-12 w-full items-center justify-center rounded-border bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:pointer-events-none disabled:opacity-50"
              >
                Get Started — It&apos;s Free
              </Link>
            <a
              href="/learn"
              className="flex h-12 w-full items-center justify-center rounded-border border px-6 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              Learn the Concepts
            </a>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6 bg-muted/5">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            How it works
          </h2>
          <div className="grid gap-8 sm:grid-cols-3">
            <div className="flex flex-col items-center gap-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-border bg-primary/10 text-primary">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold">Choose a Problem</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Select a real-world system design question from our library—URL shortener, news feed, rate limiter, and more.
              </p>
            </div>
            <div className="flex flex-col items-center gap-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-border bg-primary/10 text-primary">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold">Design on Canvas</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Drag and drop components, connect them, and add implementation notes to build your architecture.
              </p>
            </div>
            <div className="flex flex-col items-center gap-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-border bg-primary/10 text-primary">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold">Get AI Feedback</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Two AI judges with different perspectives score your design, debate, and provide a consensus verdict with detailed feedback.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Preview */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10">Try a Sample Problem</h2>
          <div className="space-y-6">
            <div className="border border-muted/50 rounded-xl p-6">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-border bg-primary/20 text-primary">
                  <span className="text-sm font-bold">#001</span>
                </div>
                <div className="flex-1 space-y-3">
                  <h3 className="text-xl font-semibold">Design a URL Shortener</h3>
                  <p className="text-sm text-muted-foreground">
                    Build a service like bit.ly that maps long URLs to short codes at scale.
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs font-medium">
                    <span className="px-2 py-0.5 rounded-border bg-primary/20 text-primary">hashing</span>
                    <span className="px-2 py-0.5 rounded-border bg-primary/20 text-primary">caching</span>
                    <span className="px-2 py-0.5 rounded-border bg-primary/20 text-primary">databases</span>
                    <span className="px-2 py-0.5 rounded-border bg-primary/20 text-primary">REST API</span>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <Link
                    href="/problems/1"
                    className="flex h-10 w-10 items-center justify-center rounded-border border border-primary/50 hover:bg-primary/10 transition-colors"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </Link>
                </div>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Requirements: Shorten a long URL to a 7-character alias, redirect users, handle 100M URLs/day, read-heavy (10:1 ratio).
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Key considerations: Hash generation, collision handling, storage, caching, CDN.
              </p>
            </div>
          </div>
          <div className="mt-10 text-center">
                <Link
                href="/problems"
                className="flex h-12 w-full items-center justify-center rounded-border bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:pointer-events-none disabled:opacity-50"
              >
                Get Started — It&apos;s Free
              </Link>
          </div>
        </div>
      </section>

      {/* Learn Section */}
      <section className="py-20 px-6 bg-muted/5">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10">Learn the Fundamentals</h2>
          <p className="text-lg text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Master core system design concepts with our in-depth articles—then apply them immediately in the playground.
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-border bg-primary/10 text-primary flex-shrink-0">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="flex-1 space-y-2">
              <h3 className="text-lg font-semibold">27 Expert Articles</h3>
              <p className="text-sm text-muted-foreground">
                From basics like CAP theorem and consistent hashing to advanced topics like event streaming and ML integration.
              </p>
            </div>
          </div>
          <div className="mt-10 text-center">
            <a
              href="/learn"
              className="inline-flex h-11 w-full items-center justify-center rounded-border border px-5 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              Explore the Library
            </a>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Simple, Transparent Pricing</h2>
          <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-3">
            {/* Free Tier */}
            <div className="border border-muted/50 rounded-xl p-6 space-y-6">
              <div className="flex flex-col items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-border bg-primary/20 text-primary">
                  <span className="text-sm font-bold">Free</span>
                </div>
                <h3 className="text-xl font-semibold">$0 forever</h3>
                <p className="text-sm text-center text-muted-foreground">
                  Perfect for getting started and practicing without limits.
                </p>
              </div>
              <ul className="space-y-4 text-left text-sm">
                <li className="flex items-center gap-3">
                  <svg className="h-4 w-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Unlimited practice sessions
                </li>
                <li className="flex items-center gap-3">
                  <svg className="h-4 w-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Access to all problems
                </li>
                <li className="flex items-center gap-3">
                  <svg className="h-4 w-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Full learning library (27 articles)
                </li>
                <li className="flex items-center gap-3">
                  <svg className="h-4 w-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Community leaderboard
                </li>
              </ul>
            </div>

            {/* Yearly */}
            <div className="border border-muted/50 rounded-xl p-6 space-y-6">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <span className="absolute -top-2 left-2 flex h-5 w-5 items-center justify-center rounded-border bg-primary text-primary-foreground text-xs font-bold">
                    Best Value
                  </span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-border bg-primary/20 text-primary">
                    <span className="text-sm font-bold">$49</span>
                  </div>
                </div>
                <h3 className="text-xl font-semibold">/ year</h3>
                <p className="text-sm text-center text-muted-foreground">
                  Billed annually. Save 20% vs monthly.
                </p>
              </div>
              <ul className="space-y-4 text-left text-sm">
                <li className="flex items-center gap-3">
                  <svg className="h-4 w-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Everything in Free
                </li>
                <li className="flex items-center gap-3">
                  <svg className="h-4 w-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  AI scores (0-100) from two judges
                </li>
                <li className="flex items-center gap-3">
                  <svg className="h-4 w-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Pass/fail/borderline verdict
                </li>
                <li className="flex items-center gap-3">
                  <svg className="h-4 w-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Full written feedback & consensus
                </li>
                <li className="flex items-center gap-3">
                  <svg className="h-4 w-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Mermaid diagram editor
                </li>
              </ul>
              <a
                href="/upgrade"
                className="mt-4 w-full h-10 flex items-center justify-center rounded-border bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Choose Yearly
              </a>
            </div>

            {/* Stupid Button Club */}
            <div className="border border-muted/50 rounded-xl p-6 space-y-6">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <span className="absolute -top-2 left-2 flex h-5 w-5 items-center justify-center rounded-border bg-primary text-primary-foreground text-xs font-bold">
                    Exclusive
                  </span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-border bg-primary/20 text-primary">
                    <span className="text-sm font-bold">SBC</span>
                  </div>
                </div>
                <h3 className="text-xl font-semibold">Stupid Button Club</h3>
                <p className="text-sm text-center text-muted-foreground">
                  Invite-only community for serious engineers
                </p>
              </div>
              <ul className="space-y-4 text-left text-sm">
                <li className="flex items-center gap-3">
                  <svg className="h-4 w-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Everything in Yearly
                </li>
                <li className="flex items-center gap-3">
                  <svg className="h-4 w-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Access via member approval
                </li>
                <li className="flex items-center gap-3">
                  <svg className="h-4 w-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Priority support & early features
                </li>
              </ul>
              <a
                href="https://stupidbutton.club/"
                className="mt-4 w-full h-10 flex items-center justify-center rounded-border border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                Learn More →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-6 bg-primary/5">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to level up your system design skills?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of engineers using Arena to prepare for their next interview.
          </p>
              <Link
                href="/problems"
                className="inline-flex h-11 w-full items-center justify-center rounded-border bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Start Practicing — It&apos;s Free
              </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-muted/20">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6">
          <div className="text-sm text-muted-foreground">
            System Design Arena &copy; {new Date().getFullYear()} &copy; All rights reserved.
          </div>
          <div className="flex flex-wrap gap-4 text-sm">
            <a href="/terms" className="hover:text-primary transition-colors">Terms</a>
            <a href="/privacy" className="hover:text-primary transition-colors">Privacy</a>
            <a href="/contact" className="hover:text-primary transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}