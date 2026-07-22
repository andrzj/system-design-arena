import type { RFEdge, RFNode } from '@/store/canvas-store';

import {
  isCacheArchetype,
  isCdnComponent,
  isDatastoreArchetype,
  isDataWarehouseComponent,
  isHealthCheckComponent,
  isQueueArchetype,
  resolveArchetype,
} from './archetypes';

export type EdgeIntent =
  | 'request'
  | 'cache_lookup'
  | 'origin_fallback'
  | 'async_enqueue'
  | 'async_consume'
  | 'telemetry'
  | 'static_cache'
  | 'control';

export const EDGE_INTENT_LABELS: Record<
  EdgeIntent,
  { short: string; label: string; description: string }
> = {
  request: {
    short: 'REQ',
    label: 'Request',
    description: 'Synchronous user-path call. Affects latency, errors, and availability.',
  },
  cache_lookup: {
    short: 'CACHE',
    label: 'Cache lookup',
    description: 'Reads check the cache. Hits stop there; misses continue to origin.',
  },
  origin_fallback: {
    short: 'DB',
    label: 'Origin fallback',
    description: 'Datastore/search/object-store origin for misses, writes, or uncached traffic.',
  },
  async_enqueue: {
    short: 'ASYNC',
    label: 'Async enqueue',
    description: 'Write/event work is buffered and leaves the synchronous request path.',
  },
  async_consume: {
    short: 'WORK',
    label: 'Async consume',
    description: 'Background worker/service consumes queued work.',
  },
  telemetry: {
    short: 'TEL',
    label: 'Telemetry',
    description: 'Sampled metrics/logs/traces. Adds load but not user-path availability risk.',
  },
  static_cache: {
    short: 'CDN',
    label: 'Static cache',
    description: 'Edge/static cache serves read hits and forwards misses/writes.',
  },
  control: {
    short: 'CTRL',
    label: 'Control',
    description: 'Low-volume health checks, scheduler, safety, or control-plane traffic.',
  },
};

function dedupeIntents(intents: EdgeIntent[]): EdgeIntent[] {
  const seen = new Set<EdgeIntent>();
  return intents.filter((intent) => {
    if (seen.has(intent)) return false;
    seen.add(intent);
    return true;
  });
}

function isAnalyticsComponent(componentType: string): boolean {
  return componentType === 'analytics';
}

export function parseExplicitIntent(label?: string | null): EdgeIntent | null {
  if (!label?.trim()) return null;
  const normalized = label.trim().toLowerCase();
  const intents = Object.keys(EDGE_INTENT_LABELS) as EdgeIntent[];
  if (intents.includes(normalized as EdgeIntent)) return normalized as EdgeIntent;
  const byShort = intents.find(
    (intent) => EDGE_INTENT_LABELS[intent].short.toLowerCase() === normalized,
  );
  return byShort ?? null;
}

export function inferEdgeIntent(
  source: RFNode,
  target: RFNode,
  allOutgoing: RFEdge[],
  nodeById: Map<string, RFNode>,
): EdgeIntent {
  const sourceArchetype = resolveArchetype(source.data.componentType, source.data.label);
  const targetArchetype = resolveArchetype(target.data.componentType, target.data.label);

  if (isQueueArchetype(sourceArchetype)) return 'async_consume';
  if (
    isHealthCheckComponent(source.data.componentType) ||
    isHealthCheckComponent(target.data.componentType)
  ) {
    return 'control';
  }
  if (
    isCdnComponent(source.data.componentType) &&
    (targetArchetype === 'compute' ||
      targetArchetype === 'store' ||
      isDatastoreArchetype(targetArchetype))
  ) {
    return 'static_cache';
  }
  if (isCacheArchetype(targetArchetype)) return 'cache_lookup';
  if (isCacheArchetype(sourceArchetype) && isDatastoreArchetype(targetArchetype)) {
    return 'origin_fallback';
  }
  if (targetArchetype === 'observability' || isAnalyticsComponent(source.data.componentType)) {
    return 'telemetry';
  }
  if (isQueueArchetype(targetArchetype)) return 'async_enqueue';
  if (isDatastoreArchetype(targetArchetype)) return 'origin_fallback';
  return 'request';
}

