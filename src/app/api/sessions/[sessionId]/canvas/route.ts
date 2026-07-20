import { NextResponse } from 'next/server';
import {
  createEdges,
  createNodes,
  deleteEdgesBySessionId,
  deleteNodesBySessionId,
  getEdgesBySessionId,
  getNodesBySessionId,
} from '@/lib/db';

type CanvasNodeInput = {
  nodeUuid: string;
  componentType: string;
  label?: string | null;
  x: number;
  y: number;
  replicas: number;
  implementationNotes?: string | null;
  isDisabled?: boolean;
};

type CanvasEdgeInput = {
  edgeUuid: string;
  sourceNodeId: number;
  targetNodeId: number;
  label?: string | null;
  style?: string | null;
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  const { sessionId } = await params;
  const id = Number(sessionId);

  if (Number.isNaN(id)) {
    return NextResponse.json({ error: 'Invalid session id' }, { status: 400 });
  }

  const [nodes, edges] = await Promise.all([
    getNodesBySessionId(id),
    getEdgesBySessionId(id),
  ]);

  return NextResponse.json({ nodes, edges });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  const { sessionId } = await params;
  const id = Number(sessionId);

  if (Number.isNaN(id)) {
    return NextResponse.json({ error: 'Invalid session id' }, { status: 400 });
  }

  const body = (await request.json()) as {
    nodes?: CanvasNodeInput[];
    edges?: CanvasEdgeInput[];
  };

  await deleteNodesBySessionId(id);
  await deleteEdgesBySessionId(id);

  const [nodes, edges] = await Promise.all([
    createNodes(body.nodes ?? [], id),
    createEdges(body.edges ?? [], id),
  ]);

  return NextResponse.json({ nodes, edges });
}
