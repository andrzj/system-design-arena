'use client';

import { useState } from 'react';

import { ChaosEventButton } from '@/components/chaos/ChaosEventButton';
import { ChaosTimeline } from '@/components/chaos/ChaosTimeline';
import { Button } from '@/components/ui/button';
import { getCategories, getEventById, getEventsByCategory } from '@/lib/chaos/events';
import { requiresChaosTarget } from '@/lib/chaos/scopes';
import type { ChaosSimulationResult } from '@/lib/chaos/simulate';
import { useCanvasStore } from '@/store/canvas-store';

const CATEGORY_LABELS: Record<string, string> = {
  infrastructure: 'Infrastructure',
  network: 'Network',
  application: 'Application',
  dependency: 'Dependencies',
  data: 'Data',
  security: 'Security',
  scaling: 'Scaling',
  human: 'Human Factors',
  global: 'Global',
};

export function ChaosTab() {
  const sessionUuid = useCanvasStore((s) => s.sessionUuid);
  const nodes = useCanvasStore((s) => s.nodes);
  const updateNode = useCanvasStore((s) => s.updateNode);
  const addActiveChaos = useCanvasStore((s) => s.addActiveChaos);
  const activeChaosEvents = useCanvasStore((s) => s.activeChaosEvents);
  const clearActiveChaos = useCanvasStore((s) => s.clearActiveChaos);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [targetNodeId, setTargetNodeId] = useState<string>('global');
  const [results, setResults] = useState<ChaosSimulationResult[]>([]);
  const [loading, setLoading] = useState(false);

  const selectedEvent = selectedEventId ? getEventById(selectedEventId) : null;

  const needsTarget = selectedEvent ? requiresChaosTarget(selectedEvent.scope) : false;

  const runSimulation = async () => {
    if (!sessionUuid || !selectedEventId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/sessions/${sessionUuid}/chaos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: selectedEventId,
          targetNodeId: needsTarget && targetNodeId !== 'global' ? targetNodeId : null,
          nodes: nodes.map((n) => ({
            id: n.id,
            componentType: n.data.componentType,
            replicas: n.data.replicas,
          })),
        }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        window.alert(data.error ?? 'Chaos simulation failed');
        return;
      }
      const data = (await res.json()) as { result: ChaosSimulationResult };
      setResults((prev) => [data.result, ...prev]);
      for (const update of data.result.nodeUpdates) {
        updateNode(update.nodeId, {
          isDisabled: update.isDisabled,
          isDegraded: update.isDegraded,
        });
      }
      addActiveChaos({
        chaosId: selectedEventId,
        nodeId: needsTarget && targetNodeId !== 'global' ? targetNodeId : null,
        scope: selectedEvent?.scope ?? 'node',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetChaos = () => {
    for (const node of nodes) {
      if (node.data.isDegraded || node.data.isDisabled) {
        updateNode(node.id, { isDisabled: false, isDegraded: false });
      }
    }
    clearActiveChaos();
  };

  return (
    <div className="mx-auto w-full max-w-6xl wb-transition-pane">
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-4">
        {getCategories().map((category) => {
          const events = getEventsByCategory(category);
          return (
            <section key={category}>
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {CATEGORY_LABELS[category] ?? category}
              </h3>
              <div className="grid gap-2 sm:grid-cols-2">
                {events.map((event) => (
                  <ChaosEventButton
                    key={event.id}
                    event={event}
                    selected={selectedEventId === event.id}
                    onSelect={() => setSelectedEventId(event.id)}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
      <aside className="space-y-4 rounded-lg border border-border bg-card/40 p-4">
        <h3 className="text-sm font-semibold">Run chaos</h3>
        {selectedEvent ? (
          <p className="text-xs text-muted-foreground">
            {needsTarget
              ? 'Pick a node — failure applies to that component only.'
              : 'Global event — affects the whole design (or region).'}
          </p>
        ) : null}
        {needsTarget ? (
          <label className="block space-y-1 text-sm">
            <span className="text-muted-foreground">Target node</span>
            <select
              className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm"
              value={targetNodeId}
              onChange={(e) => setTargetNodeId(e.target.value)}
            >
              <option value="global">Select node…</option>
              {nodes.map((node) => (
                <option key={node.id} value={node.id}>
                  {node.data.label}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <Button
          className="wb-transition wb-press w-full"
          data-testid="start-chaos-simulation"
          disabled={!selectedEventId || loading || (needsTarget && targetNodeId === 'global')}
          onClick={runSimulation}
        >
          Start Simulation
        </Button>
        {activeChaosEvents.length > 0 ? (
          <Button
            className="w-full"
            variant="outline"
            data-testid="reset-chaos"
            onClick={resetChaos}
          >
            Reset Chaos ({activeChaosEvents.length} active)
          </Button>
        ) : null}
        <div>
          <h4 className="mb-2 text-sm font-medium">Timeline</h4>
          <ChaosTimeline results={results} />
        </div>
      </aside>
      </div>
    </div>
  );
}
