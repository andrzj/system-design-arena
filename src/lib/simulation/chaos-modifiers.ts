import { shouldApplyChaosGlobally } from '@/lib/chaos/scopes';

import {
  chaosEventToModifier,
  DEFAULT_CHAOS_MODIFIER,
  type EngineChaosModifier,
} from '@/lib/chaos/event-modifiers';

export type ActiveChaosEvent = {
  chaosId: string;
  nodeId: string | null;
  scope: string;
};

export type { EngineChaosModifier };
export { chaosEventToModifier, DEFAULT_CHAOS_MODIFIER };

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function mergeModifiers(
  base: EngineChaosModifier,
  next: EngineChaosModifier,
): EngineChaosModifier {
  return {
    capacityMultiplier: base.capacityMultiplier * next.capacityMultiplier,
    slownessMultiplier: Math.max(base.slownessMultiplier, next.slownessMultiplier),
    errorBoost: clamp(base.errorBoost + next.errorBoost, 0, 0.6),
    connectionDropBoost: clamp(base.connectionDropBoost + next.connectionDropBoost, 0, 0.85),
    crash: base.crash || next.crash,
    cacheHitPenalty: clamp(base.cacheHitPenalty + next.cacheHitPenalty, 0, 0.95),
    trafficMultiplier: base.trafficMultiplier * next.trafficMultiplier,
  };
}

export function isGlobalChaosScope(scope: string): boolean {
  return shouldApplyChaosGlobally(scope, null);
}

export function buildChaosContext(activeChaos: ActiveChaosEvent[] = []) {
  let globalModifier = { ...DEFAULT_CHAOS_MODIFIER };
  let trafficMultiplier = 1;
  const nodeModifiers = new Map<string, EngineChaosModifier>();
  let hasGlobalChaos = false;

  for (const active of activeChaos) {
    const modifier = chaosEventToModifier(active.chaosId);
    const global = shouldApplyChaosGlobally(active.scope, active.nodeId);

    if (global) {
      globalModifier = mergeModifiers(globalModifier, modifier);
      trafficMultiplier *= modifier.trafficMultiplier;
      hasGlobalChaos =
        hasGlobalChaos ||
        modifier.crash ||
        modifier.capacityMultiplier !== 1 ||
        modifier.slownessMultiplier !== 1 ||
        modifier.errorBoost > 0 ||
        modifier.connectionDropBoost > 0 ||
        modifier.cacheHitPenalty > 0 ||
        modifier.trafficMultiplier !== 1;
      continue;
    }

    if (!active.nodeId) continue;
    const existing = nodeModifiers.get(active.nodeId) ?? { ...DEFAULT_CHAOS_MODIFIER };
    nodeModifiers.set(active.nodeId, mergeModifiers(existing, modifier));
  }

  return { globalModifier, nodeModifiers, trafficMultiplier, hasGlobalChaos };
}

export function resolveNodeChaosModifier(
  nodeId: string,
  nodeArchetype: string,
  nodeModifiers: Map<string, EngineChaosModifier>,
  globalModifier: EngineChaosModifier,
  hasGlobalChaos: boolean,
  base: EngineChaosModifier,
): EngineChaosModifier {
  const scoped = nodeModifiers.get(nodeId);
  let merged = mergeModifiers(base, scoped ?? DEFAULT_CHAOS_MODIFIER);

  if (hasGlobalChaos && nodeArchetype !== 'client') {
    merged = mergeModifiers(merged, globalModifier);
  }

  return merged;
}
