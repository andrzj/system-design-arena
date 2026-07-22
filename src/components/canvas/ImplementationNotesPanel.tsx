'use client';

import { FileText, X } from 'lucide-react';

import { getComponentByType } from '@/lib/canvas/components';
import { cn } from '@/lib/utils';
import type { NodeData } from '@/store/canvas-store';
import { useCanvasStore } from '@/store/canvas-store';
import { useAuth } from '@/store/auth-store';

type ImplementationNotesPanelProps = {
  nodeId: string;
  data: NodeData;
  notesHint?: string;
  onClose: () => void;
};

export function ImplementationNotesPanel({
  nodeId,
  data,
  notesHint,
  onClose,
}: ImplementationNotesPanelProps) {
  const updateNode = useCanvasStore((s) => s.updateNode);
  const { isAuthenticated } = useAuth();
  const def = getComponentByType(data.componentType);
  const description = data.description ?? def?.description ?? '';

  if (!isAuthenticated) {
    return (
      <div className="absolute left-0 top-full z-20 mt-2 w-[min(280px,calc(100vw-2rem))] rounded-lg border border-border bg-card/95 p-3 shadow-xl backdrop-blur">
        <p className="font-mono text-xs text-muted-foreground">
          Sign in to add implementation notes for AI scoring.
        </p>
      </div>
    );
  }

  return (
    <div
      className="absolute left-1/2 top-full z-20 mt-3 w-[min(300px,calc(100vw-2rem))] -translate-x-1/2 rounded-xl border border-white/10 bg-slate-950/95 p-4 shadow-2xl backdrop-blur-md"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: def?.color ?? '#3b82f6' }}
          />
          <span className="font-mono text-sm font-semibold text-foreground">{data.label}</span>
        </div>
        <button
          type="button"
          aria-label="Close notes"
          className="rounded p-0.5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
          onClick={onClose}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <p className="mt-2 font-mono text-[11px] leading-relaxed text-muted-foreground">{description}</p>
      {notesHint ? (
        <p className="mt-2 rounded-md border border-primary/20 bg-primary/5 px-2 py-1.5 font-mono text-[10px] text-primary/90">
          Hint: {notesHint}
        </p>
      ) : null}
      <div className="mt-3 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
        <FileText className="h-3 w-3" />
        Implementation notes
      </div>
      <textarea
        aria-label="Implementation notes"
        className={cn(
          'mt-2 min-h-[88px] w-full resize-y rounded-md border border-white/10 bg-black/40 px-3 py-2',
          'font-mono text-xs text-foreground placeholder:text-muted-foreground/70',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
        )}
        placeholder="e.g. stateless; 4 replicas; autoscale at 70% CPU"
        value={data.implementationNotes ?? ''}
        onChange={(e) => updateNode(nodeId, { implementationNotes: e.target.value })}
      />
      <p className="mt-2 font-mono text-[10px] text-muted-foreground/80">
        The AI judges read these notes when scoring your design.
      </p>
    </div>
  );
}
