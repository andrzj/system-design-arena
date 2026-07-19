# System Design Arena — Implementation Task File

## Tech Stack Decisions

| Decision | Choice | Justification |
|---|---|---|
| Framework | **Next.js 16** (App Router, `--turbopack`) | Latest stable (16.2.10), RSC, server actions, streaming, turbopack |
| Styling | **Tailwind CSS v4** + **shadcn/ui** | Consistent design system, radix primitives, dark theme ready |
| Language | **TypeScript** (strict mode) | Type safety across 44+ component definitions |
| Database | **PostgreSQL** via **Prisma ORM** | Schema-first, migrations, type-safe queries, good DX |
| Auth | **Clerk** (or NextAuth v5) | Social/email auth, webhooks, session management out of box |
| Canvas | **React Flow** (xyflow/react v11.x) | Matches the PRD's observed use of reactflow.dev |
| AI Router | **OpenRouter SDK** | Swappable between OpenAI, Anthropic, etc. |
| Payments | **Stripe** + webhooks | Subscriptions (Yearly), marketplace (Stupid Button Club) |
| Deployment | **Vercel** (default) | Native Next.js support, edge functions, serverless DB |
| Testing | **Vitest** + **Playwright** | Unit tests + E2E for critical flows |
| State | **React Context** + **Zustand** (for canvas) | Lightweight, no overkill Redux |

---

## Data Models (Prisma Schema)

```prisma
// ========== AUTH (via Clerk — this is supplemental, Clerk owns auth) ==========
model User {
  id              String   @id @default(cuid())
  clerkId         String   @unique
  email           String?
  name            String?
  subscriptionTier String  @default("free") // free | yearly | sbc
  stripeCustomerId String? @unique
  stripeSubId     String?
  sbcMemberEmail  String?
  simsUsedToday   Int      @default(0)
  lastSimDate     DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  sessions        DesignSession[]
  scoreResults    ScoreResult[]
}

// ========== PROBLEMS ==========
model Problem {
  id              Int      @id @default(autoincrement())
  title           String
  slug            String   @unique
  difficulty      String   // easy | medium | hard
  tags            String[] // hashing, caching, etc.
  brief           String   // Full problem description
  requirements    String   // Markdown list
  keyConsiderations String
  referenceArchitecture Json? // Textual flow layout
  order           Int
  isPublic        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  sessions        DesignSession[]
}

// ========== DESIGN SESSIONS ==========
model DesignSession {
  id              Int      @id @default(autoincrement())
  userId          String?
  problemId       Int
  sessionUuid     String   @unique @default(cuid())
  status          String   @default("in_progress") // in_progress | completed
  speedSetting    Float    @default(1.0)
  trafficSetting  Float    @default(1.0)
  readWriteRatio  Float    @default(0.92)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  user            User?        @relation(fields: [userId], references: [id])
  problem         Problem      @relation(fields: [problemId], references: [id])
  nodes           CanvasNode[]
  chaosLogs       ChaosLog[]
  scoreResults    ScoreResult[]
}

// ========== CANVAS NODES ==========
model CanvasNode {
  id              Int      @id @default(autoincrement())
  sessionId       Int
  nodeUuid        String   @unique
  componentType   String   // "Client", "Load Balancer", "SQL Database", etc.
  label           String?
  x               Float
  y               Float
  replicas        Int      @default(1)
  implementationNotes String?
  isDisabled      Boolean  @default(false)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  session         DesignSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  sourceEdges     CanvasEdge[]  @relation("sourceNode")
  targetEdges     CanvasEdge[]  @relation("targetNode")
}

// ========== CANVAS EDGES ==========
model CanvasEdge {
  id              Int      @id @default(autoincrement())
  sessionId       Int
  edgeUuid        String   @unique
  sourceNodeId    Int
  targetNodeId    Int
  label           String?  // e.g., "HTTP", "gRPC", "async"
  style           String?  // solid | dashed
  createdAt       DateTime @default(now())

  sourceNode      CanvasNode @relation("sourceNode", fields: [sourceNodeId], references: [id], onDelete: Cascade)
  targetNode      CanvasNode @relation("targetNode", fields: [targetNodeId], references: [id], onDelete: Cascade)
  session         DesignSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
}

// ========== CHAOS EVENTS LOG ==========
model ChaosLog {
  id              Int      @id @default(autoincrement())
  sessionId       Int
  chaosEventId    String   // e.g., "availability-zone", "cache-stampede"
  targetNodeId    Int?     // null = global event
  timestamp       DateTime @default(now())
  result          Json?    // simulation outcome data

  session         DesignSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  targetNode      CanvasNode?   @relation(fields: [targetNodeId], references: [id])
}

// ========== SCORE RESULTS (AI JUDGING) ==========
model ScoreResult {
  id              Int      @id @default(autoincrement())
  sessionId       Int
  userId          String?
  judgeRigorScore   Int?
  judgePragmatismScore Int?
  consensusVerdict String?  // pass | fail | borderline
  writtenFeedback  String?  // Markdown
  debateSummary    String?  // Summary of judge debate
  modelUsed        String   // model name used for judging
  createdAt        DateTime @default(now())

  session         DesignSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  user            User?        @relation(fields: [userId], references: [id])
}

// ========== ARTICLES (Learning Library) ==========
model Article {
  id              Int      @id @default(autoincrement())
  title           String
  slug            String   @unique
  category        String   // foundations | feeds-storage | realtime-geo
  summary         String
  content         String   // Markdown
  featured        Boolean  @default(false)
  relatedProblemIds Int[]   // references to Problem IDs
  order           Int
  isPublished     Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

---

## Directory Structure

```
app/
├── (marketing)/          # Public landing pages
│   ├── page.tsx          # Hero, how it works, pricing
│   ├── layout.tsx
│   ├── learn/            # Learning library
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   └── problems/         # Problem library (gated)
│       ├── page.tsx
│       └── [id]/page.tsx
├── (dashboard)/          # Authenticated area
│   ├── dashboard/
│   │   └── page.tsx
│   ├── session/
│   │   └── [uuid]/page.tsx   # The main playground
│   └── settings/
│       └── page.tsx
├── sign-in/              # Clerk auth pages
│   └── [[...sign-in]]/page.tsx
├── sign-up/
│   └── [[...sign-up]]/page.tsx
└── api/                  # Route Handlers
    ├── sessions/
    │   ├── [uuid]/
    │   │   ├── route.ts          # GET/PUT session
    │   │   ├── nodes/route.ts    # CRUD canvas nodes
    │   │   └── edges/route.ts    # CRUD canvas edges
    │   └── route.ts              # POST create session
    ├── chaos/
    │   └── [sessionUuid]/route.ts
    ├── scoring/
    │   └── route.ts              # POST trigger AI judge
    ├── subscriptions/
    │   └── webhook/route.ts      # Stripe webhooks
    └── users/
        └── route.ts

