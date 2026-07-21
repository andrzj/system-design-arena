import type { RFNode } from '@/store/canvas-store';

import { CHAOS_EVENTS, getEventById } from './events';

export type ChaosSimulationInput = {
  eventId: string;
  targetNodeId?: string | null;
  nodes: RFNode[];
};

export type ChaosSimulationResult = {
  eventId: string;
  targetNodeId: string | null;
  summary: string;
  metrics: {
    latencyMultiplier: number;
    errorRate: number;
    throughputMultiplier: number;
  };
  affectedNodeIds: string[];
  nodeUpdates: Array<{ nodeId: string; isDisabled?: boolean; isDegraded?: boolean }>;
};

export function simulateChaosEvent(input: ChaosSimulationInput): ChaosSimulationResult {
  const event = getEventById(input.eventId);
  if (!event) {
    throw new Error(`Unknown chaos event: ${input.eventId}`);
  }

  const effects = event.effects as {
    is_disabled?: boolean;
    latency_multiplier?: number | null;
    error_rate?: number;
    throughput_multiplier?: number;
  };

  const latencyMultiplier = effects.latency_multiplier ?? 1;
  const errorRate = effects.error_rate ?? 0;
  const throughputMultiplier = effects.throughput_multiplier ?? 1;

  let affectedNodeIds: string[] = [];
  const nodeUpdates: ChaosSimulationResult['nodeUpdates'] = [];

  if (event.scope === 'node' && input.targetNodeId) {
    affectedNodeIds = [input.targetNodeId];
  } else if (event.scope === 'global' || event.scope === 'zone') {
    affectedNodeIds = input.nodes.map((n) => n.id);
  } else if (input.targetNodeId) {
    affectedNodeIds = [input.targetNodeId];
  }

  for (const nodeId of affectedNodeIds) {
    nodeUpdates.push({
      nodeId,
      isDisabled: effects.is_disabled ?? false,
      isDegraded: !effects.is_disabled && (errorRate > 0 || latencyMultiplier > 1),
    });
  }

  return {
    eventId: input.eventId,
    targetNodeId: input.targetNodeId ?? null,
    summary: `${event.label}: ${event.impact}`,
    metrics: {
      latencyMultiplier,
      errorRate,
      throughputMultiplier,
    },
    affectedNodeIds,
    nodeUpdates,
  };
}

export function pickRandomChaosEventId(): string {
  const index = Math.floor(Math.random() * CHAOS_EVENTS.length);
  return CHAOS_EVENTS[index]?.id ?? 'server_crash';
}
