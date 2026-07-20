import type { Profile } from '@prisma/client';

export type SubscriptionTier = 'free' | 'yearly' | 'sbc';

const PAID_TIERS: SubscriptionTier[] = ['yearly', 'sbc'];

export function getUserTier(profile: Profile | null): SubscriptionTier {
  if (!profile) return 'free';

  const tier = profile.subscriptionTier as SubscriptionTier;
  if (tier === 'yearly' || tier === 'sbc') return tier;
  return 'free';
}

export function isPaidTier(tier: SubscriptionTier): boolean {
  return PAID_TIERS.includes(tier);
}
