# System Design Arena - Implementation Task List

This document breaks down the PRD into actionable tasks for building the System Design Arena web application using Next.js 16, Tailwind CSS, Supabase, and React Flow.

## Tech Stack
- **Framework**: Next.js 16.2.10 (App Router, Turbopack)
- **Styling**: Tailwind CSS v4 + shadcn/ui primitives (via lucide-react and class-variance-authority)
- **State Management**: Zustand (for global state like canvas nodes/edges, session state)
- **Canvas**: React Flow (@xyflow/react v12.11.0)
- **Authentication & Database**: Supabase (via @supabase/supabase-js and @supabase/ssr)
- **AI Judging**: OpenRouter API (to access LLMs like GPT-4o, Claude Sonnet)
- **Payments**: Stripe (for subscriptions)
- **Deployment**: Vercel (or self-hosted)

## Project Structure
```
/src
  /app
    /(marketing)      # Public landing pages
    /(dashboard)      # Authenticated user area
    /api              # Route handlers (Supabase webhooks, etc.)
    /(auth)           # Auth pages (sign-in, sign-up) - handled by Supabase UI or custom
  /components
    /canvas           # React Flow components (nodes, edges, toolbar, toolbar)
    /chaos            # Chaos engineering tab components
    /session          # Session header, sliders, status
    /ai-judges        # AI judging panel components
    /problems         # Problem cards, brief page
    /learn            # Article cards, article content
    /pricing          # Pricing tier components
    /shared           # Layout components (header, footer, etc.)
  /lib
    /supabase         # Supabase client initialization and helpers
    /utils            # Utility functions (cn, date formatting, etc.)
    /canvas           # Component definitions, default positions, validation
    /chaos            # Chaos event definitions and simulation logic
    /scoring          # AI judge prompts, OpenRouter client, consensus logic
    /routes           # API route handlers (if not in /app/api)
/prisma               # Removed - using Supabase directly
/supabase             # SQL schema for Supabase
/public               # Static assets
```

