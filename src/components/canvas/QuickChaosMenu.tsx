'use client';

import { useEffect, useRef, useState } from 'react';
import { Trash2, Zap } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { QUICK_CHAOS_EVENTS } from '@/lib/chaos/quick-events';
import { useChaosEvent } from '@/hooks/use-chaos-event';
import { cn } from '@/lib/utils';

type QuickChaosMenuProps = {
  align?: 'center' | 'right';
};

export function QuickChaosMenu({ align = 'center' }: QuickChaosMenuProps) {
  const [open, setOpen] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const { runChaosEvent, clearChaos, activeChaosCount } = useChaosEvent();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open]);

  const triggerEvent = async (eventId: string) => {
    setLoadingId(eventId);
    try {
      await runChaosEvent(eventId);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <Button
        variant="outline"
        size="sm"
        data-testid="quick-chaos"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <Zap className="mr-1 h-4 w-4" />
        Quick Chaos
      </Button>

      {open ? (
        <div
          className={cn(
            'absolute top-full z-20 mt-2 w-max max-w-[min(92vw,720px)] rounded-xl border border-white/10 bg-slate-950/95 p-3 shadow-2xl backdrop-blur-md',
            align === 'right' ? 'right-0' : 'left-1/2 -translate-x-1/2',
          )}
          data-testid="quick-chaos-menu"
        >
          <p className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
            Quick Chaos
          </p>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_CHAOS_EVENTS.map((event) => (
              <button
                key={event.eventId}
                type="button"
                data-testid={`quick-chaos-${event.eventId}`}
                disabled={loadingId !== null}
                className={cn(
                  'rounded-lg border border-white/10 bg-slate-900/80 px-2.5 py-1.5 text-left text-xs text-white transition-colors',
                  'hover:border-primary/40 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50',
                  loadingId === event.eventId && 'border-primary/50 bg-slate-800',
                )}
                onClick={() => triggerEvent(event.eventId)}
              >
                <span className="mr-1">{event.emoji}</span>
                {event.label}
              </button>
            ))}
          </div>
          <div className="mt-2 flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              data-testid="quick-chaos-clear"
              disabled={activeChaosCount === 0}
              className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              onClick={clearChaos}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear{activeChaosCount > 0 ? ` (${activeChaosCount})` : ''}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
