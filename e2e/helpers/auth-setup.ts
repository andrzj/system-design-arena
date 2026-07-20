import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

import { ensureProfile } from '../../src/lib/auth/profile';
import { prisma } from '../../src/lib/prisma/client';

dotenv.config();

export type E2EUser = {
  email: string;
  password: string;
  name: string;
  userId?: string;
};

export async function probePublicSignUp(): Promise<boolean> {
  const email = `probe-${Date.now()}@arena.test`;
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const { data, error } = await supabase.auth.signUp({
    email,
    password: 'TestPass123!',
  });

  if (error || !data.user) return false;

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
  await admin.auth.admin.deleteUser(data.user.id).catch(() => undefined);

  return true;
}

export async function createConfirmedAuthUser(name: string): Promise<E2EUser> {
  const email = `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@arena.test`;
  const password = 'TestPass123!';

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: name },
  });

  if (error || !data.user) {
    throw new Error(`Failed to create E2E user: ${error?.message ?? 'unknown'}`);
  }

  return { email, password, name, userId: data.user.id };
}

export async function deleteAuthUser(userId: string) {
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  await admin.auth.admin.deleteUser(userId);
  await prisma.profile.deleteMany({ where: { id: userId } }).catch(() => undefined);
}

export async function deleteAuthUserByEmail(email: string) {
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
  const listed = await admin.auth.admin.listUsers();
  const authUser = listed.data.users.find((u) => u.email === email);
  if (authUser) await deleteAuthUser(authUser.id);
}

export async function getProfileByEmail(email: string) {
  return prisma.profile.findFirst({ where: { email } });
}

export async function createProfileForE2EUser(user: E2EUser, userId: string) {
  return ensureProfile(userId, user.email, user.name);
}

export { prisma };
