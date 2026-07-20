'use client';

import { Slider } from '@/components/ui/slider';
import { useCanvasStore } from '@/store/canvas-store';

type SpeedSliderProps = {
  onCommit?: (value: number) => void;
};

export function SpeedSlider({ onCommit }: SpeedSliderProps) {
  const speed = useCanvasStore((s) => s.simulationSpeed);
  const setSpeed = useCanvasStore((s) => s.setSimulationSpeed);

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Speed</span>
        <span>Speed {speed.toFixed(1)}×</span>
      </div>
      <Slider
        role="slider"
        aria-label="Simulation speed"
        min={0}
        max={5}
        step={0.1}
        value={[speed]}
        onValueChange={([value]) => setSpeed(value)}
        onValueCommit={([value]) => onCommit?.(value)}
      />
    </div>
  );
}

export function TrafficSlider({ onCommit }: SpeedSliderProps) {
  const traffic = useCanvasStore((s) => s.trafficLevel);
  const setTraffic = useCanvasStore((s) => s.setTrafficLevel);

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Traffic</span>
        <span>{traffic.toFixed(1)}×</span>
      </div>
      <Slider
        role="slider"
        aria-label="Traffic volume"
        min={0}
        max={5}
        step={0.1}
        value={[traffic]}
        onValueChange={([value]) => setTraffic(value)}
        onValueCommit={([value]) => onCommit?.(value)}
      />
    </div>
  );
}

export function ReadWriteSlider({ onCommit }: SpeedSliderProps) {
  const ratio = useCanvasStore((s) => s.readWriteRatio);
  const setRatio = useCanvasStore((s) => s.setReadWriteRatio);
  const writePct = Math.round((1 - ratio) * 100);

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Reads vs writes</span>
        <span>Read-heavy · {writePct}% write</span>
      </div>
      <Slider
        role="slider"
        aria-label="Read write ratio"
        min={0}
        max={1}
        step={0.01}
        value={[ratio]}
        onValueChange={([value]) => setRatio(value)}
        onValueCommit={([value]) => onCommit?.(value)}
      />
    </div>
  );
}
