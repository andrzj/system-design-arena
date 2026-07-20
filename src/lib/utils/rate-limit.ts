import type { Profile } from '@prisma/client';

import type { SubscriptionTier } from '@/lib/auth/tier';

export const FREE_DAILY_SIM_LIMIT = 1;

export function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export function todayUtcDate(): Date {
  return startOfUtcDay(new Date());
}

export function shouldResetDailyCounter(profile: Profile, today: Date = todayUtcDate()): boolean {
  if (!profile.lastSimDate) return true;
  return startOfUtcDay(profile.lastSimDate).getTime() < today.getTime();
}

export function canStartSim(profile: Profile, tier: SubscriptionTier): boolean {
  if (tier !== 'free') return true;
  return profile.simsUsedToday < FREE_DAILY_SIM_LIMIT;
}
