'use client';

import { FREE_DAILY_SIM_LIMIT, SIM_LIMIT_TEMPORARILY_DISABLED } from '@/lib/utils/rate-limit';
import { useAuth } from '@/store/auth-store';

export function SimStatusBadge() {
  const { profile } = useAuth();

  if (SIM_LIMIT_TEMPORARILY_DISABLED) {
    return null;
  }

  const used = profile?.simsUsedToday ?? 0;
  const limit = FREE_DAILY_SIM_LIMIT;

  return (
    <span className="rounded-full border border-border bg-muted/40 px-2 py-0.5 font-mono text-xs text-muted-foreground">
      {used}/{limit} sims today
    </span>
  );
}
