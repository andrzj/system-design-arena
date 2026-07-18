'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import type { Problem } from '@/lib/supabase/service';

interface ProblemListProps {
  initialProblems: Problem[];
}

export default function ProblemList({ initialProblems }: ProblemListProps) {
  const [filter, setFilter] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return initialProblems.filter((p) => {
      const matchesDifficulty = filter === 'all' || p.difficulty === filter;
      const matchesSearch =
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
      return matchesDifficulty && matchesSearch;
    });
  }, [initialProblems, filter, search]);

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold mb-6">System Design Problems</h1>
      {/* Filter tabs */}
      <div className="flex space-x-4 mb-4">
        {['all', 'easy', 'medium', 'hard'].map((d) => (
          <button
            key={d}
            onClick={() => setFilter(d as 'all' | 'easy' | 'medium' | 'hard')}
            className={`px-4 py-2 rounded ${filter === d ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/70'}`}
          >
            {d.charAt(0).toUpperCase() + d.slice(1)}
          </button>
        ))}
      </div>
      {/* Search bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search problems..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 border rounded"
        />
      </div>
      {/* Grid of problem cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p) => (
          <Link key={p.id} href={`/problems/${p.slug}`}>
            <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer bg-white dark:bg-gray-800">
              <h2 className="text-xl font-semibold mb-2">{p.title}</h2>
              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{p.brief}</p>
              <div className="flex flex-wrap gap-2 mb-2">
                {p.tags.map((t) => (
                  <span key={t} className="px-2 py-1 text-xs bg-primary/10 text-primary rounded">
                    {t}
                  </span>
                ))}
              </div>
              <span className={`px-2 py-1 text-xs rounded ${p.difficulty === 'easy' ? 'bg-green-100 text-green-800' : p.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                {p.difficulty.charAt(0).toUpperCase() + p.difficulty.slice(1)}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
