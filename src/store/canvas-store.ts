import { create } from 'zustand';

import type { WorkbenchMode } from '@/lib/session/workbench-mode';
import type { ActiveChaosEvent } from '@/lib/simulation/chaos-modifiers';
import { computeSimulation, createQueueState, idleSnapshot } from '@/lib/simulation/engine';
import { getProblemSimPreset } from '@/lib/simulation/problem-presets';
import type { NodeSimConfig, SimulationQueueState, SimulationSnapshot } from '@/lib/simulation/types';

export type NodeData = {
  label: string;
  componentType: string;
  replicas: number;
  implementationNotes?: string | null;
  isDisabled?: boolean;
  isDegraded?: boolean;
  description?: string;
  simConfig?: NodeSimConfig;
};

export type EdgeData = {
  label: string;
  style: 'solid' | 'dashed';
  intent?: string;
};

export type RFNode = {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: NodeData;
  selected?: boolean;
};

export type RFEdge = {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  type: string;
  data: EdgeData;
  style?: React.CSSProperties;
  selected?: boolean;
};

interface CanvasState {
  nodes: RFNode[];
  edges: RFEdge[];
  sessionId: number | null;
  sessionUuid: string | null;
  problemId: number | null;
  problemTitle: string;
  sessionStatus: string;
  isSimulationRunning: boolean;
  simulationSpeed: number;
  trafficLevel: number;
  readWriteRatio: number;
  cacheHitRate: number;
  edgeCacheHitRate: number;
  activeChaosEvents: ActiveChaosEvent[];
  simulationQueueState: SimulationQueueState;
  selectedEdgeId: string | null;
  isInteractive: boolean;
  showMinimap: boolean;
  paletteMinimized: boolean;
  simulationSnapshot: SimulationSnapshot;
  notesPanelNodeId: string | null;
  workbenchMode: WorkbenchMode;
  setNodes: (nodes: RFNode[]) => void;
  setEdges: (edges: RFEdge[]) => void;
  updateNode: (nodeId: string, updates: Partial<NodeData>) => void;
  updateEdge: (edgeId: string, updates: Partial<EdgeData>) => void;
  removeNode: (nodeId: string) => void;
  setSessionId: (id: number | null) => void;
  setSessionUuid: (uuid: string | null) => void;
  setProblemId: (id: number | null) => void;
  setProblemTitle: (title: string) => void;
  setSessionStatus: (status: string) => void;
  setSimulationState: (running: boolean) => void;
  setSimulationSpeed: (speed: number) => void;
  setTrafficLevel: (level: number) => void;
  setReadWriteRatio: (ratio: number) => void;
  setCacheHitRate: (rate: number) => void;
  setEdgeCacheHitRate: (rate: number) => void;
  addActiveChaos: (event: ActiveChaosEvent) => void;
  clearActiveChaos: () => void;
  setSelectedEdgeId: (edgeId: string | null) => void;
  setInteractive: (interactive: boolean) => void;
  setShowMinimap: (show: boolean) => void;
  setPaletteMinimized: (minimized: boolean) => void;
  setSimulationSnapshot: (snapshot: SimulationSnapshot) => void;
  setNotesPanelNodeId: (nodeId: string | null) => void;
  setWorkbenchMode: (mode: WorkbenchMode) => void;
  recomputeSimulation: () => void;
  initSession: (data: {
    sessionId: number;
    sessionUuid: string;
    problemId: number;
    problemTitle: string;
    status: string;
    speedSetting: number;
    trafficSetting: number;
    readWriteRatio: number;
    cacheHitRate?: number;
    edgeCacheHitRate?: number;
    nodes: RFNode[];
    edges: RFEdge[];
  }) => void;
  resetCanvas: () => void;
}

const EMPTY_AGGREGATE = {
  totalRps: 0,
  avgLatencyMs: 0,
  p95LatencyMs: 0,
  p99LatencyMs: 0,
  errorRate: 0,
  availability: 0,
  errorBudgetBurnRate: 0,
  activeNodes: 0,
  failingNodes: 0,
  bottleneckId: null,
  bottleneckName: null,
  bottleneckCpu: 0,
  hottestNodeId: null,
  hottestNodeName: null,
  hottestNodeCpu: 0,
} as const;

