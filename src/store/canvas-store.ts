import { create } from 'zustand';

export type NodeData = {
  label: string;
  componentType: string;
  replicas: number;
  implementationNotes?: string | null;
  isDisabled?: boolean;
  isDegraded?: boolean;
  description?: string;
};

export type EdgeData = {
  label: string;
  style: 'solid' | 'dashed';
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
  isInteractive: boolean;
  showMinimap: boolean;
  paletteMinimized: boolean;
  setNodes: (nodes: RFNode[]) => void;
  setEdges: (edges: RFEdge[]) => void;
  updateNode: (nodeId: string, updates: Partial<NodeData>) => void;
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
  setInteractive: (interactive: boolean) => void;
  setShowMinimap: (show: boolean) => void;
  setPaletteMinimized: (minimized: boolean) => void;
  initSession: (data: {
    sessionId: number;
    sessionUuid: string;
    problemId: number;
    problemTitle: string;
    status: string;
    speedSetting: number;
    trafficSetting: number;
    readWriteRatio: number;
    nodes: RFNode[];
    edges: RFEdge[];
  }) => void;
  resetCanvas: () => void;
}

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
  isInteractive: true,
  showMinimap: true,
  paletteMinimized: false,

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  updateNode: (nodeId, updates) =>
    set({
      nodes: get().nodes.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, ...updates } } : node,
      ),
    }),
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
  setSimulationState: (running) => set({ isSimulationRunning: running }),
  setSimulationSpeed: (speed) => set({ simulationSpeed: speed }),
  setTrafficLevel: (level) => set({ trafficLevel: level }),
  setReadWriteRatio: (ratio) => set({ readWriteRatio: ratio }),
  setInteractive: (interactive) => set({ isInteractive: interactive }),
  setShowMinimap: (show) => set({ showMinimap: show }),
  setPaletteMinimized: (minimized) => set({ paletteMinimized: minimized }),
  initSession: (data) =>
    set({
      sessionId: data.sessionId,
      sessionUuid: data.sessionUuid,
      problemId: data.problemId,
      problemTitle: data.problemTitle,
      sessionStatus: data.status,
      simulationSpeed: data.speedSetting,
      trafficLevel: data.trafficSetting,
      readWriteRatio: data.readWriteRatio,
      nodes: data.nodes,
      edges: data.edges,
      isSimulationRunning: data.status === 'in_progress',
    }),
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
      isInteractive: true,
      showMinimap: true,
      paletteMinimized: false,
    }),
}));
