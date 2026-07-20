'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  type Connection,
  type NodeChange,
  type EdgeChange,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { ComponentPalette } from '@/components/canvas/ComponentPalette';
import { CanvasToolbar } from '@/components/canvas/CanvasToolbar';
import { SystemNode } from '@/components/canvas/SystemNode';
import { isValidConnection } from '@/lib/canvas/validation';
import { useCanvasStore, type RFEdge, type RFNode } from '@/store/canvas-store';

const nodeTypes = { system: SystemNode };

type CanvasProps = {
  onQuickChaos?: () => void;
};

function CanvasInner({ onQuickChaos }: CanvasProps) {
  const nodes = useCanvasStore((s) => s.nodes);
  const edges = useCanvasStore((s) => s.edges);
  const sessionUuid = useCanvasStore((s) => s.sessionUuid);
  const isInteractive = useCanvasStore((s) => s.isInteractive);
  const showMinimap = useCanvasStore((s) => s.showMinimap);
  const setNodes = useCanvasStore((s) => s.setNodes);
  const setEdges = useCanvasStore((s) => s.setEdges);
  const removeNode = useCanvasStore((s) => s.removeNode);
  const loadedRef = useRef(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const styledEdges = useMemo(
    () =>
      edges.map((edge) => ({
        ...edge,
        style: {
          strokeDasharray: edge.data?.style === 'dashed' ? '5 5' : undefined,
        },
      })),
    [edges],
  );

  const saveCanvas = useCallback(async () => {
    if (!sessionUuid) return;
    const state = useCanvasStore.getState();

    await fetch(`/api/sessions/${sessionUuid}/nodes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nodes: state.nodes.map((node) => ({
          nodeUuid: node.id,
          componentType: node.data.componentType,
          label: node.data.label,
          x: node.position.x,
          y: node.position.y,
          replicas: node.data.replicas,
          implementationNotes: node.data.implementationNotes ?? null,
          isDisabled: node.data.isDisabled ?? false,
        })),
      }),
    });

    await fetch(`/api/sessions/${sessionUuid}/edges`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        edges: state.edges.map((edge) => ({
          edgeUuid: edge.id,
          sourceNodeUuid: edge.source,
          targetNodeUuid: edge.target,
          label: edge.data?.label ?? null,
          style: edge.data?.style ?? 'solid',
        })),
      }),
    });
  }, [sessionUuid]);

  useEffect(() => {
    if (!sessionUuid || loadedRef.current) return;
    loadedRef.current = true;
  }, [sessionUuid]);

  useEffect(() => {
    if (!sessionUuid || !loadedRef.current) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      void saveCanvas();
    }, 10_000);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [nodes, edges, sessionUuid, saveCanvas]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes(applyNodeChanges(changes, nodes) as RFNode[]);
    },
    [nodes, setNodes],
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges(applyEdgeChanges(changes, edges) as RFEdge[]);
    },
    [edges, setEdges],
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      if (!isValidConnection(connection)) return;
      const edge: RFEdge = {
        id: crypto.randomUUID(),
        source: connection.source!,
        target: connection.target!,
        sourceHandle: connection.sourceHandle ?? 'source',
        targetHandle: connection.targetHandle ?? 'target',
        type: 'smoothstep',
        data: { label: '', style: 'solid' },
      };
      setEdges(addEdge(edge, edges) as RFEdge[]);
    },
    [edges, setEdges],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Backspace' && event.key !== 'Delete') return;
      const selected = nodes.filter((n) => n.selected);
      selected.forEach((node) => {
        removeNode(node.id);
        if (sessionUuid) {
          void fetch(`/api/sessions/${sessionUuid}/nodes/${node.id}`, { method: 'DELETE' });
        }
      });
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [nodes, removeNode, sessionUuid]);

  return (
    <div className="flex h-full min-h-0">
      <ComponentPalette />
      <div className="relative min-h-0 flex-1">
        <ReactFlow
          nodes={nodes}
          edges={styledEdges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          isValidConnection={(connection) => isValidConnection(connection as Connection)}
          nodesConnectable={isInteractive}
          nodesDraggable={isInteractive}
          elementsSelectable={isInteractive}
          panOnDrag={isInteractive}
          fitView
          multiSelectionKeyCode="Shift"
          selectionOnDrag
        >
          <Background />
          <Controls />
          {showMinimap ? <MiniMap /> : null}
        </ReactFlow>
        <CanvasToolbar onQuickChaos={onQuickChaos} />
      </div>
    </div>
  );
}

export function Canvas(props: CanvasProps) {
  return (
    <ReactFlowProvider>
      <CanvasInner {...props} />
    </ReactFlowProvider>
  );
}
