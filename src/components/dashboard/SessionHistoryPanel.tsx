'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Clock, Search } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export type DashboardSession = {
  sessionUuid: string;
  status: string;
  updatedAt: string;
  problemTitle: string;
};

function formatStatus(status: string): string {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

type SessionHistoryPanelProps = {
  sessions: DashboardSession[];
};

export function SessionHistoryPanel({ sessions }: SessionHistoryPanelProps) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return sessions;
    return sessions.filter((session) =>
      session.problemTitle.toLowerCase().includes(normalized),
    );
  }, [query, sessions]);

  return (
    <section className="rounded-xl border border-white/10 bg-card/40 p-5 backdrop-blur-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-[family-name:var(--font-heading)] text-lg font-semibold">Session History</h2>
        <span className="font-mono text-xs text-muted-foreground">{sessions.length} total</span>
      </div>

      <div className="relative mt-4">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by problem title..."
          className="border-white/10 bg-slate-950/40 pl-9"
          aria-label="Search sessions by problem title"
        />
      </div>

      {sessions.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">
          No sessions yet.{' '}
          <Link href="/problems" className="text-primary hover:underline">
            Start a problem
          </Link>{' '}
          to practice.
        </p>
      ) : filtered.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">No sessions match your search.</p>
      ) : (
        <ul className="mt-4 divide-y divide-white/10 rounded-lg border border-white/10 bg-slate-950/30">
          {filtered.map((session) => (
            <li key={session.sessionUuid}>
              <Link
                href={`/session/${session.sessionUuid}`}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-white/5"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{session.problemTitle}</p>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    {formatDate(session.updatedAt)}
                  </p>
                </div>
                <span
                  className={cn(
                    'shrink-0 rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wide',
                    session.status === 'completed'
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                      : 'border-primary/30 bg-primary/10 text-primary',
                  )}
                >
                  {formatStatus(session.status)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
