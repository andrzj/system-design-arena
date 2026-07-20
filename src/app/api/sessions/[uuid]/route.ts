import { NextResponse } from 'next/server';

import { updateSession } from '@/lib/db';
import { getSessionByUuidOrThrow, serializeSession } from '@/lib/sessions/helpers';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ uuid: string }> },
) {
  const { uuid } = await params;
  const session = await getSessionByUuidOrThrow(uuid);

  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  return NextResponse.json(serializeSession(session));
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ uuid: string }> },
) {
  const { uuid } = await params;
  const session = await getSessionByUuidOrThrow(uuid);

  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  const body = (await request.json()) as {
    speedSetting?: number;
    trafficSetting?: number;
    readWriteRatio?: number;
    status?: string;
  };

  const updated = await updateSession(session.id, {
    speedSetting: body.speedSetting,
    trafficSetting: body.trafficSetting,
    readWriteRatio: body.readWriteRatio,
    status: body.status,
  });

  return NextResponse.json({
    speedSetting: updated.speedSetting,
    trafficSetting: updated.trafficSetting,
    readWriteRatio: updated.readWriteRatio,
    status: updated.status,
  });
}
