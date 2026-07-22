'use client';

import { EDGE_INTENT_LABELS, type EdgeIntent } from '@/lib/simulation/edge-intents';
import { useCanvasStore } from '@/store/canvas-store';

const INTENTS = Object.keys(EDGE_INTENT_LABELS) as EdgeIntent[];

export function EdgeIntentPanel() {
  const selectedEdgeId = useCanvasStore((s) => s.selectedEdgeId);
  const edges = useCanvasStore((s) => s.edges);
  const nodes = useCanvasStore((s) => s.nodes);
  const updateEdge = useCanvasStore((s) => s.updateEdge);
  const setSelectedEdgeId = useCanvasStore((s) => s.setSelectedEdgeId);

  const edge = edges.find((item) => item.id === selectedEdgeId);
  if (!edge) return null;

  const source = nodes.find((node) => node.id === edge.source);
  const target = nodes.find((node) => node.id === edge.target);
  const currentIntent = (edge.data.intent ?? edge.data.label)?.toLowerCase() as EdgeIntent | undefined;

  return (
    <div className="absolute right-3 top-3 z-20 w-56 rounded-xl border border-white/10 bg-slate-950/95 p-3 shadow-xl backdrop-blur">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          Edge intent
        </p>
        <button
          type="button"
          className="text-xs text-muted-foreground hover:text-foreground"
          onClick={() => setSelectedEdgeId(null)}
        >
          Close
        </button>
      </div>
      <p className="mb-2 text-xs text-muted-foreground">
        {source?.data.label ?? edge.source} → {target?.data.label ?? edge.target}
      </p>
      <div className="grid gap-1">
        {INTENTS.map((intent) => {
          const meta = EDGE_INTENT_LABELS[intent];
          const active = currentIntent === intent || edge.data.label.toUpperCase() === meta.short;
          return (
            <button
              key={intent}
              type="button"
              className={`rounded-md border px-2 py-1.5 text-left text-xs transition-colors ${
                active
                  ? 'border-primary/50 bg-primary/15 text-foreground'
                  : 'border-white/10 hover:bg-white/5'
              }`}
              onClick={() =>
                updateEdge(edge.id, {
                  intent,
                  label: meta.short,
                })
              }
            >
              <span className="font-mono font-semibold">{meta.short}</span>
              <span className="ml-2 text-muted-foreground">{meta.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