components/
├── canvas/
│   ├── Canvas.tsx               # React Flow wrapper
│   ├── SystemNode.tsx           # Custom node renderer
│   ├── ComponentPalette.tsx     # Left sidebar
│   ├── CanvasToolbar.tsx        # Zoom, fit, map controls
│   ├── NodeDetailSheet.tsx      # Implementation notes panel
│   └── Minimap.tsx
├── chaos/
│   ├── ChaosTab.tsx
│   ├── ChaosEventButton.tsx
│   └── ChaosResult.tsx
├── session/
│   ├── SessionHeader.tsx        # Problem title, sliders, sim controls
│   ├── SpeedSlider.tsx
│   ├── TrafficSlider.tsx
│   ├── ReadWriteSlider.tsx
│   └── SimStatusBadge.tsx
├── ai-judges/
│   ├── JudgesPanel.tsx
│   ├── JudgeCard.tsx
│   ├── ConsensusBadge.tsx
│   └── FeedbackMarkdown.tsx
├── problems/
│   ├── ProblemCard.tsx
│   ├── ProblemFilter.tsx
│   └── ProblemBrief.tsx
├── learn/
│   ├── ArticleCard.tsx
│   └── ArticleContent.tsx
├── pricing/
│   ├── PricingCard.tsx
│   └── UpgradeCTA.tsx
└── shared/
    ├── Header.tsx
    ├── Footer.tsx
    └── NotificationsBell.tsx

lib/
├── prisma/
│   ├── schema.prisma
│   ├── client.ts
│   └── seed.ts          # Seed problems, articles
├── canvas/
│   ├── components.ts     # 44 component definitions + metadata
│   ├── defaults.ts       # Default node positions
│   └── validation.ts     # Validate architecture completeness
├── chaos/
│   ├── events.ts         # 30 event definitions
│   └── simulate.ts       # Chaos simulation engine
├── scoring/
│   ├── judge-rules.ts    # Rigor vs Pragmatism prompts
│   ├── openrouter.ts     # OpenRouter client
│   └── consensus.ts      # Merge judge outputs
├── stripe/
│   ├── client.ts
│   ├── plans.ts
│   └── webhooks.ts
├── clerk/
│   └── middleware.ts
├── utils/
│   ├── cn.ts
│   └── rate-limit.ts
└── constants.ts
```

---

## Phase Breakdown

### Phase 0: Project Scaffold & Infra (2-3 days)

**Tasks:**

- [ ] 0.1 Initialize Next.js 16 project with TypeScript, `--turbopack`, App Router
- [ ] 0.2 Install and configure Tailwind CSS v4 + shadcn/ui with custom dark theme
  - Dark theme palette: bg `#0a0a0f`, card bg `#1a1a2e`, accent blue `#3b82f6`
  - Fonts: Inter (UI), IBM Plex Mono (code/monospace), Space Grotesk (headings)
- [ ] 0.3 Set up Prisma + PostgreSQL (local Docker Compose + production RDS/Neon)
- [ ] 0.4 Write and run initial migration for the full schema above
- [ ] 0.5 Write seed script for:
  - 5+ problems with full mock data
  - 27 articles across 3 categories
- [ ] 0.6 Configure Clerk authentication (sign-in, sign-up, webhooks)
- [ ] 0.7 Set up OpenRouter SDK wrapper in `/lib/scoring/openrouter.ts`
- [ ] 0.8 Configure Stripe (products, prices, webhook endpoint)
- [ ] 0.9 Set up Vercel project, environment variables, CI (GitHub Actions for lint+test)
- [ ] 0.10 Write `.env.example` with all required env vars documented

### Phase 1: Authentication & User Management (1-2 days)

**Tasks:**

