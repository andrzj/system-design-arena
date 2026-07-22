'use client';

import { useCallback } from 'react';

import { getEventById } from '@/lib/chaos/events';
import { pickChaosTargetNodeId } from '@/lib/chaos/scopes';
import { useCanvasStore } from '@/store/canvas-store';

export function useChaosEvent() {
  const sessionUuid = useCanvasStore((s) => s.sessionUuid);
  const nodes = useCanvasStore((s) => s.nodes);
  const updateNode = useCanvasStore((s) => s.updateNode);
  const addActiveChaos = useCanvasStore((s) => s.addActiveChaos);
  const clearActiveChaos = useCanvasStore((s) => s.clearActiveChaos);
  const activeChaosEvents = useCanvasStore((s) => s.activeChaosEvents);

  const runChaosEvent = useCallback(
    async (eventId: string) => {
      if (!sessionUuid) return false;
      const event = getEventById(eventId);
      if (!event) return false;

      const targetNodeId = pickChaosTargetNodeId(eventId, nodes);

      const res = await fetch(`/api/sessions/${sessionUuid}/chaos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          targetNodeId,
          nodes: nodes.map((node) => ({
            id: node.id,
            componentType: node.data.componentType,
            replicas: node.data.replicas,
          })),
        }),
      });

      if (!res.ok) return false;

      const data = (await res.json()) as {
        result: {
          nodeUpdates: Array<{ nodeId: string; isDisabled?: boolean; isDegraded?: boolean }>;
        };
      };

      for (const update of data.result.nodeUpdates) {
        updateNode(update.nodeId, {
          isDisabled: update.isDisabled,
          isDegraded: update.isDegraded,
        });
      }

      addActiveChaos({
        chaosId: eventId,
        nodeId: targetNodeId,
        scope: event.scope,
      });

      return true;
    },
    [sessionUuid, nodes, updateNode, addActiveChaos],
  );

  const clearChaos = useCallback(() => {
    for (const node of nodes) {
      if (node.data.isDegraded || node.data.isDisabled) {
        updateNode(node.id, { isDisabled: false, isDegraded: false });
      }
    }
    clearActiveChaos();
  }, [nodes, updateNode, clearActiveChaos]);

  return { runChaosEvent, clearChaos, activeChaosCount: activeChaosEvents.length };
}
