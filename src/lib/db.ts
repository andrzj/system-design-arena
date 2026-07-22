import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma/client';

export type { Problem, Article, DesignSession, CanvasNode, CanvasEdge, Profile } from '@prisma/client';

export async function getProblems() {
  return prisma.problem.findMany({
    where: { isPublic: true },
    orderBy: { order: 'asc' },
  });
}

export async function getProblemBySlug(slug: string) {
  return prisma.problem.findUnique({
    where: { slug },
  });
}

export async function getArticles() {
  return prisma.article.findMany({
    where: { isPublished: true },
    orderBy: { order: 'asc' },
  });
}

export async function getArticleBySlug(slug: string) {
  return prisma.article.findUnique({
    where: { slug },
  });
}

export async function getProfile(userId: string) {
  return prisma.profile.findUnique({
    where: { id: userId },
  });
}

export async function updateProfile(userId: string, updates: Prisma.ProfileUpdateInput) {
  return prisma.profile.update({
    where: { id: userId },
    data: updates,
  });
}

export async function createSession(userId: string | null, problemId: number) {
  return prisma.designSession.create({
    data: {
      userId,
      problemId,
    },
  });
}

export async function getSessionByUuid(sessionUuid: string) {
  return prisma.designSession.findUnique({
    where: { sessionUuid },
    include: { problem: true },
  });
}

export async function updateSession(sessionId: number, updates: Prisma.DesignSessionUpdateInput) {
  return prisma.designSession.update({
    where: { id: sessionId },
    data: updates,
  });
}

export async function createNodes(
  nodes: Array<Omit<Prisma.CanvasNodeCreateManyInput, 'sessionId'>>,
  sessionId: number,
) {
  if (nodes.length === 0) return [];

  await prisma.canvasNode.createMany({
    data: nodes.map((node) => ({ ...node, sessionId })),
  });

  return prisma.canvasNode.findMany({
    where: { sessionId },
    orderBy: { createdAt: 'asc' },
  });
}

export async function getNodesBySessionId(sessionId: number) {
  return prisma.canvasNode.findMany({
    where: { sessionId },
    orderBy: { createdAt: 'asc' },
  });
}

export async function updateNode(nodeId: number, updates: Prisma.CanvasNodeUpdateInput) {
  return prisma.canvasNode.update({
    where: { id: nodeId },
    data: updates,
  });
}

export async function deleteNode(nodeId: number) {
  await prisma.canvasNode.delete({
    where: { id: nodeId },
  });
}

export async function deleteNodesBySessionId(sessionId: number) {
  await prisma.canvasNode.deleteMany({
    where: { sessionId },
  });
}

export async function createEdges(
  edges: Array<Omit<Prisma.CanvasEdgeCreateManyInput, 'sessionId'>>,
  sessionId: number,
) {
  if (edges.length === 0) return [];

  await prisma.canvasEdge.createMany({
    data: edges.map((edge) => ({ ...edge, sessionId })),
  });

  return prisma.canvasEdge.findMany({
    where: { sessionId },
    orderBy: { createdAt: 'asc' },
  });
}

export async function getEdgesBySessionId(sessionId: number) {
  return prisma.canvasEdge.findMany({
    where: { sessionId },
    orderBy: { createdAt: 'asc' },
  });
}

export async function deleteEdgesBySessionId(sessionId: number) {
  await prisma.canvasEdge.deleteMany({
    where: { sessionId },
  });
}

export async function logChaosEvent(
  sessionId: number,
  eventId: string,
  targetNodeId: number | null,
  result: Prisma.InputJsonValue,
) {
  return prisma.chaosLog.create({
    data: {
      sessionId,
      chaosEventId: eventId,
      targetNodeId,
      result,
    },
  });
}

export async function createScoreResult(
  sessionId: number,
  userId: string | null,
  scoreData: Omit<Prisma.ScoreResultUncheckedCreateInput, 'sessionId' | 'userId'>,
) {
  return prisma.scoreResult.create({
    data: {
      sessionId,
      userId,
      ...scoreData,
    },
  });
}

