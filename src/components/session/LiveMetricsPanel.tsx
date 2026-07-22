'use client';

import { Activity, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useCanvasStore } from '@/store/canvas-store';

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 font-mono text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="tabular-nums text-foreground">{value}</span>
    </div>
  );
}

export function LiveMetricsPanel() {
  const open = useCanvasStore((s) => s.showLiveMetrics);
  const setOpen = useCanvasStore((s) => s.setShowLiveMetrics);
  const isRunning = useCanvasStore((s) => s.isSimulationRunning);
  const metrics = useCanvasStore((s) => s.simulationSnapshot.aggregateMetrics);
  const activeChaos = useCanvasStore((s) => s.activeChaosEvents.length);

  if (!open || !isRunning) return null;

  return (
    <div
      className="absolute top-14 right-4 z-20 w-[min(92vw,320px)] rounded-xl border border-white/10 bg-slate-950/95 p-4 shadow-2xl backdrop-blur-md"
      data-testid="live-metrics-panel"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
          <Activity className="h-3.5 w-3.5" />
          Live Metrics
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
          aria-label="Close live metrics"
          onClick={() => setOpen(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-4">
        <div className="grid gap-2 rounded-lg border border-white/10 bg-slate-900/60 p-3">
          <MetricRow label="Total RPS" value={Math.round(metrics.totalRps).toLocaleString()} />
          <MetricRow label="Avg latency" value={`${metrics.avgLatencyMs}ms`} />
          <MetricRow
            label="p95 / p99"
            value={`${metrics.p95LatencyMs} / ${metrics.p99LatencyMs}ms`}
          />
          <MetricRow label="Error rate" value={`${(metrics.errorRate * 100).toFixed(1)}%`} />
          <MetricRow label="Availability" value={`${(metrics.availability * 100).toFixed(1)}%`} />
          <MetricRow label="Budget burn" value={`${metrics.errorBudgetBurnRate.toFixed(1)}x`} />
        </div>
        <div className="grid gap-2 rounded-lg border border-white/10 bg-slate-900/60 p-3">
          <MetricRow label="Active / failing" value={`${metrics.activeNodes} / ${metrics.failingNodes}`} />
          <MetricRow label="Active chaos" value={String(activeChaos)} />
          <MetricRow label="Bottleneck" value={metrics.bottleneckName ?? 'None'} />
          {metrics.hottestNodeName ? (
            <MetricRow
              label="Hottest component"
              value={`${metrics.hottestNodeName} (${Math.round(metrics.hottestNodeCpu * 100)}%)`}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
