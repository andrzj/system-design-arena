import { describe, expect, it } from 'vitest';

import type { Profile } from '@prisma/client';

import { getUserTier, isPaidTier } from './tier';

const baseProfile = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'user@example.com',
  name: null,
  avatarUrl: null,
  stripeCustomerId: null,
  stripeSubscriptionId: null,
  sbcMemberEmail: null,
  simsUsedToday: 0,
  lastSimDate: null,
  createdAt: new Date(),
  updatedAt: new Date(),
} satisfies Omit<Profile, 'subscriptionTier'>;

describe('getUserTier', () => {
  it('returns free when profile is null', () => {
    expect(getUserTier(null)).toBe('free');
  });

  it('returns the stored tier when valid', () => {
    expect(getUserTier({ ...baseProfile, subscriptionTier: 'yearly' })).toBe('yearly');
    expect(getUserTier({ ...baseProfile, subscriptionTier: 'sbc' })).toBe('sbc');
  });

  it('falls back to free for unknown values', () => {
    expect(getUserTier({ ...baseProfile, subscriptionTier: 'invalid' })).toBe('free');
  });
});

describe('isPaidTier', () => {
  it('identifies paid tiers', () => {
    expect(isPaidTier('yearly')).toBe(true);
    expect(isPaidTier('sbc')).toBe(true);
    expect(isPaidTier('free')).toBe(false);
  });
});
