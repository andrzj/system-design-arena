import { describe, expect, it } from 'vitest';

import {
  getApplicableEdgeIntents,
  getEdgeIntentWarnings,
  inferEdgeIntent,
  resolveEdgeIntent,
} from '@/lib/simulation/edge-intents';
import type { RFEdge, RFNode } from '@/store/canvas-store';

function node(id: string, componentType: string, label?: string, replicas = 1): RFNode {
  return {
    id,
    type: 'system',
    position: { x: 0, y: 0 },
    data: { label: label ?? componentType, componentType, replicas },
  };
}

function edge(
  id: string,
  source: string,
  target: string,
  label = '',
  intent?: string,
): RFEdge {
  return {
    id,
    source,
    target,
    type: 'flow',
    data: { label, style: 'solid', intent },
  };
}

describe('getApplicableEdgeIntents', () => {
  it('offers cache lookup on edges into cache nodes', () => {
    const nodes = [node('app', 'app_server'), node('cache', 'redis_cache', 'Cache')];
    const edges = [edge('e1', 'app', 'cache')];
    const nodeById = new Map(nodes.map((item) => [item.id, item]));

    expect(getApplicableEdgeIntents(nodes[0], nodes[1], edges, nodeById)).toEqual([
      'cache_lookup',
    ]);
  });

  it('offers origin fallback and request on cache-to-database edges', () => {
    const nodes = [node('cache', 'redis_cache'), node('db', 'sql_database', 'DB')];
    const edges = [edge('e1', 'cache', 'db', 'DB')];
    const nodeById = new Map(nodes.map((item) => [item.id, item]));

    expect(getApplicableEdgeIntents(nodes[0], nodes[1], edges, nodeById)).toEqual([
      'origin_fallback',
      'request',
    ]);
  });

  it('offers origin fallback and request on app-to-database edges', () => {
    const nodes = [node('app', 'app_server'), node('db', 'sql_database', 'DB')];
    const edges = [edge('e1', 'app', 'db')];
    const nodeById = new Map(nodes.map((item) => [item.id, item]));

    expect(getApplicableEdgeIntents(nodes[0], nodes[1], edges, nodeById)).toEqual([
      'origin_fallback',
      'request',
    ]);
  });

  it('defaults app-to-database edges to origin fallback', () => {
    const nodes = [node('app', 'app_server'), node('db', 'sql_database', 'DB')];
    const edges = [edge('e1', 'app', 'db')];
    const nodeById = new Map(nodes.map((item) => [item.id, item]));

    expect(inferEdgeIntent(nodes[0], nodes[1], edges, nodeById)).toBe('origin_fallback');
  });

  it('offers static cache and request on CDN edges', () => {
    const nodes = [node('cdn', 'cdn'), node('app', 'app_server')];
    const edges = [edge('e1', 'cdn', 'app')];
    const nodeById = new Map(nodes.map((item) => [item.id, item]));

    expect(getApplicableEdgeIntents(nodes[0], nodes[1], edges, nodeById)).toEqual([
      'static_cache',
      'request',
    ]);
  });

  it('offers only telemetry to observability nodes', () => {
    const nodes = [node('app', 'app_server'), node('logs', 'logs', 'Logs')];
    const edges = [edge('e1', 'app', 'logs', 'TEL')];
    const nodeById = new Map(nodes.map((item) => [item.id, item]));

    expect(getApplicableEdgeIntents(nodes[0], nodes[1], edges, nodeById)).toEqual(['telemetry']);
  });
});

describe('resolveEdgeIntent', () => {
  it('uses explicit intent only when applicable', () => {
    const nodes = [node('app', 'app_server'), node('db', 'sql_database')];
    const edges = [edge('e1', 'app', 'db', 'REQ', 'request')];
    const nodeById = new Map(nodes.map((item) => [item.id, item]));

    expect(resolveEdgeIntent(edges[0], nodes[0], nodes[1], edges, nodeById)).toBe('request');
  });

  it('falls back to inferred intent when explicit choice is invalid', () => {
    const nodes = [node('app', 'app_server'), node('db', 'sql_database')];
    const edges = [edge('e1', 'app', 'db', 'REQ', 'telemetry')];
    const nodeById = new Map(nodes.map((item) => [item.id, item]));

    expect(resolveEdgeIntent(edges[0], nodes[0], nodes[1], edges, nodeById)).toBe(
      inferEdgeIntent(nodes[0], nodes[1], edges, nodeById),
    );
  });
});

describe('getEdgeIntentWarnings', () => {
  it('warns when queue is treated like an origin datastore', () => {
    const nodes = [node('app', 'app_server'), node('queue', 'message_queue')];
    const edges = [edge('e1', 'app', 'queue')];
    const nodeById = new Map(nodes.map((item) => [item.id, item]));

    expect(
      getEdgeIntentWarnings(edges[0], nodes[0], nodes[1], edges, nodeById, 'origin_fallback'),
    ).toContain('Queues cannot serve cache misses or reads like an origin datastore.');
  });
});
