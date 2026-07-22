'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { canvasToMermaid } from '@/lib/canvas/to-mermaid';
import { getUserTier, isPaidTier } from '@/lib/auth/tier';
import { useAuth } from '@/store/auth-store';
import { useCanvasStore } from '@/store/canvas-store';

export function MermaidTab() {
  const { profile } = useAuth();
  const paid = isPaidTier(getUserTier(profile));
  const nodes = useCanvasStore((s) => s.nodes);
  const edges = useCanvasStore((s) => s.edges);
  const generated = useMemo(() => canvasToMermaid(nodes, edges), [nodes, edges]);
  const [edited, setEdited] = useState<string | null>(null);
  const source = edited ?? generated;

  if (!paid) {
    return (
      <div className="mx-auto w-full max-w-6xl wb-transition-pane">
        <div className="mx-auto max-w-lg rounded-lg border border-border bg-card/50 p-8 text-center">
        <h3 className="text-lg font-semibold">Mermaid editor is premium</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Upgrade to Yearly or Stupid Button Club to edit and preview Mermaid diagrams synced from your canvas.
        </p>
        <Button asChild className="mt-4">
          <Link href="/upgrade">Unlock Mermaid</Link>
        </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl wb-transition-pane">
      <div className="grid gap-4 lg:grid-cols-2">
      <label className="space-y-2 text-sm">
        <span className="font-medium">Mermaid source</span>
        <textarea
          className="min-h-[320px] w-full rounded-md border border-border bg-background p-3 font-mono text-xs"
          value={source}
          onChange={(e) => setEdited(e.target.value)}
          aria-label="Mermaid editor"
        />
      </label>
      <div className="space-y-2">
        <span className="text-sm font-medium">Preview</span>
        <pre className="min-h-[320px] overflow-auto rounded-md border border-border bg-muted/20 p-3 font-mono text-xs">
          {source}
        </pre>
      </div>
      </div>
    </div>
  );
}
