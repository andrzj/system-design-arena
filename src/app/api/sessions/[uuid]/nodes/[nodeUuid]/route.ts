import { NextResponse } from 'next/server';

import { deleteNodeByUuid } from '@/lib/db';
import { getSessionByUuidOrThrow } from '@/lib/sessions/helpers';

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ uuid: string; nodeUuid: string }> },
) {
  const { uuid, nodeUuid } = await params;
  const session = await getSessionByUuidOrThrow(uuid);

  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  const deleted = await deleteNodeByUuid(session.id, nodeUuid);
  if (!deleted) {
    return NextResponse.json({ error: 'Node not found' }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