- [ ] 1.1 Clerk sign-up/sign-in pages (app router `[[...sign-in]]`)
- [ ] 1.2 Clerk webhook handler to sync user to Prisma on create/update
- [ ] 1.3 Middleware for protected routes (`/dashboard/*`, `/session/*`)
- [ ] 1.4 User dropdown in header (avatar, sign out, settings link)
- [ ] 1.5 User tier check helper (free vs yearly vs sbc)
- [ ] 1.6 Daily sim counter reset logic (`/lib/utils/rate-limit.ts`)

### Phase 2: Landing & Marketing Pages (2-3 days)

**Tasks:**

- [ ] 2.1 **Hero Section** — heading, subtext, CTA "Get started", demo placeholder
- [ ] 2.2 **How it works** — 3-step numbered explainer (Choose → Design → Score)
- [ ] 2.3 **Problem preview cards** — Show 3-4 featured problems with difficulty/tags
- [ ] 2.4 **Pricing section** — Free / Yearly ($49) / Stupid Button Club tier cards
- [ ] 2.5 **Learning library callout** — Link to /learn with featured articles
- [ ] 2.6 **Header** — Logo, Learn link, Problems link, Get Started / Sign In buttons
- [ ] 2.7 **Footer** — Copyright, attribution
- [ ] 2.8 **Replit Feedback Widget** — (the PRD showed one — can implement as optional)
- [ ] 2.9 Responsive design pass for all marketing pages

### Phase 3: Problem Library (3-4 days)

**Tasks:**

- [ ] 3.1 `/problems` page — list all problems from DB
- [ ] 3.2 **Difficulty filter tabs**: All / Easy / Medium / Hard
- [ ] 3.3 **Search bar** — filter problems by title/tags client-side
- [ ] 3.4 `ProblemCard` component — difficulty badge, title, tags, brief description, "Attempt" button
- [ ] 3.5 `/problems/[id]` problem brief page
  - Problem #, title, difficulty, tags
  - Full requirements (formatted markdown)
  - Key considerations
  - **Learn Before Solving** section — links to relevant articles (dynamically from `relatedProblems` in DB)
  - **Reference Architecture** display (rendered as flow steps)
  - "Start" / "Start New Session" buttons (creates session and redirects to playground)
- [ ] 3.6 `ReferenceArchitecture` component — renders the stored JSON flow as a visual/readable diagram

### Phase 4: Playground — Canvas (7-10 days — the core feature)

**Tasks:**

#### 4.1 Session Shell
- [ ] 4.1.1 `session/[uuid]/page.tsx` — Main playground layout with tabs
- [ ] 4.1.2 `SessionHeader` — Problem title, status badge, simulation controls
- [ ] 4.1.3 Load session data from API on mount (nodes, edges, settings)
- [ ] 4.1.4 Auto-save session state every 10 seconds via PUT API

#### 4.2 Sliders & Sim Controls
- [ ] 4.2.1 `SpeedSlider` — role="slider", range 0-5, default 1, shows "Speed X×"
- [ ] 4.2.2 `TrafficSlider` — range 0-5, default 1, shows "Traffic X×"
- [ ] 4.2.3 `ReadWriteSlider` — range 0-1, default per-problem (0.92 for URL Shortener)
- [ ] 4.2.4 Sims counter badge — "X/1 sims today"
- [ ] 4.2.5 Start/Stop simulation button — toggles status, tracks daily usage

#### 4.3 React Flow Canvas
- [ ] 4.3.1 Initialize React Flow instance with custom node types
- [ ] 4.3.2 `SystemNode` custom component — handles left/right connection handles, label, replica controls, implementation notes icon
- [ ] 4.3.3 Node visual: blue border (2px), semi-transparent bg, min-width 110px, monospace label
- [ ] 4.3.4 Connection validation: only allow source→target connections
- [ ] 4.3.5 Edge rendering: solid/dashed lines between handles
- [ ] 4.3.6 Node drag & select (React Flow built-in)
- [ ] 4.3.7 Multi-node selection via shift+click or box select

#### 4.4 Component Palette
- [ ] 4.4.1 `ComponentPalette` sidebar with 44 components across categories
- [ ] 4.4.2 **Category accordions**: Client, Traffic & Edge, Compute, Storage, Messaging, Observability, Network, AI & Agents, External
- [ ] 4.4.3 Search filter textbox — dynamic filtering
- [ ] 4.4.4 Minimize/maximize toggle
- [ ] 4.4.5 "+" button per component — adds node to canvas at default position
- [ ] 4.4.6 Drag-to-add from palette to canvas (drag from palette, drop on canvas)
- [ ] 4.4.7 All 44 component definitions in `/lib/canvas/components.ts` (labels, descriptions, default colors, icon references)

#### 4.5 Node Controls
- [ ] 4.5.1 **Replica count** (+/- buttons per node), min=1, disabled at min
- [ ] 4.5.2 **Implementation notes** — text input, redirects to sign-in if not authenticated; saves to DB if signed in
- [ ] 4.5.3 **Delete node** — backspace/delete key when selected, or context menu
- [ ] 4.5.4 **Node enable/disable** toggle (shown but disabled in free tier — shown as disabled button per PRD)
- [ ] 4.5.5 **Node tooltip** — shows component description on hover

#### 4.6 Canvas Toolbar
- [ ] 4.6.1 Zoom in/out buttons (with React Flow controls)
- [ ] 4.6.2 Fit view button
- [ ] 4.6.3 Toggle interactivity (lock/unlock canvas)
- [ ] 4.6.4 **Map toggle** — show/hide minimap
- [ ] 4.6.5 **Live Metrics** button — visible when simulation is active
- [ ] 4.6.6 **Quick Chaos** button — one-click random chaos event

