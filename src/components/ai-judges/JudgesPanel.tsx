'use client';

import { useState } from 'react';

import { ConsensusBadge } from '@/components/ai-judges/ConsensusBadge';
import { FeedbackMarkdown } from '@/components/ai-judges/FeedbackMarkdown';
import { JudgeCard } from '@/components/ai-judges/JudgeCard';
import { Button } from '@/components/ui/button';
import type { SessionArchitecture } from '@/lib/scoring/serialize';
import { useAuth } from '@/store/auth-store';
import { useCanvasStore } from '@/store/canvas-store';

type ScoreResponse = {
  rigorScore: number | null;
  pragmatismScore: number | null;
  consensusVerdict: 'pass' | 'borderline' | 'fail' | null;
  writtenFeedback: string;
  debateSummary: string;
};

export function JudgesPanel() {
  const { isAuthenticated } = useAuth();
  const sessionUuid = useCanvasStore((s) => s.sessionUuid);
  const nodes = useCanvasStore((s) => s.nodes);
  const edges = useCanvasStore((s) => s.edges);
  const problemTitle = useCanvasStore((s) => s.problemTitle);
  const speed = useCanvasStore((s) => s.simulationSpeed);
  const traffic = useCanvasStore((s) => s.trafficLevel);
  const readWriteRatio = useCanvasStore((s) => s.readWriteRatio);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScoreResponse | null>(null);

  const scoreDesign = async () => {
    if (!sessionUuid) return;
    setLoading(true);
    try {
      const architecture: SessionArchitecture = {
        problemTitle,
        requirements: '',
        keyConsiderations: '',
        speedSetting: speed,
        trafficSetting: traffic,
        readWriteRatio,
        nodes: nodes.map((n) => ({
          label: n.data.label,
          componentType: n.data.componentType,
          replicas: n.data.replicas,
          implementationNotes: n.data.implementationNotes,
          isDisabled: n.data.isDisabled,
        })),
        edges: edges.map((e) => ({
          source: e.source,
          target: e.target,
          label: e.data?.label,
        })),
      };

      const res = await fetch('/api/scoring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionUuid, architecture }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        window.alert(data.error ?? 'Scoring failed');
        return;
      }

      setResult((await res.json()) as ScoreResponse);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="rounded-lg border border-border bg-card/40 p-6 text-sm text-muted-foreground">
        Sign in to receive AI judge feedback on your architecture.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">AI Judges</h3>
          <p className="text-sm text-muted-foreground">
            Two judges debate your design — Rigor vs Pragmatism.
          </p>
        </div>
        <Button data-testid="score-design" onClick={scoreDesign} disabled={loading || nodes.length === 0}>
          {loading ? 'Scoring…' : 'Score design'}
        </Button>
      </div>

      {result ? (
        <>
          <div className="flex items-center gap-2">
            <ConsensusBadge verdict={result.consensusVerdict} />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <JudgeCard title="Rigor" score={result.rigorScore} />
            <JudgeCard title="Pragmatism" score={result.pragmatismScore} />
          </div>
          <FeedbackMarkdown content={result.writtenFeedback} />
        </>
      ) : (
        <p className="text-sm text-muted-foreground">
          Add components to the canvas, then score to get feedback.
        </p>
      )}
    </div>
  );
}
