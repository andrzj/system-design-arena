import { getEventById } from '@/lib/chaos/events';

export type ActiveChaosEvent = {
  chaosId: string;
  nodeId: string | null;
  scope: string;
};

export type EngineChaosModifier = {
  capacityMultiplier: number;
  slownessMultiplier: number;
  errorBoost: number;
  connectionDropBoost: number;
  crash: boolean;
  cacheHitPenalty: number;
  trafficMultiplier: number;
};

const DEFAULT: EngineChaosModifier = {
  capacityMultiplier: 1,
  slownessMultiplier: 1,
  errorBoost: 0,
  connectionDropBoost: 0,
  crash: false,
  cacheHitPenalty: 0,
  trafficMultiplier: 1,
};

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

export function chaosEventToModifier(eventId: string): EngineChaosModifier {
  const event = getEventById(eventId);
  if (!event) return DEFAULT;

  const effects = event.effects as {
    is_disabled?: boolean;
    latency_multiplier?: number | null;
    error_rate?: number;
    throughput_multiplier?: number;
  };

  const throughput = effects.throughput_multiplier ?? 1;
  const errorRate = effects.error_rate ?? 0;
  const latency = effects.latency_multiplier ?? 1;
  const cacheHitPenalty =
    event.id.includes('cache') && !event.id.includes('thundering') ? 0.35 : event.id === 'cache_thundering_herd' ? 0.55 : 0;

  if (effects.is_disabled) {
    return {
      ...DEFAULT,
      crash: true,
      capacityMultiplier: 0,
      errorBoost: 0.6,
      connectionDropBoost: 1,
    };
  }

  return {
    capacityMultiplier: clamp(throughput, 0.1, 1),
    slownessMultiplier: clamp(latency, 1, 3.2),
    errorBoost: clamp(errorRate * 0.6, 0, 0.6),
    connectionDropBoost: clamp(errorRate * 0.4, 0, 0.85),
    crash: false,
    cacheHitPenalty,
    trafficMultiplier: event.scope === 'global' || event.scope === 'zone' ? clamp(throughput, 0.5, 2) : 1,
  };
}

export function isGlobalChaosScope(scope: string): boolean {
  return scope === 'global' || scope === 'zone' || scope === 'system';
}

export function buildChaosContext(activeChaos: ActiveChaosEvent[] = []) {
  let globalModifier = { ...DEFAULT };
  let trafficMultiplier = 1;
  const nodeModifiers = new Map<string, EngineChaosModifier>();
  let hasGlobalChaos = false;

  for (const active of activeChaos) {
    const modifier = chaosEventToModifier(active.chaosId);
    const global = isGlobalChaosScope(active.scope) || active.nodeId === null;

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
        modifier.cacheHitPenalty > 0;
      continue;
    }

    if (!active.nodeId) continue;
    const existing = nodeModifiers.get(active.nodeId) ?? { ...DEFAULT };
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
  let merged = mergeModifiers(base, scoped ?? DEFAULT);

  if (hasGlobalChaos && nodeArchetype !== 'client') {
    merged = mergeModifiers(merged, globalModifier);
  }

  return merged;
}
