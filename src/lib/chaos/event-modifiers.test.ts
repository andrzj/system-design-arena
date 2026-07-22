import { describe, expect, it } from 'vitest';

import { CHAOS_EVENTS } from '@/lib/chaos/events';
import { chaosEventToModifier, isSignificantChaosImpact } from '@/lib/chaos/event-modifiers';

describe('chaosEventToModifier', () => {
  it('maps every catalog event to a modifier', () => {
    for (const event of CHAOS_EVENTS) {
      const modifier = chaosEventToModifier(event.id);
      expect(modifier).toBeDefined();
      expect(modifier.capacityMultiplier).toBeGreaterThanOrEqual(0);
      expect(modifier.slownessMultiplier).toBeGreaterThanOrEqual(1);
    }
  });

  it('maps server crash to crash modifier', () => {
    const modifier = chaosEventToModifier('server_crash');
    expect(modifier.crash).toBe(true);
    expect(modifier.capacityMultiplier).toBe(0);
  });

  it('maps ddos to 3x traffic surge', () => {
    const modifier = chaosEventToModifier('ddos_attack');
    expect(modifier.trafficMultiplier).toBe(3);
    expect(modifier.slownessMultiplier).toBeGreaterThan(2);
  });

  it('maps cache stampede to hit-rate penalty', () => {
    const modifier = chaosEventToModifier('cache_thundering_herd');
    expect(modifier.cacheHitPenalty).toBeGreaterThan(0.5);
  });

  it('maps network partition to connection drops', () => {
    const modifier = chaosEventToModifier('network_partition');
    expect(modifier.connectionDropBoost).toBeGreaterThan(0.5);
  });

  it('marks subtle sql injection as low impact', () => {
    const modifier = chaosEventToModifier('sql_injection');
    expect(modifier.errorBoost).toBeLessThan(0.2);
    expect(isSignificantChaosImpact(modifier)).toBe(true);
  });
});
