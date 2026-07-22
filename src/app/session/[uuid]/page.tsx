import { notFound } from 'next/navigation';

import { SessionView } from '@/components/session/SessionView';
import type { SessionData } from '@/components/session/SessionPlayground';
import type { NodeSimConfig } from '@/lib/simulation/types';
import { getSessionByUuidOrThrow, serializeSession } from '@/lib/sessions/helpers';

export default async function SessionPage({ params }: { params: Promise<{ uuid: string }> }) {
  const { uuid } = await params;
  const session = await getSessionByUuidOrThrow(uuid);

  if (!session) {
    notFound();
  }

  const data = serializeSession(session);

  return (
    <SessionView
      session={{
        id: data.id,
        sessionUuid: data.sessionUuid,
        status: data.status,
        speedSetting: data.speedSetting,
        trafficSetting: data.trafficSetting,
        readWriteRatio: data.readWriteRatio,
        cacheHitRate: data.cacheHitRate,
        edgeCacheHitRate: data.edgeCacheHitRate,
        problem: data.problem,
        nodes: data.nodes.map((node) => ({
          ...node,
          simConfig:
            node.simConfig && typeof node.simConfig === 'object' && !Array.isArray(node.simConfig)
              ? (node.simConfig as NodeSimConfig)
              : undefined,
        })),
        edges: data.edges,
      } satisfies SessionData}
    />
  );
}
