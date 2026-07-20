import { Suspense } from 'react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<div className="px-6 py-12 text-center text-sm text-muted-foreground">Loading…</div>}>{children}</Suspense>;
}
