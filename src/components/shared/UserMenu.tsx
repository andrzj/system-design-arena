'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/store/auth-store';

function getInitials(name?: string | null, email?: string | null): string {
  if (name) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  if (email) {
    return email.slice(0, 2).toUpperCase();
  }

  return 'U';
}

export function UserMenu() {
  const { user, profile, signOut } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  if (!user) return null;

  const displayName = profile?.name || user.user_metadata?.full_name || user.email || 'Account';
  const initials = getInitials(profile?.name || user.user_metadata?.full_name, user.email);

  async function handleSignOut() {
    setIsSigningOut(true);
    try {
      await signOut();
    } catch {
      router.push('/');
      router.refresh();
    } finally {
      setIsSigningOut(false);
      setOpen(false);
    }
  }

  return (
    <div className="relative z-[60]">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-2 pl-2"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-primary">
          {initials}
        </span>
        <span className="hidden max-w-[120px] truncate sm:inline">{displayName}</span>
      </Button>

      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[55] cursor-default"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <div
            role="menu"
            className="absolute right-0 z-[70] mt-2 w-56 rounded-md border border-border bg-card p-1 shadow-lg"
          >
            <div className="border-b border-border px-3 py-2">
              <p className="truncate text-sm font-medium">{displayName}</p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
              {profile ? (
                <p className="mt-1 text-xs text-muted-foreground capitalize">
                  {profile.subscriptionTier} tier
                </p>
              ) : null}
            </div>
            <Link
              href="/dashboard"
              role="menuitem"
              className="block rounded-sm px-3 py-2 text-sm hover:bg-muted"
              onClick={() => setOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              href="/settings"
              role="menuitem"
              className="block rounded-sm px-3 py-2 text-sm hover:bg-muted"
              onClick={() => setOpen(false)}
            >
              Settings
            </Link>
            <button
              type="button"
              role="menuitem"
              className="block w-full rounded-sm px-3 py-2 text-left text-sm hover:bg-muted disabled:opacity-50"
              onClick={handleSignOut}
              disabled={isSigningOut}
            >
              {isSigningOut ? 'Signing out…' : 'Sign out'}
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}
