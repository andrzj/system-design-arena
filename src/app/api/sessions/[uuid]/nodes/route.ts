import { NextResponse } from 'next/server';

import { upsertCanvasNodes } from '@/lib/db';
import { getSessionByUuidOrThrow } from '@/lib/sessions/helpers';

type NodeInput = {
  nodeUuid: string;
  componentType: string;
  label?: string | null;
  x: number;
  y: number;
  replicas: number;
  implementationNotes?: string | null;
  isDisabled?: boolean;
};

export async function POST(
  request: Request,
  { params }: { params: Promise<{ uuid: string }> },
) {
  const { uuid } = await params;
  const session = await getSessionByUuidOrThrow(uuid);

  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  const body = (await request.json()) as { nodes?: NodeInput[] };
  const nodes = await upsertCanvasNodes(session.id, body.nodes ?? []);

  return NextResponse.json({ nodes });
}
