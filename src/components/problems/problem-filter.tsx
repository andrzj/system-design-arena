'use client';

import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

import type { DifficultyFilter } from '@/lib/problems/filter-problems';

interface ProblemFilterProps {
  filter: DifficultyFilter;
  search: string;
  resultCount: number;
  totalCount: number;
  onFilterChange: (filter: DifficultyFilter) => void;
  onSearchChange: (search: string) => void;
}

const difficultyOptions: { value: DifficultyFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
];

export function ProblemFilter({
  filter,
  search,
  resultCount,
  totalCount,
  onFilterChange,
  onSearchChange,
}: ProblemFilterProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-3">
        <Tabs value={filter} onValueChange={(value) => onFilterChange(value as DifficultyFilter)}>
          <TabsList>
            {difficultyOptions.map((option) => (
              <TabsTrigger key={option.value} value={option.value}>
                {option.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <p className="text-sm text-muted-foreground">
          {resultCount} shown of {totalCount}
        </p>
      </div>

      <div className="w-full sm:max-w-sm">
        <Input
          type="search"
          placeholder="Search by title or tag..."
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          aria-label="Search problems"
        />
      </div>
    </div>
  );
}
