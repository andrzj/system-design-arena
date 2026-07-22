'use client';

import { Activity } from 'lucide-react';

import { QuickChaosMenu } from '@/components/canvas/QuickChaosMenu';
import { Button } from '@/components/ui/button';
import { useCanvasStore } from '@/store/canvas-store';
import { cn } from '@/lib/utils';

export function CanvasTopControls() {
  const isSimulationRunning = useCanvasStore((s) => s.isSimulationRunning);
  const showLiveMetrics = useCanvasStore((s) => s.showLiveMetrics);
  const setShowLiveMetrics = useCanvasStore((s) => s.setShowLiveMetrics);

  return (
    <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
      {isSimulationRunning ? (
        <Button
          variant="secondary"
          size="sm"
          data-testid="live-metrics"
          className={cn(
            'gap-1.5 border border-white/10 bg-slate-950/80 font-mono text-[10px] uppercase tracking-[0.12em] shadow-lg backdrop-blur',
            'opacity-80 transition-opacity hover:opacity-100',
            showLiveMetrics && 'border-primary/40 bg-slate-900/95 opacity-100',
          )}
          onClick={() => setShowLiveMetrics(!showLiveMetrics)}
        >
          <Activity className="h-3.5 w-3.5" />
          Live Metrics
        </Button>
      ) : null}
      <QuickChaosMenu align="right" />
    </div>
  );
}
