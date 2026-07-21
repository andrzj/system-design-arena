import { redirect } from 'next/navigation';

import { signOutAction } from '@/lib/auth/actions';
import { getProfileWithDailyReset } from '@/lib/utils/rate-limit-server';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/auth/sign-in?redirect_url=/settings');

  const profile = await getProfileWithDailyReset(user.id);

  return (
    <div className="mx-auto max-w-xl px-6 py-12">
      <h1 className="font-[family-name:var(--font-heading)] text-3xl font-semibold">Settings</h1>
      <div className="mt-8 space-y-4 rounded-lg border border-border bg-card/40 p-6 text-sm">
        <div>
          <p className="text-muted-foreground">Email</p>
          <p>{profile?.email ?? user.email}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Name</p>
          <p>{profile?.name ?? '—'}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Tier</p>
          <p className="capitalize">{profile?.subscriptionTier ?? 'free'}</p>
        </div>
      </div>
      <form action={signOutAction} className="mt-6">
        <Button type="submit" variant="outline">
          Sign out
        </Button>
      </form>
    </div>
  );
}
