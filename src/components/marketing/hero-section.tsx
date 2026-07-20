import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

export function HeroSection() {
  return (
    <section className="border-b border-border/40">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 pb-16 pt-16 lg:grid-cols-2 lg:items-center lg:gap-12 lg:pb-20 lg:pt-20">
        <div className="flex flex-col gap-6">
          <h1 className="font-[family-name:var(--font-heading)] text-4xl font-semibold tracking-tight sm:text-5xl lg:text-[3.25rem] lg:leading-[1.05]">
            Practice system design on a live blueprint canvas
          </h1>
          <p className="max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
            Draw real architectures, stress-test with chaos events, and get feedback from two debating AI judges.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button asChild size="lg" className="active:scale-[0.98]">
              <Link href="/problems">Get started</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="active:scale-[0.98]">
              <Link href="/learn">Browse learn</Link>
            </Button>
          </div>
        </div>

        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-border/80 bg-card shadow-[0_24px_80px_rgb(0_0_0/0.35)]">
          <Image
            src="/images/hero-blueprint.webp"
            alt="Blueprint diagram showing Client, Load Balancer, App Server, Cache, and SQL Database connected for a URL shortener"
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>
      </div>
    </section>
  );
}