#### 4.7 Tutorial
- [ ] 4.7.1 "Start tutorial" button — launches guided overlay
- [ ] 4.7.2 Step-by-step walkthrough: add component → connect → adjust replicas → run sim → score

#### 4.8 Backend APIs
- [ ] 4.8.1 `POST /api/sessions` — create new session with problem ID
- [ ] 4.8.2 `GET /api/sessions/[uuid]` — full session data (nodes, edges, settings)
- [ ] 4.8.3 `PUT /api/sessions/[uuid]` — update session settings (sliders)
- [ ] 4.8.4 `POST /api/sessions/[uuid]/nodes` — bulk upsert nodes
- [ ] 4.8.5 `POST /api/sessions/[uuid]/edges` — bulk upsert edges
- [ ] 4.8.6 `DELETE /api/sessions/[uuid]/nodes/[nodeUuid]` — delete node
- [ ] 4.8.7 `PUT /api/sessions/[uuid]/sim` — update sim status (start/stop)

### Phase 5: Chaos Engineering Tab (3-4 days)

**Tasks:**

- [ ] 5.1 ChaosTab component with category sections
- [ ] 5.2 **30 chaos event definitions** in `/lib/chaos/events.ts`:
  - Infrastructure (10): AZ offline, data center outage, instance crash/slow, disk failure/corruption, IOPS throttle, file system, VM CPU, host hardware
  - Network (11): partition, cross-region loss, packet loss, high latency, bandwidth throttle, connection flap, LB degradation, backend port, health check fail, TLS cert fail, DNS fail
  - Application (8): memory leak, OOM, thread pool exhaustion, deadlock, cache stampede, error storm, CPU spike
  - Global (1): traffic surge ×3 RPS
- [ ] 5.3 `ChaosEventButton` — emoji icon + title + description, clickable
- [ ] 5.4 **Target node selector** — pick a component node for targeted failure; "none selected" means global
- [ ] 5.5 "Start Simulation" button — triggers the chosen chaos event
- [ ] 5.6 **Chaos simulation engine** (`/lib/chaos/simulate.ts`):
  - Calculates impact on system based on node types, connections, replicas
  - Returns simulated outcomes: latency impact, error rate, throughput reduction
  - Visualizes on-canvas: greyed-out/degraded nodes, broken connections
- [ ] 5.7 Chaos result display — timeline of events and their effects

### Phase 6: AI Judging System (3-5 days)

**Tasks:**

- [ ] 6.1 **Architecture serialization** — convert canvas state to structured text for LLM input:
  - List of nodes with types, labels, replicas, implementation notes
  - List of edges with source→target direction
  - Simulation settings (speed, traffic, R/W ratio)
- [ ] 6.2 **Rigor Judge prompt** (`/lib/scoring/judge-rules.ts`):
  - Strict academic evaluation: depth analysis, consistency, trade-offs, failures
  - Outputs: score (0-100), strengths, weaknesses, specific improvement items
- [ ] 6.3 **Pragmatism Judge prompt**:
  - Industry practitioner lens: feasibility, cost, simplicity, operational reality
  - Outputs: score (0-100), "what works", "what's over-engineered", practical fixes
- [ ] 6.4 **OpenRouter integration**: call both judges in parallel via OpenRouter
- [ ] 6.5 **Consensus engine** (`/lib/scoring/consensus.ts`):
  - Merge both judge outputs
  - Generate verdict: pass (≥70 avg) / borderline (50-69) / fail (<50)
  - Synthesize debate summary highlighting disagreements
  - Produce final written feedback combining both perspectives
- [ ] 6.6 `POST /api/scoring` — trigger judging for a session (checks auth + tier)
- [ ] 6.7 `JudgesPanel` component — shows judge cards with scores, loading state
- [ ] 6.8 `JudgeCard` — judge name (Rigor/Pragmatism), score badge, key points
- [ ] 6.9 `ConsensusBadge` — pass/fail/borderline with color coding
- [ ] 6.10 `FeedbackMarkdown` — rendered written feedback with suggestions
- [ ] 6.11 **Tier gating**: free tier = qualitative feedback only; paid tier = numeric scores + verdict
- [ ] 6.12 Save `ScoreResult` to DB, display in session history

### Phase 7: Mermaid Tab (1-2 days — premium feature)

**Tasks:**

- [ ] 7.1 MermaidTab component with paywall state
- [ ] 7.2 Premium gate — show upgrade card if not on yearly/sbc tier
- [ ] 7.3 CodeMirror or Monaco editor for Mermaid syntax editing
- [ ] 7.4 **Bidirectional sync** (advanced): Mermaid ↔ Canvas sync via intermediate representation
  - Canvas → Mermaid: serialize nodes/edges to Mermaid `graph TD` syntax
  - Mermaid → Canvas: parse Mermaid, create/update canvas elements
- [ ] 7.5 Mermaid preview panel (rendered diagram)
- [ ] 7.6 "Unlock Mermaid" link to `/upgrade`

### Phase 8: Learning Library (2-3 days)

**Tasks:**

