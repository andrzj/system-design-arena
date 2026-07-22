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
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { ComponentPalette } from '@/components/canvas/ComponentPalette';
import { CanvasToolbar } from '@/components/canvas/CanvasToolbar';
import { CanvasTopControls } from '@/components/canvas/CanvasTopControls';
import { FlowEdge } from '@/components/canvas/FlowEdge';
import { SystemNode } from '@/components/canvas/SystemNode';
import { LiveMetricsPanel } from '@/components/session/LiveMetricsPanel';
import { useSimulationLoop } from '@/hooks/use-simulation-loop';
import { getComponentByType } from '@/lib/canvas/components';
import { isValidConnection } from '@/lib/canvas/validation';
import { useCanvasStore, type RFEdge, type RFNode } from '@/store/canvas-store';

const nodeTypes = { system: SystemNode };
const edgeTypes = { flow: FlowEdge };

function CanvasInner() {
  useSimulationLoop();

  const nodes = useCanvasStore((s) => s.nodes);
  const edges = useCanvasStore((s) => s.edges);
  const nodeMetrics = useCanvasStore((s) => s.simulationSnapshot.nodeMetrics);
  const sessionUuid = useCanvasStore((s) => s.sessionUuid);
  const isInteractive = useCanvasStore((s) => s.isInteractive);
  const showMinimap = useCanvasStore((s) => s.showMinimap);
  const setNodes = useCanvasStore((s) => s.setNodes);
  const setEdges = useCanvasStore((s) => s.setEdges);
  const removeNode = useCanvasStore((s) => s.removeNode);
  const recomputeSimulation = useCanvasStore((s) => s.recomputeSimulation);
  const setSelectedEdgeId = useCanvasStore((s) => s.setSelectedEdgeId);
  const loadedRef = useRef(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const minimapNodeColor = useCallback(
    (node: RFNode) => {
      const metrics = nodeMetrics[node.id];
      if (metrics?.isBottleneck) return '#ef4444';
      if (node.data.isDegraded || node.data.isDisabled) return '#64748b';
      return getComponentByType(node.data.componentType)?.color ?? '#3b82f6';
    },
    [nodeMetrics],
  );

  const styledEdges = useMemo(
    () =>
      edges.map((edge) => ({
        ...edge,
        type: 'flow',
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
          simConfig: node.data.simConfig ?? null,
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
          intent: edge.data?.intent ?? null,
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
        type: 'flow',
        data: { label: '', style: 'solid' },
      };
      setEdges(addEdge(edge, edges) as RFEdge[]);
    },
    [edges, setEdges],
  );

  const deleteEdgeOnServer = useCallback(
    (edgeId: string) => {
      if (!sessionUuid) return;
      void fetch(`/api/sessions/${sessionUuid}/edges/${edgeId}`, { method: 'DELETE' });
    },
    [sessionUuid],
  );

  const onNodesDelete = useCallback(
    (deleted: Array<{ id: string }>) => {
      deleted.forEach((node) => {
        removeNode(node.id);
        if (sessionUuid) {
          void fetch(`/api/sessions/${sessionUuid}/nodes/${node.id}`, { method: 'DELETE' });
        }
      });
      recomputeSimulation();
    },
    [removeNode, recomputeSimulation, sessionUuid],
  );

  const onEdgesDelete = useCallback(
    (deleted: Edge[]) => {
      deleted.forEach((edge) => deleteEdgeOnServer(edge.id));
      recomputeSimulation();
    },
    [deleteEdgeOnServer, recomputeSimulation],
  );

  const onEdgeClick = useCallback(
    (_event: React.MouseEvent, edge: { id: string }) => {
      setSelectedEdgeId(edge.id);
    },
    [setSelectedEdgeId],
  );

  const onPaneClick = useCallback(() => {
    setSelectedEdgeId(null);
  }, [setSelectedEdgeId]);

  return (
    <div className="flex h-full min-h-0">
      <ComponentPalette />
      <div className="relative min-h-0 flex-1">
        <ReactFlow
          colorMode="dark"
          nodes={nodes}
          edges={styledEdges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onEdgeClick={onEdgeClick}
          onPaneClick={onPaneClick}
          onNodesDelete={onNodesDelete}
          onEdgesDelete={onEdgesDelete}
          deleteKeyCode={['Backspace', 'Delete']}
          edgesFocusable
          isValidConnection={(connection) => isValidConnection(connection as Connection)}
          nodesConnectable={isInteractive}
          nodesDraggable={isInteractive}
          elementsSelectable={isInteractive}
          panOnDrag={isInteractive}
          fitView
          multiSelectionKeyCode="Shift"
          selectionOnDrag
        >
          <Background gap={20} size={1.5} color="rgba(148, 163, 184, 0.25)" />
          <Controls />
          {showMinimap ? (
            <MiniMap
              pannable
              zoomable
              nodeColor={minimapNodeColor}
              nodeStrokeColor="#94a3b8"
              nodeBorderRadius={6}
              bgColor="#1a1a2e"
              maskColor="rgba(10, 10, 15, 0.55)"
              maskStrokeColor="rgba(59, 130, 246, 0.9)"
              maskStrokeWidth={1.5}
              className="!border-border !bg-card"
            />
          ) : null}
        </ReactFlow>
        <CanvasTopControls />
        <LiveMetricsPanel />
        <CanvasToolbar />
      </div>
    </div>
  );
}

export function Canvas() {
  return (
    <ReactFlowProvider>
      <CanvasInner />
    </ReactFlowProvider>
  );
}
