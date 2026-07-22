import { getEventById, type ChaosEvent } from '@/lib/chaos/events';

export type EngineChaosModifier = {
  capacityMultiplier: number;
  slownessMultiplier: number;
  errorBoost: number;
  connectionDropBoost: number;
  crash: boolean;
  cacheHitPenalty: number;
  trafficMultiplier: number;
};

export const DEFAULT_CHAOS_MODIFIER: EngineChaosModifier = {
  capacityMultiplier: 1,
  slownessMultiplier: 1,
  errorBoost: 0,
  connectionDropBoost: 0,
  crash: false,
  cacheHitPenalty: 0,
  trafficMultiplier: 1,
};

type ChaosEffects = {
  is_disabled?: boolean;
  latency_multiplier?: number | null;
  error_rate?: number;
  throughput_multiplier?: number;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function mergeModifier(
  base: EngineChaosModifier,
  patch: Partial<EngineChaosModifier>,
): EngineChaosModifier {
  return {
    capacityMultiplier: patch.capacityMultiplier ?? base.capacityMultiplier,
    slownessMultiplier: Math.max(base.slownessMultiplier, patch.slownessMultiplier ?? base.slownessMultiplier),
    errorBoost: clamp(patch.errorBoost ?? base.errorBoost, 0, 0.6),
    connectionDropBoost: clamp(patch.connectionDropBoost ?? base.connectionDropBoost, 0, 0.85),
    crash: base.crash || (patch.crash ?? false),
    cacheHitPenalty: clamp(patch.cacheHitPenalty ?? base.cacheHitPenalty, 0, 0.95),
    trafficMultiplier: patch.trafficMultiplier ?? base.trafficMultiplier,
  };
}

function baseModifierFromEffects(effects: ChaosEffects): EngineChaosModifier {
  const throughput = effects.throughput_multiplier ?? 1;
  const errorRate = effects.error_rate ?? 0;
  const latency = effects.latency_multiplier ?? 1;

  if (effects.is_disabled) {
    return {
      ...DEFAULT_CHAOS_MODIFIER,
      crash: true,
      capacityMultiplier: 0,
      errorBoost: 0.6,
      connectionDropBoost: 0.85,
    };
  }

  return {
    capacityMultiplier: clamp(throughput, 0.05, 1),
    slownessMultiplier: clamp(latency, 1, 3.2),
    errorBoost: clamp(errorRate * 0.65, 0, 0.6),
    connectionDropBoost: clamp(errorRate * 0.35, 0, 0.85),
    crash: false,
    cacheHitPenalty: 0,
    trafficMultiplier: 1,
  };
}

function categoryAdjustments(event: ChaosEvent, modifier: EngineChaosModifier): EngineChaosModifier {
  let next = { ...modifier };

  if (event.category === 'network' || event.id === 'network_partition') {
    next.connectionDropBoost = Math.max(next.connectionDropBoost, 0.3);
  }

  if (event.category === 'data') {
    next.slownessMultiplier = Math.max(next.slownessMultiplier, 1.5);
  }

  if (event.scope === 'global' && event.id === 'ddos_attack') {
    next = mergeModifier(next, {
      trafficMultiplier: 3,
      capacityMultiplier: Math.min(next.capacityMultiplier, 0.25),
      slownessMultiplier: 3.2,
      errorBoost: 0.45,
      connectionDropBoost: 0.5,
    });
  }

  return next;
}

const EVENT_OVERRIDES: Record<string, Partial<EngineChaosModifier>> = {
  server_crash: { crash: true, capacityMultiplier: 0, connectionDropBoost: 0.85 },
  power_outage: { crash: true, capacityMultiplier: 0, connectionDropBoost: 0.85 },
  network_partition: { connectionDropBoost: 0.7, capacityMultiplier: 0.35, errorBoost: 0.45 },
  disk_failure: { slownessMultiplier: 3.2, errorBoost: 0.25, capacityMultiplier: 0.2 },
  ram_exhaustion: { slownessMultiplier: 3.2, errorBoost: 0.35, capacityMultiplier: 0.12 },
  dns_failure: { errorBoost: 0.55, connectionDropBoost: 0.45, capacityMultiplier: 0.12 },
  bandwidth_throttling: { slownessMultiplier: 2.8, connectionDropBoost: 0.25, capacityMultiplier: 0.4 },
  packet_loss: { connectionDropBoost: 0.5, slownessMultiplier: 2.2 },
  high_latency: { slownessMultiplier: 3.2, connectionDropBoost: 0.25 },
  ssl_certificate_expired: { errorBoost: 0.6, capacityMultiplier: 0.05, connectionDropBoost: 0.75 },
  memory_leak: { slownessMultiplier: 1.8, capacityMultiplier: 0.75, errorBoost: 0.12 },
  deadlock: { slownessMultiplier: 3.2, errorBoost: 0.25, capacityMultiplier: 0.12 },
  cache_corruption: { cacheHitPenalty: 0.5, errorBoost: 0.3, capacityMultiplier: 0.55 },
  thread_exhaustion: { slownessMultiplier: 3.2, capacityMultiplier: 0.3, connectionDropBoost: 0.3 },
  connection_pool_exhausted: { slownessMultiplier: 2.8, connectionDropBoost: 0.4, capacityMultiplier: 0.35 },
  dependency_timeout: { slownessMultiplier: 3.2, errorBoost: 0.25, capacityMultiplier: 0.18 },
  payment_gateway_failure: { errorBoost: 0.6, capacityMultiplier: 0.08, connectionDropBoost: 0.55 },
  email_service_down: { errorBoost: 0.6, capacityMultiplier: 0.05 },
  cdn_origin_fetch_fail: { cacheHitPenalty: 0.6, errorBoost: 0.35, capacityMultiplier: 0.45 },
  auth_service_outage: { errorBoost: 0.5, capacityMultiplier: 0.12, connectionDropBoost: 0.4 },
  database_corruption: { errorBoost: 0.6, capacityMultiplier: 0.05, connectionDropBoost: 0.65 },
  replication_lag: { errorBoost: 0.15, slownessMultiplier: 1.4, capacityMultiplier: 0.75 },
  query_timeout: { slownessMultiplier: 3.2, errorBoost: 0.22, capacityMultiplier: 0.12 },
  deadlock_innodb: { slownessMultiplier: 2.2, errorBoost: 0.25, capacityMultiplier: 0.55 },
  connection_limit_exceeded: { slownessMultiplier: 2.8, connectionDropBoost: 0.45, errorBoost: 0.3 },
  ddos_attack: { trafficMultiplier: 3, capacityMultiplier: 0.25, slownessMultiplier: 3.2, errorBoost: 0.45, connectionDropBoost: 0.5 },
  sql_injection: { errorBoost: 0.12, slownessMultiplier: 1.2 },
  ransomware: { crash: true, capacityMultiplier: 0, connectionDropBoost: 0.85 },
  credential_leak: { errorBoost: 0.15, capacityMultiplier: 0.85 },
  misconfigured_firewall: { connectionDropBoost: 0.6, errorBoost: 0.45, capacityMultiplier: 0.22 },
  autoscaling_failure: { capacityMultiplier: 0.45, slownessMultiplier: 2.5, errorBoost: 0.2 },
  resource_quota_exceeded: { capacityMultiplier: 0.55, slownessMultiplier: 1.8, errorBoost: 0.12 },
  load_balancer_misconfig: { connectionDropBoost: 0.4, errorBoost: 0.25, capacityMultiplier: 0.55 },
  cache_thundering_herd: { cacheHitPenalty: 0.7, slownessMultiplier: 3.2, capacityMultiplier: 0.28 },
  fat_finger_error: { errorBoost: 0.6, capacityMultiplier: 0.05, connectionDropBoost: 0.7 },
  deploy_failure: { errorBoost: 0.35, slownessMultiplier: 2, capacityMultiplier: 0.55 },
  config_drift: { errorBoost: 0.18, capacityMultiplier: 0.75, slownessMultiplier: 1.3 },
};

export function chaosEventToModifier(eventId: string): EngineChaosModifier {
  const event = getEventById(eventId);
  if (!event) return DEFAULT_CHAOS_MODIFIER;

  const effects = event.effects as ChaosEffects;
  let modifier = baseModifierFromEffects(effects);
  modifier = categoryAdjustments(event, modifier);

  const override = EVENT_OVERRIDES[eventId];
  if (override) {
    modifier = mergeModifier(modifier, override);
  }

  return modifier;
}

export function isSignificantChaosImpact(modifier: EngineChaosModifier): boolean {
  return (
    modifier.crash ||
    modifier.capacityMultiplier < 0.9 ||
    modifier.slownessMultiplier > 1.2 ||
    modifier.errorBoost > 0.05 ||
    modifier.connectionDropBoost > 0.05 ||
    modifier.cacheHitPenalty > 0.05 ||
    modifier.trafficMultiplier !== 1
  );
}
