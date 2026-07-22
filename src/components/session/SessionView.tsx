'use client';

import { ChaosTab } from '@/components/chaos/ChaosTab';
import { JudgesPanel } from '@/components/ai-judges/JudgesPanel';
import { MermaidTab } from '@/components/mermaid/MermaidTab';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { SessionPlayground, type SessionData } from '@/components/session/SessionPlayground';

type SessionViewProps = {
  session: SessionData;
};

export function SessionView({ session }: SessionViewProps) {
  return (
    <SessionPlayground
      session={session}
      chaosTab={
        <ErrorBoundary>
          <ChaosTab />
        </ErrorBoundary>
      }
      mermaidTab={
        <ErrorBoundary>
          <MermaidTab />
        </ErrorBoundary>
      }
      judgesPanel={
        <ErrorBoundary>
          <JudgesPanel initialScore={session.latestScore} />
        </ErrorBoundary>
      }
    />
  );
}
