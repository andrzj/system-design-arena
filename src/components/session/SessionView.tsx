'use client';

import { useCallback } from 'react';

import { ChaosTab } from '@/components/chaos/ChaosTab';
import { JudgesPanel } from '@/components/ai-judges/JudgesPanel';
import { SessionPlayground, type SessionData } from '@/components/session/SessionPlayground';
import { pickRandomChaosEventId } from '@/lib/chaos/simulate';
import { useCanvasStore } from '@/store/canvas-store';

type SessionViewProps = {
  session: SessionData;
};

export function SessionView({ session }: SessionViewProps) {
  const sessionUuid = useCanvasStore((s) => s.sessionUuid);
  const nodes = useCanvasStore((s) => s.nodes);
  const updateNode = useCanvasStore((s) => s.updateNode);

  const onQuickChaos = useCallback(async () => {
    const uuid = sessionUuid ?? session.sessionUuid;
    const eventId = pickRandomChaosEventId();
    const res = await fetch(`/api/sessions/${uuid}/chaos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventId,
        targetNodeId: nodes[0]?.id ?? null,
        nodes: nodes.map((n) => ({
          id: n.id,
          componentType: n.data.componentType,
          replicas: n.data.replicas,
        })),
      }),
    });
    if (!res.ok) return;
    const data = (await res.json()) as {
      result: { nodeUpdates: Array<{ nodeId: string; isDisabled?: boolean; isDegraded?: boolean }> };
    };
    for (const update of data.result.nodeUpdates) {
      updateNode(update.nodeId, {
        isDisabled: update.isDisabled,
        isDegraded: update.isDegraded,
      });
    }
  }, [sessionUuid, session.sessionUuid, nodes, updateNode]);

  return (
    <SessionPlayground
      session={session}
      chaosTab={<ChaosTab />}
      judgesPanel={<JudgesPanel />}
      onQuickChaos={onQuickChaos}
    />
  );
}
