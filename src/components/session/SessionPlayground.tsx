'use client';

import { useEffect } from 'react';

import { Canvas } from '@/components/canvas/Canvas';
import { SessionHeader } from '@/components/session/SessionHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { JudgeScoreResult } from '@/lib/scoring/score-result';
import { useCanvasStore, type RFEdge, type RFNode } from '@/store/canvas-store';

export type SessionData = {
  id: number;
  sessionUuid: string;
  status: string;
  speedSetting: number;
  trafficSetting: number;
  readWriteRatio: number;
  cacheHitRate?: number;
  edgeCacheHitRate?: number;
  latestScore?: JudgeScoreResult | null;
  problem: {
    id: number;
    title: string;
    slug: string;
  };
  nodes: Array<{
    nodeUuid: string;
    componentType: string;
    label: string | null;
    x: number;
    y: number;
    replicas: number;
    implementationNotes: string | null;
    isDisabled: boolean;
    simConfig?: {
      cacheHitRate?: number;
      shardCount?: number;
      keySkewPct?: number;
      partitionStrategy?: 'hash' | 'range' | 'round_robin' | 'geo';
    } | null;
  }>;
  edges: Array<{
    edgeUuid: string;
    sourceNodeUuid: string;
    targetNodeUuid: string;
    label: string | null;
    style: string | null;
  }>;
};

type SessionPlaygroundProps = {
  session: SessionData;
  chaosTab?: React.ReactNode;
  mermaidTab?: React.ReactNode;
  judgesPanel?: React.ReactNode;
};

export function SessionPlayground({
  session,
  chaosTab,
  mermaidTab,
  judgesPanel,
}: SessionPlaygroundProps) {
  const initSession = useCanvasStore((s) => s.initSession);
  const resetCanvas = useCanvasStore((s) => s.resetCanvas);

  useEffect(() => {
    const rfNodes: RFNode[] = session.nodes.map((n) => ({
      id: n.nodeUuid,
      type: 'system',
      position: { x: n.x, y: n.y },
      data: {
        label: n.label ?? n.componentType,
        componentType: n.componentType,
        replicas: n.replicas,
        implementationNotes: n.implementationNotes,
        isDisabled: n.isDisabled,
        simConfig: n.simConfig ?? undefined,
      },
    }));

    const rfEdges: RFEdge[] = session.edges.map((e) => ({
      id: e.edgeUuid,
      source: e.sourceNodeUuid,
      target: e.targetNodeUuid,
      sourceHandle: 'source',
      targetHandle: 'target',
      type: 'flow',
      data: {
        label: e.label ?? '',
        style: (e.style as 'solid' | 'dashed') ?? 'solid',
      },
    }));

    initSession({
      sessionId: session.id,
      sessionUuid: session.sessionUuid,
      problemId: session.problem.id,
      problemTitle: session.problem.title,
      status: session.status,
      speedSetting: session.speedSetting,
      trafficSetting: session.trafficSetting,
      readWriteRatio: session.readWriteRatio,
      cacheHitRate: session.cacheHitRate,
      edgeCacheHitRate: session.edgeCacheHitRate,
      nodes: rfNodes,
      edges: rfEdges,
    });

    return () => resetCanvas();
  }, [session, initSession, resetCanvas]);

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <SessionHeader problemTitle={session.problem.title} />
      <Tabs defaultValue="canvas" className="flex min-h-0 flex-1 flex-col">
        <TabsList className="ml-auto mr-4 mt-2 w-fit">
          <TabsTrigger value="canvas">Canvas</TabsTrigger>
          <TabsTrigger value="chaos">Chaos</TabsTrigger>
          <TabsTrigger value="mermaid">Mermaid</TabsTrigger>
          <TabsTrigger value="judges">Judges</TabsTrigger>
        </TabsList>
        <TabsContent value="canvas" className="mt-0 min-h-0 flex-1 data-[state=inactive]:hidden">
          <Canvas />
        </TabsContent>
        <TabsContent value="chaos" className="mt-0 min-h-0 flex-1 overflow-auto p-4 data-[state=inactive]:hidden">
          {chaosTab}
        </TabsContent>
        <TabsContent value="mermaid" className="mt-0 min-h-0 flex-1 overflow-auto p-4 data-[state=inactive]:hidden">
          {mermaidTab}
        </TabsContent>
        <TabsContent value="judges" className="mt-0 min-h-0 flex-1 overflow-auto p-4 data-[state=inactive]:hidden">
          {judgesPanel}
        </TabsContent>
      </Tabs>
    </div>
  );
}