## Phase 0: Project Setup & Infrastructure (Completed)
- [x] Initialize Next.js 16 project with TypeScript, Tailwind, ESLint
- [x] Configure Tailwind CSS with custom design system (fonts, colors, radii)
- [x] Set up Supabase client (anon and service role) with SSR support
- [x] Create middleware for route protection (redirect to sign-in if not authenticated)
- [x] Remove Prisma (since we're using Supabase directly)
- [x] Add React Flow and Zustand dependencies
- [x] Create basic layout and home page (from PRD marketing site)
- [x] Set up ESLint and TypeScript configuration
- [x] Initialize git repository and commit initial state

## Phase 1: Supabase Integration & Authentication
- [ ] Set up Supabase project (self-hosted at http://supabase.local:8000)
- [ ] Apply the SQL schema (supabase/schema.sql) to create tables
- [ ] Enable Row Level Security (RLS) on all tables
- [ ] Create policies for public access (problems, articles) and user-owned data (sessions, nodes, edges, scores)
- [ ] Implement sign-in/sign-up pages using Supabase Auth UI or custom forms
- [ ] Create a `useAuth` hook for accessing user session and profile
- [ ] Implement profile table to store subscription status, Stripe IDs, etc.
- [ ] Set up webhook handlers for Supabase auth events (to update profile on signup)
- [ ] Test authentication flow: sign up, sign in, sign out, protected routes

## Phase 2: Core Data Models & Services
- [ ] Define TypeScript interfaces for all database tables (Problem, DesignSession, CanvasNode, etc.)
- [ ] Create Supabase service functions for CRUD operations:
  - `problemsService`: get all problems, get problem by id/slug
  - `sessionsService`: create session, get session by uuid, update session, delete session
  - `nodesService`: batch create/update/delete nodes for a session
  - `edgesService`: batch create/update/delete edges for a session
  - `scoresService`: create score result, get scores for session/user
  - `articlesService`: get all articles, get article by slug, get featured articles
- [ ] Implement caching layer (optional) with SWR or React Query for server state
- [ ] Create reusable hooks: `useProblems`, `useSession`, `useArticles`

## Phase 3: Problem Library & Learning Sections (Marketing Pages)
- [ ] Implement `/problems` page:
  - Fetch all problems from Supabase
  - Add filter tabs (All/Easy/Medium/Hard)
  - Add search bar (client-side filtering on title/tags)
  - Render problem cards with difficulty badge, title, tags, brief
  - Link to problem brief page (`/problems/[slug]`)
- [ ] Implement `/problems/[slug]` page:
  - Fetch problem by slug
  - Display problem number, title, difficulty, tags
  - Show full requirements and key considerations (markdown)
  - Show reference architecture (as text or simple diagram)
  - "Start Session" button (creates new design session and redirects to `/session/[uuid]`)
  - "Start New Session" button (resets current session)
- [ ] Implement `/learn` page:
  - Fetch all articles, group by category (foundations, feeds-storage, realtime-geo)
  - Add search bar (client-side)
  - Show featured articles prominently
  - Render article cards with category badge, title, summary
  - Link to article page (`/learn/[slug]`)
- [ ] Implement `/learn/[slug]` page:
  - Fetch article by slug
  - Render markdown content (use `react-markdown` or similar)
  - Show "Practice this concept" button linking to related problem
  - Show suggested path: Study concept → Try a problem → Get feedback
- [ ] Ensure all pages are responsive and follow the design system

## Phase 4: Design Session (Playground) - Canvas
- [x] Create session layout with tabs (Canvas, Chaos, Mermaid)
- [x] Implement session header:
-   - Problem title and status badge (in progress/completed)
-   - Start/Stop simulation button (toggles sim state, updates backend)
-   - Three sliders: Speed (0-5x), Traffic (0-5x), Read/Write Ratio (0-1, default per problem)
-   - Simulation counter: "X/1 sims today"
-   - Read/write path indicator (e.g., "Read-heavy · 8% write")
- [x] Implement Canvas tab:
-   - Initialize React Flow instance with custom node types
-   - Build Component Palette (sidebar) with 44 components categorized:
-     - Client: Client, Mobile
-     - Traffic & Edge: DNS, CDN, Load Balancer, WAF, API Gateway, Ingress
-     - Compute: App Server, Worker, Serverless, Auth Service, Search, Scheduler, Notifications, Analytics
-     - Storage: SQL Database, NoSQL DB, Cache, Object Store, Data Warehouse, Vector DB
-     - Messaging: Message Queue, Pub/Sub, Event Stream, Kafka
-     - Observability: Metrics, Logs, Tracing, Alerting, Health Check
-     - Network: VPC, Subnet, NAT Gateway, VPN, Service Mesh
-     - AI & Agents: LLM Gateway, Orchestrator, Tool Registry, Memory Fabric, Safety Mesh
-     - External: 3rd Party API, Payment, Email
-   - Each component button adds a node to the canvas at a default position
-   - Node UI:
-     - Label (component type)
-     - Replica count (- / + buttons, min 1)
-     - Implementation notes icon (opens text input, requires auth)
-     - Tooltip on hover showing component description
-     - Connection handles (left=target, right=source)
-   - Edge creation: drag from source handle (right) to target handle (left)
-   - Canvas controls: zoom in/out, fit view, toggle interactivity, minimap
-   - Implement node dragging, selection, deletion (Delete key)
-   - Persist canvas state (nodes, edges) to Supabase via Zustand middleware or onChange handlers
-   - Load existing session data on mount
-   - Implement auto-save (debounced) to prevent data loss
- [ ] Implement Mermaid tab:
-   - Check user subscription (yearly or sbc) for access
-   - If not subscribed, show upgrade prompt
-   - If subscribed, show Mermaid editor (use @codemirror/light or similar)
-   - Implement bidirectional sync (advanced) OR one-way (canvas -> mermaid) for MVP
-   - Provide preview of rendered Mermaid diagram
- [ ] Implement Chaos tab:
-   - List 30 chaos events grouped by category (Infrastructure, Network, Application, Global)
-   - Each event as a button with emoji, title, description
-   - Allow selecting a target node (for targeted attacks) or leave as global
-   - "Start Simulation" button triggers the chaos event
-   - Display results (e.g., node status changes, simulated latency/error rates)
-   - Integrate with simulation engine to modify canvas node properties visually

## Phase 5: Simulation Engine
- [ ] Define simulation state: speed multiplier, traffic multiplier, read/write ratio
- [ ] Create a simple simulation model that calculates:
  - Base latency per node type (e.g., API Gateway: 10ms, Database: 50ms)
  - Load distribution based on connections and replicas
  - Impact of sliders on overall throughput and latency
- [ ] Implement chaos event effects:
  - Each event modifies node properties (e.g., latency multiplier, error rate, capacity loss)
  - Combine effects if multiple events active
  - Reset effects when event stops
- [ ] Visual feedback on canvas:
  - Nodes: change color/intensity based on load or error state
  - Edges: show packet loss, latency (optional: animate flow)
  - Tooltips on hover showing current metrics (latency, error rate, throughput)
- [ ] Implement "Live Metrics" button (visible when sim running) to open a modal with real-time charts
- [ ] Ensure simulation runs in a web worker or with requestAnimationFrame for smoothness
- [ ] Allow pausing/resuming simulation without losing state

## Phase 6: AI Judging System
- [ ] Create OpenRouter client with API key from environment
- [ ] Define two judge prompts:
  - **Rigor Judge**: Focus on correctness, completeness, adherence to principles, handling of edge cases, consistency, fault tolerance.
  - **Pragmatism Judge**: Focus on practicality, cost, simplicity, time-to-market, operational feasibility, industry best practices.
- [ ] Serialize current canvas state into a structured text prompt for the judges:
  - List of nodes with type, label, replicas, implementation notes
  - List of connections (source -> target)
  - Simulation settings (speed, traffic, read/write ratio)
  - Any active chaos events and their effects
- [ ] Implement function to call both judges in parallel via OpenRouter
- [ ] Implement consensus logic:
  - Each judge returns a score (0-100) and detailed feedback
  - Compute average score
  - Determine verdict: Pass (>=70), Borderline (50-69), Fail (<50)
  - Generate debate summary highlighting disagreements
  - Combine feedback into coherent written suggestions
- [ ] Create `ScoreResult` table in Supabase to store judgments
- [ ] Implement "Score My Design" button (enabled only after authentication):
  - Disables during processing, shows loading state
  - Sends serialized state to API route (`/api/score`)
  - Returns judgment and displays:
    - Two judge cards with scores and key points
    - Consensus verdict badge (color-coded: green/purple/red)
    - Written feedback in markdown format
- [ ] Gate numeric scores and verdict behind paid tiers (yearly/sbc):
  - Free tier gets qualitative feedback only (e.g., "Your design shows good understanding of caching but consider...") without numbers
  - Paid tiers get full scores and verdict
- [ ] Store judgment in database and allow users to view past scores

## Phase 7: User Dashboard & Progress Tracking
- [ ] Create `/dashboard` page (protected):
  - Display user profile info (avatar, name, subscription tier)
  - Show subscription status and upgrade/downgrade options
  - Display "Sims used today: X/1" with reset at midnight (based on user's timezone)
  - Show recent sessions list (problem name, date, status, score if available)
  - Link to view detailed session (with score and feedback)
  - Provide ability to delete account (with confirmation)
- [ ] Implement session history page:
  - Filter by problem, date range, score
  - Pagination or infinite scroll
- [ ] Add analytics: average score per problem type, improvement over time

## Phase 8: Payments & Subscriptions
- [ ] Set up Stripe products and prices:
  - Yearly: $49/year (price ID from Stripe dashboard)
- [ ] Create Stripe checkout session for upgrading to yearly
- [ ] Implement webhook endpoint (`/api/stripe/webhook`) to handle:
  - `checkout.session.completed`: set user subscription to yearly, store customer and subscription IDs
  - `invoice.payment_succeeded`: renew subscription
  - `customer.subscription.deleted`: downgrade to free
  - `customer.subscription.updated`: handle plan changes
- [ ] Create `/upgrade` page:
  - Display pricing comparison (Free vs Yearly vs SBC)
  - Handle Stripe redirect and success/cancel pages
- [ ] Implement SBC (Stupid Button Club) as a manual process:
  - User requests membership via form (email, motivation)
  - Admin (you) approves in Supabase dashboard or via internal tool
  - On approval, set `subscription_status = 'sbc'` and store member email
- [ ] Add middleware to check subscription status for gated features:
  - AI scoring (numeric scores and verdict)
  - Mermaid editor
  - Possibly unlimited sims/day (free gets 1/day, paid gets unlimited)
  - Advanced analytics
- [ ] Test payment flow with Stripe test mode

## Phase 9: Additional Features & Polish
- [ ] Implement dark/light theme toggle (persist in localStorage)
- [ ] Add animations and micro-interactions (using Framer Motion or CSS transitions)
- [ ] Optimize performance:
  - Memoize expensive React Flow node/edge renderers
  - Use virtualization for large node counts (if needed)
  - Lazy-load heavy components (e.g., article content)
- [ ] Add error boundaries and fallback UIs
- [ ] Implement form validation (using react-hook-form or similar)
- [ ] Add toast notifications for success/error states (e.g., "Session saved", "Score submitted")
- [ ] Create 404 and 500 error pages
- [ ] Add metadata for SEO (open graph tags, twitter cards)
- [ ] Implement reCAPTCHA on sign-up to prevent abuse
- [ ] Add feedback mechanism (e.g., "Was this helpful?" after scoring)
- [ ] Ensure accessibility (WCAG 2.1 AA):
  - Keyboard navigation for canvas (Arrow keys to move selected node, etc.)
  - ARIA labels for all interactive elements
  - Sufficient color contrast
  - Screen reader labels for complex components
- [ ] Add offline detection and warning (if possible with Supabase)
- [ ] Implement session sharing: generate a view-only link for a session
- [ ] Add ability to export/import session as JSON
- [ ] Create admin dashboard (for you) to manage users, view statistics, approve SBC requests

## Phase 10: Testing & QA
- [ ] Write unit tests for utility functions (using Vitest)
- [ ] Write integration tests for Supabase services (using Vitest with supabase-mock or real test database)
- [ ] Write end-to-end tests for critical flows (using Playwright):
  - User sign up → create session → add nodes → connect → run sim → score → view feedback
  - Upgrade subscription via Stripe test mode
  - Access paid features after upgrade
- [ ] Test responsiveness on mobile, tablet, desktop
- [ ] Test performance with large numbers of nodes (e.g., 50+)
- [ ] Test edge cases: simultaneous users, rapid sliding, rapid node creation/deletion
- [ ] Audit security:
  - Ensure RLS policies are correct and tested
  - Sanitize user input (especially implementation notes) to prevent XSS
  - Use HTTPS in production
  - Implement rate limiting on scoring API to prevent abuse
- [ ] Check for any console errors or warnings
- [ ] Verify meta tags and social preview images work

## Phase 11: Deployment & Monitoring
- [ ] Set up Vercel project (or deploy to self-hosted Node server)
- [ ] Configure environment variables on Vercel:
  - NEXT_PUBLIC_SUPABASE_URL
  - NEXT_PUBLIC_SUPABASE_ANON_KEY
  - SUPABASE_SERVICE_ROLE_KEY
  - NEXT_PUBLIC_APP_URL
  - OPENROUTER_API_KEY
  - STRIPE_SECRET_KEY
  - STRIPE_WEBHOOK_SECRET
  - NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID
- [ ] Set up custom domain if desired
- [ ] Enable automatic branch previews on Vercel
- [ ] Set up error tracking (e.g., Sentry) for production
- [ ] Set up logging (e.g., Logflare or Vercel built-in)
- [ ] Monitor database performance and upgrade Supabase plan as needed
- [ ] Create backup strategy for Supabase (if self-hosted, ensure pgBackRest or similar)
- [ ] Write documentation for contributors and users

## Phase 12: Launch & Iteration
- [ ] Soft launch to a small group of friends/colleagues for feedback
- [ ] Iterate based on usability testing
- [ ] Add requested features and fix bugs
- [ ] Prepare for public launch (announcement on social media, dev.to, etc.)
- [ ] Plan post-launch features:
  - Team/workspace collaboration
  - Custom problem creation for companies
  - Integration with interview scheduling platforms
  - Mobile app (React Native)
  - Advanced AI features (e.g., auto-suggest components, detect anti-patterns)

## Using Context7 for Implementation Details
When implementing specific features, use the Context7 tool to look up best practices and examples. For example:
- To learn about React Flow custom nodes: `mcp_context7_resolve_libraryId` for "/xyflow/xyflow" with query "How to create custom nodes with React Flow and Zustand"
- To learn about Supabase auth with Next.js App Router: `mcp_context7_resolve_libraryId` for "/supabase/supabase" with query "Next.js 13+ App Router authentication with cookies"
- To learn about Zustand middleware for persistence: `mcp_context7_resolve_libraryId` for "/zustand/zustand" with query "How to persist store state and sync with server"
- To learn about OpenAI API completion: `mcp_context7_resolve_libraryId` for "/openai/openai" with query "How to structure prompts for consistent JSON output"
- To learn about Stripe subscription webhooks: `mcp_context7_resolve_libraryId` for "/stripe/stripe-node" with query "Handling subscription events with webhooks"

Always verify the latest versions and compatibility with our stack (Next.js 16, React 18, etc.).

## Notes
- This task file is a living document. Update it as you progress and discover new requirements.
- Mark tasks as done when completed.
- If a task is too big, break it into smaller sub-tasks.
- Refer back to the PRD frequently to ensure alignment.