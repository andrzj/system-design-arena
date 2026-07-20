# System Design Arena — Implementation Tasks

> **Single source of truth** for building System Design Arena.  
> Product requirements: `[systemdesignarena_prd.md](./systemdesignarena_prd.md)`

---

## Tech Stack


| Layer      | Choice                                              | Notes                                                  |
| ---------- | --------------------------------------------------- | ------------------------------------------------------ |
| Framework  | **Next.js 16** (App Router, Turbopack)              | RSC, server actions, route handlers                    |
| Styling    | **Tailwind CSS v4** + **shadcn/ui**                 | Dark theme, Radix primitives                           |
| Language   | **TypeScript** (strict)                             |                                                        |
| Database   | **PostgreSQL** (Supabase-hosted) via **Prisma ORM** | Schema-first, typed queries, versioned migrations      |
| Auth       | **Supabase Auth** (`@supabase/ssr`)                 | Email/password + OAuth; session cookies via middleware |
| Canvas     | **React Flow** (`@xyflow/react` v12)                | Custom nodes, palette, minimap                         |
| State      | **Zustand** (canvas/session)                        |                                                        |
| AI         | **OpenRouter**                                      | Dual judge calls (Rigor + Pragmatism)                  |
| Payments   | **Stripe** + webhooks                               | Yearly ($49/yr), SBC manual tier                       |
| Testing    | **Vitest** + **Playwright**                         | Unit + E2E                                             |
| Deployment | **Vercel**                                          | Connects to Supabase Postgres + Auth                   |




### Architecture: Prisma + Supabase Auth

```
┌─────────────────────────────────────────────────────────┐
│  Next.js App                                            │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │ Supabase Auth│  │ Prisma Client│  │ Route Handlers│  │
│  │ (sessions)   │  │ (app data)   │  │ (API/webhooks)│  │
│  └──────┬───────┘  └──────┬───────┘  └───────────────┘  │
└─────────┼─────────────────┼─────────────────────────────┘
          │                 │
          ▼                 ▼
┌─────────────────────────────────────────────────────────┐
│  Supabase (PostgreSQL)                                  │
│  • auth.users          ← Supabase Auth owns identity    │
│  • public.* tables     ← Prisma migrations manage schema│
└─────────────────────────────────────────────────────────┘
```

- **Supabase Auth** handles sign-up, sign-in, sessions, and JWT/cookies.
- **Prisma** owns all application tables (`Profile`, `Problem`, `DesignSession`, etc.) via `prisma migrate`.
- `Profile.id` = `auth.users.id` (UUID). Create profile on first sign-up via auth hook or server action.
- App data access goes through **Prisma in server code** (route handlers, server actions). Do not use Supabase client for CRUD on app tables.
- Optional: add RLS policies in a Prisma migration `*.sql` file for defense-in-depth on Supabase Postgres.

---



## Data Models (Prisma Schema)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Profile extends Supabase auth.users — id matches auth.users.id (UUID)
model Profile {
  id                   String    @id @db.Uuid
  email                String?
  name                 String?
  avatarUrl            String?   @map("avatar_url")
  subscriptionTier     String    @default("free") @map("subscription_tier") // free | yearly | sbc
  stripeCustomerId     String?   @unique @map("stripe_customer_id")
  stripeSubscriptionId String?   @map("stripe_subscription_id")
  sbcMemberEmail       String?   @map("sbc_member_email")
  simsUsedToday        Int       @default(0) @map("sims_used_today")
  lastSimDate          DateTime? @map("last_sim_date") @db.Date
  createdAt            DateTime  @default(now()) @map("created_at")
  updatedAt            DateTime  @updatedAt @map("updated_at")

  sessions     DesignSession[]
  scoreResults ScoreResult[]

  @@map("profiles")
}

model Problem {
  id                    Int      @id @default(autoincrement())
  title                 String
  slug                  String   @unique
  difficulty            String   // easy | medium | hard
  tags                  String[]
  brief                 String
  requirements          String
  keyConsiderations     String   @map("key_considerations")
  referenceArchitecture Json?    @map("reference_architecture")
  order                 Int      @default(0) @map("order")
  isPublic              Boolean  @default(true) @map("is_public")
  createdAt             DateTime @default(now()) @map("created_at")
  updatedAt             DateTime @updatedAt @map("updated_at")

  sessions DesignSession[]

  @@map("problems")
}

