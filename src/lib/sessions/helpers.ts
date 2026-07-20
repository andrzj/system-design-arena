import { prisma } from '@/lib/prisma/client';

export async function getSessionByUuidOrThrow(sessionUuid: string) {
  const session = await prisma.designSession.findUnique({
    where: { sessionUuid },
    include: {
      problem: true,
      nodes: { orderBy: { createdAt: 'asc' } },
      edges: {
        orderBy: { createdAt: 'asc' },
        include: {
          sourceNode: { select: { nodeUuid: true } },
          targetNode: { select: { nodeUuid: true } },
        },
      },
    },
  });

  if (!session) {
    return null;
  }

  return session;
}

export async function resolveSessionId(sessionUuid: string): Promise<number | null> {
  const session = await prisma.designSession.findUnique({
    where: { sessionUuid },
    select: { id: true },
  });
  return session?.id ?? null;
}

export function serializeSession(session: NonNullable<Awaited<ReturnType<typeof getSessionByUuidOrThrow>>>) {
  return {
    id: session.id,
    sessionUuid: session.sessionUuid,
    status: session.status,
    speedSetting: session.speedSetting,
    trafficSetting: session.trafficSetting,
    readWriteRatio: session.readWriteRatio,
    problem: {
      id: session.problem.id,
      title: session.problem.title,
      slug: session.problem.slug,
      difficulty: session.problem.difficulty,
      brief: session.problem.brief,
      requirements: session.problem.requirements,
      keyConsiderations: session.problem.keyConsiderations,
    },
    nodes: session.nodes.map((node) => ({
      nodeUuid: node.nodeUuid,
      componentType: node.componentType,
      label: node.label,
      x: node.x,
      y: node.y,
      replicas: node.replicas,
      implementationNotes: node.implementationNotes,
      isDisabled: node.isDisabled,
    })),
    edges: session.edges.map((edge) => ({
      edgeUuid: edge.edgeUuid,
      sourceNodeUuid: edge.sourceNode.nodeUuid,
      targetNodeUuid: edge.targetNode.nodeUuid,
      label: edge.label,
      style: edge.style,
    })),
  };
}
