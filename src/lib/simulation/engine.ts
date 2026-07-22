import type { RFEdge, RFNode } from '@/store/canvas-store';

import {
  ARCHETYPE_STATS,
  isCdnComponent,
  isClientArchetype,
  isQueueArchetype,
  resolveArchetype,
  type Archetype,
} from './archetypes';
import {
  BASE_RPS,
  DEFAULT_CACHE_HIT_RATE,
  DEFAULT_CONTROL_SAMPLE_RATE,
  DEFAULT_EDGE_CACHE_HIT_RATE,
  DEFAULT_KEY_SKEW_PCT,
  DEFAULT_TELEMETRY_SAMPLE_RATE,
  PARTITION_STRATEGY_FACTORS,
  type PartitionStrategy,
} from './constants';
import {
  buildChaosContext,
  resolveNodeChaosModifier,
  type ActiveChaosEvent,
} from './chaos-modifiers';
import {
  classifyEdgeIntent,
  intentToFlowKind,
  labelForIntent,
  type EdgeIntent,
} from './edge-intents';
import type {
  EdgeMetrics,
  FlowKind,
  NodeMetrics,
  SimulationAggregateMetrics,
  SimulationQueueState,
  SimulationSnapshot,
} from './types';

export { BASE_RPS };
export type { ActiveChaosEvent };

export type SimulationInput = {
  nodes: RFNode[];
  edges: RFEdge[];
  trafficLevel: number;
  readWriteRatio: number;
  cacheHitRate?: number;
  edgeCacheHitRate?: number;
  telemetrySampleRate?: number;
  controlSampleRate?: number;
  dtSeconds?: number;
  prevState?: SimulationQueueState;
  activeChaos?: ActiveChaosEvent[];
};

type ChaosModifier = {
  capacityMultiplier: number;
  slownessMultiplier: number;
  errorBoost: number;
  connectionDropBoost: number;
  crash: boolean;
  cacheHitPenalty: number;
  trafficMultiplier: number;
};

type SimNode = {
  id: string;
  label: string;
  componentType: string;
  archetype: Archetype;
  replicas: number;
  isDisabled: boolean;
  isDegraded: boolean;
  cacheHitRate?: number;
  shardCount?: number;
  keySkewPct?: number;
  partitionStrategy?: PartitionStrategy;
};

type EnrichedEdge = RFEdge & {
  intent: EdgeIntent;
  targetArchetype: Archetype;
};

type NodeHealth = {
  id: string;
  incomingRps: number;
  cpuUsage: number;
  latencyMs: number;
  errorRate: number;
  dropRate: number;
  queueDepth: number;
  isCrashed: boolean;
  isBottleneck: boolean;
};

