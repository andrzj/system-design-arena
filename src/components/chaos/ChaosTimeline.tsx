'use client';

import type { ChaosSimulationResult } from '@/lib/chaos/simulate';
import { getEventById } from '@/lib/chaos/events';

type ChaosTimelineProps = {
  results: ChaosSimulationResult[];
};

export function ChaosTimeline({ results }: ChaosTimelineProps) {
  if (results.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No chaos events yet. Trigger one to see results.</p>
    );
  }

  return (
    <ol className="space-y-3" aria-label="Chaos event timeline">
      {results.map((result, index) => {
        const event = getEventById(result.eventId);
        return (
          <li
            key={`${result.eventId}-${index}`}
            className="rounded-lg border border-border bg-card/60 p-3 text-sm"
          >
            <div className="flex items-center gap-2 font-medium">
              <span>{event?.emoji ?? '⚡'}</span>
              <span>{event?.label ?? result.eventId}</span>
            </div>
            <p className="mt-1 text-muted-foreground">{result.summary}</p>
            <p className="mt-2 font-mono text-xs text-muted-foreground">
              latency ×{result.metrics.latencyMultiplier} · errors {(result.metrics.errorRate * 100).toFixed(0)}% ·
              throughput ×{result.metrics.throughputMultiplier}
            </p>
          </li>
        );
      })}
    </ol>
  );
}
