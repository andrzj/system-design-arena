import { notFound } from 'next/navigation';

import { SessionPlayground } from '@/components/session/SessionPlayground';
import { getSessionByUuidOrThrow, serializeSession } from '@/lib/sessions/helpers';

export default async function SessionPage({ params }: { params: Promise<{ uuid: string }> }) {
  const { uuid } = await params;
  const session = await getSessionByUuidOrThrow(uuid);

  if (!session) {
    notFound();
  }

  const data = serializeSession(session);

  return (
    <SessionPlayground
      session={{
        id: data.id,
        sessionUuid: data.sessionUuid,
        status: data.status,
        speedSetting: data.speedSetting,
        trafficSetting: data.trafficSetting,
        readWriteRatio: data.readWriteRatio,
        problem: data.problem,
        nodes: data.nodes,
        edges: data.edges,
      }}
    />
  );
}