model DesignSession {
  id             Int      @id @default(autoincrement())
  userId         String?  @map("user_id") @db.Uuid
  problemId      Int      @map("problem_id")
  sessionUuid    String   @unique @default(cuid()) @map("session_uuid")
  status         String   @default("in_progress") // in_progress | completed
  speedSetting   Float    @default(1.0) @map("speed_setting")
  trafficSetting Float    @default(1.0) @map("traffic_setting")
  readWriteRatio Float    @default(0.92) @map("read_write_ratio")
  createdAt      DateTime @default(now()) @map("created_at")
  updatedAt      DateTime @updatedAt @map("updated_at")

  user         Profile?      @relation(fields: [userId], references: [id], onDelete: SetNull)
  problem      Problem       @relation(fields: [problemId], references: [id])
  nodes        CanvasNode[]
  edges        CanvasEdge[]
  chaosLogs    ChaosLog[]
  scoreResults ScoreResult[]

  @@index([userId])
  @@index([problemId])
  @@map("design_sessions")
}

model CanvasNode {
  id                  Int      @id @default(autoincrement())
  sessionId           Int      @map("session_id")
  nodeUuid            String   @unique @map("node_uuid")
  componentType       String   @map("component_type")
  label               String?
  x                   Float    @default(0)
  y                   Float    @default(0)
  replicas            Int      @default(1)
  implementationNotes String?  @map("implementation_notes")
  isDisabled          Boolean  @default(false) @map("is_disabled")
  createdAt           DateTime @default(now()) @map("created_at")
  updatedAt           DateTime @updatedAt @map("updated_at")

  session     DesignSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  sourceEdges CanvasEdge[]  @relation("sourceNode")
  targetEdges CanvasEdge[]  @relation("targetNode")
  chaosLogs   ChaosLog[]

  @@index([sessionId])
  @@map("canvas_nodes")
}

model CanvasEdge {
  id           Int      @id @default(autoincrement())
  sessionId    Int      @map("session_id")
  edgeUuid     String   @unique @map("edge_uuid")
  sourceNodeId Int      @map("source_node_id")
  targetNodeId Int      @map("target_node_id")
  label        String?
  style        String?  // solid | dashed
  createdAt    DateTime @default(now()) @map("created_at")

  sourceNode CanvasNode    @relation("sourceNode", fields: [sourceNodeId], references: [id], onDelete: Cascade)
  targetNode CanvasNode    @relation("targetNode", fields: [targetNodeId], references: [id], onDelete: Cascade)
  session    DesignSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)

  @@index([sessionId])
  @@map("canvas_edges")
}

model ChaosLog {
  id           Int      @id @default(autoincrement())
  sessionId    Int      @map("session_id")
  chaosEventId String   @map("chaos_event_id")
  targetNodeId Int?     @map("target_node_id")
  timestamp    DateTime @default(now())
  result       Json?

  session    DesignSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  targetNode CanvasNode?   @relation(fields: [targetNodeId], references: [id], onDelete: SetNull)

  @@index([sessionId])
  @@map("chaos_logs")
}

model ScoreResult {
  id                   Int      @id @default(autoincrement())
  sessionId            Int      @map("session_id")
  userId               String?  @map("user_id") @db.Uuid
  judgeRigorScore      Int?     @map("judge_rigor_score")
  judgePragmatismScore Int?     @map("judge_pragmatism_score")
  consensusVerdict     String?  @map("consensus_verdict") // pass | fail | borderline
  writtenFeedback      String?  @map("written_feedback")
  debateSummary        String?  @map("debate_summary")
  modelUsed            String   @map("model_used")
  createdAt            DateTime @default(now()) @map("created_at")

  session DesignSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  user    Profile?      @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@index([sessionId])
  @@index([userId])
  @@map("score_results")
}

model Article {
  id                Int      @id @default(autoincrement())
  title             String
  slug              String   @unique
  category          String   // foundations | feeds-storage | realtime-geo
  summary           String
  content           String
  featured          Boolean  @default(false)
  relatedProblemIds Int[]    @default([]) @map("related_problem_ids")
  order             Int      @default(0) @map("order")
  isPublished       Boolean  @default(true) @map("is_published")
  createdAt         DateTime @default(now()) @map("created_at")
  updatedAt         DateTime @updatedAt @map("updated_at")

  @@map("articles")
}
```



### Migration workflow

```bash
# Initial setup
npx prisma init
# Edit prisma/schema.prisma (above)
npx prisma migrate dev --name init

