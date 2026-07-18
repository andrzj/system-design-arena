import React, { useState, useEffect, useCallback } from 'react';
import {
  ReactFlowProvider,
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  NodeChange,
  EdgeChange,
  Connection,
  Node,
  Edge,
} from '@xyflow/react';
import { COMPONENT_DEFS } from '@/lib/canvas/components';
import { supabaseService } from '@/lib/supabase/service';
import { v4 as uuidv4 } from 'uuid';
import { useAuthStore } from '@/store/auth-store';
import { useCanvasStore, RFNode, RFEdge, NodeData, EdgeData } from '@/store/canvas-store';

// Custom node component
const CustomNode = ({ data, selected }: { data: NodeData; selected: boolean }) => {
  return (
    <div
      className={`w-48 h-32 rounded-lg border-2 border-dashed ${
        selected ? 'border-blue-500' : 'border-gray-300'
      } bg-white/90 dark:bg-gray-800/90 shadow-md flex flex-col items-center p-3 transition-all duration-200 hover:scale-105`}
    >
      <div className="flex items-center mb-2">
        <span className="text-2xl">
          {data.componentType === 'client' ? '💻' : data.componentType === 'mobile' ? '📱' : data.componentType === 'server' ? '⚙️' : '📦'}
        </span>
        <span className="ml-2 font-medium text-gray-800 dark:text-gray-100">{data.label}</span>
      </div>
      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
        <button
          onClick={(e) => { e.stopPropagation(); }}
          className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          −
        </button>
        <span className="w-8 text-center">{data.replicas}</span>
        <button
          onClick={(e) => { e.stopPropagation(); }}
          className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          +
        </button>
      </div>
    </div>
  );
};

// Canvas toolbar component
const CanvasToolbar = () => {
  const { nodes, setNodes } = useCanvasStore((state) => ({
    nodes: state.nodes,
    setNodes: state.setNodes,
  }));
  const { user } = useAuthStore((state) => ({ user: state.user }));

  const handleAddNode = (componentType: string) => {
    if (!user) return;
    const nodeId = `node-${uuidv4()}`;
    const newNode: RFNode = {
      id: nodeId,
      type: 'custom',
      position: { x: 250, y: 250 },
      data: {
        label: componentType.replace('_', ' '),
        componentType: componentType,
        replicas: 1,
      },
    };
    setNodes([...nodes, newNode]);
  };

  return (
    <div className="w-64 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
      <div className="flex flex-col space-y-4">
        <h2 className="text-lg font-semibold mb-4">Components</h2>
        <div className="space-y-2">
          {['client', 'traffic', 'compute', 'storage', 'messaging', 'observability', 'network', 'ai', 'external'].map(
            (category) => {
              const components = COMPONENT_DEFS.filter((c) => c.category === category);
              if (components.length === 0) return null;
              return (
                <div key={category}>
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 capitalize">{category}</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {components.map((component) => (
                      <button
                        key={component.id}
                        onClick={() => handleAddNode(component.type)}
                        className="flex items-center space-x-2 px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-sm transition-colors"
                      >
                        <span>{component.icon}</span>
                        <span>{component.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            }
          )}
        </div>
      </div>
    </div>
  );
};

export const Canvas: React.FC = () => {
  const { nodes, edges, setNodes, setEdges, sessionId } = useCanvasStore((state) => ({
    nodes: state.nodes,
    edges: state.edges,
    setNodes: state.setNodes,
    setEdges: state.setEdges,
    sessionId: state.sessionId,
  }));
  const { user } = useAuthStore((state) => ({ user: state.user }));

  // Handle node changes using React Flow's helper
  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      const updated = applyNodeChanges(changes, nodes) as RFNode[];
      setNodes(updated);
    },
    [nodes, setNodes],
  );

  // Handle edge changes using React Flow's helper
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      const updated = applyEdgeChanges(changes, edges) as RFEdge[];
      setEdges(updated);
    },
    [edges, setEdges],
  );

  // Handle new connections
  const onConnect = useCallback(
    (connection: Connection) => {
      const updated = addEdge(connection, edges) as RFEdge[];
      setEdges(updated);
    },
    [edges, setEdges],
  );

  // Load existing nodes and edges for the session
  useEffect(() => {
    if (sessionId) {
      const loadSessionData = async () => {
        try {
          const [nodeData, edgeData] = await Promise.all([
            supabaseService.getNodesBySessionId(sessionId),
            supabaseService.getEdgesBySessionId(sessionId),
          ]);
          // Convert database nodes to React Flow nodes
          const rfNodes: RFNode[] = nodeData.map((n) => ({
            id: n.node_uuid,
            type: 'custom',
            position: { x: n.x, y: n.y },
            data: {
              label: n.label || n.component_type,
              componentType: n.component_type,
              replicas: n.replicas,
            },
          }));
          // Convert database edges to React Flow edges
          const rfEdges: RFEdge[] = edgeData.map((e) => ({
            id: e.edge_uuid,
            source: String(e.source_node_id),
            target: String(e.target_node_id),
            type: 'smoothstep',
            data: {
              label: e.label || '',
              style: e.style,
            },
          }));
          setNodes(rfNodes);
          setEdges(rfEdges);
        } catch (error) {
          console.error('Failed to load session data:', error);
        }
      };
      loadSessionData();
    }
  }, [sessionId, setNodes, setEdges]);

  // Save nodes and edges to database when they change
  useEffect(() => {
    if (!sessionId) return;
    const saveSessionData = async () => {
      try {
        await supabaseService.deleteNodesBySessionId(sessionId);
        await supabaseService.deleteEdgesBySessionId(sessionId);
        await Promise.all([
          supabaseService.createNodes(nodes.map((node) => ({
            session_id: sessionId,
            node_uuid: node.id,
            component_type: node.data.componentType,
            label: node.data.label,
            x: node.position.x,
            y: node.position.y,
            replicas: node.data.replicas,
            implementation_notes: null,
            is_disabled: false,
          }))),
          supabaseService.createEdges(edges.map((edge) => ({
            session_id: sessionId,
            edge_uuid: edge.id,
            source_node_id: parseInt(edge.source),
            target_node_id: parseInt(edge.target),
            label: edge.data?.label || null,
            style: (edge.data?.style as 'solid' | 'dashed') || 'solid',
          }))),
        ]);
      } catch (error) {
        console.error('Failed to save session data:', error);
      }
    };
    const handler = setTimeout(saveSessionData, 1000);
    return () => clearTimeout(handler);
  }, [sessionId, nodes, edges, setNodes, setEdges]);

  return (
    <div className="flex h-full">
      <CanvasToolbar />
      <div className="flex-1 relative">
        <ReactFlowProvider>
          <div className="absolute inset-0">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={{ custom: CustomNode }}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              panOnDrag={true}
              fitView
            >
              <Background />
              <Controls />
              <MiniMap
                />
            </ReactFlow>
          </div>
        </ReactFlowProvider>
      </div>
    </div>
  );
};