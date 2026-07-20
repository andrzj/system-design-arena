import type { Problem } from '@prisma/client';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { difficultyBadgeClass, formatDifficulty } from '@/lib/marketing/difficulty';

interface ProblemPreviewSectionProps {
  problems: Problem[];
}

export function ProblemPreviewSection({ problems }: ProblemPreviewSectionProps) {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-[family-name:var(--font-heading)] text-3xl font-semibold tracking-tight sm:text-4xl">
              Interview problems to try
            </h2>
            <p className="mt-3 max-w-xl text-muted-foreground">
              Real prompts with requirements, reference flows, and a playground session for each.
            </p>
          </div>
          <Button asChild variant="outline" className="w-fit shrink-0">
            <Link href="/problems">View all problems</Link>
          </Button>
        </div>

        {problems.length === 0 ? (
          <p className="mt-10 text-muted-foreground">Problems are loading. Visit the library directly.</p>
        ) : (
          <ul className="mt-10 grid gap-4 sm:grid-cols-2">
            {problems.map((problem) => (
              <li key={problem.id}>
                <Link
                  href={`/problems/${problem.slug}`}
                  className="group flex h-full flex-col gap-4 rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/40 hover:bg-card/80"
                >
                  <div className="flex items-start justify-between gap-4">
                    <span
                      className={`rounded-md px-2.5 py-1 text-xs font-medium ${difficultyBadgeClass(problem.difficulty)}`}
                    >
                      {formatDifficulty(problem.difficulty)}
                    </span>
                    <ArrowUpRight
                      className="size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
                      strokeWidth={1.75}
                    />
                  </div>
                  <div>
                    <h3 className="font-[family-name:var(--font-heading)] text-xl font-semibold">{problem.title}</h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{problem.brief}</p>
                  </div>
                  <div className="mt-auto flex flex-wrap gap-2">
                    {problem.tags.slice(0, 4).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md border border-border/80 bg-background/60 px-2 py-0.5 font-mono text-[11px] text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
