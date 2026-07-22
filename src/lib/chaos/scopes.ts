import type { RFNode } from '@/store/canvas-store';

import { getEventById } from './events';

const BROADCAST_SCOPES = new Set(['global', 'zone', 'system', 'network', 'account']);
const TARGETED_SCOPES = new Set(['node', 'service', 'link', 'cluster']);

export function requiresChaosTarget(scope: string): boolean {
  return TARGETED_SCOPES.has(scope);
}

export function isBroadcastChaosScope(scope: string): boolean {
  return BROADCAST_SCOPES.has(scope);
}

export function shouldApplyChaosGlobally(scope: string, nodeId: string | null | undefined): boolean {
  if (nodeId) return false;
  return isBroadcastChaosScope(scope) || scope === 'cluster';
}

const EVENT_TARGET_PREFERENCES: Record<string, string[]> = {
  disk_failure: ['sql_database', 'nosql_database', 'object_storage', 'block_storage'],
  cache_corruption: ['redis_cache', 'memcached', 'cdn'],
  cache_thundering_herd: ['redis_cache', 'memcached', 'cdn'],
  cdn_origin_fetch_fail: ['cdn'],
  deadlock: ['sql_database', 'nosql_database'],
  deadlock_innodb: ['sql_database'],
  query_timeout: ['sql_database', 'nosql_database'],
  database_corruption: ['sql_database', 'nosql_database'],
  replication_lag: ['sql_database', 'nosql_database'],
  connection_limit_exceeded: ['sql_database', 'nosql_database'],
  sql_injection: ['sql_database', 'nosql_database'],
  load_balancer_misconfig: ['load_balancer'],
  autoscaling_failure: ['app_server', 'api_gateway', 'kubernetes', 'container'],
  ssl_certificate_expired: ['api_gateway', 'load_balancer', 'waf'],
  payment_gateway_failure: ['app_server', 'api_gateway', 'payment'],
  auth_service_outage: ['auth_service', 'api_gateway'],
  thread_exhaustion: ['app_server', 'api_gateway'],
  connection_pool_exhausted: ['app_server', 'api_gateway'],
  memory_leak: ['app_server', 'api_gateway'],
  deploy_failure: ['app_server', 'api_gateway'],
  high_latency: ['load_balancer', 'api_gateway'],
  packet_loss: ['load_balancer', 'api_gateway'],
};

function nonClientNodes(nodes: RFNode[]): RFNode[] {
  return nodes.filter((node) => node.data.componentType !== 'client');
}

export function pickChaosTargetNodeId(eventId: string, nodes: RFNode[]): string | null {
  const event = getEventById(eventId);
  if (!event || !requiresChaosTarget(event.scope)) return null;

  const candidates = nonClientNodes(nodes);
  const pool = candidates.length > 0 ? candidates : nodes;
  if (pool.length === 0) return null;

  const preferredTypes = EVENT_TARGET_PREFERENCES[eventId];
  if (preferredTypes) {
    const match = pool.find((node) => preferredTypes.includes(node.data.componentType));
    if (match) return match.id;
  }

  return pool[Math.floor(Math.random() * pool.length)]?.id ?? null;
}

export function resolveAffectedNodeIds(
  scope: string,
  targetNodeId: string | null | undefined,
  nodes: RFNode[],
): string[] {
  if (requiresChaosTarget(scope)) {
    return targetNodeId ? [targetNodeId] : [];
  }

  if (isBroadcastChaosScope(scope)) {
    return nodes.map((node) => node.id);
  }

  if (scope === 'cluster' && !targetNodeId) {
    return nonClientNodes(nodes).map((node) => node.id);
  }

  return targetNodeId ? [targetNodeId] : nodes.map((node) => node.id);
}
