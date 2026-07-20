import { describe, expect, it } from 'vitest';
import type { Problem } from '@prisma/client';

import { filterProblems } from '@/lib/problems/filter-problems';

const sampleProblems = [
  {
    id: 1,
    title: 'Design a URL Shortener',
    slug: 'design-url-shortener',
    difficulty: 'easy',
    tags: ['hashing', 'caching'],
    brief: 'Shorten URLs at scale.',
    requirements: '',
    keyConsiderations: '',
    referenceArchitecture: null,
    order: 1,
    isPublic: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2,
    title: 'Design a Distributed Cache',
    slug: 'design-distributed-cache',
    difficulty: 'hard',
    tags: ['caching', 'distributed systems'],
    brief: 'Build Redis-like cache.',
    requirements: '',
    keyConsiderations: '',
    referenceArchitecture: null,
    order: 5,
    isPublic: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
] satisfies Problem[];

describe('filterProblems', () => {
  it('returns all problems when filter and search are empty', () => {
    expect(filterProblems(sampleProblems, 'all', '')).toHaveLength(2);
  });

  it('filters by difficulty', () => {
    const easy = filterProblems(sampleProblems, 'easy', '');
    expect(easy).toHaveLength(1);
    expect(easy[0]?.slug).toBe('design-url-shortener');
  });

  it('filters by title search', () => {
    const results = filterProblems(sampleProblems, 'all', 'distributed');
    expect(results).toHaveLength(1);
    expect(results[0]?.slug).toBe('design-distributed-cache');
  });

  it('filters by tag search case-insensitively', () => {
    const results = filterProblems(sampleProblems, 'all', 'HASHING');
    expect(results).toHaveLength(1);
    expect(results[0]?.slug).toBe('design-url-shortener');
  });

  it('returns empty when nothing matches', () => {
    expect(filterProblems(sampleProblems, 'medium', 'kafka')).toHaveLength(0);
  });
});
