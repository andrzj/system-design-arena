import Link from 'next/link';
import { redirect } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getUserTier } from '@/lib/auth/tier';
import { getDashboardStats, getScoreResultsByUserId, getSessionsByUserId } from '@/lib/db';
import { FREE_DAILY_SIM_LIMIT } from '@/lib/utils/rate-limit';
import { getProfileWithDailyReset } from '@/lib/utils/rate-limit-server';
import { createClient } from '@/lib/supabase/server';

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

  const tier = getUserTier(profile);
  const avgScore =
    scores.filter((s) => s.judgeRigorScore && s.judgePragmatismScore).length > 0
      ? Math.round(
          scores
            .filter((s) => s.judgeRigorScore && s.judgePragmatismScore)
            .reduce((sum, s) => sum + ((s.judgeRigorScore ?? 0) + (s.judgePragmatismScore ?? 0)) / 2, 0) /
            scores.filter((s) => s.judgeRigorScore && s.judgePragmatismScore).length,
        )
      : null;

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="font-[family-name:var(--font-heading)] text-3xl font-semibold">Dashboard</h1>
      <p className="mt-2 text-muted-foreground">Your progress in System Design Arena.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Sessions</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{stats.totalSessions}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Problems tried</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{stats.problemsAttempted}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg score</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{avgScore ?? '—'}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Sims today</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {profile.simsUsedToday}/{tier === 'free' ? FREE_DAILY_SIM_LIMIT : '∞'}
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[2fr_1fr]">
        <section>
          <h2 className="text-lg font-semibold">Recent sessions</h2>
          {sessions.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">No sessions yet. Start a problem to practice.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {sessions.slice(0, 8).map((session) => (
                <li key={session.id} className="rounded-lg border border-border bg-card/40 p-3 text-sm">
                  <Link href={`/session/${session.sessionUuid}`} className="font-medium hover:underline">
                    {session.problem.title}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {session.status} · {session.updatedAt.toLocaleDateString()}
                    {session.scoreResults[0]?.consensusVerdict
                      ? ` · ${session.scoreResults[0].consensusVerdict}`
                      : ''}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Subscription</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>
              Current tier: <span className="capitalize">{tier}</span>
            </p>
            {tier === 'free' ? (
              <Button asChild size="sm">
                <Link href="/upgrade">Upgrade</Link>
              </Button>
            ) : null}
            <Button asChild variant="outline" size="sm">
              <Link href="/settings">Account settings</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
