import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { getSessionByUuid } from '@/lib/db';

export default async function SessionPage({ params }: { params: Promise<{ uuid: string }> }) {
  const { uuid } = await params;
  const session = await getSessionByUuid(uuid);

  if (!session) {
    notFound();
  }

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-start justify-center gap-6 px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-wide text-muted-foreground">Design session</p>
      <h1 className="font-[family-name:var(--font-heading)] text-3xl font-semibold tracking-tight">
        {session.problem.title}
      </h1>
      <p className="text-muted-foreground">
        Your session was created. The interactive canvas playground ships in Phase 4.
      </p>
      <div className="flex flex-wrap gap-3">
        <Button asChild variant="outline">
          <Link href={`/problems/${session.problem.slug}`}>Back to brief</Link>
        </Button>
        <Button asChild>
          <Link href="/problems">All problems</Link>
        </Button>
      </div>
      <p className="font-mono text-xs text-muted-foreground">Session ID: {session.sessionUuid}</p>
    </div>
  );
}