- [ ] 8.1 `/learn` page — grid of 27 articles, categorized by Foundations / Feeds & Storage / Realtime & Geo
- [ ] 8.2 Search learning topics textbox
- [ ] 8.3 Featured articles section (editable via `featured` flag in DB)
- [ ] 8.4 `ArticleCard` — category badge, title, summary, related problem tags
- [ ] 8.5 `/learn/[slug]` article page — full rendered markdown
- [ ] 8.6 Suggested path card: "Start with Structure → Study concept → Run a session"
- [ ] 8.7 Related problems section — links to practice specific problems
- [ ] 8.8 "Practice in Arena" CTA at bottom of each article

### Phase 9: User Dashboard & Progress (2-3 days)

**Tasks:**

- [ ] 9.1 `/dashboard` page — authenticated user's home
- [ ] 9.2 **Stats overview**: total sessions, problems attempted, AI scores history
- [ ] 9.3 **Recent sessions** list — problem title, date, status, score
- [ ] 9.4 **Subscription card** — current tier, upgrade/downgrade options
- [ ] 9.5 **Sim usage meter** — "X/1 sims used today"
- [ ] 9.6 **Score history chart** — average scores over time per problem type
- [ ] 9.7 **Settings page** (/settings): account info, notification prefs, delete account

### Phase 10: Subscriptions & Payments (2-3 days)

**Tasks:**

- [ ] 10.1 Stripe product/price configuration (Yearly $49/year)
- [ ] 10.2 **Stripe checkout flow** — redirect to Stripe, return to dashboard
- [ ] 10.3 **Stripe webhook handler** — subscribe, cancel, renew events
- [ ] 10.4 Stupid Button Club integration — manual approval flow (admin marks user as sbc)
- [ ] 10.5 Tier-gating logic throughout the app:
  - Free: canvas, 1 sim/day, 27 articles, all problems (no AI scoring)
  - Yearly: +AI scores, verdict, mermaid editor
  - SBC: same as yearly
- [ ] 10.6 Pricing page with tier comparison table

### Phase 11: Notifications System (1 day)

**Tasks:**

- [ ] 11.1 `NotificationsBell` component with F8 keyboard shortcut
- [ ] 11.2 Toast notifications for: score ready, sim limit reached, subscription events
- [ ] 11.3 Notification history stored in DB (or in-app alert queue)
- [ ] 11.4 Real-time notification via polling or WebSocket when score is ready

### Phase 12: Polish & QA (3-4 days)

**Tasks:**

- [ ] 12.1 **Responsive design** — test and fix layout at 768px, 1024px, 1440px+
- [ ] 12.2 **Keyboard navigation** — tab order, aria labels, focus management
- [ ] 12.3 **Error boundaries** — graceful fallback for canvas, chaos, scoring
- [ ] 12.4 **Loading states** — skeleton screens for problem list, session load, scoring
- [ ] 12.5 **Empty states** — canvas with no components, no sessions yet, no scores yet
- [ ] 12.6 **Toast system** for success/error feedback after mutations
- [ ] 12.7 **Performance** — React Flow node memoization, canvas lazy loading
- [ ] 12.8 **E2E tests** (Playwright):
  - User sign up and start a session
  - Add components, connect them
  - Run simulation
  - Trigger AI scoring
  - Upgrade subscription flow

---

## 44 Component Definitions (for `/lib/canvas/components.ts`)