export function getApplicableEdgeIntents(
  source: RFNode,
  target: RFNode,
  allOutgoing: RFEdge[],
  nodeById: Map<string, RFNode>,
): EdgeIntent[] {
  const sourceArchetype = resolveArchetype(source.data.componentType, source.data.label);
  const targetArchetype = resolveArchetype(target.data.componentType, target.data.label);
  const isObservabilityTarget =
    targetArchetype === 'observability' || isAnalyticsComponent(target.data.componentType);
  const isDatastoreTarget = isDatastoreArchetype(targetArchetype);

  const intents: EdgeIntent[] = [inferEdgeIntent(source, target, allOutgoing, nodeById)];

  if (isQueueArchetype(sourceArchetype)) intents.push('async_consume');
  if (
    isHealthCheckComponent(source.data.componentType) ||
    isHealthCheckComponent(target.data.componentType)
  ) {
    intents.push('control');
  }
  if (
    isCdnComponent(source.data.componentType) &&
    (targetArchetype === 'compute' ||
      targetArchetype === 'store' ||
      isDatastoreTarget)
  ) {
    intents.push('static_cache');
  }
  if (isCacheArchetype(targetArchetype)) intents.push('cache_lookup');
  if (isCacheArchetype(sourceArchetype) && isDatastoreTarget) intents.push('origin_fallback');
  if (isObservabilityTarget) intents.push('telemetry');
  if (isQueueArchetype(targetArchetype)) intents.push('async_enqueue');
  if (isDatastoreTarget) intents.push('origin_fallback');
  if (
    !isQueueArchetype(sourceArchetype) &&
    !isQueueArchetype(targetArchetype) &&
    !isCacheArchetype(targetArchetype) &&
    !isObservabilityTarget
  ) {
    intents.push('request');
  }

  return dedupeIntents(intents);
}

function edgeParticipatesInCycle(edge: RFEdge, edges: RFEdge[]): boolean {
  const adjacency = new Map<string, string[]>();
  for (const item of edges) {
    const next = adjacency.get(item.source) ?? [];
    next.push(item.target);
    adjacency.set(item.source, next);
  }

  const stack = [edge.target];
  const visited = new Set<string>();

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) continue;
    if (current === edge.source) return true;
    if (visited.has(current)) continue;
    visited.add(current);
    for (const next of adjacency.get(current) ?? []) stack.push(next);
  }

  return false;
}

export function getEdgeIntentWarnings(
  edge: RFEdge,
  source: RFNode,
  target: RFNode,
  allEdges: RFEdge[],
  nodeById: Map<string, RFNode>,
  explicitIntent?: EdgeIntent | null,
): string[] {
  const outgoing = allEdges.filter((item) => item.source === edge.source);
  const resolved =
    explicitIntent ?? inferEdgeIntent(source, target, outgoing, nodeById);
  const warnings: string[] = [];

  const sourceArchetype = resolveArchetype(source.data.componentType, source.data.label);
  const targetArchetype = resolveArchetype(target.data.componentType, target.data.label);

  if (sourceArchetype === 'client' && isDatastoreArchetype(targetArchetype)) {
    warnings.push('Direct client-to-datastore access bypasses app/API controls.');
  }
  if (targetArchetype === 'observability' && resolved === 'request') {
    warnings.push('Observability on the main request path can make monitoring outages user-visible.');
  }
  if (isDataWarehouseComponent(target.data.componentType) && resolved === 'request') {
    warnings.push('Data warehouses are usually analytical stores, not live user-path databases.');
  }
  if (
    isQueueArchetype(targetArchetype) &&
    (resolved === 'origin_fallback' || resolved === 'cache_lookup')
  ) {
    warnings.push('Queues cannot serve cache misses or reads like an origin datastore.');
  }
  if (
    (isCacheArchetype(sourceArchetype) || isCacheArchetype(targetArchetype)) &&
    resolved === 'async_enqueue'
  ) {
    warnings.push('Caches should not be used as write/event buffers.');
  }
  if (targetArchetype === 'database' && (target.data.replicas ?? 1) > 1) {
    warnings.push('Database replicas add read capacity only; writes stay bound to the single primary.');
  }
  if (edgeParticipatesInCycle(edge, allEdges)) {
    warnings.push('This edge participates in a cycle, so traffic ordering is approximate.');
  }

  return warnings;
}

export function resolveEdgeIntent(
  edge: RFEdge,
  source: RFNode,
  target: RFNode,
  allOutgoing: RFEdge[],
  nodeById: Map<string, RFNode>,
): EdgeIntent {
  const applicable = getApplicableEdgeIntents(source, target, allOutgoing, nodeById);
  const explicit = parseExplicitIntent(edge.data?.intent);
  if (explicit && applicable.includes(explicit)) return explicit;
  return inferEdgeIntent(source, target, allOutgoing, nodeById);
}

export function classifyEdgeIntent(
  edge: RFEdge,
  source: RFNode,
  target: RFNode,
  allOutgoing: RFEdge[],
  nodeById: Map<string, RFNode>,
): EdgeIntent {
  return resolveEdgeIntent(edge, source, target, allOutgoing, nodeById);
}

export function intentToFlowKind(
  intent: EdgeIntent,
): 'request' | 'read' | 'write' | 'cache' | 'idle' {
  switch (intent) {
    case 'cache_lookup':
    case 'static_cache':
      return 'cache';
    case 'origin_fallback':
    case 'async_enqueue':
      return 'write';
    default:
      return intent === 'request' ? 'request' : 'read';
  }
}

export function labelForIntent(intent: EdgeIntent): string {
  return EDGE_INTENT_LABELS[intent].short;
}
