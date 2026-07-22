'use client';

import { QuickChaosMenu } from '@/components/canvas/QuickChaosMenu';

export function CanvasTopControls() {
  return (
    <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
      <QuickChaosMenu align="right" />
    </div>
  );
}
