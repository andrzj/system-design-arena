'use client';

import { Activity } from 'lucide-react';

import { useCanvasStore } from '@/store/canvas-store';

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 font-mono text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="tabular-nums text-foreground">{value}</span>
    </div>
  );
}

export function LiveMetricsBody() {
  const metrics = useCanvasStore((s) => s.simulationSnapshot.aggregateMetrics);
  const activeChaos = useCanvasStore((s) => s.activeChaosEvents.length);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-foreground">
        <Activity className="h-3.5 w-3.5" />
        Live Metrics
      </div>
      <div className="grid gap-2 border-t border-border pt-3">
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
      <div className="grid gap-2 border-t border-border pt-3">
        <MetricRow
          label="Active / failing"
          value={`${metrics.activeNodes} / ${metrics.failingNodes}`}
        />
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
  );
}

export function LiveMetricsPanel() {
  const isRunning = useCanvasStore((s) => s.isSimulationRunning);
  if (!isRunning) return null;

  return (
    <div data-testid="live-metrics-panel" className="wb-transition-pane">
      <LiveMetricsBody />
    </div>
  );
}
