'use server';

import { redirect } from 'next/navigation';

import { createProfileForUser, ensureProfile } from '@/lib/auth/profile';
import { createClient } from '@/lib/supabase/server';

export type AuthActionState = {
  error?: string;
};

function getRedirectUrl(formData: FormData): string {
  const redirectUrl = formData.get('redirect_url');
  if (typeof redirectUrl === 'string' && redirectUrl.startsWith('/')) {
    return redirectUrl;
  }
  return '/problems';
}

function getAuthErrorMessage(error: unknown): string {
  if (!error || typeof error !== 'object') {
    return 'Authentication failed. Please try again.';
  }

  const authError = error as { message?: string; msg?: string; status?: number };
  const message = authError.message?.trim();
  const msg = authError.msg?.trim();

  if (msg && msg !== '{}') return msg;
  if (message && message !== '{}') return message;

  if (authError.status === 500) {
    return 'Error sending confirmation email. Configure Supabase SMTP or enable auto-confirm for local dev.';
  }

  return 'Authentication failed. Please try again.';
}

export async function signUpAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const name = String(formData.get('name') ?? '').trim();
  const redirectUrl = getRedirectUrl(formData);

  if (!email || !password) {
    return { error: 'Email and password are required.' };
  }

  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters.' };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: name ? { full_name: name } : undefined,
    },
  });

  if (error) {
    return { error: getAuthErrorMessage(error) };
  }

  if (!data.user) {
    return { error: 'Sign up failed. Please try again.' };
  }

  try {
    await createProfileForUser(data.user.id, email, name || null);
  } catch (profileError) {
    console.error('Failed to create profile after sign-up:', profileError);
    return { error: 'Account created but profile setup failed. Please sign in and try again.' };
  }

  redirect(redirectUrl);
}

export async function signInAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const redirectUrl = getRedirectUrl(formData);

  if (!email || !password) {
    return { error: 'Email and password are required.' };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: getAuthErrorMessage(error) };
  }

  if (data.user) {
    await ensureProfile(data.user.id, data.user.email, data.user.user_metadata?.full_name);
  }

  redirect(redirectUrl);
}

export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/');
}

export async function fetchProfileAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, profile: null };
  }

  const profile = await ensureProfile(
    user.id,
    user.email,
    typeof user.user_metadata?.full_name === 'string' ? user.user_metadata.full_name : null,
  );

  return { user, profile };
}
