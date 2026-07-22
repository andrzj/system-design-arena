'use client';

import { useMemo, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { COMPONENT_DEFS, getCategories } from '@/lib/canvas/components';
import { showComponentPalette } from '@/lib/session/workbench-mode';
import { cn } from '@/lib/utils';
import { useCanvasStore, type RFNode } from '@/store/canvas-store';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const CATEGORY_LABELS: Record<string, string> = {
  client: 'Client',
  traffic: 'Traffic & Edge',
  compute: 'Compute',
  storage: 'Storage',
  messaging: 'Messaging',
  observability: 'Observability',
  network: 'Network',
  ai: 'AI & Agents',
  external: 'External',
};

export function ComponentPalette() {
  const workbenchMode = useCanvasStore((s) => s.workbenchMode);
  const [search, setSearch] = useState('');
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(getCategories().map((c) => [c, true])),
  );
  const paletteMinimized = useCanvasStore((s) => s.paletteMinimized);
  const setPaletteMinimized = useCanvasStore((s) => s.setPaletteMinimized);
  const nodes = useCanvasStore((s) => s.nodes);
  const setNodes = useCanvasStore((s) => s.setNodes);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return COMPONENT_DEFS;
    return COMPONENT_DEFS.filter(
      (c) =>
        c.label.toLowerCase().includes(q) ||
        c.type.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q),
    );
  }, [search]);

  if (!showComponentPalette(workbenchMode)) return null;

  const addNode = (componentType: string, label: string, description: string) => {
    const nodeId = uuidv4();
    const newNode: RFNode = {
      id: nodeId,
      type: 'system',
      position: { x: 120 + (nodes.length % 5) * 40, y: 120 + Math.floor(nodes.length / 5) * 80 },
      data: {
        label,
        componentType,
        replicas: 1,
        description,
      },
    };
    setNodes([...nodes, newNode]);
  };

  if (paletteMinimized) {
    return (
      <div className="flex h-full w-10 flex-col items-center border-r border-border bg-card py-2">
        <Button
          variant="ghost"
          size="sm"
          title="Expand palette"
          aria-label="Expand palette"
          onClick={() => setPaletteMinimized(false)}
        >
          →
        </Button>
      </div>
    );
  }

  return (
    <aside className="flex h-full w-64 flex-col border-r border-border bg-card">
      <div className="flex items-center justify-between border-b border-border p-3">
        <h2 className="text-sm font-semibold">Components</h2>
        <Button
          variant="ghost"
          size="sm"
          title="Minimize"
          aria-label="Minimize palette"
          onClick={() => setPaletteMinimized(true)}
        >
          ←
        </Button>
      </div>
      <div className="space-y-2 p-3">
        <Input
          placeholder="Search components"
          aria-label="Search components"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button variant="outline" size="sm" className="w-full" data-testid="start-tutorial">
          Start tutorial
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto px-3 pb-3">
        {getCategories().map((category) => {
          const items = filtered.filter((c) => c.category === category);
          if (items.length === 0) return null;
          const isOpen = openCategories[category] ?? true;
          return (
            <div key={category} className="mb-3">
              <button
                type="button"
                className="flex w-full items-center justify-between text-left text-xs font-medium uppercase tracking-wide text-muted-foreground"
                onClick={() =>
                  setOpenCategories((prev) => ({ ...prev, [category]: !isOpen }))
                }
              >
                {CATEGORY_LABELS[category] ?? category}
                <span>{isOpen ? '−' : '+'}</span>
              </button>
              {isOpen ? (
                <div className="mt-2 space-y-1">
                  {items.map((component) => (
                    <div
                      key={component.id}
                      className="flex items-center gap-1 rounded border border-border/60 bg-background/40 p-1.5"
                      title={component.description}
                    >
                      <span className="text-sm">{component.icon}</span>
                      <span className="flex-1 truncate text-xs">{component.label}</span>
                      <button
                        type="button"
                        aria-label={`Add ${component.label}`}
                        className={cn(
                          'rounded px-1.5 text-sm hover:bg-primary/20',
                        )}
                        data-testid={`add-component-${component.type}`}
                        onClick={() => addNode(component.type, component.label, component.description)}
                      >
                        +
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
