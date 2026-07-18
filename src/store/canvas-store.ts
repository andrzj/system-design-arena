import { create } from 'zustand';

// Define the types for the nodes and edges in the store
export type NodeData = {
  label: string;
  componentType: string;
  replicas: number;
  implementation_notes?: string | null;
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
};

export type RFEdge = {
  id: string;
  source: string;
  target: string;
  type: string;
  data: EdgeData;
};

interface CanvasState {
  nodes: RFNode[];
  edges: RFEdge[];
  sessionId: number | null;
  problemId: number | null;
  isSimulationRunning: boolean;
  simulationSpeed: number;
  trafficLevel: number;
  readWriteRatio: number;
  setNodes: (nodes: RFNode[]) => void;
  setEdges: (edges: RFEdge[]) => void;
  setSessionId: (id: number | null) => void;
  setProblemId: (id: number | null) => void;
  setSimulationState: (running: boolean) => void;
  setSimulationSpeed: (speed: number) => void;
  setTrafficLevel: (level: number) => void;
  setReadWriteRatio: (ratio: number) => void;
  resetCanvas: () => void;
}

export const useCanvasStore = create<CanvasState>((set) => ({
  nodes: [],
  edges: [],
  sessionId: null,
  problemId: null,
  isSimulationRunning: false,
  simulationSpeed: 1.0,
  trafficLevel: 1.0,
  readWriteRatio: 0.9, // 90% reads, 10% writes by default
  
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  setSessionId: (id) => set({ sessionId: id }),
  setProblemId: (id) => set({ problemId: id }),
  setSimulationState: (running) => set({ isSimulationRunning: running }),
  setSimulationSpeed: (speed) => set({ simulationSpeed: speed }),
  setTrafficLevel: (level) => set({ trafficLevel: level }),
  setReadWriteRatio: (ratio) => set({ readWriteRatio: ratio }),
  
  resetCanvas: () => set({
    nodes: [],
    edges: [],
    sessionId: null,
    problemId: null,
    isSimulationRunning: false,
    simulationSpeed: 1.0,
    trafficLevel: 1.0,
    readWriteRatio: 0.9
  }),
}));