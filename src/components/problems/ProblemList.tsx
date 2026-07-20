'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import type { Problem } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

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
          <Button
            key={d}
            variant={filter === d ? 'default' : 'secondary'}
            size="sm"
            onClick={() => setFilter(d as 'all' | 'easy' | 'medium' | 'hard')}
          >
            {d.charAt(0).toUpperCase() + d.slice(1)}
          </Button>
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
            <Card className="h-full transition-shadow hover:shadow-lg">
              <CardHeader>
                <CardTitle>{p.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{p.brief}</p>
                <div className="flex flex-wrap gap-2 mb-2">
                  {p.tags.map((t) => (
                    <span key={t} className="px-2 py-1 text-xs bg-primary/10 text-primary rounded">
                      {t}
                    </span>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <span className={`px-2 py-1 text-xs rounded ${p.difficulty === 'easy' ? 'bg-green-100 text-green-800' : p.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                  {p.difficulty.charAt(0).toUpperCase() + p.difficulty.slice(1)}
                </span>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