export async function upsertCanvasNodes(
  sessionId: number,
  nodes: Array<{
    nodeUuid: string;
    componentType: string;
    label?: string | null;
    x: number;
    y: number;
    replicas: number;
    implementationNotes?: string | null;
    isDisabled?: boolean;
    simConfig?: unknown;
  }>,
) {
  const results = await Promise.all(
    nodes.map((node) =>
      prisma.canvasNode.upsert({
        where: { nodeUuid: node.nodeUuid },
        create: {
          ...node,
          sessionId,
          simConfig: node.simConfig ?? undefined,
        },
        update: {
          componentType: node.componentType,
          label: node.label,
          x: node.x,
          y: node.y,
          replicas: node.replicas,
          implementationNotes: node.implementationNotes,
          isDisabled: node.isDisabled ?? false,
          simConfig: node.simConfig ?? undefined,
        },
      }),
    ),
  );
  return results;
}

export async function upsertCanvasEdges(
  sessionId: number,
  edges: Array<{
    edgeUuid: string;
    sourceNodeUuid: string;
    targetNodeUuid: string;
    label?: string | null;
    style?: string | null;
    intent?: string | null;
  }>,
) {
  const nodeMap = new Map(
    (
      await prisma.canvasNode.findMany({
        where: { sessionId },
        select: { id: true, nodeUuid: true },
      })
    ).map((n) => [n.nodeUuid, n.id]),
  );

  const results = await Promise.all(
    edges.map(async (edge) => {
      const sourceNodeId = nodeMap.get(edge.sourceNodeUuid);
      const targetNodeId = nodeMap.get(edge.targetNodeUuid);
      if (!sourceNodeId || !targetNodeId) {
        throw new Error(`Invalid edge endpoints: ${edge.edgeUuid}`);
      }

      return prisma.canvasEdge.upsert({
        where: { edgeUuid: edge.edgeUuid },
        create: {
          edgeUuid: edge.edgeUuid,
          sessionId,
          sourceNodeId,
          targetNodeId,
          label: edge.label,
          style: edge.style ?? 'solid',
          intent: edge.intent ?? null,
        },
        update: {
          sourceNodeId,
          targetNodeId,
          label: edge.label,
          style: edge.style ?? 'solid',
          intent: edge.intent ?? null,
        },
      });
    }),
  );

  const keepIds = edges.map((edge) => edge.edgeUuid);
  await prisma.canvasEdge.deleteMany({
    where: {
      sessionId,
      edgeUuid: { notIn: keepIds.length > 0 ? keepIds : ['__none__'] },
    },
  });

  return results;
}

export async function deleteEdgeByUuid(sessionId: number, edgeUuid: string) {
  const edge = await prisma.canvasEdge.findFirst({
    where: { sessionId, edgeUuid },
  });
  if (!edge) return null;
  await prisma.canvasEdge.delete({ where: { id: edge.id } });
  return edge;
}

export async function deleteNodeByUuid(sessionId: number, nodeUuid: string) {
  const node = await prisma.canvasNode.findFirst({
    where: { sessionId, nodeUuid },
  });
  if (!node) return null;
  await prisma.canvasNode.delete({ where: { id: node.id } });
  return node;
}

export async function getChaosLogsBySessionId(sessionId: number) {
  return prisma.chaosLog.findMany({
    where: { sessionId },
    orderBy: { timestamp: 'desc' },
    include: { targetNode: { select: { nodeUuid: true, label: true, componentType: true } } },
  });
}

export async function getScoreResultsByUserId(userId: string) {
  return prisma.scoreResult.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      session: { include: { problem: true } },
    },
  });
}

export async function getSessionsByUserId(userId: string) {
  return prisma.designSession.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
    include: {
      problem: true,
      scoreResults: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
  });
}

export async function getDashboardStats(userId: string) {
  const [sessions, scores] = await Promise.all([
    prisma.designSession.findMany({
      where: { userId },
      select: { id: true, problemId: true, status: true },
    }),
    prisma.scoreResult.findMany({
      where: { userId },
      select: {
        judgeRigorScore: true,
        judgePragmatismScore: true,
        consensusVerdict: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    }),
  ]);

  const problemIds = new Set(sessions.map((s) => s.problemId));

  return {
    totalSessions: sessions.length,
    problemsAttempted: problemIds.size,
    completedSessions: sessions.filter((s) => s.status === 'completed').length,
    scores,
  };
}