const DEFAULT_MODIFIER: ChaosModifier = {
  capacityMultiplier: 1,
  slownessMultiplier: 1,
  errorBoost: 0,
  connectionDropBoost: 0,
  crash: false,
  cacheHitPenalty: 0,
  trafficMultiplier: 1,
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function latencyMultiplier(cpuUsage: number): number {
  if (cpuUsage <= 1) return 1 + 0.6 * cpuUsage;
  return 1.6 + Math.pow(cpuUsage - 1, 1.5) * 9;
}

function isBottleneck(health: NodeHealth): boolean {
  return (
    health.isCrashed ||
    health.cpuUsage >= 1 ||
    health.dropRate >= 0.05 ||
    health.errorRate >= 0.05 ||
    health.queueDepth >= 100
  );
}

function shardCount(node: SimNode): number {
  return Math.max(1, Math.round(node.shardCount ?? 1));
}

function partitionSpread(node: SimNode): number {
  const shards = shardCount(node);
  if (shards <= 1) return 1;
  const skew = clamp((node.keySkewPct ?? DEFAULT_KEY_SKEW_PCT) / 100, 0, 1);
  const strategyFactor = PARTITION_STRATEGY_FACTORS[node.partitionStrategy ?? 'hash'];
  const effectiveShards = 1 + (shards - 1) * strategyFactor;
  return clamp(skew + (1 - skew) / effectiveShards, 0, 1);
}

function baseNodeModifier(node: SimNode): ChaosModifier {
  if (node.isDisabled) {
    return { ...DEFAULT_MODIFIER, crash: true, capacityMultiplier: 0 };
  }
  if (node.isDegraded) {
    return {
      capacityMultiplier: 0.6,
      slownessMultiplier: 2,
      errorBoost: 0.15,
      connectionDropBoost: 0.1,
      crash: false,
      cacheHitPenalty: 0.1,
      trafficMultiplier: 1,
    };
  }
  return DEFAULT_MODIFIER;
}

function toSimNode(node: RFNode): SimNode {
  const simConfig = node.data.simConfig;
  return {
    id: node.id,
    label: node.data.label,
    componentType: node.data.componentType,
    archetype: resolveArchetype(node.data.componentType, node.data.label),
    replicas: Math.max(1, node.data.replicas ?? 1),
    isDisabled: node.data.isDisabled ?? false,
    isDegraded: node.data.isDegraded ?? false,
    cacheHitRate: simConfig?.cacheHitRate,
    shardCount: simConfig?.shardCount,
    keySkewPct: simConfig?.keySkewPct,
    partitionStrategy: simConfig?.partitionStrategy,
  };
}

function emptyAggregateMetrics(): SimulationAggregateMetrics {
  return {
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
  };
}

function isSourceNode(node: SimNode, inDegree: number, hasClient: boolean): boolean {
  return isClientArchetype(node.archetype) || (!hasClient && inDegree === 0);
}

function topologicalOrder(nodes: SimNode[], outEdges: Map<string, EnrichedEdge[]>): string[] {
  const inDegree = new Map<string, number>();
  const order: string[] = [];
  const visited = new Set<string>();
  const queue: string[] = [];

  for (const node of nodes) {
    inDegree.set(node.id, 0);
  }
  for (const edges of outEdges.values()) {
    for (const edge of edges) {
      inDegree.set(edge.target, (inDegree.get(edge.target) ?? 0) + 1);
    }
  }

  for (const node of nodes) {
    if ((inDegree.get(node.id) ?? 0) === 0) queue.push(node.id);
  }

  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    if (visited.has(nodeId)) continue;
    visited.add(nodeId);
    order.push(nodeId);
    for (const edge of outEdges.get(nodeId) ?? []) {
      const next = (inDegree.get(edge.target) ?? 0) - 1;
      inDegree.set(edge.target, next);
      if (next <= 0 && !visited.has(edge.target)) queue.push(edge.target);
    }
  }

  for (const node of nodes) {
    if (!visited.has(node.id)) order.push(node.id);
  }

  return order;
}

function emptyMetrics(nodes: RFNode[], edges: RFEdge[]): SimulationSnapshot {
  const nodeMetrics: Record<string, NodeMetrics> = {};
  for (const node of nodes) {
    const archetype = resolveArchetype(node.data.componentType, node.data.label);
    nodeMetrics[node.id] = {
      loadPct: 0,
      cpuUsage: 0,
      latencyMs: ARCHETYPE_STATS[archetype].baseLatencyMs,
      errorRate: 0,
      dropRate: 0,
      isBottleneck: false,
      incomingRps: 0,
      queueDepth: 0,
    };
  }
  const edgeMetrics: Record<string, EdgeMetrics> = {};
  for (const edge of edges) {
    edgeMetrics[edge.id] = {
      flowRate: 0,
      incomingRps: 0,
      flowKind: 'idle',
      label: edge.data?.label?.trim().toUpperCase() ?? '',
    };
  }
  return {
    nodeMetrics,
    edgeMetrics,
    aggregateMetrics: emptyAggregateMetrics(),
    totalRps: 0,
    tick: 0,
    queueState: { queueBacklog: new Map() },
  };
}

