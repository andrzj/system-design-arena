import Link from 'next/link';

import { Button } from '@/components/ui/button';

export function FinalCtaSection() {
  return (
    <section className="border-t border-border/40 bg-primary/5 py-20">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <h2 className="font-[family-name:var(--font-heading)] text-3xl font-semibold tracking-tight sm:text-4xl">
          Ready for your next system design interview?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Open a problem, sketch an architecture, break it on purpose, and improve from the judges.
        </p>
        <Button asChild size="lg" className="mt-8 active:scale-[0.98]">
          <Link href="/problems">Get started</Link>
        </Button>
      </div>
    </section>
  );
}
