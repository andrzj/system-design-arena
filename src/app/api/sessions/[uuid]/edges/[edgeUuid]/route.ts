import { NextResponse } from 'next/server';

import { deleteEdgeByUuid } from '@/lib/db';
import { getSessionByUuidOrThrow } from '@/lib/sessions/helpers';

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ uuid: string; edgeUuid: string }> },
) {
  const { uuid, edgeUuid } = await params;
  const session = await getSessionByUuidOrThrow(uuid);

  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  const deleted = await deleteEdgeByUuid(session.id, edgeUuid);
  if (!deleted) {
    return NextResponse.json({ error: 'Edge not found' }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
