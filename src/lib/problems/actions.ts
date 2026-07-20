'use server';

import { redirect } from 'next/navigation';

import { createSession } from '@/lib/db';
import { getPublicProblemBySlug } from '@/lib/problems/queries';
import { createClient } from '@/lib/supabase/server';

export async function startSessionAction(problemSlug: string) {
  const problem = await getPublicProblemBySlug(problemSlug);

  if (!problem) {
    throw new Error('Problem not found.');
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const session = await createSession(user?.id ?? null, problem.id);
  redirect(`/session/${session.sessionUuid}`);
}