```typescript
export interface ComponentDef {
  type: string;
  category: ComponentCategory;
  label: string;
  description: string;
  defaultColor: string;
  icon?: string;
}

export type ComponentCategory =
  | 'client'
  | 'traffic-edge'
  | 'compute'
  | 'storage'
  | 'messaging'
  | 'observability'
  | 'network'
  | 'ai-agents'
  | 'external';

export const COMPONENT_DEFS: ComponentDef[] = [
  // Client
  { type: 'Client', category: 'client', label: 'Client', description: "A user's web browser — where requests originate. Generates the read and write traffic your system must handle.", defaultColor: '#3b82f6' },
  { type: 'Mobile', category: 'client', label: 'Mobile', description: 'A mobile app client. Like the web client, it is a source of user traffic into your system.', defaultColor: '#3b82f6' },
  // Traffic & Edge
  { type: 'DNS', category: 'traffic-edge', label: 'DNS', description: 'Resolves your domain name to a server address — the first lookup before any request reaches you.', defaultColor: '#8b5cf6' },
  { type: 'CDN', category: 'traffic-edge', label: 'CDN', description: 'Caches static files (images, JS, CSS) close to users for fast delivery and far less load on your origin.', defaultColor: '#8b5cf6' },
  { type: 'Load Balancer', category: 'traffic-edge', label: 'Load Balancer', description: 'Spreads incoming requests across many servers so no single one gets overwhelmed.', defaultColor: '#8b5cf6' },
  { type: 'WAF', category: 'traffic-edge', label: 'WAF', description: 'Web Application Firewall — blocks malicious traffic (attacks, bots) before it reaches your app.', defaultColor: '#8b5cf6' },
  { type: 'API Gateway', category: 'traffic-edge', label: 'API Gateway', description: 'A single front door for client requests: routing, authentication, and rate limiting in one place.', defaultColor: '#8b5cf6' },
  { type: 'Ingress', category: 'traffic-edge', label: 'Ingress', description: 'Cluster entry point that routes external traffic to the right internal service.', defaultColor: '#8b5cf6' },
  // Compute
  { type: 'App Server', category: 'compute', label: 'App Server', description: 'Runs your application logic — handles requests and talks to databases, caches, and queues.', defaultColor: '#10b981' },
  { type: 'Worker', category: 'compute', label: 'Worker', description: 'Processes background jobs off the request path (sending emails, resizing images, etc.).', defaultColor: '#10b981' },
  { type: 'Serverless', category: 'compute', label: 'Serverless', description: 'On-demand functions that scale automatically per request, with no servers to manage.', defaultColor: '#10b981' },
  { type: 'Auth Service', category: 'compute', label: 'Auth Service', description: 'Handles login, tokens, and permissions — verifies who the user is and what they can do.', defaultColor: '#10b981' },
  { type: 'Search', category: 'compute', label: 'Search', description: 'A search index (e.g. Elasticsearch) for fast full-text queries over large datasets.', defaultColor: '#10b981' },
  { type: 'Scheduler', category: 'compute', label: 'Scheduler', description: 'Triggers recurring or delayed jobs (cron-like) for background work.', defaultColor: '#10b981' },
  { type: 'Notifications', category: 'compute', label: 'Notifications', description: 'Sends push, SMS, or in-app alerts out to users.', defaultColor: '#10b981' },
  { type: 'Analytics', category: 'compute', label: 'Analytics', description: 'Collects and processes usage events to produce metrics and insights.', defaultColor: '#10b981' },
  // Storage
  { type: 'SQL Database', category: 'storage', label: 'SQL Database', description: 'Relational store for structured data with strong consistency (e.g. Postgres). Every write must land here — it cannot be cached away.', defaultColor: '#f59e0b' },
  { type: 'NoSQL DB', category: 'storage', label: 'NoSQL DB', description: 'Flexible, horizontally-scalable store for large or semi-structured data (e.g. MongoDB, Cassandra).', defaultColor: '#f59e0b' },
  { type: 'Cache', category: 'storage', label: 'Cache', description: 'In-memory store (e.g. Redis) that serves repeated READS fast, taking load off the database. It does NOT help writes.', defaultColor: '#f59e0b' },
  { type: 'Object Store', category: 'storage', label: 'Object Store', description: 'Stores large files and blobs like images and videos (e.g. S3).', defaultColor: '#f59e0b' },
  { type: 'Data Warehouse', category: 'storage', label: 'Data Warehouse', description: 'Holds huge volumes of historical data for analytics queries — not live user traffic.', defaultColor: '#f59e0b' },
  { type: 'Vector DB', category: 'storage', label: 'Vector DB', description: 'Stores embeddings for similarity search — powers AI and semantic-search features.', defaultColor: '#f59e0b' },
  // Messaging
  { type: 'Message Queue', category: 'messaging', label: 'Message Queue', description: 'Buffers work between services so producers and consumers can run at their own pace (e.g. SQS). Great for absorbing write bursts.', defaultColor: '#ec4899' },
  { type: 'Pub/Sub', category: 'messaging', label: 'Pub/Sub', description: 'Broadcasts each event to many subscribers at once — decouples senders from receivers.', defaultColor: '#ec4899' },
  { type: 'Event Stream', category: 'messaging', label: 'Event Stream', description: 'An ordered, replayable log of events that multiple consumers can read independently.', defaultColor: '#ec4899' },
  { type: 'Kafka', category: 'messaging', label: 'Kafka', description: 'High-throughput event log built to ingest and distribute massive write streams.', defaultColor: '#ec4899' },
  // Observability
  { type: 'Metrics', category: 'observability', label: 'Metrics', description: 'Numeric time-series (latency, error rate, throughput) for monitoring system health.', defaultColor: '#6366f1' },
  { type: 'Logs', category: 'observability', label: 'Logs', description: 'Recorded events and messages used for debugging and auditing.', defaultColor: '#6366f1' },
  { type: 'Tracing', category: 'observability', label: 'Tracing', description: 'Follows a single request across services to show where time is spent.', defaultColor: '#6366f1' },
  { type: 'Alerting', category: 'observability', label: 'Alerting', description: 'Notifies your team when a metric crosses a dangerous threshold.', defaultColor: '#6366f1' },
  { type: 'Health Check', category: 'observability', label: 'Health Check', description: 'Periodically probes services so unhealthy ones can be restarted or pulled from rotation.', defaultColor: '#6366f1' },
  // Network
  { type: 'VPC', category: 'network', label: 'VPC', description: 'An isolated private network that contains your cloud resources.', defaultColor: '#14b8a6' },
  { type: 'Subnet', category: 'network', label: 'Subnet', description: 'A segment of a VPC used to group and isolate resources.', defaultColor: '#14b8a6' },
  { type: 'NAT Gateway', category: 'network', label: 'NAT Gateway', description: 'Lets private resources reach the internet without being publicly exposed.', defaultColor: '#14b8a6' },
  { type: 'VPN', category: 'network', label: 'VPN', description: 'An encrypted tunnel for secure access between networks.', defaultColor: '#14b8a6' },
  { type: 'Service Mesh', category: 'network', label: 'Service Mesh', description: 'Manages service-to-service traffic: routing, retries, security, and observability.', defaultColor: '#14b8a6' },
  // AI & Agents
  { type: 'LLM Gateway', category: 'ai-agents', label: 'LLM Gateway', description: 'Routes and manages requests to large language models, with caching and rate limits.', defaultColor: '#a855f7' },
  { type: 'Orchestrator', category: 'ai-agents', label: 'Orchestrator', description: 'Coordinates multi-step AI agent workflows and tool calls.', defaultColor: '#a855f7' },
  { type: 'Tool Registry', category: 'ai-agents', label: 'Tool Registry', description: 'A catalog of tools and functions an AI agent is allowed to call.', defaultColor: '#a855f7' },
  { type: 'Memory Fabric', category: 'ai-agents', label: 'Memory Fabric', description: 'Stores an agent long-term memory and context for later retrieval.', defaultColor: '#a855f7' },
  { type: 'Safety Mesh', category: 'ai-agents', label: 'Safety Mesh', description: 'Filters and guards AI inputs and outputs for safety and policy compliance.', defaultColor: '#a855f7' },
  // External
  { type: '3rd Party API', category: 'external', label: '3rd Party API', description: 'An external service you depend on — outside your control, so it can be slow or fail.', defaultColor: '#6b7280' },
  { type: 'Payment', category: 'external', label: 'Payment', description: 'An external payment processor (e.g. Stripe) that handles transactions.', defaultColor: '#6b7280' },
  { type: 'Email', category: 'external', label: 'Email', description: 'An external email delivery provider (e.g. SendGrid).', defaultColor: '#6b7280' },
];
```

