import type { Problem } from '@prisma/client';

export type DifficultyFilter = 'all' | 'easy' | 'medium' | 'hard';

export function filterProblems(
  problems: Problem[],
  filter: DifficultyFilter,
  search: string,
): Problem[] {
  const query = search.trim().toLowerCase();

  return problems.filter((problem) => {
    const matchesDifficulty = filter === 'all' || problem.difficulty === filter;
    const matchesSearch =
      query.length === 0 ||
      problem.title.toLowerCase().includes(query) ||
      problem.tags.some((tag) => tag.toLowerCase().includes(query));

    return matchesDifficulty && matchesSearch;
  });
}