export function computeSimulation(input: SimulationInput, tick = 0): SimulationSnapshot {
  const {
    nodes,
    edges,
    trafficLevel,
    readWriteRatio,
    cacheHitRate = DEFAULT_CACHE_HIT_RATE,
    edgeCacheHitRate = DEFAULT_EDGE_CACHE_HIT_RATE,
    telemetrySampleRate = DEFAULT_TELEMETRY_SAMPLE_RATE,
    controlSampleRate = DEFAULT_CONTROL_SAMPLE_RATE,
    dtSeconds = 1,
    prevState,
    activeChaos = [],
  } = input;

  if (trafficLevel <= 0 || nodes.length === 0) {
    return emptyMetrics(nodes, edges);
  }

  const chaosContext = buildChaosContext(activeChaos);
  const getModifierForNode = (node: SimNode): ChaosModifier =>
    resolveNodeChaosModifier(
      node.id,
      node.archetype,
      chaosContext.nodeModifiers,
      chaosContext.globalModifier,
      chaosContext.hasGlobalChaos,
      baseNodeModifier(node),
    );

  const readRatio = clamp(readWriteRatio, 0, 1);
  const simNodes = nodes.map(toSimNode);
  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  const simById = new Map(simNodes.map((node) => [node.id, node]));
  const outEdges = new Map<string, EnrichedEdge[]>();
  const inDegree = new Map<string, number>();
  const intentByEdgeId = new Map<string, EdgeIntent>();

  const outgoingBySource = new Map<string, RFEdge[]>();
  for (const edge of edges) {
    if (!outgoingBySource.has(edge.source)) outgoingBySource.set(edge.source, []);
    outgoingBySource.get(edge.source)!.push(edge);
  }

  for (const node of simNodes) {
    outEdges.set(node.id, []);
    inDegree.set(node.id, 0);
  }

  for (const edge of edges) {
    const source = nodeById.get(edge.source);
    const target = nodeById.get(edge.target);
    if (!source || !target) continue;

    const outgoing = outgoingBySource.get(edge.source) ?? [];
    const intent = classifyEdgeIntent(edge, source, target, outgoing, nodeById);
    intentByEdgeId.set(edge.id, intent);
    const enriched: EnrichedEdge = {
      ...edge,
      intent,
      targetArchetype: resolveArchetype(target.data.componentType, target.data.label),
    };
    outEdges.get(edge.source)?.push(enriched);
    inDegree.set(edge.target, (inDegree.get(edge.target) ?? 0) + 1);
  }

  const hasClient = simNodes.some((node) => isClientArchetype(node.archetype));
  const order = topologicalOrder(simNodes, outEdges);
  const totalRps = BASE_RPS * Math.max(0, trafficLevel) * chaosContext.trafficMultiplier;

  const syncLoad = new Map<string, number>();
  const asyncLoad = new Map<string, number>();
  const telemetryLoad = new Map<string, number>();
  const controlLoad = new Map<string, number>();
  const writeRatioLoad = new Map<string, number>();
  const latencyWeightedLoad = new Map<string, number>();
  const cacheMissByTarget = new Map<string, number>();
  const edgeRps = new Map<string, number>();
  const healthById = new Map<string, NodeHealth>();
  const queueBacklog = new Map(prevState?.queueBacklog ?? []);
  const latencySamples: Array<{ latencyMs: number; rps: number }> = [];

  for (const node of simNodes) {
    syncLoad.set(node.id, 0);
    asyncLoad.set(node.id, 0);
    telemetryLoad.set(node.id, 0);
    controlLoad.set(node.id, 0);
    writeRatioLoad.set(node.id, 0);
    latencyWeightedLoad.set(node.id, 0);
  }

  const healthCheckNodes = new Set<string>();
  for (const edge of edges) {
    const source = nodeById.get(edge.source);
    const target = nodeById.get(edge.target);
    if (!source || !target) continue;
    if (source.data.componentType === 'health_check') healthCheckNodes.add(target.id);
    if (target.data.componentType === 'health_check') healthCheckNodes.add(source.id);
  }

  const isConnectionDropped = (sourceId: string, targetId: string, modifier: ChaosModifier) =>
    modifier.crash ||
    ((clamp(modifier.connectionDropBoost, 0, 0.85) >= 0.3 ||
      clamp(modifier.errorBoost, 0, 0.6) >= 0.3) &&
      (healthCheckNodes.has(sourceId) || healthCheckNodes.has(targetId)));

  for (const nodeId of order) {
    const node = simById.get(nodeId);
    if (!node) continue;

    const modifier = getModifierForNode(node);
    const stats = ARCHETYPE_STATS[node.archetype];
    let sync = syncLoad.get(nodeId) ?? 0;
    const async = asyncLoad.get(nodeId) ?? 0;
    const telemetry = telemetryLoad.get(nodeId) ?? 0;
    const control = controlLoad.get(nodeId) ?? 0;
    let writeRatio = writeRatioLoad.get(nodeId) ?? 0;

    if (isSourceNode(node, inDegree.get(nodeId) ?? 0, hasClient)) {
      sync += totalRps;
      writeRatio += totalRps * (1 - readRatio);
    }

    const incomingRps = sync + async + telemetry + control;
    const replicas = Math.max(1, node.replicas);
    const capacityMultiplier = clamp(modifier.capacityMultiplier, 0.35, 1);
    const slownessMultiplier = clamp(modifier.slownessMultiplier, 1, 3.2);
    const errorBoost = clamp(modifier.errorBoost, 0, 0.6);
    const connectionDropBoost = clamp(modifier.connectionDropBoost, 0, 0.85);
    const isCrashed = modifier.crash;
    const shardFactor = node.archetype === 'database' ? shardCount(node) : 1;
    const spreadFactor = node.archetype === 'database' ? partitionSpread(node) : 1;
    const effectiveCapacity = isCrashed
      ? 0
      : stats.capacityRps * replicas * shardFactor * capacityMultiplier;

    let cpuUsage: number;
    if (isCrashed) {
      cpuUsage = 1.15;
    } else if (node.archetype === 'database' && (replicas > 1 || shardFactor > 1)) {
      const writePart = clamp(writeRatio, 0, sync);
      const readPart = Math.max(0, incomingRps - writePart);
      const perShardCapacity = stats.capacityRps * capacityMultiplier;
      const readCpu = perShardCapacity > 0 ? (readPart * spreadFactor) / perShardCapacity : 0;
      const writeCpu =
        perShardCapacity > 0 ? (writePart * spreadFactor) / (perShardCapacity * replicas) : 0;
      cpuUsage = readCpu + writeCpu;
    } else {
      cpuUsage = effectiveCapacity > 0 ? incomingRps / effectiveCapacity : 0;
    }

    cpuUsage = clamp(cpuUsage, 0, 20);
    const saturationError = cpuUsage > 1 ? clamp(1 - 1 / cpuUsage, 0, 0.12) : 0;
    const errorRate = isCrashed ? 0.6 : clamp(saturationError + errorBoost, 0, 0.6);
    const saturationDrop = cpuUsage > 1 ? clamp(1 - 1 / cpuUsage, 0, 0.95) : 0;
    const dropRate = isCrashed ? 1 : clamp(Math.max(saturationDrop, connectionDropBoost), 0, 0.95);
    const latencyMs = isCrashed
      ? 1800
      : clamp(stats.baseLatencyMs * slownessMultiplier * latencyMultiplier(cpuUsage), 0, 1800);

    let queueDepth = isCrashed ? 250 : clamp((cpuUsage - 0.8) * 350, 0, 250);
    const avgLatency =
      sync > 0 ? (latencyWeightedLoad.get(nodeId) ?? 0) / sync : 0;
    const survivingRatio = (1 - dropRate) * (1 - errorRate);
    const survivingSync = sync * survivingRatio;
    const survivingAsync = async * survivingRatio;
    const survivingTelemetry = telemetry * survivingRatio;
    const survivingControl = control * survivingRatio;

    let backlog = 0;
    let dequeueRps = 0;

    if (isQueueArchetype(node.archetype)) {
      backlog = queueBacklog.get(nodeId) ?? 0;
      let downstreamCapacity = 0;
      for (const edge of outEdges.get(nodeId) ?? []) {
        const target = simById.get(edge.target);
        if (!target) continue;
        const targetModifier = getModifierForNode(target);
        if (targetModifier.crash) continue;
        const targetStats = ARCHETYPE_STATS[target.archetype];
        const targetShards = target.archetype === 'database' ? shardCount(target) : 1;
        downstreamCapacity +=
          targetStats.capacityRps *
          Math.max(1, target.replicas) *
          targetShards *
          clamp(targetModifier.capacityMultiplier, 0.35, 1);
      }
      const offered = survivingAsync + backlog;
      dequeueRps = Math.min(offered, downstreamCapacity);
      const nextBacklog = Math.max(0, backlog + (survivingAsync - dequeueRps) * dtSeconds);
      queueBacklog.set(nodeId, nextBacklog);
      backlog = nextBacklog;
      queueDepth = clamp(Math.max(queueDepth, backlog), 0, 250);
    }

    healthById.set(nodeId, {
      id: nodeId,
      incomingRps,
      cpuUsage,
      latencyMs,
      errorRate,
      dropRate,
      queueDepth,
      isCrashed,
      isBottleneck: false,
    });

    const outgoing = outEdges.get(nodeId) ?? [];
    if (outgoing.length === 0) {
      const cacheMissLoad = (cacheMissByTarget.get(nodeId) ?? 0) * survivingRatio;
      const leftoverSync = Math.max(0, survivingSync - cacheMissLoad);
      if (leftoverSync > 0) {
        latencySamples.push({ latencyMs: avgLatency + latencyMs, rps: leftoverSync });
      }
      continue;
    }

    const byIntent = (intent: EdgeIntent) => outgoing.filter((edge) => edge.intent === intent);
    const requestEdges = byIntent('request');
    const cacheEdges = byIntent('cache_lookup');
    const dbEdges = byIntent('origin_fallback');
    const enqueueEdges = byIntent('async_enqueue');
    const consumeEdges = byIntent('async_consume');
    const telemetryEdges = byIntent('telemetry');
    const staticCacheEdges = byIntent('static_cache');
    const controlEdges = byIntent('control');

    const filterHealthy = (edgeList: EnrichedEdge[]) => {
      const isEdgeOrGateway = node.archetype === 'edge' || node.archetype === 'gateway';
      if (!isEdgeOrGateway) return edgeList;
      const healthy = edgeList.filter(
        (edge) =>
          !isConnectionDropped(nodeId, edge.target, getModifierForNode(simById.get(edge.target)!)),
      );
      return healthy.length > 0 ? healthy : edgeList;
    };

    let distributedSync = 0;

    const distribute = (
      amount: number,
      edgeList: EnrichedEdge[],
      targetMap: Map<string, number>,
      writeFraction = 0,
    ) => {
      const candidates = filterHealthy(edgeList);
      if (amount <= 0 || candidates.length === 0) return;
      const share = amount / candidates.length;
      for (const edge of candidates) {
        targetMap.set(edge.target, (targetMap.get(edge.target) ?? 0) + share);
        edgeRps.set(edge.id, (edgeRps.get(edge.id) ?? 0) + share);
        if (targetMap === syncLoad) {
          latencyWeightedLoad.set(
            edge.target,
            (latencyWeightedLoad.get(edge.target) ?? 0) + share * (avgLatency + latencyMs),
          );
          distributedSync += share;
          if (writeFraction > 0) {
            writeRatioLoad.set(edge.target, (writeRatioLoad.get(edge.target) ?? 0) + share * writeFraction);
          }
        }
      }
    };

    const syncWriteFraction = sync > 0 ? clamp(writeRatio, 0, sync) / sync : 0;
    const sampledSync = survivingSync + survivingAsync;

    distribute(sampledSync * telemetrySampleRate + survivingTelemetry, telemetryEdges, telemetryLoad);
    distribute(sampledSync * controlSampleRate + survivingControl, controlEdges, controlLoad);

    const effectiveCacheHitRate = (targetNode: SimNode | undefined, fallback: number) => {
      const base =
        targetNode?.cacheHitRate != null
          ? clamp(targetNode.cacheHitRate, 0, 1)
          : fallback;
      const penalty = targetNode ? clamp(getModifierForNode(targetNode).cacheHitPenalty, 0, 0.95) : 0;
      return base * (1 - penalty);
    };

    // Cache-serving nodes answer read hits locally; only misses and writes
    // continue downstream, regardless of how outgoing edges are classified.
    const isCacheServing = node.archetype === 'cache' || isCdnComponent(node.componentType);
    const ownHitRate = isCacheServing
      ? effectiveCacheHitRate(node, node.archetype === 'cache' ? cacheHitRate : edgeCacheHitRate)
      : 0;
    const readsIn = survivingSync * readRatio;
    const servedHere = readsIn * ownHitRate;
    const forwardableSync = Math.max(0, survivingSync - servedHere);
    if (servedHere > 0) {
      latencySamples.push({ latencyMs: avgLatency + latencyMs, rps: servedHere });
    }

    const splitCount =
      (cacheEdges.length > 0 ? 1 : 0) +
      (dbEdges.length > 0 ? 1 : 0) +
      (enqueueEdges.length > 0 ? 1 : 0) +
      (staticCacheEdges.length > 0 ? 1 : 0);
    const requestShare =
      requestEdges.length > 0 && splitCount > 0
        ? forwardableSync * (requestEdges.length / (requestEdges.length + splitCount))
        : requestEdges.length > 0
          ? forwardableSync
          : 0;

    const requestWriteFraction =
      isCacheServing && forwardableSync > 0
        ? clamp((syncWriteFraction * survivingSync) / forwardableSync, 0, 1)
        : syncWriteFraction;
    distribute(requestShare, requestEdges, syncLoad, requestWriteFraction);

    const remainingSync = Math.max(0, forwardableSync - requestShare);
    const missReadRatio =
      forwardableSync > 0 ? clamp((readsIn - servedHere) / forwardableSync, 0, 1) : 0;
    const readPart = remainingSync * missReadRatio;
    const writePart = remainingSync - readPart;

    if (staticCacheEdges.length > 0) {
      const staticAmount = readPart + writePart;
      distribute(staticAmount, staticCacheEdges, syncLoad, staticAmount > 0 ? writePart / staticAmount : 0);
    }

    distribute(readPart, cacheEdges, syncLoad);

    distribute(writePart, enqueueEdges, asyncLoad);

    const avgCacheHit =
      cacheEdges.length > 0
        ? cacheEdges.reduce((sum, edge) => {
            const target = simById.get(edge.target);
            return sum + effectiveCacheHitRate(target, cacheHitRate);
          }, 0) / cacheEdges.length
        : cacheHitRate;

    // For cache-serving nodes readPart is already miss-only traffic.
    const cacheMissRps = isCacheServing
      ? readPart
      : cacheEdges.length > 0
        ? readPart * (1 - avgCacheHit)
        : readPart;

    const dbWritePart = enqueueEdges.length > 0 ? 0 : writePart;
    const dbAmount = cacheMissRps + dbWritePart;

    if (dbEdges.length > 0) {
      distribute(dbAmount, dbEdges, syncLoad, dbAmount > 0 ? dbWritePart / dbAmount : 0);
      if (cacheEdges.length > 0 && cacheMissRps > 0) {
        const missShare = cacheMissRps / cacheEdges.length;
        for (const edge of cacheEdges) {
          cacheMissByTarget.set(edge.target, (cacheMissByTarget.get(edge.target) ?? 0) + missShare);
        }
      }
    } else if (cacheEdges.length > 0 && dbWritePart > 0) {
      distribute(dbWritePart, cacheEdges, syncLoad, 1);
    }

    const workerRps = isQueueArchetype(node.archetype) ? dequeueRps : survivingAsync;
    if (workerRps > 0) {
      if (consumeEdges.length > 0) distribute(workerRps, consumeEdges, asyncLoad);
      else if (dbEdges.length > 0) distribute(workerRps, dbEdges, asyncLoad);
      else if (requestEdges.length > 0) distribute(workerRps, requestEdges, asyncLoad);
      else if (staticCacheEdges.length > 0) distribute(workerRps, staticCacheEdges, asyncLoad);
    }

    const cacheMissLoad = (cacheMissByTarget.get(nodeId) ?? 0) * survivingRatio;
    const leftoverSync = Math.max(0, forwardableSync - distributedSync - cacheMissLoad);
    if (leftoverSync > 0) {
      latencySamples.push({ latencyMs: avgLatency + latencyMs, rps: leftoverSync });
    }
  }

  let sourceRps = 0;
  for (const node of simNodes) {
    if (isSourceNode(node, inDegree.get(node.id) ?? 0, hasClient)) {
      sourceRps += healthById.get(node.id)?.incomingRps ?? 0;
    }
  }

  let bottleneckId: string | null = null;
  let bottleneckCpu = 0;
  for (const health of healthById.values()) {
    if (health.incomingRps <= 0) continue;
    const candidate = { ...health, isBottleneck: false };
    if (isBottleneck(candidate) && health.cpuUsage >= bottleneckCpu) {
      bottleneckId = health.id;
      bottleneckCpu = health.cpuUsage;
    }
  }

  if (bottleneckId) {
    const existing = healthById.get(bottleneckId);
    if (existing) healthById.set(bottleneckId, { ...existing, isBottleneck: true });
  }

  const activeHealth = [...healthById.values()].filter((health) => health.incomingRps > 0);
  const sampledRps = latencySamples.reduce((sum, sample) => sum + sample.rps, 0);
  const sortedSamples = [...latencySamples].sort((a, b) => a.latencyMs - b.latencyMs);
  const percentileLatency = (percentile: number) => {
    if (sampledRps <= 0) return 0;
    const target = (percentile / 100) * sampledRps;
    let seen = 0;
    for (const sample of sortedSamples) {
      seen += sample.rps;
      if (seen >= target) return sample.latencyMs;
    }
    return sortedSamples[sortedSamples.length - 1]?.latencyMs ?? 0;
  };
  const avgLatencyMs =
    sampledRps > 0
      ? latencySamples.reduce((sum, sample) => sum + sample.latencyMs * sample.rps, 0) / sampledRps
      : 0;
  const availability = sourceRps > 0 ? clamp(sampledRps / sourceRps, 0, 1) : 0;
  let errorWeighted = 0;
  let errorTotal = 0;
  for (const health of activeHealth) {
    errorWeighted += health.errorRate * health.incomingRps;
    errorTotal += health.incomingRps;
  }
  const aggregateErrorRate = errorTotal > 0 ? errorWeighted / errorTotal : 0;
  let failingNodes = 0;
  for (const health of healthById.values()) {
    if (health.isCrashed || health.cpuUsage >= 1 || health.errorRate >= 0.1) failingNodes += 1;
  }
  let hottest: NodeHealth | null = null;
  for (const health of activeHealth) {
    if (!hottest || health.cpuUsage > hottest.cpuUsage) hottest = health;
  }
  const bottleneckNode = bottleneckId ? simById.get(bottleneckId) : null;
  const hottestNode = hottest ? simById.get(hottest.id) : null;

  const aggregateMetrics: SimulationAggregateMetrics = {
    totalRps: sourceRps,
    avgLatencyMs: Math.round(avgLatencyMs),
    p95LatencyMs: Math.round(percentileLatency(95)),
    p99LatencyMs: Math.round(percentileLatency(99)),
    errorRate: aggregateErrorRate,
    availability,
    errorBudgetBurnRate: clamp((1 - availability) / 0.001, 0, 1000),
    activeNodes: activeHealth.length,
    failingNodes,
    bottleneckId,
    bottleneckName: bottleneckNode?.label ?? null,
    bottleneckCpu: bottleneckId ? (healthById.get(bottleneckId)?.cpuUsage ?? 0) : 0,
    hottestNodeId: hottest?.id ?? null,
    hottestNodeName: hottestNode?.label ?? null,
    hottestNodeCpu: hottest?.cpuUsage ?? 0,
  };

  const nodeMetrics: Record<string, NodeMetrics> = {};
  for (const node of simNodes) {
    const health = healthById.get(node.id);
    if (!health) {
      nodeMetrics[node.id] = {
        loadPct: 0,
        cpuUsage: 0,
        latencyMs: ARCHETYPE_STATS[node.archetype].baseLatencyMs,
        errorRate: 0,
        dropRate: 0,
        isBottleneck: false,
        incomingRps: 0,
        queueDepth: 0,
      };
      continue;
    }
    nodeMetrics[node.id] = {
      loadPct: Math.min(150, Math.round(health.cpuUsage * 100)),
      cpuUsage: health.cpuUsage,
      latencyMs: Math.round(health.latencyMs),
      errorRate: health.errorRate,
      dropRate: health.dropRate,
      isBottleneck: health.isBottleneck,
      incomingRps: health.incomingRps,
      queueDepth: Math.round(health.queueDepth),
      hasChaos:
        chaosContext.nodeModifiers.has(node.id) ||
        (chaosContext.hasGlobalChaos && node.archetype !== 'client') ||
        node.isDegraded ||
        node.isDisabled,
    };
  }

  const edgeMetrics: Record<string, EdgeMetrics> = {};
  for (const edge of edges) {
    const target = nodeById.get(edge.target);
    const intent = intentByEdgeId.get(edge.id) ?? 'request';
    const rps = edgeRps.get(edge.id) ?? 0;
    const targetHealth = target ? nodeMetrics[target.id] : undefined;
    const flowKind: FlowKind =
      targetHealth?.isBottleneck && rps > 0
        ? 'error'
        : rps <= 0
          ? 'idle'
          : intentToFlowKind(intent);

    edgeMetrics[edge.id] = {
      flowRate: sourceRps > 0 ? rps / sourceRps : 0,
      incomingRps: rps,
      flowKind,
      label: labelForIntent(intent),
    };
  }

  return {
    nodeMetrics,
    edgeMetrics,
    aggregateMetrics,
    totalRps: sourceRps,
    tick,
    queueState: { queueBacklog },
  };
}

export function idleSnapshot(nodes: RFNode[], edges: RFEdge[]): SimulationSnapshot {
  return emptyMetrics(nodes, edges);
}

export function createQueueState(): SimulationQueueState {
  return { queueBacklog: new Map() };
}
