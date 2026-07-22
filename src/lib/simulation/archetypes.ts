import { getComponentByType } from '@/lib/canvas/components';

export type Archetype =
  | 'client'
  | 'edge'
  | 'gateway'
  | 'compute'
  | 'cache'
  | 'database'
  | 'store'
  | 'queue'
  | 'observability'
  | 'network'
  | 'search'
  | 'external'
  | 'ai';

export type ArchetypeStats = {
  capacityRps: number;
  baseLatencyMs: number;
};

export const ARCHETYPE_STATS: Record<Archetype, ArchetypeStats> = {
  client: { capacityRps: 1_000_000_000, baseLatencyMs: 0 },
  edge: { capacityRps: 100_000, baseLatencyMs: 1 },
  network: { capacityRps: 80_000, baseLatencyMs: 1 },
  cache: { capacityRps: 30_000, baseLatencyMs: 2 },
  observability: { capacityRps: 15_000, baseLatencyMs: 5 },
  queue: { capacityRps: 10_000, baseLatencyMs: 8 },
  gateway: { capacityRps: 3_000, baseLatencyMs: 5 },
  store: { capacityRps: 2_000, baseLatencyMs: 40 },
  compute: { capacityRps: 1_500, baseLatencyMs: 25 },
  external: { capacityRps: 800, baseLatencyMs: 80 },
  search: { capacityRps: 600, baseLatencyMs: 30 },
  database: { capacityRps: 300, baseLatencyMs: 20 },
  ai: { capacityRps: 100, baseLatencyMs: 200 },
};

const TYPE_TO_ARCHETYPE: Record<string, Archetype> = {
  client: 'client',
  mobile: 'client',
  tablet: 'client',
  dns: 'edge',
  cdn: 'edge',
  load_balancer: 'edge',
  waf: 'edge',
  api_gateway: 'gateway',
  ingress: 'gateway',
  app_server: 'compute',
  worker: 'compute',
  serverless: 'compute',
  auth_service: 'compute',
  scheduler: 'compute',
  notifications: 'compute',
  analytics: 'compute',
  tool_registry: 'compute',
  search: 'search',
  cache: 'cache',
  sql_db: 'database',
  nosql_db: 'database',
  vector_db: 'database',
  memory_fabric: 'database',
  object_store: 'store',
  data_warehouse: 'store',
  message_queue: 'queue',
  pubsub: 'queue',
  event_stream: 'queue',
  kafka: 'queue',
  metrics: 'observability',
  logs: 'observability',
  tracing: 'observability',
  alerting: 'observability',
  health_check: 'observability',
  vpc: 'network',
  subnet: 'network',
  nat_gateway: 'network',
  vpn: 'network',
  service_mesh: 'network',
  llm_gateway: 'ai',
  orchestrator: 'ai',
  safety_mesh: 'gateway',
  third_party_api: 'external',
  payment: 'external',
  email: 'external',
};

const CATEGORY_FALLBACK: Record<string, Archetype> = {
  client: 'client',
  traffic: 'edge',
  compute: 'compute',
  storage: 'database',
  messaging: 'queue',
  observability: 'observability',
  network: 'network',
  ai: 'ai',
  external: 'external',
};

export function resolveArchetype(componentType: string, label?: string): Archetype {
  const mapped = TYPE_TO_ARCHETYPE[componentType];
  if (mapped) return mapped;

  const def = getComponentByType(componentType);
  if (def?.category && CATEGORY_FALLBACK[def.category]) {
    return CATEGORY_FALLBACK[def.category];
  }

  const haystack = `${componentType} ${label ?? ''}`.toLowerCase();
  if (haystack.includes('cache') || haystack.includes('redis')) return 'cache';
  if (haystack.includes('gateway') || haystack.includes('ingress')) return 'gateway';
  if (haystack.includes('queue') || haystack.includes('kafka')) return 'queue';
  if (haystack.includes('warehouse') || haystack.includes('object') || haystack.includes('s3')) {
    return 'store';
  }
  if (haystack.includes('sql') || haystack.includes('database') || haystack.includes('mongo')) {
    return 'database';
  }
  if (haystack.includes('search') || haystack.includes('elastic')) return 'search';
  if (haystack.includes('client') || haystack.includes('mobile')) return 'client';
  if (haystack.includes('dns') || haystack.includes('cdn') || haystack.includes('balancer')) {
    return 'edge';
  }

  return 'compute';
}

export function isClientArchetype(archetype: Archetype): boolean {
  return archetype === 'client';
}

export function isDatastoreArchetype(archetype: Archetype): boolean {
  return archetype === 'database' || archetype === 'store' || archetype === 'search';
}

export function isQueueArchetype(archetype: Archetype): boolean {
  return archetype === 'queue';
}

export function isCacheArchetype(archetype: Archetype): boolean {
  return archetype === 'cache';
}

export function isCdnComponent(componentType: string): boolean {
  return componentType === 'cdn';
}

export function isHealthCheckComponent(componentType: string): boolean {
  return componentType === 'health_check';
}

export function isDataWarehouseComponent(componentType: string): boolean {
  return componentType === 'data_warehouse';
}
