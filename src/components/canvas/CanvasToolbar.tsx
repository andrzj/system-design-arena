'use client';

import { Lock, LockOpen, Map, Zap } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useCanvasStore } from '@/store/canvas-store';

type CanvasToolbarProps = {
  onQuickChaos?: () => void;
};

export function CanvasToolbar({ onQuickChaos }: CanvasToolbarProps) {
  const isInteractive = useCanvasStore((s) => s.isInteractive);
  const showMinimap = useCanvasStore((s) => s.showMinimap);
  const isSimulationRunning = useCanvasStore((s) => s.isSimulationRunning);
  const setShowLiveMetrics = useCanvasStore((s) => s.setShowLiveMetrics);
  const setInteractive = useCanvasStore((s) => s.setInteractive);
  const setShowMinimap = useCanvasStore((s) => s.setShowMinimap);

  return (
    <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-lg border border-border bg-card/95 px-3 py-2 shadow-lg backdrop-blur">
      <Button
        variant="ghost"
        size="sm"
        aria-label={isInteractive ? 'Lock canvas' : 'Unlock canvas'}
        onClick={() => setInteractive(!isInteractive)}
      >
        {isInteractive ? <LockOpen className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        aria-label={showMinimap ? 'Hide minimap' : 'Show minimap'}
        onClick={() => setShowMinimap(!showMinimap)}
      >
        <Map className="h-4 w-4" />
      </Button>
      {isSimulationRunning ? (
        <Button
          variant="secondary"
          size="sm"
          data-testid="live-metrics"
          onClick={() => setShowLiveMetrics(true)}
        >
          Live Metrics
        </Button>
      ) : null}
      {onQuickChaos ? (
        <Button variant="outline" size="sm" onClick={onQuickChaos} data-testid="quick-chaos">
          <Zap className="mr-1 h-4 w-4" />
          Quick Chaos
        </Button>
      ) : null}
    </div>
  );
}
