'use client';

import { useEffect, useRef } from 'react';

import { computeSimulation, createQueueState, idleSnapshot } from '@/lib/simulation/engine';
import type { SimulationQueueState } from '@/lib/simulation/types';
import { useCanvasStore } from '@/store/canvas-store';

const BASE_INTERVAL_MS = 800;

export function useSimulationLoop() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tickRef = useRef(0);
  const queueStateRef = useRef<SimulationQueueState>(createQueueState());
  const isSimulationRunning = useCanvasStore((s) => s.isSimulationRunning);
  const simulationSpeed = useCanvasStore((s) => s.simulationSpeed);
  const trafficLevel = useCanvasStore((s) => s.trafficLevel);
  const readWriteRatio = useCanvasStore((s) => s.readWriteRatio);
  const cacheHitRate = useCanvasStore((s) => s.cacheHitRate);
  const edgeCacheHitRate = useCanvasStore((s) => s.edgeCacheHitRate);
  const activeChaosEvents = useCanvasStore((s) => s.activeChaosEvents);
  const nodes = useCanvasStore((s) => s.nodes);
  const edges = useCanvasStore((s) => s.edges);

  useEffect(() => {
    const clearTimer = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    const tick = () => {
      const state = useCanvasStore.getState();

      if (!state.isSimulationRunning) {
        queueStateRef.current = createQueueState();
        state.setSimulationSnapshot(idleSnapshot(state.nodes, state.edges));
        clearTimer();
        return;
      }

      tickRef.current += 1;
      const snapshot = computeSimulation(
        {
          nodes: state.nodes,
          edges: state.edges,
          trafficLevel: state.trafficLevel,
          readWriteRatio: state.readWriteRatio,
          cacheHitRate: state.cacheHitRate,
          edgeCacheHitRate: state.edgeCacheHitRate,
          activeChaos: state.activeChaosEvents,
          prevState: queueStateRef.current,
        },
        tickRef.current,
      );
      queueStateRef.current = snapshot.queueState;
      state.setSimulationSnapshot(snapshot);

      const speedFactor = Math.max(0.25, state.simulationSpeed || 1);
      timerRef.current = setTimeout(tick, BASE_INTERVAL_MS / speedFactor);
    };

    if (!isSimulationRunning) {
      tickRef.current = 0;
      queueStateRef.current = createQueueState();
    }

    clearTimer();
    tick();

    return clearTimer;
  }, [
    isSimulationRunning,
    simulationSpeed,
    trafficLevel,
    readWriteRatio,
    cacheHitRate,
    edgeCacheHitRate,
    activeChaosEvents,
    nodes,
    edges,
  ]);
}
