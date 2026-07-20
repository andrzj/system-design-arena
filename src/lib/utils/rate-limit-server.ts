import type { Profile } from '@prisma/client';

import { getUserTier } from '@/lib/auth/tier';
import { prisma } from '@/lib/prisma/client';

import {
  canStartSim,
  shouldResetDailyCounter,
  todayUtcDate,
} from '@/lib/utils/rate-limit';

export async function getProfileWithDailyReset(userId: string): Promise<Profile | null> {
  const profile = await prisma.profile.findUnique({
    where: { id: userId },
  });

  if (!profile) return null;

  if (!shouldResetDailyCounter(profile)) return profile;

  return prisma.profile.update({
    where: { id: userId },
    data: {
      simsUsedToday: 0,
      lastSimDate: todayUtcDate(),
    },
  });
}

export async function incrementSimCount(userId: string): Promise<Profile> {
  const profile = await getProfileWithDailyReset(userId);
  if (!profile) {
    throw new Error('Profile not found');
  }

  const tier = getUserTier(profile);
  if (!canStartSim(profile, tier)) {
    throw new Error('Daily sim limit reached');
  }

  return prisma.profile.update({
    where: { id: userId },
    data: {
      simsUsedToday: { increment: 1 },
      lastSimDate: todayUtcDate(),
    },
  });
}
