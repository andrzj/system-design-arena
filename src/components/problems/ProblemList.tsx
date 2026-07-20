'use client';

import { useMemo, useState } from 'react';
import type { Problem } from '@prisma/client';

import { ProblemCard } from '@/components/problems/problem-card';
import { ProblemFilter } from '@/components/problems/problem-filter';
import { filterProblems, type DifficultyFilter } from '@/lib/problems/filter-problems';

interface ProblemListProps {
  initialProblems: Problem[];
}

export default function ProblemList({ initialProblems }: ProblemListProps) {
  const [filter, setFilter] = useState<DifficultyFilter>('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(
    () => filterProblems(initialProblems, filter, search),
    [initialProblems, filter, search],
  );

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="max-w-2xl">
        <h1 className="font-[family-name:var(--font-heading)] text-4xl font-semibold tracking-tight sm:text-5xl">
          Problem library
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          Curated system design interview prompts with requirements, reference flows, and a playground session for each.
        </p>
      </div>

      <div className="mt-10">
        <ProblemFilter
          filter={filter}
          search={search}
          resultCount={filtered.length}
          totalCount={initialProblems.length}
          onFilterChange={setFilter}
          onSearchChange={setSearch}
        />
      </div>

      {filtered.length === 0 ? (
        <p className="mt-10 rounded-xl border border-dashed border-border px-6 py-10 text-center text-muted-foreground">
          No problems match your filters. Try another difficulty or search term.
        </p>
      ) : (
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((problem) => (
            <li key={problem.id}>
              <ProblemCard problem={problem} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
