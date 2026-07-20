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
