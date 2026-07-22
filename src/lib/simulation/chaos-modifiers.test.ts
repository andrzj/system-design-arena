import { describe, expect, it } from 'vitest';

import { chaosEventToModifier } from './chaos-modifiers';
import { computeSimulation } from './engine';
import type { RFEdge, RFNode } from '@/store/canvas-store';

function node(id: string, type: string): RFNode {
  return {
    id,
    type: 'system',
    position: { x: 0, y: 0 },
    data: { label: type, componentType: type, replicas: 1 },
  };
}

function edge(id: string, source: string, target: string): RFEdge {
  return {
    id,
    source,
    target,
    type: 'flow',
    data: { label: '', style: 'solid' },
  };
}

describe('chaos-modifiers', () => {
  it('maps server crash to crash modifier', () => {
    const modifier = chaosEventToModifier('server_crash');
    expect(modifier.crash).toBe(true);
  });

  it('applies global chaos to non-client nodes during simulation', () => {
    const nodes = [node('c', 'client'), node('a', 'app_server')];
    const edges = [edge('e1', 'c', 'a')];
    const baseline = computeSimulation({
      nodes,
      edges,
      trafficLevel: 2,
      readWriteRatio: 0.9,
    });
    const withChaos = computeSimulation({
      nodes,
      edges,
      trafficLevel: 2,
      readWriteRatio: 0.9,
      activeChaos: [{ chaosId: 'dns_failure', nodeId: null, scope: 'global' }],
    });

    expect(withChaos.nodeMetrics.a.errorRate).toBeGreaterThan(baseline.nodeMetrics.a.errorRate);
  });
});

describe('aggregate metrics', () => {
  it('returns aggregate metrics on simulation snapshot', () => {
    const snap = computeSimulation({
      nodes: [node('c', 'client'), node('a', 'app_server')],
      edges: [edge('e1', 'c', 'a')],
      trafficLevel: 1,
      readWriteRatio: 0.9,
    });

    expect(snap.aggregateMetrics.totalRps).toBeGreaterThan(0);
    expect(snap.aggregateMetrics.activeNodes).toBeGreaterThan(0);
  });
});
