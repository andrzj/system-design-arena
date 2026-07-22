import { BookOpen, Star, TrendingUp, Trophy } from 'lucide-react';

import { cn } from '@/lib/utils';

type StatCard = {
  label: string;
  value: string;
  icon: typeof BookOpen;
  variant: 'light' | 'dark';
};

type DashboardStatCardsProps = {
  totalSessions: number;
  avgScore: number | null;
  problemsAttempted: number;
  scoredCount: number;
};

export function DashboardStatCards({
  totalSessions,
  avgScore,
  problemsAttempted,
  scoredCount,
}: DashboardStatCardsProps) {
  const cards: StatCard[] = [
    { label: 'Total Sessions', value: String(totalSessions), icon: BookOpen, variant: 'light' },
    { label: 'Avg Score', value: avgScore != null ? String(avgScore) : '—', icon: TrendingUp, variant: 'light' },
    { label: 'Problems', value: String(problemsAttempted), icon: Trophy, variant: 'dark' },
    { label: 'Scored', value: String(scoredCount), icon: Star, variant: 'dark' },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className={cn(
              'rounded-xl border p-5 shadow-sm',
              card.variant === 'light'
                ? 'border-primary/20 bg-primary/10'
                : 'border-white/10 bg-slate-950/50',
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm text-muted-foreground">{card.label}</p>
              <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
            </div>
            <p className="mt-4 font-[family-name:var(--font-heading)] text-4xl font-semibold tracking-tight">
              {card.value}
            </p>
          </div>
        );
      })}
    </div>
  );
}
