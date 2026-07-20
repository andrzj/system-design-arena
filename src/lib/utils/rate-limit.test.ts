import { describe, expect, it } from 'vitest';

import type { Profile } from '@prisma/client';

import { canStartSim, shouldResetDailyCounter, startOfUtcDay } from './rate-limit';

const baseProfile = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'user@example.com',
  name: null,
  avatarUrl: null,
  subscriptionTier: 'free',
  stripeCustomerId: null,
  stripeSubscriptionId: null,
  sbcMemberEmail: null,
  simsUsedToday: 0,
  lastSimDate: null,
  createdAt: new Date(),
  updatedAt: new Date(),
} satisfies Profile;

describe('shouldResetDailyCounter', () => {
  it('resets when lastSimDate is missing', () => {
    expect(shouldResetDailyCounter(baseProfile)).toBe(true);
  });

  it('resets when lastSimDate is before today', () => {
    const yesterday = new Date('2026-07-18T12:00:00.000Z');
    const today = startOfUtcDay(new Date('2026-07-19T08:00:00.000Z'));

    expect(
      shouldResetDailyCounter({ ...baseProfile, lastSimDate: yesterday }, today),
    ).toBe(true);
  });

  it('does not reset when lastSimDate is today', () => {
    const today = startOfUtcDay(new Date('2026-07-19T15:00:00.000Z'));

    expect(
      shouldResetDailyCounter({ ...baseProfile, lastSimDate: today }, today),
    ).toBe(false);
  });
});

describe('canStartSim', () => {
  it('allows paid tiers regardless of count', () => {
    expect(canStartSim({ ...baseProfile, simsUsedToday: 99 }, 'yearly')).toBe(true);
  });

  it('limits free tier to one sim per day', () => {
    expect(canStartSim({ ...baseProfile, simsUsedToday: 0 }, 'free')).toBe(true);
    expect(canStartSim({ ...baseProfile, simsUsedToday: 1 }, 'free')).toBe(false);
  });
});