---

## 30 Chaos Event Definitions (for `/lib/chaos/events.ts`)

```typescript
export interface ChaosEvent {
  id: string;
  category: 'infrastructure' | 'network' | 'application' | 'global';
  emoji: string;
  title: string;
  description: string;
  scope: 'targeted' | 'global';
  effects: {
    latencyMultiplier?: number;
    errorRateIncrease?: number;
    throughputReduction?: number;
    capacityLoss?: number;
  };
}

export const CHAOS_EVENTS: ChaosEvent[] = [
  // Infrastructure Failures
  { id: 'az-outage', category: 'infrastructure', emoji: '🏚️', title: 'Availability Zone', description: 'An entire AZ goes offline — every tier loses about half its capacity.', scope: 'targeted', effects: { capacityLoss: 0.5 } },
  { id: 'data-center-outage', category: 'infrastructure', emoji: '🔥', title: 'Data Center', description: 'A data center outage cripples capacity across the whole fleet.', scope: 'targeted', effects: { capacityLoss: 0.7 } },
  { id: 'instance-crash', category: 'infrastructure', emoji: '💥', title: 'Instance Crash', description: 'The instance crashes and stops serving traffic.', scope: 'targeted', effects: { capacityLoss: 1.0 } },
  { id: 'instance-slow', category: 'infrastructure', emoji: '🐢', title: 'Instance Slow', description: 'A degraded instance responds far slower.', scope: 'targeted', effects: { latencyMultiplier: 5, throughputReduction: 0.5 } },
  { id: 'disk-failure', category: 'infrastructure', emoji: '💽', title: 'Disk Failure', description: 'Disk failure causes errors and reduced throughput.', scope: 'targeted', effects: { errorRateIncrease: 0.3, throughputReduction: 0.4 } },
  { id: 'disk-corruption', category: 'infrastructure', emoji: '🧟', title: 'Disk Corruption', description: 'Corrupted data drives a spike in errors.', scope: 'targeted', effects: { errorRateIncrease: 0.6 } },
  { id: 'storage-iops', category: 'infrastructure', emoji: '📉', title: 'Storage IOPS', description: 'IOPS throttling slows the node and cuts capacity.', scope: 'targeted', effects: { latencyMultiplier: 3, throughputReduction: 0.3 } },
  { id: 'file-system', category: 'infrastructure', emoji: '🗂️', title: 'File System', description: 'File system trouble adds latency and errors.', scope: 'targeted', effects: { latencyMultiplier: 2, errorRateIncrease: 0.1 } },
  { id: 'vm-cpu', category: 'infrastructure', emoji: '🌡️', title: 'VM CPU', description: 'CPU starvation halves capacity and slows responses.', scope: 'targeted', effects: { throughputReduction: 0.5, latencyMultiplier: 3 } },
  { id: 'host-hardware', category: 'infrastructure', emoji: '🔌', title: 'Host Hardware', description: 'Host hardware failure takes the node down.', scope: 'targeted', effects: { capacityLoss: 1.0 } },
  // Network Chaos
  { id: 'network-partition', category: 'network', emoji: '✂️', title: 'Network Partition', description: 'A partition drops most connections to the node.', scope: 'targeted', effects: { throughputReduction: 0.8, errorRateIncrease: 0.5 } },
  { id: 'cross-region-loss', category: 'network', emoji: '🌐', title: 'Cross-Region Loss', description: 'Cross-region packet loss adds drops and latency.', scope: 'targeted', effects: { latencyMultiplier: 4, errorRateIncrease: 0.2 } },
  { id: 'packet-loss', category: 'network', emoji: '📦', title: 'Packet Loss', description: 'Random packet loss degrades throughput.', scope: 'targeted', effects: { throughputReduction: 0.3, errorRateIncrease: 0.15 } },
  { id: 'high-latency', category: 'network', emoji: '🕰️', title: 'High Latency', description: 'Network latency balloons response times.', scope: 'targeted', effects: { latencyMultiplier: 10 } },
  { id: 'bandwidth-throttle', category: 'network', emoji: '🚰', title: 'Bandwidth Throttle', description: 'Throttled bandwidth caps capacity and adds latency.', scope: 'targeted', effects: { throughputReduction: 0.5, latencyMultiplier: 2 } },
  { id: 'connection-flap', category: 'network', emoji: '🔁', title: 'Connection Flap', description: 'Flapping connections drop a chunk of traffic.', scope: 'targeted', effects: { throughputReduction: 0.4, errorRateIncrease: 0.3 } },
  { id: 'lb-degradation', category: 'network', emoji: '⚖️', title: 'Load Balancer', description: 'LB degradation cuts capacity and drops requests.', scope: 'targeted', effects: { throughputReduction: 0.5, errorRateIncrease: 0.2 } },
  { id: 'backend-port', category: 'network', emoji: '🚪', title: 'Backend Port', description: 'A closed backend port refuses connections.', scope: 'targeted', effects: { errorRateIncrease: 0.7 } },
  { id: 'health-check-fail', category: 'network', emoji: '🩺', title: 'Health Check', description: 'Failing health checks pull the node from rotation.', scope: 'targeted', effects: { capacityLoss: 0.3 } },
  { id: 'tls-certificate', category: 'network', emoji: '🔐', title: 'TLS Certificate', description: 'An invalid TLS cert breaks secure connections.', scope: 'targeted', effects: { errorRateIncrease: 0.9 } },
  { id: 'dns-resolution', category: 'network', emoji: '🧭', title: 'DNS Resolution', description: 'DNS resolution failures drop and slow traffic.', scope: 'targeted', effects: { errorRateIncrease: 0.3, latencyMultiplier: 3 } },
  // Application-Level Chaos
  { id: 'memory-leak', category: 'application', emoji: '🩸', title: 'Memory Leak', description: 'A leak slowly starves the node of capacity.', scope: 'targeted', effects: { throughputReduction: 0.6 } },
  { id: 'out-of-memory', category: 'application', emoji: '🧠', title: 'Out of Memory', description: 'The process is OOM-killed and goes down.', scope: 'targeted', effects: { capacityLoss: 1.0 } },
  { id: 'thread-pool', category: 'application', emoji: '🧵', title: 'Thread Pool', description: 'Thread pool exhaustion cuts capacity and slows.', scope: 'targeted', effects: { throughputReduction: 0.6, latencyMultiplier: 4 } },
  { id: 'deadlock', category: 'application', emoji: '🔒', title: 'Deadlock', description: 'A deadlock stalls requests and raises errors.', scope: 'targeted', effects: { errorRateIncrease: 0.5, latencyMultiplier: 8 } },
  { id: 'cache-stampede', category: 'application', emoji: '🐂', title: 'Cache Stampede', description: "Hot keys expire at once — the cache's hit rate collapses and misses flood the origin.", scope: 'targeted', effects: { latencyMultiplier: 6, errorRateIncrease: 0.2 } },
  { id: 'error-storm', category: 'application', emoji: '⛈️', title: 'Error Storm', description: "An error storm spikes the node's error rate.", scope: 'targeted', effects: { errorRateIncrease: 0.7 } },
  { id: 'cpu-spike', category: 'application', emoji: '📈', title: 'CPU Spike', description: 'A CPU spike chokes capacity and slows responses.', scope: 'targeted', effects: { throughputReduction: 0.4, latencyMultiplier: 3 } },
  // Global Events
  { id: 'traffic-surge', category: 'global', emoji: '🌊', title: 'Traffic Surge', description: 'A global traffic surge multiplies inbound RPS 3×.', scope: 'global', effects: { throughputReduction: 0.0, latencyMultiplier: 2 } },
];
```

