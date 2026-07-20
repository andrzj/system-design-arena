'use client';

import { useTransition } from 'react';

import { Button } from '@/components/ui/button';
import { startSessionAction } from '@/lib/problems/actions';

interface StartSessionButtonProps {
  problemSlug: string;
  label?: string;
}

export function StartSessionButton({ problemSlug, label = 'Start session' }: StartSessionButtonProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      size="lg"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          await startSessionAction(problemSlug);
        });
      }}
    >
      {isPending ? 'Starting...' : label}
    </Button>
  );
}
