import { describe, expect, it } from 'vitest';

import type { RFEdge, RFNode } from '@/store/canvas-store';

import { BASE_RPS } from './constants';
import { computeSimulation } from './engine';

function node(id: string, type: string, replicas = 1, extras: Partial<RFNode['data']> = {}): RFNode {
  return {
    id,
    type: 'system',
    position: { x: 0, y: 0 },
    data: { label: type, componentType: type, replicas, ...extras },
  };
}

function edge(id: string, source: string, target: string, label = ''): RFEdge {
  return {
    id,
    source,
    target,
    type: 'flow',
    data: { label, style: 'solid' },
  };
}

describe('computeSimulation', () => {
  it('returns zero load when traffic is zero', () => {
    const nodes = [node('c', 'client'), node('a', 'app_server')];
    const edges = [edge('e1', 'c', 'a')];
    const snap = computeSimulation({ nodes, edges, trafficLevel: 0, readWriteRatio: 0.9 });
    expect(snap.nodeMetrics.c.loadPct).toBe(0);
    expect(snap.edgeMetrics.e1.flowRate).toBe(0);
    expect(snap.totalRps).toBe(0);
  });

  it('uses reference baseline RPS at traffic multiplier 1', () => {
    const nodes = [node('c', 'client'), node('a', 'app_server')];
    const edges = [edge('e1', 'c', 'a')];
    const snap = computeSimulation({ nodes, edges, trafficLevel: 1, readWriteRatio: 0.9 });
    expect(snap.totalRps).toBe(BASE_RPS);
    expect(snap.nodeMetrics.a.incomingRps).toBe(BASE_RPS);
  });

  it('routes more traffic to cache on read-heavy workloads', () => {
    const nodes = [
      node('c', 'client'),
      node('a', 'app_server'),
      node('db', 'sql_db'),
      node('cache', 'cache'),
    ];
    const edges = [
      edge('e1', 'c', 'a'),
      edge('e2', 'a', 'db'),
      edge('e3', 'a', 'cache'),
    ];

    const readHeavy = computeSimulation({
      nodes,
      edges,
      trafficLevel: 2,
      readWriteRatio: 0.95,
      cacheHitRate: 0.95,
    });
    const writeHeavy = computeSimulation({
      nodes,
      edges,
      trafficLevel: 2,
      readWriteRatio: 0.1,
      cacheHitRate: 0.95,
    });

    expect(readHeavy.edgeMetrics.e3.incomingRps).toBeGreaterThan(writeHeavy.edgeMetrics.e3.incomingRps);
    expect(writeHeavy.edgeMetrics.e2.incomingRps).toBeGreaterThan(readHeavy.edgeMetrics.e2.incomingRps);
    expect(readHeavy.edgeMetrics.e3.label).toBe('CACHE');
    expect(writeHeavy.edgeMetrics.e2.label).toBe('DB');
  });

  it('splits read/write at gateway nodes with cache and db children', () => {
    const nodes = [
      node('c', 'client'),
      node('gw', 'api_gateway'),
      node('db', 'sql_db'),
      node('cache', 'cache'),
    ];
    const edges = [
      edge('e1', 'c', 'gw'),
      edge('e2', 'gw', 'db'),
      edge('e3', 'gw', 'cache'),
    ];

    const readHeavy = computeSimulation({
      nodes,
      edges,
      trafficLevel: 2,
      readWriteRatio: 0.9,
      cacheHitRate: 0.9,
    });

    expect(readHeavy.edgeMetrics.e3.incomingRps).toBeGreaterThan(readHeavy.edgeMetrics.e2.incomingRps);
  });

  it('marks overloaded database as bottleneck', () => {
    const nodes = [
      node('c', 'client'),
      node('a', 'app_server', 1),
      node('db', 'sql_db', 1),
    ];
    const edges = [edge('e1', 'c', 'a'), edge('e2', 'a', 'db')];

    const snap = computeSimulation({
      nodes,
      edges,
      trafficLevel: 5,
      readWriteRatio: 0.5,
    });

    expect(snap.nodeMetrics.db.isBottleneck).toBe(true);
    expect(snap.nodeMetrics.db.cpuUsage).toBeGreaterThanOrEqual(1);
  });

  it('reports near-full availability for a healthy chain (leaf nodes sampled)', () => {
    const nodes = [node('c', 'client'), node('a', 'app_server'), node('db', 'sql_db')];
    const edges = [edge('e1', 'c', 'a'), edge('e2', 'a', 'db')];

    // trafficLevel 0.2 keeps every node under capacity so nothing drops
    const snap = computeSimulation({ nodes, edges, trafficLevel: 0.2, readWriteRatio: 0.9 });

    expect(snap.aggregateMetrics.availability).toBeGreaterThan(0.9);
    expect(snap.aggregateMetrics.availability).toBeLessThanOrEqual(1);
    expect(snap.aggregateMetrics.avgLatencyMs).toBeGreaterThan(0);
  });

  it('keeps availability sane with request fan-out (no distributedSync double count)', () => {
    const nodes = [
      node('c', 'client'),
      node('gw', 'api_gateway'),
      node('a1', 'app_server'),
      node('a2', 'app_server'),
    ];
    const edges = [
      edge('e1', 'c', 'gw'),
      edge('e2', 'gw', 'a1'),
      edge('e3', 'gw', 'a2'),
    ];

    const snap = computeSimulation({ nodes, edges, trafficLevel: 1, readWriteRatio: 0.9 });

    expect(snap.aggregateMetrics.availability).toBeGreaterThan(0.9);
    expect(snap.aggregateMetrics.availability).toBeLessThanOrEqual(1);
    // fan-out splits traffic evenly, not duplicates it
    const combined = snap.edgeMetrics.e2.incomingRps + snap.edgeMetrics.e3.incomingRps;
    expect(combined).toBeLessThanOrEqual(BASE_RPS + 1);
  });

  it('node cacheHitRate scales traffic forwarded by a cache node', () => {
    const nodes = (hit: number) => [
      node('c', 'client'),
      node('a', 'app_server'),
      node('cache', 'cache', 1, { simConfig: { cacheHitRate: hit } }),
      node('db', 'sql_db'),
    ];
    const edges = [
      edge('e1', 'c', 'a'),
      edge('e2', 'a', 'cache'),
      edge('e3', 'cache', 'db'),
    ];

    const lowHit = computeSimulation({
      nodes: nodes(0.1),
      edges,
      trafficLevel: 1,
      readWriteRatio: 0.9,
    });
    const highHit = computeSimulation({
      nodes: nodes(0.95),
      edges,
      trafficLevel: 1,
      readWriteRatio: 0.9,
    });

    expect(highHit.edgeMetrics.e3.incomingRps).toBeLessThan(lowHit.edgeMetrics.e3.incomingRps);
  });

  it('CDN hit rate scales traffic forwarded on plain request edges', () => {
    const nodes = (hit: number) => [
      node('c', 'client'),
      node('cdn', 'cdn', 1, { simConfig: { cacheHitRate: hit } }),
      node('gw', 'api_gateway'),
    ];
    const edges = [edge('e1', 'c', 'cdn'), edge('e2', 'cdn', 'gw')];

    const lowHit = computeSimulation({
      nodes: nodes(0.1),
      edges,
      trafficLevel: 1,
      readWriteRatio: 0.9,
    });
    const highHit = computeSimulation({
      nodes: nodes(0.95),
      edges,
      trafficLevel: 1,
      readWriteRatio: 0.9,
    });

    expect(highHit.edgeMetrics.e2.incomingRps).toBeLessThan(lowHit.edgeMetrics.e2.incomingRps);
  });

  it('persists queue backlog across ticks via returned queueState', () => {
    const nodes = [
      node('c', 'client'),
      node('a', 'app_server'),
      node('q', 'message_queue'),
    ];
    const edges = [edge('e1', 'c', 'a'), edge('e2', 'a', 'q')];
    const input = { nodes, edges, trafficLevel: 3, readWriteRatio: 0.1 };

    const tick1 = computeSimulation(input, 1);
    const backlog1 = tick1.queueState.queueBacklog.get('q') ?? 0;
    expect(backlog1).toBeGreaterThan(0);

    const tick2 = computeSimulation({ ...input, prevState: tick1.queueState }, 2);
    const backlog2 = tick2.queueState.queueBacklog.get('q') ?? 0;
    expect(backlog2).toBeGreaterThan(backlog1);
  });

  it('reduces load when replicas increase', () => {
    const nodes = [node('c', 'client'), node('a', 'app_server', 4)];
    const edges = [edge('e1', 'c', 'a')];

    const oneRep = computeSimulation({
      nodes: [node('c', 'client'), node('a', 'app_server', 1)],
      edges,
      trafficLevel: 3,
      readWriteRatio: 0.5,
    });
    const fourRep = computeSimulation({ nodes, edges, trafficLevel: 3, readWriteRatio: 0.5 });

    expect(fourRep.nodeMetrics.a.cpuUsage).toBeLessThan(oneRep.nodeMetrics.a.cpuUsage);
  });
});
