'use client';

import type { ChaosEvent } from '@/lib/chaos/events';

type ChaosEventButtonProps = {
  event: ChaosEvent;
  selected: boolean;
  onSelect: () => void;
};

export function ChaosEventButton({ event, selected, onSelect }: ChaosEventButtonProps) {
  return (
    <button
      type="button"
      data-testid={`chaos-event-${event.id}`}
      onClick={onSelect}
      className={`rounded-lg border p-3 text-left transition-colors ${
        selected
          ? 'border-primary bg-primary/10'
          : 'border-border bg-card/40 hover:border-primary/40'
      }`}
    >
      <div className="flex items-center gap-2 text-sm font-medium">
        <span>{event.emoji}</span>
        <span>{event.label}</span>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{event.description}</p>
    </button>
  );
}
