'use client';

import { useCallback, useState } from 'react';

import { Button } from '@/components/ui/button';
import { SimStatusBadge } from '@/components/session/SimStatusBadge';
import { ReadWriteSlider, SpeedSlider, TrafficSlider } from '@/components/session/sim-sliders';
import { useCanvasStore } from '@/store/canvas-store';

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
    <header className="border-b border-border bg-card/80 px-4 py-3 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <p className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
            Design session
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-[family-name:var(--font-heading)] text-lg font-semibold">
              {problemTitle}
            </h1>
            <span className="rounded-full border border-border px-2 py-0.5 text-xs capitalize text-muted-foreground">
              {sessionStatus.replace('_', ' ')}
            </span>
            <SimStatusBadge />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            data-testid="button-toggle-sim"
            onClick={toggleSim}
            disabled={simLoading}
          >
            {isSimulationRunning ? 'Stop' : 'Start'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            data-testid="button-toggle-sim-compact"
            onClick={toggleSim}
            disabled={simLoading}
          >
            {isSimulationRunning ? 'Stop' : 'Start'}
          </Button>
        </div>
      </div>
      <div className="mt-3 grid gap-3 md:grid-cols-3">
        <SpeedSlider onCommit={persistSettings} />
        <TrafficSlider onCommit={persistSettings} />
        <ReadWriteSlider onCommit={persistSettings} />
      </div>
    </header>
  );
}