# Seed
npx prisma db seed

# Production
npx prisma migrate deploy
```

Add to `package.json`:

```json
"prisma": { "seed": "tsx prisma/seed.ts" }
```

---



## Directory Structure

```
src/
├── app/
│   ├── (marketing)/           # Public pages
│   │   ├── page.tsx           # Landing
│   │   ├── learn/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   └── problems/
│   │       ├── page.tsx
│   │       └── [slug]/page.tsx
│   ├── (dashboard)/           # Authenticated area
│   │   ├── dashboard/page.tsx
│   │   ├── session/[uuid]/page.tsx
│   │   └── settings/page.tsx
│   ├── auth/
│   │   ├── sign-in/page.tsx
│   │   └── sign-up/page.tsx
│   └── api/
│       ├── sessions/...
│       ├── chaos/...
│       ├── scoring/route.ts
│       ├── stripe/webhook/route.ts
│       └── auth/callback/route.ts   # Supabase OAuth callback
├── components/
│   ├── canvas/    # Canvas, SystemNode, ComponentPalette, toolbar
│   ├── chaos/     # ChaosTab, ChaosEventButton, ChaosResult
│   ├── session/   # SessionHeader, sliders, SimStatusBadge
│   ├── ai-judges/ # JudgesPanel, JudgeCard, ConsensusBadge
│   ├── problems/  # ProblemCard, ProblemFilter, ProblemBrief
│   ├── learn/     # ArticleCard, ArticleContent
│   ├── pricing/   # PricingCard, UpgradeCTA
│   └── shared/    # Header, Footer, NotificationsBell
├── lib/
│   ├── prisma/client.ts       # Prisma singleton
│   ├── supabase/              # Auth clients only (browser, server, middleware)
│   ├── canvas/                # 44 component defs, validation, defaults
│   ├── chaos/                 # 30 event defs, simulate.ts
│   ├── scoring/               # judge prompts, openrouter, consensus
│   ├── stripe/                # client, plans, webhooks
│   └── utils/                 # cn, rate-limit
├── store/                     # Zustand stores (canvas, auth)
└── middleware.ts              # Supabase session refresh + route protection

