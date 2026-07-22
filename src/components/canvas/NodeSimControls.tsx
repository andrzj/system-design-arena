'use client';

import { Slider } from '@/components/ui/slider';
import { DEFAULT_CACHE_HIT_RATE, DEFAULT_EDGE_CACHE_HIT_RATE } from '@/lib/simulation/constants';
import type { NodeData } from '@/store/canvas-store';
import type { NodeSimConfig } from '@/lib/simulation/types';

type NodeSimControlsProps = {
  componentType: string;
  simConfig?: NodeSimConfig;
  onChange: (updates: Partial<NodeData>) => void;
};

const PARTITIONS: NodeSimConfig['partitionStrategy'][] = ['hash', 'range', 'round_robin', 'geo'];

function isCacheType(type: string) {
  return type === 'cache' || type === 'cdn';
}

function isDatabaseType(type: string) {
  return ['sql_db', 'nosql_db', 'vector_db', 'memory_fabric'].includes(type);
}

export function NodeSimControls({
  componentType,
  simConfig,
  onChange,
}: NodeSimControlsProps) {
  if (!isCacheType(componentType) && !isDatabaseType(componentType)) return null;

  const patch = (next: Partial<NodeSimConfig>) =>
    onChange({ simConfig: { ...simConfig, ...next } });

  const hitRate =
    simConfig?.cacheHitRate ??
    (componentType === 'cdn' ? DEFAULT_EDGE_CACHE_HIT_RATE : DEFAULT_CACHE_HIT_RATE);

  return (
    <div className="mt-2 space-y-1.5 border-t border-white/10 pt-2">
      <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
        Sim tuning
      </p>
      {isCacheType(componentType) ? (
        <div className="space-y-1 text-[10px]">
          <div className="flex items-center justify-between">
            <span>Hit rate</span>
            <span className="tabular-nums text-foreground">{Math.round(hitRate * 100)}%</span>
          </div>
          <Slider
            aria-label="Cache hit rate"
            className="nodrag"
            min={0}
            max={1}
            step={0.01}
            value={[hitRate]}
            onValueChange={([value]) => patch({ cacheHitRate: value })}
          />
        </div>
      ) : null}
      {isDatabaseType(componentType) ? (
        <>
          <div className="space-y-1 text-[10px]">
            <div className="flex items-center justify-between">
              <span>Shards</span>
              <span className="tabular-nums text-foreground">{simConfig?.shardCount ?? 1}</span>
            </div>
            <Slider
              aria-label="Shard count"
              className="nodrag"
              min={1}
              max={64}
              step={1}
              value={[simConfig?.shardCount ?? 1]}
              onValueChange={([value]) => patch({ shardCount: value })}
            />
          </div>
          <div className="space-y-1 text-[10px]">
            <div className="flex items-center justify-between">
              <span>Key skew</span>
              <span className="tabular-nums text-foreground">{simConfig?.keySkewPct ?? 10}%</span>
            </div>
            <Slider
              aria-label="Key skew percentage"
              className="nodrag"
              min={0}
              max={100}
              step={1}
              value={[simConfig?.keySkewPct ?? 10]}
              onValueChange={([value]) => patch({ keySkewPct: value })}
            />
          </div>
          <label className="flex items-center justify-between gap-2 text-[10px]">
            <span>Partition</span>
            <select
              className="nodrag rounded border border-white/10 bg-slate-900 px-1 py-0.5 text-[10px]"
              value={simConfig?.partitionStrategy ?? 'hash'}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) =>
                patch({ partitionStrategy: e.target.value as NodeSimConfig['partitionStrategy'] })
              }
            >
              {PARTITIONS.map((strategy) => (
                <option key={strategy} value={strategy}>
                  {strategy}
                </option>
              ))}
            </select>
          </label>
        </>
      ) : null}
    </div>
  );
}
