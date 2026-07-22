export type FlowKind = 'request' | 'read' | 'write' | 'cache' | 'error' | 'idle';

export type NodeMetrics = {
  loadPct: number;
  cpuUsage: number;
  latencyMs: number;
  errorRate: number;
  dropRate: number;
  isBottleneck: boolean;
  incomingRps: number;
  queueDepth: number;
  hasChaos?: boolean;
};

export type EdgeMetrics = {
  flowRate: number;
  incomingRps: number;
  flowKind: FlowKind;
  label: string;
};

export type SimulationAggregateMetrics = {
  totalRps: number;
  avgLatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  errorRate: number;
  availability: number;
  errorBudgetBurnRate: number;
  activeNodes: number;
  failingNodes: number;
  bottleneckId: string | null;
  bottleneckName: string | null;
  bottleneckCpu: number;
  hottestNodeId: string | null;
  hottestNodeName: string | null;
  hottestNodeCpu: number;
};

export type SimulationSnapshot = {
  nodeMetrics: Record<string, NodeMetrics>;
  edgeMetrics: Record<string, EdgeMetrics>;
  aggregateMetrics: SimulationAggregateMetrics;
  totalRps: number;
  tick: number;
  queueState: SimulationQueueState;
};

export type SimulationQueueState = {
  queueBacklog: Map<string, number>;
};

export type NodeSimConfig = {
  cacheHitRate?: number;
  shardCount?: number;
  keySkewPct?: number;
  partitionStrategy?: 'hash' | 'range' | 'round_robin' | 'geo';
};