export const useCanvasStore = create<CanvasState>((set, get) => ({
  nodes: [],
  edges: [],
  sessionId: null,
  sessionUuid: null,
  problemId: null,
  problemTitle: '',
  sessionStatus: 'in_progress',
  isSimulationRunning: false,
  simulationSpeed: 1.0,
  trafficLevel: 1.0,
  readWriteRatio: 0.92,
  cacheHitRate: 0.8,
  edgeCacheHitRate: 0.9,
  activeChaosEvents: [],
  simulationQueueState: createQueueState(),
  selectedEdgeId: null,
  isInteractive: true,
  showMinimap: true,
  paletteMinimized: false,
  simulationSnapshot: {
    nodeMetrics: {},
    edgeMetrics: {},
    aggregateMetrics: { ...EMPTY_AGGREGATE },
    totalRps: 0,
    tick: 0,
    queueState: createQueueState(),
  },
  notesPanelNodeId: null,
  workbenchMode: 'design',

  recomputeSimulation: () => {
    const state = get();
    if (!state.isSimulationRunning) {
      set({ simulationSnapshot: idleSnapshot(state.nodes, state.edges) });
      return;
    }
    const snapshot = computeSimulation(
      {
        nodes: state.nodes,
        edges: state.edges,
        trafficLevel: state.trafficLevel,
        readWriteRatio: state.readWriteRatio,
        cacheHitRate: state.cacheHitRate,
        edgeCacheHitRate: state.edgeCacheHitRate,
        activeChaos: state.activeChaosEvents,
        prevState: state.simulationQueueState,
      },
      state.simulationSnapshot.tick + 1,
    );
    set({
      simulationSnapshot: snapshot,
      simulationQueueState: snapshot.queueState,
    });
  },

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  updateNode: (nodeId, updates) =>
    set({
      nodes: get().nodes.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, ...updates } } : node,
      ),
    }),
  updateEdge: (edgeId, updates) => {
    set({
      edges: get().edges.map((edge) =>
        edge.id === edgeId ? { ...edge, data: { ...edge.data, ...updates } } : edge,
      ),
    });
    get().recomputeSimulation();
  },
  removeNode: (nodeId) =>
    set({
      nodes: get().nodes.filter((n) => n.id !== nodeId),
      edges: get().edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
    }),
  setSessionId: (id) => set({ sessionId: id }),
  setSessionUuid: (uuid) => set({ sessionUuid: uuid }),
  setProblemId: (id) => set({ problemId: id }),
  setProblemTitle: (title) => set({ problemTitle: title }),
  setSessionStatus: (status) => set({ sessionStatus: status }),
  setSimulationState: (running) => {
    set({
      isSimulationRunning: running,
      simulationQueueState: createQueueState(),
      ...(running ? {} : { activeChaosEvents: [] }),
    });
    get().recomputeSimulation();
  },
  setSimulationSpeed: (speed) => set({ simulationSpeed: speed }),
  setTrafficLevel: (level) => {
    set({ trafficLevel: level });
    get().recomputeSimulation();
  },
  setReadWriteRatio: (ratio) => {
    set({ readWriteRatio: ratio });
    get().recomputeSimulation();
  },
  setCacheHitRate: (rate) => {
    set({ cacheHitRate: rate });
    get().recomputeSimulation();
  },
  setEdgeCacheHitRate: (rate) => {
    set({ edgeCacheHitRate: rate });
    get().recomputeSimulation();
  },
  addActiveChaos: (event) => {
    const existing = get().activeChaosEvents;
    const isDuplicate = existing.some(
      (e) => e.chaosId === event.chaosId && e.nodeId === event.nodeId,
    );
    if (!isDuplicate) {
      set({ activeChaosEvents: [...existing, event] });
    }
    get().recomputeSimulation();
  },
  clearActiveChaos: () => {
    set({ activeChaosEvents: [] });
    get().recomputeSimulation();
  },
  setSelectedEdgeId: (edgeId) => set({ selectedEdgeId: edgeId }),
  setInteractive: (interactive) => set({ isInteractive: interactive }),
  setShowMinimap: (show) => set({ showMinimap: show }),
  setPaletteMinimized: (minimized) => set({ paletteMinimized: minimized }),
  setSimulationSnapshot: (snapshot) => set({ simulationSnapshot: snapshot }),
  setNotesPanelNodeId: (nodeId) => set({ notesPanelNodeId: nodeId }),
  setWorkbenchMode: (mode) => set({ workbenchMode: mode }),
  initSession: (data) => {
    const preset = getProblemSimPreset(data.problemTitle);
    set({
      sessionId: data.sessionId,
      sessionUuid: data.sessionUuid,
      problemId: data.problemId,
      problemTitle: data.problemTitle,
      sessionStatus: data.status,
      simulationSpeed: data.speedSetting,
      trafficLevel: data.trafficSetting,
      readWriteRatio: preset?.readRatio ?? data.readWriteRatio,
      cacheHitRate: data.cacheHitRate ?? preset?.cacheHitRate ?? 0.8,
      edgeCacheHitRate: data.edgeCacheHitRate ?? 0.9,
      activeChaosEvents: [],
      nodes: data.nodes,
      edges: data.edges,
      isSimulationRunning: false,
      selectedEdgeId: null,
      simulationQueueState: createQueueState(),
      simulationSnapshot: idleSnapshot(data.nodes, data.edges),
      notesPanelNodeId: null,
      workbenchMode: 'design',
    });
  },
  resetCanvas: () =>
    set({
      nodes: [],
      edges: [],
      sessionId: null,
      sessionUuid: null,
      problemId: null,
      problemTitle: '',
      sessionStatus: 'in_progress',
      isSimulationRunning: false,
      simulationSpeed: 1.0,
      trafficLevel: 1.0,
      readWriteRatio: 0.92,
      cacheHitRate: 0.8,
      edgeCacheHitRate: 0.9,
      activeChaosEvents: [],
      simulationQueueState: createQueueState(),
      selectedEdgeId: null,
      isInteractive: true,
      showMinimap: true,
      paletteMinimized: false,
      simulationSnapshot: {
        nodeMetrics: {},
        edgeMetrics: {},
        aggregateMetrics: { ...EMPTY_AGGREGATE },
        totalRps: 0,
        tick: 0,
        queueState: createQueueState(),
      },
      notesPanelNodeId: null,
      workbenchMode: 'design',
    }),
}));
