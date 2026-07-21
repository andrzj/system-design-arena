import { NextResponse } from 'next/server';

import { logChaosEvent } from '@/lib/db';
import { simulateChaosEvent } from '@/lib/chaos/simulate';
import { getSessionByUuidOrThrow } from '@/lib/sessions/helpers';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ uuid: string }> },
) {
  const { uuid } = await params;
  const session = await getSessionByUuidOrThrow(uuid);

  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  const body = (await request.json()) as {
    eventId?: string;
    targetNodeId?: string | null;
    nodes?: Array<{ id: string; componentType: string; replicas: number }>;
  };

  if (!body.eventId) {
    return NextResponse.json({ error: 'eventId required' }, { status: 400 });
  }

  const rfNodes = (body.nodes ?? []).map((n) => ({
    id: n.id,
    type: 'system',
    position: { x: 0, y: 0 },
    data: { label: n.componentType, componentType: n.componentType, replicas: n.replicas },
  }));

  try {
    const result = simulateChaosEvent({
      eventId: body.eventId,
      targetNodeId: body.targetNodeId,
      nodes: rfNodes,
    });

    let targetNodeDbId: number | null = null;
    if (body.targetNodeId) {
      const target = session.nodes.find((n) => n.nodeUuid === body.targetNodeId);
      targetNodeDbId = target?.id ?? null;
    }

    await logChaosEvent(session.id, body.eventId, targetNodeDbId, result);

    return NextResponse.json({ result });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Simulation failed' },
      { status: 400 },
    );
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ uuid: string }> },
) {
  const { uuid } = await params;
  const session = await getSessionByUuidOrThrow(uuid);

  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  const { getChaosLogsBySessionId } = await import('@/lib/db');
  const logs = await getChaosLogsBySessionId(session.id);
  return NextResponse.json({ logs });
}
