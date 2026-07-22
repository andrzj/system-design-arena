'use client';

import { EdgeLabelRenderer } from '@xyflow/react';

import {
  EDGE_INTENT_LABELS,
  getApplicableEdgeIntents,
  getEdgeIntentWarnings,
  inferEdgeIntent,
  parseExplicitIntent,
  type EdgeIntent,
} from '@/lib/simulation/edge-intents';
import { cn } from '@/lib/utils';
import { useCanvasStore } from '@/store/canvas-store';

type EdgeIntentPopoverProps = {
  edgeId: string;
  labelX: number;
  labelY: number;
};

export function EdgeIntentPopover({ edgeId, labelX, labelY }: EdgeIntentPopoverProps) {
  const edges = useCanvasStore((s) => s.edges);
  const nodes = useCanvasStore((s) => s.nodes);
  const updateEdge = useCanvasStore((s) => s.updateEdge);

  const edge = edges.find((item) => item.id === edgeId);
  if (!edge) return null;

  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  const source = nodeById.get(edge.source);
  const target = nodeById.get(edge.target);
  if (!source || !target) return null;

  const outgoing = edges.filter((item) => item.source === edge.source);
  const applicableIntents = getApplicableEdgeIntents(source, target, outgoing, nodeById);
  const inferredIntent = inferEdgeIntent(source, target, outgoing, nodeById);
  const explicitIntent = parseExplicitIntent(edge.data?.intent);
  const activeIntent =
    explicitIntent && applicableIntents.includes(explicitIntent) ? explicitIntent : null;
  const defaultMeta = EDGE_INTENT_LABELS[inferredIntent];
  const warnings = getEdgeIntentWarnings(
    edge,
    source,
    target,
    edges,
    nodeById,
    activeIntent,
  );

  const selectIntent = (intent: EdgeIntent | null) => {
    if (intent === null) {
      updateEdge(edge.id, {
        intent: undefined,
        label: defaultMeta.short,
      });
      return;
    }

    updateEdge(edge.id, {
      intent,
      label: EDGE_INTENT_LABELS[intent].short,
    });
  };

  return (
    <EdgeLabelRenderer>
      <div
        className="nopan nodrag nowheel pointer-events-auto absolute z-50 flex max-h-60 w-64 flex-col rounded-md border border-white/20 bg-zinc-900/95 p-2 text-left shadow-2xl backdrop-blur"
        style={{
          transform: `translate(-50%, 0.75rem) translate(${labelX}px, ${labelY}px)`,
        }}
        onClick={(event) => event.stopPropagation()}
        data-testid={`edge-intent-menu-${edgeId}`}
      >
        <div className="mb-1.5 flex items-center justify-between gap-2 px-1">
          <p className="text-[10px] font-bold uppercase tracking-wide text-white/80">
            Connection intent
          </p>
          {!activeIntent ? (
            <span className="text-[9px] font-semibold uppercase tracking-wide text-emerald-300">
              Default
            </span>
          ) : null}
        </div>

        {warnings[0] ? (
          <div className="mb-1.5 shrink-0 rounded border border-amber-300/30 bg-amber-400/10 px-2 py-1 text-[10px] leading-snug text-amber-100">
            {warnings[0]}
          </div>
        ) : null}

        <div className="min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">
          {applicableIntents.map((intent) => {
            const meta = EDGE_INTENT_LABELS[intent];
            const isInferred = intent === inferredIntent;
            const isAuto = !activeIntent;
            const selected = isAuto ? isInferred : activeIntent === intent;

            return (
              <button
                key={intent}
                type="button"
                data-testid={
                  isInferred ? `edge-intent-auto-${edgeId}` : `edge-intent-${intent}-${edgeId}`
                }
                className={cn(
                  'w-full rounded px-2 py-1 text-left hover:bg-white/10',
                  selected ? 'bg-white/12' : undefined,
                )}
                onClick={() => {
                  if (isAuto && isInferred) return;
                  if (!isAuto && isInferred) {
                    selectIntent(null);
                    return;
                  }
                  selectIntent(intent);
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-white">{meta.short}</span>
                  <span className="text-[10px] uppercase tracking-wide text-white/70">
                    {isAuto && isInferred ? 'Default' : meta.label}
                  </span>
                </div>
                <p className="mt-0.5 text-[9px] leading-snug text-white/55">{meta.description}</p>
              </button>
            );
          })}
        </div>
      </div>
    </EdgeLabelRenderer>
  );
}
