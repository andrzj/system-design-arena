import { describe, expect, it } from 'vitest';

import { simulateChaosEvent } from '@/lib/chaos/simulate';
import type { RFNode } from '@/store/canvas-store';

const sampleNodes: RFNode[] = [
  {
    id: 'node-a',
    type: 'system',
    position: { x: 0, y: 0 },
    data: { label: 'App', componentType: 'app_server', replicas: 2 },
  },
  {
    id: 'node-b',
    type: 'system',
    position: { x: 100, y: 0 },
    data: { label: 'DB', componentType: 'sql_database', replicas: 1 },
  },
];

describe('simulateChaosEvent', () => {
  it('disables targeted node on server crash', () => {
    const result = simulateChaosEvent({
      eventId: 'server_crash',
      targetNodeId: 'node-a',
      nodes: sampleNodes,
    });

    expect(result.affectedNodeIds).toEqual(['node-a']);
    expect(result.nodeUpdates[0]?.isDisabled).toBe(true);
    expect(result.metrics.errorRate).toBe(1);
  });

  it('affects all nodes on global dns failure', () => {
    const result = simulateChaosEvent({
      eventId: 'dns_failure',
      nodes: sampleNodes,
    });

    expect(result.affectedNodeIds).toHaveLength(2);
  });
});
