'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { FileText, Minus, Plus, Power } from 'lucide-react';

import { ImplementationNotesPanel } from '@/components/canvas/ImplementationNotesPanel';
import { NodeSimControls } from '@/components/canvas/NodeSimControls';
import { getComponentByType, getComponentNotesHint } from '@/lib/canvas/components';
import type { NodeData } from '@/store/canvas-store';
import { useCanvasStore } from '@/store/canvas-store';
import { cn } from '@/lib/utils';

function loadBarColor(loadPct: number, isBottleneck: boolean): string {
  if (isBottleneck || loadPct > 100) return 'bg-red-500';
  if (loadPct > 70) return 'bg-amber-400';
  if (loadPct > 35) return 'bg-emerald-400';
  return 'bg-sky-400';
}

function SystemNodeComponent({ id, data, selected }: NodeProps & { data: NodeData }) {
  const updateNode = useCanvasStore((s) => s.updateNode);
  const recomputeSimulation = useCanvasStore((s) => s.recomputeSimulation);
  const isSimulationRunning = useCanvasStore((s) => s.isSimulationRunning);
  const metrics = useCanvasStore((s) => s.simulationSnapshot.nodeMetrics[id]);
  const notesPanelNodeId = useCanvasStore((s) => s.notesPanelNodeId);
  const setNotesPanelNodeId = useCanvasStore((s) => s.setNotesPanelNodeId);

  const def = getComponentByType(data.componentType);
  const description = data.description ?? def?.description ?? '';
  const notesHint = getComponentNotesHint(data.componentType, data.label);
  const accent = def?.color ?? '#3b82f6';

  const loadPct = isSimulationRunning ? (metrics?.loadPct ?? 0) : 0;
  const latencyMs = isSimulationRunning ? (metrics?.latencyMs ?? 0) : 0;
  const isBottleneck = isSimulationRunning && (metrics?.isBottleneck ?? false);
  const notesOpen = notesPanelNodeId === id;

  return (
    <div className="relative">
      <div
        className={cn(
          'react-flow__node-system min-w-[148px] rounded-xl border-2 px-3 py-2.5 font-mono text-xs shadow-lg backdrop-blur-sm transition-shadow',
          selected && 'ring-2 ring-primary/50',
          data.isDisabled && 'opacity-40',
          data.isDegraded && 'border-red-500',
          isBottleneck && 'border-red-500 shadow-[0_0_24px_rgba(239,68,68,0.35)]',
        )}
        style={{
          backgroundColor: 'rgba(15, 23, 42, 0.72)',
          borderColor: isBottleneck ? undefined : accent,
        }}
        title={description}
      >
        <Handle
          type="target"
          position={Position.Left}
          id="target"
          className="react-flow__handle-left target !h-2.5 !w-2.5 !border-2 !border-white !bg-slate-900"
          isConnectable
        />
        <Handle
          type="source"
          position={Position.Right}
          id="source"
          className="react-flow__handle-right source !h-2.5 !w-2.5 !border-2 !border-white !bg-slate-900"
          isConnectable
        />

        <div className="flex items-start justify-between gap-2">
          <span className="font-semibold leading-tight text-foreground">{data.label}</span>
          <button
            type="button"
            aria-label="Implementation notes"
            aria-expanded={notesOpen}
            className={cn(
              'rounded p-0.5 text-muted-foreground hover:bg-white/10 hover:text-foreground',
              notesOpen && 'bg-white/10 text-foreground',
            )}
            onClick={(e) => {
              e.stopPropagation();
              setNotesPanelNodeId(notesOpen ? null : id);
            }}
          >
            <FileText className="h-3.5 w-3.5" />
          </button>
        </div>

        {isBottleneck ? (
          <div className="mt-1 rounded bg-red-500/20 px-1.5 py-0.5 text-center text-[9px] font-bold uppercase tracking-wider text-red-300">
            Bottleneck
          </div>
        ) : null}
        {metrics?.hasChaos ? (
          <div className="mt-1 rounded bg-amber-500/20 px-1.5 py-0.5 text-center text-[9px] font-bold uppercase tracking-wider text-amber-200">
            Chaos
          </div>
        ) : null}

        <div className="mt-2 flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground">
          <button
            type="button"
            aria-label="Decrease replicas"
            disabled={data.replicas <= 1}
            className="flex h-5 w-5 items-center justify-center rounded border border-white/10 hover:bg-white/10 disabled:opacity-40"
            onClick={(e) => {
              e.stopPropagation();
              if (data.replicas > 1) updateNode(id, { replicas: data.replicas - 1 });
            }}
          >
            <Minus className="h-3 w-3" />
          </button>
          <span className="min-w-[3.5rem] text-center tabular-nums">
            {data.replicas} rep{data.replicas === 1 ? '' : 's'}
          </span>
          <button
            type="button"
            aria-label="Increase replicas"
            className="flex h-5 w-5 items-center justify-center rounded border border-white/10 hover:bg-white/10"
            onClick={(e) => {
              e.stopPropagation();
              updateNode(id, { replicas: data.replicas + 1 });
            }}
          >
            <Plus className="h-3 w-3" />
          </button>
          <button
            type="button"
            aria-label="Toggle disabled"
            className={cn(
              'ml-0.5 flex h-5 w-5 items-center justify-center rounded border border-white/10 hover:bg-white/10',
              data.isDisabled && 'border-red-400/50 text-red-400',
            )}
            onClick={(e) => {
              e.stopPropagation();
              updateNode(id, { isDisabled: !data.isDisabled });
            }}
          >
            <Power className="h-3 w-3" />
          </button>
        </div>

        <NodeSimControls
          componentType={data.componentType}
          simConfig={data.simConfig}
          onChange={(updates) => {
            updateNode(id, updates);
            recomputeSimulation();
          }}
        />

        <div className="mt-2.5 space-y-1">
          <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className={cn('h-full rounded-full transition-all duration-500', loadBarColor(loadPct, isBottleneck))}
              style={{ width: `${Math.min(100, loadPct)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] tabular-nums text-muted-foreground">
            <span>{loadPct}%</span>
            <span>{latencyMs}ms</span>
          </div>
        </div>
      </div>

      {notesOpen ? (
        <ImplementationNotesPanel
          nodeId={id}
          data={data}
          notesHint={notesHint}
          onClose={() => setNotesPanelNodeId(null)}
        />
      ) : null}
    </div>
  );
}

export const SystemNode = memo(SystemNodeComponent);
