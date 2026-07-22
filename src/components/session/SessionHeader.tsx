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
};

export function SessionHeader({ problemTitle }: SessionHeaderProps) {
  const sessionUuid = useCanvasStore((s) => s.sessionUuid);
  const sessionStatus = useCanvasStore((s) => s.sessionStatus);
  const isSimulationRunning = useCanvasStore((s) => s.isSimulationRunning);
  const setSimulationState = useCanvasStore((s) => s.setSimulationState);
  const setSessionStatus = useCanvasStore((s) => s.setSessionStatus);
  const [simLoading, setSimLoading] = useState(false);

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
        window.alert(data.error ?? 'Failed to toggle simulation');
        return;
      }
      const data = (await res.json()) as { status: string; simRunning: boolean };
      setSessionStatus(data.status);
      setSimulationState(data.simRunning);
    } finally {
      setSimLoading(false);
    }
  };

  return (
    <header className="relative z-0 border-b border-border bg-card/60 px-4 py-3 backdrop-blur-md">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            Design session
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-[family-name:var(--font-heading)] text-lg font-semibold tracking-tight">
              {problemTitle}
            </h1>
            <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-primary">
              {sessionStatus.replace('_', ' ')}
            </span>
          </div>
        </div>

        <div className="flex min-w-[min(100%,520px)] flex-1 flex-wrap items-center justify-end gap-3 rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2.5 lg:max-w-2xl">
          <Button
            data-testid="button-toggle-sim"
            onClick={toggleSim}
            disabled={simLoading}
            className={cn(
              'min-w-[5.5rem] gap-1.5',
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

          <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-3">
            <SpeedSlider onCommit={persistSettings} />
            <TrafficSlider onCommit={persistSettings} />
            <ReadWriteSlider onCommit={persistSettings} />
          </div>
        </div>
      </div>

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
