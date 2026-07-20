'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';

import { getComponentByType } from '@/lib/canvas/components';
import type { NodeData } from '@/store/canvas-store';
import { useCanvasStore } from '@/store/canvas-store';
import { useAuth } from '@/store/auth-store';
import { cn } from '@/lib/utils';

function SystemNodeComponent({ id, data, selected }: NodeProps & { data: NodeData }) {
  const updateNode = useCanvasStore((s) => s.updateNode);
  const { isAuthenticated } = useAuth();
  const def = getComponentByType(data.componentType);

  const description = data.description ?? def?.description ?? '';
  const icon = def?.icon ?? '📦';

  return (
    <div
      className={cn(
        'react-flow__node-system min-w-[110px] rounded-md border-2 px-3 py-2 font-mono text-xs shadow-sm',
        selected ? 'border-blue-400' : 'border-[rgb(59,130,246)]',
        data.isDisabled && 'opacity-40',
        data.isDegraded && 'border-red-500 bg-red-500/10',
      )}
      style={{ backgroundColor: 'rgba(255, 255, 255, 0.12)' }}
      title={description}
    >
      <Handle
        type="target"
        position={Position.Left}
        id="target"
        className="react-flow__handle-left target !h-2 !w-2 !border-white !bg-white"
        isConnectable
      />
      <Handle
        type="source"
        position={Position.Right}
        id="source"
        className="react-flow__handle-right source !h-2 !w-2 !border-white !bg-white"
        isConnectable
      />
      <div className="flex items-center gap-1.5">
        <span>{icon}</span>
        <span className="font-medium">{data.label}</span>
      </div>
      <div className="mt-2 flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
        <button
          type="button"
          aria-label="Decrease replicas"
          disabled={data.replicas <= 1}
          className="rounded px-1 hover:bg-white/10 disabled:opacity-40"
          onClick={(e) => {
            e.stopPropagation();
            if (data.replicas > 1) updateNode(id, { replicas: data.replicas - 1 });
          }}
        >
          −
        </button>
        <span className="w-6 text-center">{data.replicas}</span>
        <button
          type="button"
          aria-label="Increase replicas"
          className="rounded px-1 hover:bg-white/10"
          onClick={(e) => {
            e.stopPropagation();
            updateNode(id, { replicas: data.replicas + 1 });
          }}
        >
          +
        </button>
        <button
          type="button"
          aria-label="Toggle disabled"
          className={cn('ml-1 rounded px-1 hover:bg-white/10', data.isDisabled && 'text-red-400')}
          onClick={(e) => {
            e.stopPropagation();
            updateNode(id, { isDisabled: !data.isDisabled });
          }}
        >
          ⏻
        </button>
        {isAuthenticated ? (
          <button
            type="button"
            aria-label="Implementation notes"
            className="rounded px-1 hover:bg-white/10"
            onClick={(e) => {
              e.stopPropagation();
              const notes = window.prompt('Implementation notes', data.implementationNotes ?? '');
              if (notes !== null) updateNode(id, { implementationNotes: notes });
            }}
          >
            📝
          </button>
        ) : null}
      </div>
    </div>
  );
}

export const SystemNode = memo(SystemNodeComponent);
