import type { RFEdge, RFNode } from '@/store/canvas-store';

import {
  isCacheArchetype,
  isCdnComponent,
  isDatastoreArchetype,
  isHealthCheckComponent,
  isQueueArchetype,
  resolveArchetype,
  type Archetype,
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
    description: 'Datastore origin for misses, writes, or uncached traffic.',
  },
  async_enqueue: {
    short: 'ASYNC',
    label: 'Async enqueue',
    description: 'Write or event work buffered off the synchronous request path.',
  },
  async_consume: {
    short: 'WORK',
    label: 'Async consume',
    description: 'Background worker consumes queued work.',
  },
  telemetry: {
    short: 'TEL',
    label: 'Telemetry',
    description: 'Sampled metrics, logs, or traces.',
  },
  static_cache: {
    short: 'CDN',
    label: 'Static cache',
    description: 'Edge cache serves read hits and forwards misses.',
  },
  control: {
    short: 'CTRL',
    label: 'Control',
    description: 'Low-volume health or control-plane traffic.',
  },
};

type OutgoingEdge = RFEdge & { targetArchetype: Archetype };

function outgoingWithArchetypes(edges: RFEdge[], nodeById: Map<string, RFNode>): OutgoingEdge[] {
  return edges.map((edge) => ({
    ...edge,
    targetArchetype: resolveArchetype(
      nodeById.get(edge.target)?.data.componentType ?? '',
      nodeById.get(edge.target)?.data.label,
    ),
  }));
}

function hasTargetArchetype(edges: OutgoingEdge[], archetype: Archetype): boolean {
  return edges.some((edge) => edge.targetArchetype === archetype);
}

function parseExplicitIntent(label?: string | null): EdgeIntent | null {
  if (!label?.trim()) return null;
  const normalized = label.trim().toLowerCase();
  const intents = Object.keys(EDGE_INTENT_LABELS) as EdgeIntent[];
  if (intents.includes(normalized as EdgeIntent)) return normalized as EdgeIntent;
  const byShort = intents.find(
    (intent) => EDGE_INTENT_LABELS[intent].short.toLowerCase() === normalized,
  );
  return byShort ?? null;
}

function inferEdgeIntent(
  source: RFNode,
  target: RFNode,
  allOutgoing: RFEdge[],
  nodeById: Map<string, RFNode>,
): EdgeIntent {
  const sourceArchetype = resolveArchetype(source.data.componentType, source.data.label);
  const targetArchetype = resolveArchetype(target.data.componentType, target.data.label);
  const outgoing = outgoingWithArchetypes(allOutgoing, nodeById);

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
  if (targetArchetype === 'observability' || source.data.componentType === 'analytics') {
    return 'telemetry';
  }
  if (isQueueArchetype(targetArchetype)) return 'async_enqueue';
  if (
    isDatastoreArchetype(targetArchetype) &&
    (hasTargetArchetype(outgoing, 'cache') ||
      hasTargetArchetype(outgoing, 'queue') ||
      outgoing.some((edge) => parseExplicitIntent(edge.data?.label) === 'cache_lookup') ||
      outgoing.some((edge) => parseExplicitIntent(edge.data?.label) === 'async_enqueue'))
  ) {
    return 'origin_fallback';
  }
  return 'request';
}

export function classifyEdgeIntent(
  edge: RFEdge,
  source: RFNode,
  target: RFNode,
  allOutgoing: RFEdge[],
  nodeById: Map<string, RFNode>,
): EdgeIntent {
  const explicit =
    parseExplicitIntent(edge.data?.intent) ?? parseExplicitIntent(edge.data?.label);
  const inferred = inferEdgeIntent(source, target, allOutgoing, nodeById);
  if (explicit) return explicit;
  return inferred;
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
