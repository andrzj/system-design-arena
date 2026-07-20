import type { Article } from '@prisma/client';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

interface LearnCalloutSectionProps {
  articles: Article[];
}

const categoryLabels: Record<string, string> = {
  foundations: 'Foundations',
  'feeds-storage': 'Feeds & Storage',
  'realtime-geo': 'Realtime & Geo',
};

export function LearnCalloutSection({ articles }: LearnCalloutSectionProps) {
  return (
    <section className="border-y border-border/40 bg-card/20 py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-2xl">
          <h2 className="font-[family-name:var(--font-heading)] text-3xl font-semibold tracking-tight sm:text-4xl">
            Learn before you draw
          </h2>
          <p className="mt-4 text-muted-foreground">
            27 articles on caching, fan-out, CAP, and more. Study a concept, then run it in the arena.
          </p>
        </div>

        {articles.length === 0 ? (
          <p className="mt-10 text-muted-foreground">Articles are loading. Visit the library directly.</p>
        ) : (
          <ul className="mt-10 grid gap-4 lg:grid-cols-3">
            {articles.map((article, index) => (
              <li key={article.id}>
                <Link
                  href={`/learn/${article.slug}`}
                  className={`group flex h-full flex-col rounded-xl border p-6 transition-colors hover:border-primary/40 ${
                    index === 0
                      ? 'border-primary/30 bg-primary/5'
                      : 'border-border bg-card hover:bg-card/80'
                  }`}
                >
                  <span className="w-fit rounded-md border border-border/80 bg-background/60 px-2 py-0.5 text-xs text-muted-foreground">
                    {categoryLabels[article.category] ?? article.category}
                  </span>
                  <h3 className="mt-4 font-[family-name:var(--font-heading)] text-lg font-semibold group-hover:text-primary">
                    {article.title}
                  </h3>
                  <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {article.summary}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-10">
          <Button asChild variant="outline">
            <Link href="/learn">Explore library</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
