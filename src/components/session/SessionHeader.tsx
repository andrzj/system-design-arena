'use client';

import { useCallback, useState } from 'react';
import { Pause, Play } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ReadWriteSlider, SpeedSlider, TrafficSlider } from '@/components/session/sim-sliders';
import { SIM_LIMIT_TEMPORARILY_DISABLED } from '@/lib/utils/rate-limit';
import { useCanvasStore } from '@/store/canvas-store';
import { cn } from '@/lib/utils';

type SessionHeaderProps = {
  problemTitle: string;
  modeTabs?: React.ReactNode;
};

export function SessionHeader({ problemTitle, modeTabs }: SessionHeaderProps) {
  const sessionUuid = useCanvasStore((s) => s.sessionUuid);
  const sessionStatus = useCanvasStore((s) => s.sessionStatus);
  const isSimulationRunning = useCanvasStore((s) => s.isSimulationRunning);
  const setSimulationState = useCanvasStore((s) => s.setSimulationState);
  const setSessionStatus = useCanvasStore((s) => s.setSessionStatus);
  const [simLoading, setSimLoading] = useState(false);
  const [simError, setSimError] = useState<string | null>(null);

  const persistSettings = useCallback(async () => {
    if (!sessionUuid) return;
    const { simulationSpeed, trafficLevel, readWriteRatio } = useCanvasStore.getState();
    await fetch(`/api/sessions/${sessionUuid}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        speedSetting: simulationSpeed,
        trafficSetting: trafficLevel,
        readWriteRatio,
      }),
    });
  }, [sessionUuid]);

  const toggleSim = async () => {
    if (!sessionUuid) return;
    setSimLoading(true);
    try {
      const action = isSimulationRunning ? 'stop' : 'start';
      const res = await fetch(`/api/sessions/${sessionUuid}/sim`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setSimError(data.error ?? 'Failed to toggle simulation');
        return;
      }
      const data = (await res.json()) as { status: string; simRunning: boolean };
      setSimError(null);
      setSessionStatus(data.status);
      setSimulationState(data.simRunning);
    } finally {
      setSimLoading(false);
    }
  };

  return (
    <header className="relative z-0 border-b border-border bg-card/60 px-3 py-2 backdrop-blur-md">
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-[family-name:var(--font-heading)] text-base font-semibold tracking-tight">
            {problemTitle}
          </h1>
          <span className="mt-1 inline-block rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-primary">
            {sessionStatus.replace('_', ' ')}
          </span>
        </div>

        {modeTabs}

        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button
            data-testid="button-toggle-sim"
            onClick={toggleSim}
            disabled={simLoading}
            className={cn(
              'wb-transition wb-press min-w-[5.5rem] gap-1.5',
              isSimulationRunning
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-white text-slate-950 hover:bg-white/90',
            )}
          >
            {isSimulationRunning ? (
              <>
                <Pause className="h-4 w-4" />
                Stop
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Start
              </>
            )}
          </Button>

          {!SIM_LIMIT_TEMPORARILY_DISABLED ? (
            <span className="hidden font-mono text-xs text-muted-foreground sm:inline">
              sim quota
            </span>
          ) : null}

          <div className="hidden h-8 w-px bg-border sm:block" />

          <SpeedSlider onCommit={persistSettings} />
          <TrafficSlider onCommit={persistSettings} />
          <ReadWriteSlider onCommit={persistSettings} />
        </div>
      </div>

      {simError ? (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {simError}
        </p>
      ) : null}

      <Button
        variant="outline"
        size="sm"
        className="sr-only"
        data-testid="button-toggle-sim-compact"
        onClick={toggleSim}
        disabled={simLoading}
      >
        {isSimulationRunning ? 'Stop' : 'Start'}
      </Button>
    </header>
  );
}