---

## Implementation Order (Recommended)

```
Week 1:  Phases 0 + 1 + 2     (Scaffold, Auth, Landing)
Week 2:  Phase 3 + 4.1-4.3    (Problems, Canvas shell)
Week 3:  Phase 4.4-4.8        (Palette, Nodes, APIs)
Week 4:  Phase 5              (Chaos)
Week 5:  Phase 6              (AI Judging)
Week 6:  Phase 7 + 8          (Mermaid, Learning Library)
Week 7:  Phase 9 + 10         (Dashboard, Subscriptions)
Week 8:  Phase 11 + 12        (Notifications, Polish, QA)
```

---

## Open Questions & Risks

1. **Simulation engine depth** — The PRDs simulation (speed/traffic/RW sliders) is a visual placeholder in the current site. The actual computational simulation (tracking latency, errors, throughput per node) needs to be designed. For MVP, approximate effects based on node types and chaos events rather than a full discrete event simulator.

2. **AI judging cost** — Each score request hits OpenRouter twice (two judges). At say $0.01/call, 1000 users × 3 scores = $60/day. Budget accordingly. Consider a daily per-user cap.

3. **Canvas performance** — React Flow with 44+ component types and 20+ nodes can get slow. Memoize node components, use `react-flow`'s built-in virtualization if available, lazy-load the canvas page.

4. **Mermaid ↔ Canvas sync** — This is genuinely hard. For MVP, one-way sync (canvas→mermaid) only. Bidirectional sync can be Phase 3.

5. **Daily sim limit** — 1 sim/day for free users must be robust against abuse (server-side check, not just client-side).

6. **Replit widget** — The original site includes a Replit feedback widget. Skip for initial build unless planning to deploy on Replit.

7. **Stupid Button Club** — Manual approval flow. Admin dashboard needed to approve/deny SBC membership requests.
