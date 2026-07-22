'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md border-white/10 bg-slate-950/95">
        <DialogHeader>
          <DialogTitle className="font-[family-name:var(--font-heading)]">Live metrics</DialogTitle>
        </DialogHeader>
        {!isRunning ? (
          <p className="text-sm text-muted-foreground">Start simulation to see live session metrics.</p>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-2 rounded-lg border border-white/10 bg-slate-900/60 p-3">
              <MetricRow label="Total RPS" value={Math.round(metrics.totalRps).toLocaleString()} />
              <MetricRow label="Avg latency" value={`${metrics.avgLatencyMs}ms`} />
              <MetricRow label="P95 latency" value={`${metrics.p95LatencyMs}ms`} />
              <MetricRow label="P99 latency" value={`${metrics.p99LatencyMs}ms`} />
              <MetricRow label="Availability" value={`${(metrics.availability * 100).toFixed(1)}%`} />
              <MetricRow label="Error rate" value={`${(metrics.errorRate * 100).toFixed(1)}%`} />
              <MetricRow
                label="Error budget burn"
                value={metrics.errorBudgetBurnRate.toFixed(1)}
              />
            </div>
            <div className="grid gap-2 rounded-lg border border-white/10 bg-slate-900/60 p-3">
              <MetricRow label="Active nodes" value={String(metrics.activeNodes)} />
              <MetricRow label="Failing nodes" value={String(metrics.failingNodes)} />
              <MetricRow label="Active chaos" value={String(activeChaos)} />
              <MetricRow
                label="Bottleneck"
                value={metrics.bottleneckName ?? 'None'}
              />
              {metrics.bottleneckName ? (
                <MetricRow
                  label="Bottleneck CPU"
                  value={`${Math.round(metrics.bottleneckCpu * 100)}%`}
                />
              ) : null}
              <MetricRow label="Hottest node" value={metrics.hottestNodeName ?? 'None'} />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
