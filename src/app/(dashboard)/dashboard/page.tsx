import Link from 'next/link';
import { redirect } from 'next/navigation';

import { DashboardStatCards } from '@/components/dashboard/DashboardStatCards';
import { SessionHistoryPanel } from '@/components/dashboard/SessionHistoryPanel';
import { Button } from '@/components/ui/button';
import { getDashboardStats, getScoreResultsByUserId, getSessionsByUserId } from '@/lib/db';
import { createClient } from '@/lib/supabase/server';
import { getProfileWithDailyReset } from '@/lib/utils/rate-limit-server';

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/auth/sign-in?redirect_url=/dashboard');

  const profile = await getProfileWithDailyReset(user.id);
  if (!profile) redirect('/auth/sign-in');

  const [stats, sessions, scores] = await Promise.all([
    getDashboardStats(user.id),
    getSessionsByUserId(user.id),
    getScoreResultsByUserId(user.id),
  ]);

  const scoredSessions = scores.filter((score) => score.judgeRigorScore && score.judgePragmatismScore);
  const avgScore =
    scoredSessions.length > 0
      ? Math.round(
          scoredSessions.reduce(
            (sum, score) => sum + ((score.judgeRigorScore ?? 0) + (score.judgePragmatismScore ?? 0)) / 2,
            0,
          ) / scoredSessions.length,
        )
      : null;

  const historySessions = sessions.map((session) => ({
    sessionUuid: session.sessionUuid,
    status: session.status,
    updatedAt: session.updatedAt.toISOString(),
    problemTitle: session.problem.title,
  }));

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-[family-name:var(--font-heading)] text-3xl font-semibold tracking-tight">
              Dashboard
            </h1>
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-emerald-300">
              Live
            </span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Track sessions, scores, and progress across problems.
          </p>
        </div>
        <Button asChild>
          <Link href="/problems">+ New session</Link>
        </Button>
      </div>

      <div className="mt-8">
        <DashboardStatCards
          totalSessions={stats.totalSessions}
          avgScore={avgScore}
          problemsAttempted={stats.problemsAttempted}
          scoredCount={scoredSessions.length}
        />
      </div>

      <div className="mt-8">
        <SessionHistoryPanel sessions={historySessions} />
      </div>
    </div>
  );
}