prisma/
├── schema.prisma
├── seed.ts                    # 5+ problems, 27 articles
└── migrations/                # Versioned SQL migrations
```

---



## Progress Summary


| Phase | Name                     | Status                        |
| ----- | ------------------------ | ----------------------------- |
| 0     | Project Scaffold & Infra | 🟢 Complete (Stripe deferred) |
| 1     | Prisma + Supabase Auth   | 🟢 Complete (OAuth deferred)  |
| 2     | Landing & Marketing      | 🟢 Complete                   |
| 3     | Problem Library          | 🟢 Complete                   |
| 4     | Playground — Canvas      | 🟡 Partial (components only)  |
| 5     | Chaos Engineering        | 🔴 Not started                |
| 6     | AI Judging               | 🔴 Not started                |
| 7     | Mermaid Tab (Premium)    | 🔴 Not started                |
| 8     | Learning Library         | 🔴 Not started                |
| 9     | Dashboard & Progress     | 🔴 Not started                |
| 10    | Subscriptions & Payments | 🔴 Not started                |
| 11    | Notifications            | 🔴 Not started                |
| 12    | Polish, Testing & Deploy | 🔴 Not started                |


---



## Phase 0: Project Scaffold & Infrastructure

- [x] 0.1 Initialize Next.js 16 with TypeScript, Turbopack, App Router
- [x] 0.2 Configure Tailwind CSS v4 with custom design system (colors, fonts, radii)
- [x] 0.3 Set up Supabase Auth clients (`@supabase/ssr` — browser, server, middleware)
- [x] 0.4 Create middleware for protected routes (`/dashboard/*`, `/session/*`)
- [x] 0.5 Add React Flow and Zustand dependencies
- [x] 0.6 Write `.env.example` with required env vars
- [x] 0.7 **Install and configure Prisma** (`prisma`, `@prisma/client`)
- [x] 0.8 **Write Prisma schema** (see above) and run `prisma migrate dev --name init`
- [x] 0.9 **Create** `prisma/seed.ts`: 5+ problems, 27 articles across 3 categories
- [x] 0.10 Add shadcn/ui components (Button, Card, Tabs, Dialog, Slider, etc.)
- [x] 0.11 Set up LLM wrapper in `src/lib/scoring/openrouter.ts` (OpenAI-compatible `LLM_*` env vars)
- [ ] 0.12 Configure Stripe (products, prices, webhook endpoint stub) — **deferred to Phase 10**
- [x] 0.13 Set up CI (GitHub Actions: lint + typecheck + test)
- [x] 0.14 **Migrate away from** `supabase/schema.sql` — schema lives in Prisma migrations only
- [x] 0.15 **Replace** `supabaseService` **CRUD** with Prisma client in route handlers

---



## Phase 1: Supabase Authentication & User Profiles

- [x] 1.1 Set up Supabase project (self-hosted or cloud) with Auth enabled — documented in README for self-hosted
- [x] 1.2 Implement sign-in / sign-up pages (`/auth/sign-in`, `/auth/sign-up`)
- [ ] 1.3 Add Supabase OAuth callback route (`/api/auth/callback`) — **deferred (email-only MVP)**
- [x] 1.4 **Create Profile on sign-up** — server action or auth webhook creates `Profile` row via Prisma (id = auth user UUID)
- [x] 1.5 `useAuth` hook / auth store — expose session user + profile (subscription tier, sim count)
- [x] 1.6 User dropdown in header (avatar, sign out, settings link)
- [x] 1.7 Subscription tier helper: `getUserTier(profile)` → free | yearly | sbc
- [x] 1.8 Daily sim counter reset logic (`src/lib/utils/rate-limit.ts`) — server-side, stored on Profile
- [x] 1.9 Test full auth flow: sign up → profile created → protected route → sign out — Playwright `e2e/auth.spec.ts`

---



## Phase 2: Landing & Marketing Pages

- [x] 2.1 Hero section — heading, subtext, "Get started" CTA
- [x] 2.2 How it works — 3-step explainer (Choose → Design → Score)
- [x] 2.3 Problem preview cards — 3–4 featured problems with difficulty/tags
- [x] 2.4 Pricing section — Free / Yearly ($49) / Stupid Button Club
- [x] 2.5 Learning library callout — link to `/learn` with featured articles
- [x] 2.6 Header — Logo, Learn, Problems, Get Started / Sign In (auth-aware)
- [x] 2.7 Footer — copyright, attribution
- [x] 2.8 Responsive design pass for all marketing pages

---



## Phase 3: Problem Library

- [x] 3.1 `/problems` page — list problems (currently via Supabase service; **migrate to Prisma**)
- [x] 3.2 Difficulty filter tabs: All / Easy / Medium / Hard
- [x] 3.3 Search bar — client-side filter on title/tags
- [x] 3.4 `ProblemCard` — difficulty badge, title, tags, brief, "Attempt" button
- [x] 3.5 `/problems/[slug]` problem brief page
  - Problem #, title, difficulty, tags
  - Full requirements (markdown)
  - Key considerations
  - **Learn Before Solving** — links to related articles
  - Reference architecture display
  - "Start" / "Start New Session" → creates session, redirects to `/session/[uuid]`
- [x] 3.6 `ReferenceArchitecture` component — render stored JSON flow

---



## Phase 4: Playground — Canvas (Core Feature)



### 4.1 Session Shell

- [ ] 4.1.1 `session/[uuid]/page.tsx` — playground layout with tabs (Canvas, Chaos, Mermaid)
- [ ] 4.1.2 `SessionHeader` — problem title, status badge, simulation controls
- [ ] 4.1.3 Load session from API on mount (nodes, edges, settings) via Prisma
- [ ] 4.1.4 Auto-save every 10s via PUT API



### 4.2 Sliders & Sim Controls

- [ ] 4.2.1 `SpeedSlider` — range 0–5, default 1, shows "Speed X×"
- [ ] 4.2.2 `TrafficSlider` — range 0–5, default 1
- [ ] 4.2.3 `ReadWriteSlider` — range 0–1, default per-problem (0.92 for URL Shortener)
- [ ] 4.2.4 Sims counter badge — "X/1 sims today"
- [ ] 4.2.5 Start/Stop simulation button — toggles status, tracks daily usage server-side



### 4.3 React Flow Canvas

- [ ] 4.3.1 React Flow instance with custom node types (initial `Canvas.tsx`)
- [ ] 4.3.2 `SystemNode` — left/right handles, label, replica controls, notes icon
- [ ] 4.3.3 Node visual: blue 2px border, semi-transparent bg, min-width 110px, monospace label
- [ ] 4.3.4 Connection validation: source → target only
- [ ] 4.3.5 Edge rendering: solid/dashed lines
- [ ] 4.3.6 Node drag & select
- [ ] 4.3.7 Multi-node selection (shift+click, box select)



### 4.4 Component Palette

- [ ] 4.4.7 All 44 component definitions in `src/lib/canvas/components.ts` (in progress — align with PRD list)
- [ ] 4.4.1 `ComponentPalette` sidebar with categorized accordions
- [ ] 4.4.2 Categories: Client, Traffic & Edge, Compute, Storage, Messaging, Observability, Network, AI & Agents, External
- [ ] 4.4.3 Search filter textbox
- [ ] 4.4.4 Minimize/maximize toggle
- [ ] 4.4.5 "+" button per component — adds node at default position
- [ ] 4.4.6 Drag-to-add from palette to canvas



### 4.5 Node Controls

- [ ] 4.5.1 Replica count (+/−), min=1, disabled at min
- [ ] 4.5.2 Implementation notes — redirect to sign-in if anonymous; save via Prisma if authenticated
- [ ] 4.5.3 Delete node — backspace/delete key or context menu
- [ ] 4.5.4 Node enable/disable toggle (disabled button on free tier per PRD)
- [ ] 4.5.5 Tooltip — component description on hover



### 4.6 Canvas Toolbar

- [ ] 4.6.1 Zoom in/out (React Flow controls)
- [ ] 4.6.2 Fit view
- [ ] 4.6.3 Toggle interactivity (lock/unlock)
- [ ] 4.6.4 Map toggle — show/hide minimap
- [ ] 4.6.5 Live Metrics button (visible when sim active)
- [ ] 4.6.6 Quick Chaos button — one-click random chaos event



### 4.7 Tutorial

- [ ] 4.7.1 "Start tutorial" button — guided overlay
- [ ] 4.7.2 Walkthrough: add component → connect → replicas → run sim → score



### 4.8 Backend APIs (Prisma-backed route handlers)

- [ ] 4.8.1 `POST /api/sessions` — create session with problem ID
- [ ] 4.8.2 `GET /api/sessions/[uuid]` — full session (nodes, edges, settings)
- [ ] 4.8.3 `PUT /api/sessions/[uuid]` — update session settings (sliders)
- [ ] 4.8.4 `POST /api/sessions/[uuid]/nodes` — bulk upsert nodes
- [ ] 4.8.5 `POST /api/sessions/[uuid]/edges` — bulk upsert edges
- [ ] 4.8.6 `DELETE /api/sessions/[uuid]/nodes/[nodeUuid]` — delete node
- [ ] 4.8.7 `PUT /api/sessions/[uuid]/sim` — start/stop sim, increment daily counter

---



## Phase 5: Chaos Engineering Tab

- [x] 5.2 30 chaos event definitions in `src/lib/chaos/events.ts` (in progress — align IDs/effects with PRD)
- [ ] 5.1 `ChaosTab` with category sections
- [ ] 5.3 `ChaosEventButton` — emoji, title, description
- [ ] 5.4 Target node selector (targeted vs global)
- [ ] 5.5 "Start Simulation" button
- [ ] 5.6 Chaos simulation engine (`src/lib/chaos/simulate.ts`) — impact on latency, errors, throughput; visual degradation on canvas
- [ ] 5.7 Chaos result timeline display
- [ ] 5.8 Persist `ChaosLog` rows via Prisma

---



## Phase 6: AI Judging System

- [ ] 6.1 Architecture serialization — nodes, edges, replicas, notes, sim settings → LLM prompt
- [ ] 6.2 Rigor Judge prompt (`src/lib/scoring/judge-rules.ts`) — score 0–100, strengths, weaknesses
- [ ] 6.3 Pragmatism Judge prompt — feasibility, cost, operational reality
- [ ] 6.4 OpenRouter — call both judges in parallel
- [ ] 6.5 Consensus engine — avg score, verdict (pass ≥70 / borderline 50–69 / fail <50), debate summary
- [ ] 6.6 `POST /api/scoring` — auth + tier check, save `ScoreResult` via Prisma
- [ ] 6.7 `JudgesPanel` — judge cards, loading state
- [ ] 6.8 `JudgeCard` — Rigor/Pragmatism, score badge, key points
- [ ] 6.9 `ConsensusBadge` — pass/fail/borderline color coding
- [ ] 6.10 `FeedbackMarkdown` — rendered written feedback
- [ ] 6.11 Tier gating: free = qualitative only; paid = numeric scores + verdict
- [ ] 6.12 Score history in session and dashboard

---



## Phase 7: Mermaid Tab (Premium)

- [ ] 7.1 `MermaidTab` with paywall state
- [ ] 7.2 Premium gate — upgrade card if not yearly/sbc
- [ ] 7.3 CodeMirror or Monaco editor for Mermaid syntax
- [ ] 7.4 Canvas → Mermaid one-way sync for MVP (bidirectional = post-MVP)
- [ ] 7.5 Mermaid preview panel
- [ ] 7.6 "Unlock Mermaid" link to `/upgrade`

---



## Phase 8: Learning Library

- [ ] 8.1 `/learn` — 27 articles in Foundations / Feeds & Storage / Realtime & Geo
- [ ] 8.2 Search learning topics
- [ ] 8.3 Featured articles section
- [ ] 8.4 `ArticleCard` — category badge, title, summary, related problem tags
- [ ] 8.5 `/learn/[slug]` — full markdown content
- [ ] 8.6 Suggested path: Structure → Concept → Session → Score
- [ ] 8.7 Related problems section
- [ ] 8.8 "Practice in Arena" CTA

---



## Phase 9: User Dashboard & Progress

- [ ] 9.1 `/dashboard` — authenticated home
- [ ] 9.2 Stats: total sessions, problems attempted, AI score history
- [ ] 9.3 Recent sessions list — problem, date, status, score
- [ ] 9.4 Subscription card — current tier, upgrade options
- [ ] 9.5 Sim usage meter — "X/1 sims used today"
- [ ] 9.6 Score history chart — averages over time
- [ ] 9.7 `/settings` — account info, delete account

---



## Phase 10: Subscriptions & Payments

- [ ] 10.1 Stripe product/price (Yearly $49/year)
- [ ] 10.2 Stripe checkout flow → redirect back to dashboard
- [ ] 10.3 Stripe webhook — subscribe, cancel, renew → update `Profile.subscriptionTier` via Prisma
- [ ] 10.4 Stupid Button Club — manual admin approval flow
- [ ] 10.5 Tier gating throughout app:
  - **Free**: canvas, 1 sim/day, 27 articles, all problems, qualitative AI feedback
  - **Yearly**: + numeric AI scores, verdict, Mermaid editor
  - **SBC**: same as yearly
- [ ] 10.6 `/upgrade` pricing comparison page

---



## Phase 11: Notifications

- [ ] 11.1 `NotificationsBell` with F8 keyboard shortcut
- [ ] 11.2 Toasts: score ready, sim limit reached, subscription events
- [ ] 11.3 Notification history (DB or in-app queue)
- [ ] 11.4 Polling when score is processing

---



## Phase 12: Polish, Testing & Deployment

- [ ] 12.1 Responsive design — 768px, 1024px, 1440px+
- [ ] 12.2 Keyboard navigation, ARIA labels, focus management (WCAG 2.1 AA)
- [ ] 12.3 Error boundaries — canvas, chaos, scoring
- [ ] 12.4 Loading skeletons — problem list, session load, scoring
- [ ] 12.5 Empty states — blank canvas, no sessions, no scores
- [ ] 12.6 Toast system for mutations
- [ ] 12.7 Performance — memoize React Flow nodes, lazy-load canvas page
- [ ] 12.8 Unit tests (Vitest) — utils, scoring consensus, rate-limit
- [ ] 12.9 E2E tests (Playwright):
  - Sign up → session → add nodes → connect → sim → score
  - Stripe upgrade flow
- [ ] 12.10 Deploy to Vercel with env vars (`DATABASE_URL`, Supabase keys, OpenRouter, Stripe)
- [ ] 12.11 Error tracking (Sentry) and logging

---



## Reference: 44 Canvas Components

Full definitions live in `src/lib/canvas/components.ts`. Categories:


| Category           | Components                                                                                |
| ------------------ | ----------------------------------------------------------------------------------------- |
| Client (2)         | Client, Mobile                                                                            |
| Traffic & Edge (6) | DNS, CDN, Load Balancer, WAF, API Gateway, Ingress                                        |
| Compute (8)        | App Server, Worker, Serverless, Auth Service, Search, Scheduler, Notifications, Analytics |
| Storage (6)        | SQL Database, NoSQL DB, Cache, Object Store, Data Warehouse, Vector DB                    |
| Messaging (4)      | Message Queue, Pub/Sub, Event Stream, Kafka                                               |
| Observability (5)  | Metrics, Logs, Tracing, Alerting, Health Check                                            |
| Network (5)        | VPC, Subnet, NAT Gateway, VPN, Service Mesh                                               |
| AI & Agents (5)    | LLM Gateway, Orchestrator, Tool Registry, Memory Fabric, Safety Mesh                      |
| External (3)       | 3rd Party API, Payment, Email                                                             |


---



## Reference: 30 Chaos Events

Full definitions live in `src/lib/chaos/events.ts`. Categories:


| Category       | Count | Examples                                                                                                                                           |
| -------------- | ----- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Infrastructure | 10    | AZ outage, data center, instance crash/slow, disk failure/corruption, IOPS, file system, VM CPU, host hardware                                     |
| Network        | 11    | partition, cross-region loss, packet loss, high latency, bandwidth throttle, connection flap, LB degradation, backend port, health check, TLS, DNS |
| Application    | 8     | memory leak, OOM, thread pool, deadlock, cache stampede, error storm, CPU spike                                                                    |
| Global         | 1     | traffic surge ×3 RPS                                                                                                                               |


---



## Implementation Order

```
Week 1:  Phase 0 (Prisma) + Phase 1 (Supabase Auth) + Phase 2 (Landing)
Week 2:  Phase 3 + Phase 4.1–4.3 (Problems, Canvas shell)
Week 3:  Phase 4.4–4.8 (Palette, Nodes, APIs)
Week 4:  Phase 5 (Chaos)
Week 5:  Phase 6 (AI Judging)
Week 6:  Phase 7 + 8 (Mermaid, Learning Library)
Week 7:  Phase 9 + 10 (Dashboard, Subscriptions)
Week 8:  Phase 11 + 12 (Notifications, Polish, QA, Deploy)
```

---



## Open Questions & Risks

1. **Simulation depth** — MVP uses approximate effects from node types + chaos events, not a full discrete-event simulator.
2. **AI judging cost** — Two OpenRouter calls per score; add per-user daily cap.
3. **Canvas performance** — Memoize nodes; consider virtualization at 20+ nodes.
4. **Mermaid sync** — MVP: canvas → Mermaid only. Bidirectional is post-MVP.
5. **Daily sim limit** — Must be enforced server-side on Profile, not client-only.
6. **Legacy** `supabase/schema.sql` — Deprecate once Prisma migrations are applied. Do not maintain two schemas.
7. **SBC approval** — Needs admin tool or manual DB update via Prisma Studio.

---



## Environment Variables

```env
# Database (Supabase Postgres connection string — used by Prisma)
DATABASE_URL="postgresql://postgres:postgres@supabase.local:5432/postgres"

# Supabase Auth
NEXT_PUBLIC_SUPABASE_URL="http://supabase.local:8000/"
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_ROLE_KEY="..."

# LLM (OpenAI-compatible API for AI judges)
LLM_API_KEY=""
LLM_BASE_URL="https://api.openai.com/v1"
LLM_MODEL="gpt-4o-mini"

# Stripe (Phase 10)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=""
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""
NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID=""

# App
NEXT_PUBLIC_APP_URL="http://localhost:3030"
```

---

*Living document — update checkboxes as work completes. Refer to* `[systemdesignarena_prd.md](./systemdesignarena_prd.md)` *for product behavior.*