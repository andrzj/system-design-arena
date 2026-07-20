'use client';

import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/store/auth-store';

import { UserMenu } from './UserMenu';

export function Header() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <header className="border-b border-border/60 bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-[family-name:var(--font-heading)] text-lg font-semibold tracking-tight">
            System Design Arena
          </Link>
          <nav className="hidden items-center gap-6 text-sm md:flex">
            <Link href="/learn" className="text-muted-foreground transition-colors hover:text-foreground">
              Learn
            </Link>
            <Link href="/problems" className="text-muted-foreground transition-colors hover:text-foreground">
              Problems
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {isLoading ? (
            <div className="h-9 w-24 animate-pulse rounded-md bg-muted" aria-hidden="true" />
          ) : isAuthenticated ? (
            <UserMenu />
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/auth/sign-in">Sign in</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/auth/sign-up">Get started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
