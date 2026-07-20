import { NextResponse } from 'next/server';

import { createSession } from '@/lib/db';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const body = (await request.json()) as { problemId?: number };
  if (!body.problemId) {
    return NextResponse.json({ error: 'problemId required' }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const session = await createSession(user?.id ?? null, body.problemId);
  return NextResponse.json({ sessionUuid: session.sessionUuid, id: session.id });
}
