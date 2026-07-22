# Session Playground Command Workbench Design

**Date:** 2026-07-22  
**Status:** Approved for planning  
**Priority:** Faster design → simulate → inspect → score workflow  
**Direction:** Command workbench (preserve brand, evolve shell)

## Design read

Reading this as: product-workspace redesign for system-design interview learners, with a Linear-dark workbench language, leaning toward existing dark tokens + shadcn/Radix + restrained CSS motion.

**Dials:** `DESIGN_VARIANCE 5` / `MOTION_INTENSITY 4` / `VISUAL_DENSITY 7`

Motion dial bumped from 3 → 4 because animation style/speed is explicitly in scope (hover, active, pane transitions, sim state feedback). Still CSS-first. No new animation library.

## Goals

1. Collapse fragmented session chrome into one command surface.
2. Keep canvas as the primary work area in Design mode.
3. Make live metrics and selection context always findable in an inspector.
4. Keep global app Header (logo, nav, notifications, UserMenu).
5. Polish animation style and speed for workbench feedback without cinematic motion.

## Non-goals

- Global Header / UserMenu / route changes
- Simulation engine, scoring API, chaos API rewrites
- Canvas graph persistence or React Flow connection logic changes
- Brand retheme, font swap, marketing page work
- Adding Motion/GSAP/new animation dependencies
- Inventing new product features beyond layout and interaction polish

## Current problems

- Session header + tab strip + floating live metrics compete for attention.
- Mode tabs feel bolted on; Chaos / Mermaid / Judges replace the whole workspace.
- Live metrics popover overlaps canvas controls.
- Viewport height uses `100vh` style math; fragile under sticky global Header.
- Motion is uneven: some sim edge animations exist; chrome transitions feel abrupt or default.

## Architecture

Two chrome layers, one job each:

1. **Global `Header`** (unchanged): brand, Dashboard/Learn/Problems, notifications, UserMenu.
2. **Session command bar** (evolved `SessionHeader`): problem title + status, mode switch, sim sliders + Start/Stop.

Workbench body under the command bar:

| Mode | Left | Center | Right |
|------|------|--------|-------|
| Design | `ComponentPalette` | Canvas | `SessionInspector` |
| Chaos | hidden | Chaos tool | run / timeline panel |
| Diagram | hidden | Mermaid editor | optional help / export strip |
| Score | hidden | Judges panel | score CTA / consensus summary |

Height contract: session shell fills `calc(100dvh - global header height)`. Prefer `dvh` over `vh`.

## Command bar

- **Left:** problem title + session status badge
- **Center:** mode segmented control: Design / Chaos / Diagram / Score
- **Right:** Speed, Traffic, Reads/Writes sliders + primary Start/Stop
- Preserve existing `data-testid`s (`button-toggle-sim`, slider roles, etc.)
- One Start/Stop primary CTA; no duplicate compact control except accessibility/test hooks already present
- Sim toggle errors: move toward inline banner/toast; do not expand `window.alert` usage

## Component palette

- Stays the existing left-rail `ComponentPalette` in Design mode.
- Collapse/expand behavior preserved.
- Hidden in Chaos / Diagram / Score so those tools get horizontal room.
- Returning to Design restores palette (respect prior minimized state from store).

## Session inspector

New client component (or evolved panel) on the right in Design mode.

Priority content rules:

1. If simulation running: show live aggregate metrics (replace floating `LiveMetricsPanel` popover).
2. If node selected: show notes entry, replicas, node sim config.
3. If edge selected: show label / style / intent controls.
4. If idle: short tip (add component, connect, run sim).

Canvas overlays that stay:

- Lock / unlock
- Minimap toggle
- Quick chaos affordance if still useful on-canvas

## Mode behavior

- Modes live in the command bar, not a detached tab strip under the header.
- Switching modes must not remount the canvas store session unnecessarily.
- Design mode keeps canvas mounted when possible so graph state and sim loop stay warm.
- Chaos / Diagram / Score can unmount or hide canvas; store state remains.

## Animation style and speed

In scope. Keep stack as-is (Tailwind + existing CSS keyframes). No `motion/react` / GSAP install.

**Style**

- Prefer opacity + transform only.
- Soft workbench easing: `cubic-bezier(0.16, 1, 0.3, 1)` for chrome.
- Tint shadows/borders to existing dark surfaces; no neon glow additions.
- Active press: slight `scale(0.98)` or `translateY(1px)` on primary controls.

**Speed**

- Micro hover/focus: ~120-180ms
- Mode / pane reveal: ~180-240ms
- Inspector content swap: ~150-200ms
- Sim edge packet / dash animations: keep existing, but audit so reduced-motion disables them (already partially present)

**Reduced motion**

- Honor `prefers-reduced-motion: reduce`: disable infinite loops and non-essential transitions; keep instant state changes.

## Visual system

- Preserve existing CSS variables (`--background`, `--card`, `--primary`, Space Grotesk / Inter / IBM Plex Mono).
- Corner radius: keep current soft scale (`rounded-md` / `rounded-xl` already in product).
- One accent: existing primary blue.
- Dark theme locked for session workspace (matches product today).

## Mobile / narrow

- `< md`: palette becomes drawer; inspector becomes bottom sheet.
- Command bar wraps: title row, then modes, then sim controls.
- Canvas remains usable with collapsed chrome.

## Files likely touched

- `src/components/session/SessionPlayground.tsx`
- `src/components/session/SessionHeader.tsx`
- `src/components/session/LiveMetricsPanel.tsx` (fold / replace)
- New: `src/components/session/SessionInspector.tsx` (name flexible)
- `src/components/canvas/ComponentPalette.tsx` (visibility wiring only)
- `src/components/canvas/CanvasTopControls.tsx` (metrics button may move)
- `src/app/globals.css` (shared transition tokens / reduced-motion)
- Light layout polish only: Chaos / Mermaid / Judges panel wrappers

## Testing

- Keep Playwright selectors stable where possible.
- Manual: Design add-node → run sim → metrics in inspector → Score mode → return to Design with palette restored.
- Verify reduced-motion path for chrome + sim edge CSS.
- Smoke laptop width and narrow width.

## Success criteria

- Design → run → read metrics → score without layout thrash.
- Global Header and UserMenu always available.
- Palette available exactly when adding components (Design mode).
- No floating metrics fighting canvas controls.
- Animation feels intentional and snappy, not cinematic.
- Existing critical e2e testids still pass.
