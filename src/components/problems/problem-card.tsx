import type { Problem } from '@prisma/client';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { difficultyBadgeClass, formatDifficulty } from '@/lib/marketing/difficulty';
import { formatProblemNumber } from '@/lib/problems/format';

interface ProblemCardProps {
  problem: Problem;
}

export function ProblemCard({ problem }: ProblemCardProps) {
  return (
    <article className="flex h-full flex-col rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/40 hover:bg-card/80">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs text-muted-foreground">{formatProblemNumber(problem.order)}</span>
          <span
            className={`rounded-md px-2.5 py-1 text-xs font-medium ${difficultyBadgeClass(problem.difficulty)}`}
          >
            {formatDifficulty(problem.difficulty)}
          </span>
        </div>
        <ArrowUpRight className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
      </div>

      <div className="mt-4 flex-1">
        <h2 className="font-[family-name:var(--font-heading)] text-xl font-semibold tracking-tight">
          {problem.title}
        </h2>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{problem.brief}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {problem.tags.slice(0, 5).map((tag) => (
            <span
              key={tag}
              className="rounded-md border border-border/80 bg-background/60 px-2 py-0.5 font-mono text-[11px] text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <Button asChild className="w-full sm:w-auto">
          <Link href={`/problems/${problem.slug}`}>Attempt</Link>
        </Button>
      </div>
    </article>
  );
}
