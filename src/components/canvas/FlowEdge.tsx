'use client';

import { memo, useMemo } from 'react';
import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath, type EdgeProps } from '@xyflow/react';

import { BASE_RPS } from '@/lib/simulation/constants';
import { cn } from '@/lib/utils';
import { useCanvasStore } from '@/store/canvas-store';

export type FlowEdgeData = {
  label?: string;
  style?: 'solid' | 'dashed';
};

function packetColor(flowKind: string): string {
  if (flowKind === 'error') return '#ef4444';
  if (flowKind === 'cache') return '#fbbf24';
  return '#60a5fa';
}

function FlowEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
  interactionWidth = 24,
}: EdgeProps) {
  const isRunning = useCanvasStore((s) => s.isSimulationRunning);
  const edgeMetrics = useCanvasStore((s) => s.simulationSnapshot.edgeMetrics[id]);
  const simulationSpeed = useCanvasStore((s) => s.simulationSpeed);

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    borderRadius: 16,
  });

  const flowRate = edgeMetrics?.flowRate ?? 0;
  const incomingRps = edgeMetrics?.incomingRps ?? 0;
  const flowKind = edgeMetrics?.flowKind ?? 'idle';
  const label = edgeMetrics?.label ?? data?.label ?? '';
  const isDashed = data?.style === 'dashed';
  const isActive = isRunning && flowRate > 0.001;

  const intensity = incomingRps / BASE_RPS;
  const strokeWidth = isActive ? 1.5 + intensity * 3 : 1.5;
  const durationSec = Math.max(
    0.35,
    (1.2 - intensity * 0.9) / Math.max(0.5, simulationSpeed),
  );
  const packetCount = useMemo(
    () => (isActive ? Math.max(1, Math.min(8, Math.round(intensity * 6))) : 0),
    [isActive, intensity],
  );

  const strokeColor =
    flowKind === 'error'
      ? 'var(--destructive)'
      : flowKind === 'cache'
        ? 'rgba(251, 191, 36, 0.9)'
        : selected
          ? 'var(--primary)'
          : 'rgba(96, 165, 250, 0.75)';

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        interactionWidth={interactionWidth}
        style={{ stroke: 'transparent', strokeWidth: 0 }}
      />

      <path
        d={edgePath}
        fill="none"
        pointerEvents="none"
        className="react-flow__edge-path"
        stroke="rgba(255,255,255,0.18)"
        strokeWidth={strokeWidth}
        strokeDasharray={isDashed ? '6 6' : undefined}
      />

      {isActive ? (
        <>
          <path
            d={edgePath}
            fill="none"
            pointerEvents="none"
            className={cn(
              'react-flow__edge-path sim-edge-track',
              flowKind === 'error' && 'sim-edge-error',
              flowKind === 'cache' && 'sim-edge-cache',
              flowKind !== 'error' && flowKind !== 'cache' && 'sim-edge-flow',
            )}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray="6 14"
            strokeLinecap="round"
            style={{ animationDuration: `${durationSec}s` }}
          />

          {Array.from({ length: packetCount }, (_, index) => (
            <circle
              key={`${id}-packet-${index}`}
              r={3.5}
              fill={packetColor(flowKind)}
              opacity={0.95}
              pointerEvents="none"
              className="sim-edge-packet"
            >
              <animateMotion
                dur={`${durationSec}s`}
                repeatCount="indefinite"
                path={edgePath}
                begin={`${(index / Math.max(packetCount, 1)) * durationSec}s`}
                calcMode="linear"
              />
            </circle>
          ))}
        </>
      ) : selected ? (
        <path
          d={edgePath}
          fill="none"
          pointerEvents="none"
          stroke="var(--primary)"
          strokeWidth={2.5}
          strokeOpacity={0.85}
        />
      ) : null}

      {label ? (
        <EdgeLabelRenderer>
          <div
            className={cn(
              'pointer-events-none absolute rounded-full border px-2 py-0.5 font-mono text-[10px] font-semibold tracking-wide',
              flowKind === 'error'
                ? 'border-red-400/60 bg-red-500/20 text-red-100'
                : 'border-white/30 bg-slate-900/80 text-white',
            )}
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            }}
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      ) : null}
    </>
  );
}

export const FlowEdge = memo(FlowEdgeComponent);
