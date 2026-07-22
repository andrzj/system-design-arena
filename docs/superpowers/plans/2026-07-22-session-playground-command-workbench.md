# Session Playground Command Workbench Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the session playground shell into a command workbench under the global Header so Design → run sim → inspect metrics → score is faster, with CSS animation polish.

**Architecture:** Keep global `Header` + UserMenu. Evolve `SessionHeader` into a single command bar (title, modes, sim controls). `SessionPlayground` owns mode state and a three-pane Design layout (palette | canvas | inspector). Non-Design modes hide the palette and swap the center/right surfaces. Fold floating live metrics into `SessionInspector`. Add shared CSS transition tokens; no new animation libraries.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind v4, Radix Tabs, Zustand canvas store, existing Lucide icons, Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-07-22-session-playground-command-workbench-design.md`

## Global Constraints

- Do not modify global `Header`, UserMenu, routes, sim engine, scoring API, or chaos API.
- Preserve brand tokens / fonts; dark session theme locked.
- No `motion/react`, GSAP, or new animation deps; CSS/Tailwind only.
- Preserve critical testids: `button-toggle-sim`, `add-component-*`, `live-metrics-panel`, `score-design`, chaos testids.
- Mode labels for UI + a11y tabs: `Design`, `Chaos`, `Diagram`, `Score` (replace old Canvas / Mermaid / Judges labels).
- Animation speeds: micro 120-180ms, pane 180-240ms, inspector swap 150-200ms; easing `cubic-bezier(0.16, 1, 0.3, 1)`.
- Honor `prefers-reduced-motion`.
- Session shell height: `calc(100dvh - 4rem)` (matches sticky Header `h-16`).

---

## File map

| File | Responsibility |
|------|----------------|
| `src/lib/session/workbench-mode.ts` | Mode union + layout helper (palette visible?) |
| `src/lib/session/workbench-mode.test.ts` | Unit tests for mode helper |
| `src/app/globals.css` | `--wb-*` transition tokens + reduced-motion chrome rules |
| `src/components/session/SessionHeader.tsx` | Command bar: title, mode tabs slot, sliders, Start/Stop, inline error |
| `src/components/session/SessionInspector.tsx` | Right pane: metrics / selection / idle tip |
| `src/components/session/LiveMetricsPanel.tsx` | Refactor to embeddable metrics body (no absolute float) |
| `src/components/session/SessionPlayground.tsx` | Shell layout, mode wiring, keep canvas warm in Design |
| `src/components/canvas/Canvas.tsx` | Stop mounting floating LiveMetricsPanel |
| `src/components/canvas/CanvasTopControls.tsx` | Remove Live Metrics toggle (metrics live in inspector) |
| `src/components/canvas/ComponentPalette.tsx` | Hide when workbench mode is not design |
| `src/store/canvas-store.ts` | Add `workbenchMode` + setter |
| `src/components/chaos/ChaosTab.tsx` | Light spacing polish only |
| `src/components/mermaid/MermaidTab.tsx` | Light spacing polish only |
| `src/components/ai-judges/JudgesPanel.tsx` | Light spacing polish only |
| `e2e/session-canvas.spec.ts` | Canvas → Design tab name |
| `e2e/scoring.spec.ts` | Judges → Score tab name |

---

### Task 1: Workbench mode helper

**Files:**
- Create: `src/lib/session/workbench-mode.ts`
- Create: `src/lib/session/workbench-mode.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces:
  - `export type WorkbenchMode = 'design' | 'chaos' | 'diagram' | 'score'`
  - `export function showComponentPalette(mode: WorkbenchMode): boolean`
  - `export function workbenchModeLabel(mode: WorkbenchMode): string`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest';
import {
  showComponentPalette,
  workbenchModeLabel,
  type WorkbenchMode,
} from './workbench-mode';

