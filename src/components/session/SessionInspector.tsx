'use client';

import { LiveMetricsPanel } from '@/components/session/LiveMetricsPanel';
import { useCanvasStore } from '@/store/canvas-store';

export function SessionInspector() {
  const nodes = useCanvasStore((s) => s.nodes);
  const edges = useCanvasStore((s) => s.edges);
  const selectedEdgeId = useCanvasStore((s) => s.selectedEdgeId);
  const isSimulationRunning = useCanvasStore((s) => s.isSimulationRunning);
  const updateEdge = useCanvasStore((s) => s.updateEdge);

  const selectedNode = nodes.find((n) => n.selected) ?? null;
  const selectedEdge = selectedEdgeId
    ? edges.find((e) => e.id === selectedEdgeId) ?? null
    : null;

  return (
    <aside
      data-testid="session-inspector"
      className="flex h-full w-[min(100%,20rem)] shrink-0 flex-col border-l border-border bg-card/80"
    >
      <div className="border-b border-border px-3 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        Inspector
      </div>
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-3">
        <LiveMetricsPanel />

        {selectedNode ? (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">{selectedNode.data.label}</h3>
            <p className="font-mono text-[10px] text-muted-foreground">
              {selectedNode.data.componentType} · {selectedNode.data.replicas} rep
              {selectedNode.data.replicas === 1 ? '' : 's'}
            </p>
          </div>
        ) : null}

        {selectedEdge ? (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Edge</h3>
            <label className="block space-y-1 text-xs">
              <span className="text-muted-foreground">Label</span>
              <input
                className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm"
                value={selectedEdge.data?.label ?? ''}
                onChange={(e) => updateEdge(selectedEdge.id, { label: e.target.value })}
              />
            </label>
          </div>
        ) : null}

        {!isSimulationRunning && !selectedNode && !selectedEdge ? (
          <p className="text-sm text-muted-foreground">
            Add a component, connect edges, then start the simulation to inspect live metrics.
          </p>
        ) : null}
      </div>
    </aside>
  );
}
