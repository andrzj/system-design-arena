import { describe, expect, it } from 'vitest';

import {
  isBroadcastChaosScope,
  pickChaosTargetNodeId,
  requiresChaosTarget,
  resolveAffectedNodeIds,
} from '@/lib/chaos/scopes';
import type { RFNode } from '@/store/canvas-store';

const sampleNodes: RFNode[] = [
  {
    id: 'client-1',
    type: 'system',
    position: { x: 0, y: 0 },
    data: { label: 'Client', componentType: 'client', replicas: 1 },
  },
  {
    id: 'app-1',
    type: 'system',
    position: { x: 100, y: 0 },
    data: { label: 'App', componentType: 'app_server', replicas: 2 },
  },
  {
    id: 'db-1',
    type: 'system',
    position: { x: 200, y: 0 },
    data: { label: 'DB', componentType: 'sql_database', replicas: 1 },
  },
];

describe('chaos scopes', () => {
  it('requires target for service and link scopes', () => {
    expect(requiresChaosTarget('node')).toBe(true);
    expect(requiresChaosTarget('service')).toBe(true);
    expect(requiresChaosTarget('link')).toBe(true);
    expect(requiresChaosTarget('global')).toBe(false);
    expect(requiresChaosTarget('zone')).toBe(false);
  });

  it('broadcasts dns failure to all nodes', () => {
    expect(isBroadcastChaosScope('global')).toBe(true);
    expect(resolveAffectedNodeIds('global', null, sampleNodes)).toHaveLength(3);
  });

  it('targets one node for server crash', () => {
    expect(resolveAffectedNodeIds('node', 'app-1', sampleNodes)).toEqual(['app-1']);
    expect(resolveAffectedNodeIds('node', null, sampleNodes)).toEqual([]);
  });

  it('prefers database node for query timeout', () => {
    const target = pickChaosTargetNodeId('query_timeout', sampleNodes);
    expect(target).toBe('db-1');
  });

  it('avoids client nodes for quick chaos targets', () => {
    const target = pickChaosTargetNodeId('memory_leak', sampleNodes);
    expect(target).not.toBe('client-1');
  });
});