describe('workbench-mode', () => {
  it('shows palette only in design', () => {
    expect(showComponentPalette('design')).toBe(true);
    for (const mode of ['chaos', 'diagram', 'score'] as WorkbenchMode[]) {
      expect(showComponentPalette(mode)).toBe(false);
    }
  });

  it('maps labels for tabs', () => {
    expect(workbenchModeLabel('design')).toBe('Design');
    expect(workbenchModeLabel('chaos')).toBe('Chaos');
    expect(workbenchModeLabel('diagram')).toBe('Diagram');
    expect(workbenchModeLabel('score')).toBe('Score');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/session/workbench-mode.test.ts`

Expected: FAIL (module not found)

- [ ] **Step 3: Write minimal implementation**

```ts
export type WorkbenchMode = 'design' | 'chaos' | 'diagram' | 'score';

export function showComponentPalette(mode: WorkbenchMode): boolean {
  return mode === 'design';
}

export function workbenchModeLabel(mode: WorkbenchMode): string {
  switch (mode) {
    case 'design':
      return 'Design';
    case 'chaos':
      return 'Chaos';
    case 'diagram':
      return 'Diagram';
    case 'score':
      return 'Score';
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/session/workbench-mode.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/session/workbench-mode.ts src/lib/session/workbench-mode.test.ts
git commit -m "feat(session): add workbench mode helper"
```

---

### Task 2: CSS workbench motion tokens

**Files:**
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: existing theme variables
- Produces: utility classes `.wb-transition`, `.wb-transition-pane`, `.wb-press` and CSS vars `--wb-ease`, `--wb-duration-micro`, `--wb-duration-pane`, `--wb-duration-swap`

- [ ] **Step 1: Add tokens after `:root` block in `globals.css`**

```css
:root {
  /* keep existing vars, then add: */
  --wb-ease: cubic-bezier(0.16, 1, 0.3, 1);
  --wb-duration-micro: 150ms;
  --wb-duration-pane: 200ms;
  --wb-duration-swap: 175ms;
}

.wb-transition {
  transition-property: color, background-color, border-color, opacity, transform;
  transition-duration: var(--wb-duration-micro);
  transition-timing-function: var(--wb-ease);
}

.wb-transition-pane {
  transition-property: opacity, transform;
  transition-duration: var(--wb-duration-pane);
  transition-timing-function: var(--wb-ease);
}

.wb-press:active {
  transform: translateY(1px) scale(0.98);
}

@media (prefers-reduced-motion: reduce) {
  .wb-transition,
  .wb-transition-pane {
    transition: none;
  }

  .wb-press:active {
    transform: none;
  }
}
```

- [ ] **Step 2: Confirm existing sim-edge reduced-motion block still present**

Keep the existing `@media (prefers-reduced-motion: reduce)` rules for `.react-flow__edge-path.sim-edge-*` and `.sim-edge-packet`. Do not delete them.

- [ ] **Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "style(session): add workbench transition tokens"
```

---

### Task 3: Embeddable live metrics body

**Files:**
- Modify: `src/components/session/LiveMetricsPanel.tsx`

**Interfaces:**
- Consumes: `useCanvasStore` metrics fields
- Produces:
  - `export function LiveMetricsBody()` — metrics grid only
  - `export function LiveMetricsPanel()` — returns null when `!isSimulationRunning`; renders body with `data-testid="live-metrics-panel"` (no absolute float)

- [ ] **Step 1: Refactor `LiveMetricsPanel.tsx`**

Replace absolute floating card with non-absolute embeddable panel:

```tsx
'use client';

import { Activity } from 'lucide-react';

import { useCanvasStore } from '@/store/canvas-store';

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 font-mono text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="tabular-nums text-foreground">{value}</span>
    </div>
  );
}

export function LiveMetricsBody() {
  const metrics = useCanvasStore((s) => s.simulationSnapshot.aggregateMetrics);
  const activeChaos = useCanvasStore((s) => s.activeChaosEvents.length);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-foreground">
        <Activity className="h-3.5 w-3.5" />
        Live Metrics
      </div>
      <div className="grid gap-2 border-t border-border pt-3">
        <MetricRow label="Total RPS" value={Math.round(metrics.totalRps).toLocaleString()} />
        <MetricRow label="Avg latency" value={`${metrics.avgLatencyMs}ms`} />
        <MetricRow
          label="p95 / p99"
          value={`${metrics.p95LatencyMs} / ${metrics.p99LatencyMs}ms`}
        />
        <MetricRow label="Error rate" value={`${(metrics.errorRate * 100).toFixed(1)}%`} />
        <MetricRow label="Availability" value={`${(metrics.availability * 100).toFixed(1)}%`} />
        <MetricRow label="Budget burn" value={`${metrics.errorBudgetBurnRate.toFixed(1)}x`} />
      </div>
      <div className="grid gap-2 border-t border-border pt-3">
        <MetricRow
          label="Active / failing"
          value={`${metrics.activeNodes} / ${metrics.failingNodes}`}
        />
        <MetricRow label="Active chaos" value={String(activeChaos)} />
        <MetricRow label="Bottleneck" value={metrics.bottleneckName ?? 'None'} />
        {metrics.hottestNodeName ? (
          <MetricRow
            label="Hottest component"
            value={`${metrics.hottestNodeName} (${Math.round(metrics.hottestNodeCpu * 100)}%)`}
          />
        ) : null}
      </div>
    </div>
  );
}

export function LiveMetricsPanel() {
  const isRunning = useCanvasStore((s) => s.isSimulationRunning);
  if (!isRunning) return null;

  return (
    <div data-testid="live-metrics-panel" className="wb-transition-pane">
      <LiveMetricsBody />
    </div>
  );
}
```

- [ ] **Step 2: Remove close button, absolute positioning, and `showLiveMetrics` gating**

Inspector owns placement. Do not call `setShowLiveMetrics` here.

- [ ] **Step 3: Commit**

```bash
git add src/components/session/LiveMetricsPanel.tsx
git commit -m "refactor(session): make live metrics embeddable"
```

---

### Task 4: SessionInspector

**Files:**
- Create: `src/components/session/SessionInspector.tsx`

**Interfaces:**
- Consumes: `useCanvasStore` (`nodes`, `edges`, `selectedEdgeId`, `isSimulationRunning`, `updateEdge`), `LiveMetricsPanel`
- Produces: `<SessionInspector />` with `data-testid="session-inspector"`

- [ ] **Step 1: Create inspector with priority stack**

```tsx
'use client';

import { LiveMetricsPanel } from '@/components/session/LiveMetricsPanel';
import { useCanvasStore } from '@/store/canvas-store';

export function SessionInspector() {
  const nodes = useCanvasStore((s) => s.nodes);
  const edges = useCanvasStore((s) => s.edges);
  const selectedEdgeId = useCanvasStore((s) => s.selectedEdgeId);
  const isSimulationRunning = useCanvasStore((s) => s.isSimulationRunning);
  const updateEdge = useCanvasStore((s) => s.updateEdge);

  const selectedNode = nodes.find((n) => n.selected) ?? null;
  const selectedEdge = selectedEdgeId
    ? edges.find((e) => e.id === selectedEdgeId) ?? null
    : null;

  return (
    <aside
      data-testid="session-inspector"
      className="flex h-full w-[min(100%,20rem)] shrink-0 flex-col border-l border-border bg-card/80"
    >
      <div className="border-b border-border px-3 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        Inspector
      </div>
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-3">
        <LiveMetricsPanel />

        {selectedNode ? (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">{selectedNode.data.label}</h3>
            <p className="font-mono text-[10px] text-muted-foreground">
              {selectedNode.data.componentType} · {selectedNode.data.replicas} rep
              {selectedNode.data.replicas === 1 ? '' : 's'}
            </p>
          </div>
        ) : null}

        {selectedEdge ? (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Edge</h3>
            <label className="block space-y-1 text-xs">
              <span className="text-muted-foreground">Label</span>
              <input
                className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm"
                value={selectedEdge.data?.label ?? ''}
                onChange={(e) => updateEdge(selectedEdge.id, { label: e.target.value })}
              />
            </label>
          </div>
        ) : null}

        {!isSimulationRunning && !selectedNode && !selectedEdge ? (
          <p className="text-sm text-muted-foreground">
            Add a component, connect edges, then start the simulation to inspect live metrics.
          </p>
        ) : null}
      </div>
    </aside>
  );
}
```

Keep v1 lean: metrics + selection summary + idle tip. Node replica controls stay on-canvas.

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`

Expected: PASS for this file

- [ ] **Step 3: Commit**

```bash
git add src/components/session/SessionInspector.tsx
git commit -m "feat(session): add session inspector rail"
```

---

### Task 5: Command bar (SessionHeader)

**Files:**
- Modify: `src/components/session/SessionHeader.tsx`

**Interfaces:**
- Consumes: existing sim toggle + sliders
- Produces:

```ts
type SessionHeaderProps = {
  problemTitle: string;
  modeTabs?: React.ReactNode;
};
```

- [ ] **Step 1: Restructure header into one command bar**

```tsx
<header className="relative z-0 border-b border-border bg-card/60 px-3 py-2 backdrop-blur-md">
  <div className="flex flex-wrap items-center gap-3">
    <div className="min-w-0 flex-1">
      <h1 className="truncate font-[family-name:var(--font-heading)] text-base font-semibold tracking-tight">
        {problemTitle}
      </h1>
      {/* status badge */}
    </div>

    {modeTabs}

    <div className="flex flex-wrap items-center justify-end gap-2">
      {/* Start/Stop with wb-transition wb-press */}
      {/* SpeedSlider TrafficSlider ReadWriteSlider */}
    </div>
  </div>
  {simError ? (
    <p role="alert" className="mt-2 text-sm text-destructive">
      {simError}
    </p>
  ) : null}
</header>
```

- [ ] **Step 2: Replace `window.alert` on sim toggle failure with local error state**

```tsx
const [simError, setSimError] = useState<string | null>(null);
// on !res.ok: setSimError(data.error ?? 'Failed to toggle simulation'); return;
// on success: setSimError(null);
```

- [ ] **Step 3: Keep testids**

- `data-testid="button-toggle-sim"` on primary Start/Stop
- Keep compact `button-toggle-sim-compact` sr-only if present

- [ ] **Step 4: Commit**

```bash
git add src/components/session/SessionHeader.tsx
git commit -m "feat(session): turn session header into command bar"
```

---

### Task 6: SessionPlayground shell + modes

**Files:**
- Modify: `src/components/session/SessionPlayground.tsx`
- Modify: `src/components/canvas/Canvas.tsx`
- Modify: `src/components/canvas/CanvasTopControls.tsx`
- Modify: `src/components/canvas/ComponentPalette.tsx`
- Modify: `src/store/canvas-store.ts`

**Interfaces:**
- Consumes: `WorkbenchMode`, `showComponentPalette`, `workbenchModeLabel`, `SessionHeader`, `SessionInspector`
- Produces: command workbench shell; default mode `design`

- [ ] **Step 1: Add `workbenchMode` to canvas store**

```ts
import type { WorkbenchMode } from '@/lib/session/workbench-mode';

// in state:
workbenchMode: WorkbenchMode;
setWorkbenchMode: (mode: WorkbenchMode) => void;

// defaults:
workbenchMode: 'design',
setWorkbenchMode: (mode) => set({ workbenchMode: mode }),
```

Reset to `'design'` in `initSession` / `resetCanvas`.

- [ ] **Step 2: Rewrite `SessionPlayground` layout**

Use keep-alive Design pane so canvas/store stay warm:

```tsx
const [mode, setMode] = useState<WorkbenchMode>('design');
const setWorkbenchMode = useCanvasStore((s) => s.setWorkbenchMode);

useEffect(() => {
  setWorkbenchMode(mode);
}, [mode, setWorkbenchMode]);

const modeTabs = (
  <TabsList className="wb-transition h-9">
    {(['design', 'chaos', 'diagram', 'score'] as WorkbenchMode[]).map((value) => (
      <TabsTrigger key={value} value={value} className="wb-transition">
        {workbenchModeLabel(value)}
      </TabsTrigger>
    ))}
  </TabsList>
);

return (
  <div className="flex h-[calc(100dvh-4rem)] flex-col">
    <Tabs
      value={mode}
      onValueChange={(v) => setMode(v as WorkbenchMode)}
      className="flex min-h-0 flex-1 flex-col"
    >
      <SessionHeader problemTitle={session.problem.title} modeTabs={modeTabs} />

      <div className={mode === 'design' ? 'flex min-h-0 flex-1' : 'hidden'}>
        <div className="min-h-0 min-w-0 flex-1">
          <Canvas />
        </div>
        <SessionInspector />
      </div>

      <TabsContent value="chaos" className="mt-0 min-h-0 flex-1 overflow-auto p-4 data-[state=inactive]:hidden">
        {chaosTab}
      </TabsContent>
      <TabsContent value="diagram" className="mt-0 min-h-0 flex-1 overflow-auto p-4 data-[state=inactive]:hidden">
        {mermaidTab}
      </TabsContent>
      <TabsContent value="score" className="mt-0 min-h-0 flex-1 overflow-auto p-4 data-[state=inactive]:hidden">
        {judgesPanel}
      </TabsContent>
    </Tabs>
  </div>
);
```

Remove the old detached `TabsList` under the header.

- [ ] **Step 3: Hide palette outside Design**

In `ComponentPalette`:

```tsx
import { showComponentPalette } from '@/lib/session/workbench-mode';

const workbenchMode = useCanvasStore((s) => s.workbenchMode);
if (!showComponentPalette(workbenchMode)) return null;
```

- [ ] **Step 4: Strip floating metrics from canvas**

In `Canvas.tsx`, remove `<LiveMetricsPanel />` import and render.

In `CanvasTopControls.tsx`, remove Live Metrics button and `showLiveMetrics` usage. Keep `QuickChaosMenu`.

- [ ] **Step 5: Typecheck**

Run: `npm run typecheck`

Expected: PASS for touched files

- [ ] **Step 6: Commit**

```bash
git add src/components/session/SessionPlayground.tsx src/components/canvas/Canvas.tsx src/components/canvas/CanvasTopControls.tsx src/components/canvas/ComponentPalette.tsx src/store/canvas-store.ts
git commit -m "feat(session): wire command workbench shell and modes"
```

---

### Task 7: Light panel polish + press transitions

**Files:**
- Modify: `src/components/chaos/ChaosTab.tsx`
- Modify: `src/components/mermaid/MermaidTab.tsx`
- Modify: `src/components/ai-judges/JudgesPanel.tsx`
- Modify: `src/components/session/SessionHeader.tsx`

**Interfaces:**
- No API changes

- [ ] **Step 1: Apply consistent tool pane wrapper**

```tsx
<div className="mx-auto w-full max-w-6xl wb-transition-pane">
  {/* existing content */}
</div>
```

- [ ] **Step 2: Add `wb-transition wb-press` to primary buttons**

Apply on Start/Stop, `Start Simulation`, and `Score design`.

- [ ] **Step 3: Commit**

```bash
git add src/components/chaos/ChaosTab.tsx src/components/mermaid/MermaidTab.tsx src/components/ai-judges/JudgesPanel.tsx src/components/session/SessionHeader.tsx
git commit -m "style(session): polish tool panes and press transitions"
```

---

### Task 8: Update e2e for new mode labels

**Files:**
- Modify: `e2e/session-canvas.spec.ts`
- Modify: `e2e/scoring.spec.ts`
- Verify: `e2e/chaos.spec.ts` still uses `Chaos`

- [ ] **Step 1: Update session-canvas assertions**

```ts
await expect(page.getByRole('tab', { name: 'Design' })).toBeVisible();
await expect(page.getByRole('tab', { name: 'Chaos' })).toBeVisible();
```

Replace old `Canvas` tab name.

- [ ] **Step 2: Update scoring assertion**

```ts
await page.getByRole('tab', { name: 'Score' }).click();
```

Replace `Judges`.

- [ ] **Step 3: Run targeted e2e if env allows**

```bash
npm run test:e2e -- e2e/session-canvas.spec.ts e2e/chaos.spec.ts
```

Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add e2e/session-canvas.spec.ts e2e/scoring.spec.ts
git commit -m "test(e2e): update session mode tab labels"
```

---

### Task 9: Manual verification checklist

- [ ] **Step 1: Start app** — `npm run dev`, open a session URL
- [ ] **Step 2: Verify chrome layers** — global Header + UserMenu; command bar with modes/sliders/Start; no second user menu
- [ ] **Step 3: Verify Design workflow** — palette left; add component; start sim → inspector `live-metrics-panel`; no floating overlay
- [ ] **Step 4: Verify mode swaps** — Chaos/Diagram/Score hide palette; return Design restores palette minimized state
- [ ] **Step 5: Verify motion** — ~150-200ms chrome transitions; reduced-motion disables them
- [ ] **Step 6: Commit any final polish only if needed**

---

## Spec coverage check

| Spec requirement | Task |
|------------------|------|
| Global Header stays | Task 6 non-touch + Task 9 |
| Command bar | Task 5 |
| Design palette \| canvas \| inspector | Task 4 + 6 |
| Palette hidden outside Design | Task 1 + 6 |
| Metrics in inspector, not float | Task 3 + 4 + 6 |
| Modes Design/Chaos/Diagram/Score | Task 6 + 8 |
| CSS animation style/speed | Task 2 + 7 |
| Reduced motion | Task 2 |
| `dvh` height | Task 6 |
| Preserve testids | Tasks 3, 5, 8 |
| No engine/API/Header changes | Global constraints |
| Mobile drawer/sheet | Deferred follow-up after Task 9 |

**Mobile note:** Spec mentions palette drawer / inspector bottom sheet under `md`. Ship desktop workbench first (Tasks 1-9). Add narrow layout as a focused follow-up if needed.

## Placeholder / consistency review

- Mode values: `design | chaos | diagram | score`
- UI labels: Design / Chaos / Diagram / Score
- `live-metrics-panel` testid preserved
- No TBD left in tasks
