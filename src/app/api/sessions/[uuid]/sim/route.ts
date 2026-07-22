import { NextResponse } from 'next/server';

import { getUserTier } from '@/lib/auth/tier';
import { getSessionByUuidOrThrow } from '@/lib/sessions/helpers';
import { updateSession } from '@/lib/db';
import { canStartSim, SIM_LIMIT_TEMPORARILY_DISABLED } from '@/lib/utils/rate-limit';
import { getProfileWithDailyReset, incrementSimCount } from '@/lib/utils/rate-limit-server';
import { createClient } from '@/lib/supabase/server';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ uuid: string }> },
) {
  const { uuid } = await params;
  const session = await getSessionByUuidOrThrow(uuid);

  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  const body = (await request.json()) as { action?: 'start' | 'stop' };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (body.action === 'start') {
    if (user) {
      const profile = await getProfileWithDailyReset(user.id);
      if (!profile) {
        return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
      }
      const tier = getUserTier(profile);
      if (!SIM_LIMIT_TEMPORARILY_DISABLED && !canStartSim(profile, tier)) {
        return NextResponse.json({ error: 'Daily sim limit reached' }, { status: 429 });
      }
      if (!SIM_LIMIT_TEMPORARILY_DISABLED) {
        await incrementSimCount(user.id);
      }
    }

    const updated = await updateSession(session.id, { status: 'in_progress' });
    return NextResponse.json({ status: updated.status, simRunning: true });
  }

  if (body.action === 'stop') {
    const updated = await updateSession(session.id, { status: 'completed' });
    return NextResponse.json({ status: updated.status, simRunning: false });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
