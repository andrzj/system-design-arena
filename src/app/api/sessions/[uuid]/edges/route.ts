import { NextResponse } from 'next/server';

import { upsertCanvasEdges } from '@/lib/db';
import { getSessionByUuidOrThrow } from '@/lib/sessions/helpers';

type EdgeInput = {
  edgeUuid: string;
  sourceNodeUuid: string;
  targetNodeUuid: string;
  label?: string | null;
  style?: string | null;
  intent?: string | null;
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

  const body = (await request.json()) as { edges?: EdgeInput[] };

  try {
    const edges = await upsertCanvasEdges(session.id, body.edges ?? []);
    return NextResponse.json({ edges });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to save edges' },
      { status: 400 },
    );
  }
}
