# System Design Arena Product Requirements Document (PRD)

## 1. Product Vision
System Design Arena (System Design Playground) is a free, interactive platform that enables software engineers to practice system design interview questions by drawing architectures on a live blueprint canvas and receiving instant feedback from two debating AI judges. The platform bridges the gap between theoretical knowledge and practical interview performance by providing hands-on, iterative design practice with immediate, actionable feedback and chaos engineering simulation.

## 2. Target Audience
- Software engineers preparing for system design interviews (mid-level to senior roles)
- Computer science students learning system design concepts
- Experienced engineers refreshing system design knowledge
- Interview coaches and educators seeking a practical teaching tool

## 3. Core Features

### 3.1 Problem Library
- **Description**: A curated collection of real-world system design interview questions.
- **Full Problem List** (observed):
  - **#001 — Design a URL Shortener** (Easy) — hashing, caching, databases, REST API. Build a service like bit.ly that maps long URLs to short codes at scale.
  - **#002 — Design Twitter/X Feed** (Hard) — fan-out, caching, sharding, message queues. Design the Twitter/X home timeline and tweet posting system.
  - **#003 — How Uber Finds Nearby Drivers at 1M RPS** (Hard) — geospatial, geohashing, quadtree, location services. Design the geospatial location service for "find nearby drivers" at massive scale.
  - **#004 — Design Slack** (Hard) — websockets, message queues, pub/sub, databases. Real-time team messaging with channels, DMs, and live presence across millions of concurrent users.
  - **#005 — Build a Hotel Booking Page** (Easy) — tutorial, caching, databases, guided. Beginner-friendly guided tutorial — build a hotel booking page, discover why it slows under load, and learn how to fix it.
- **User Interaction**:
  - Browse via cards showing difficulty, tags, description
  - Filter by difficulty (All / Easy / Medium / Hard)
  - Search problems via textbox
  - Click "Attempt" to enter problem brief page, then "Start" for a session
  - "5 shown" counter visible (may be sign-in gated)

### 3.2 Learning Library
- **Description**: 27 in-depth articles on core system design concepts, categorized into three sections.
- **Foundations** (8 articles):
  - Introduction to System Design
  - System Design Structure
  - Databases and Caching
  - Cache Eviction Internals
  - CAP Theorem
  - Hot Keys and Cache Stampedes
  - Scaling: Vertical vs Horizontal
  - Throughput and Size Calculation
- **Feeds & Storage** (multiple articles):
  - Design a URL Shortener
  - Fan-Out Strategies
  - Sharding
  - Message Queues
- **Realtime & Geo** (multiple articles):
  - WebSockets and Real-Time Communication
- **Features**:
  - Search learning topics via textbox
  - Each article linked to relevant problems (e.g., "Hotel Booking URL Shortener" tags)
  - Suggested learning path: start with Structure & Estimation, study concept behind chosen problem, run a session and compare score feedback
  - Articles from ~500-2000 words with sections: Why This Matters, Mental Model, Key Ideas, Interview Walkthrough, Common Mistakes, Practice in Arena

### 3.3 Design Session (Playground)
Upon selecting a problem and clicking "Start", users enter an interactive design session.

#### 3.3.1 Session Header Controls
- **Design session heading**: Shows problem title (e.g., "Design a URL Shortener")
- **Status badge**: "in progress"
- **Simulation Start/Stop button** (data-testid: "button-toggle-sim"): Toggles between "Start" and "Stop" state to begin/end the simulation run. A compact duplicate also exists ("button-toggle-sim-compact").
- **Sims counter**: "X/1 sims today" — tracks daily simulation usage (1 free per day when not signed up)
- **Speed slider** (role="slider", range 0–5, default 1): Controls simulation speed multiplier.
- **Traffic slider** (role="slider", range 0–5, default 1): Controls simulated traffic volume multiplier.
- **Reads vs writes slider** (role="slider", range 0–1, default 0.92): Controls the read/write ratio of traffic. A read-heavy profile (92% read / 8% write) is pre-configured for this problem.
- **Read Path indicator**: Shows "Read-heavy · 8% write" and "Hot read path" — identifies the critical path for this problem.
- **Problem Brief** (collapsible): Displays full requirements and key considerations.

#### 3.3.2 Canvas Tab
The primary design surface built on **React Flow** (reactflow.dev). Contains:

##### 3.3.2.1 Component Palette (Left Sidebar)
- **Minimize button** (title="Minimize"): Collapses the palette to give more canvas space.
- **Start tutorial button**: Launches an interactive tutorial overlay for first-time users.
- **Search components textbox**: Filters the component list dynamically.
- **Component Categories and Full List** (44 components total):

**Client** (2):
1. **Client** — A user's web browser — where requests originate. Generates the read and write traffic your system must handle.
2. **Mobile** — A mobile app client. Like the web client, it's a source of user traffic into your system.

**Traffic & Edge** (6):
3. **DNS** — Resolves your domain name to a server address — the first lookup before any request reaches you.
4. **CDN** — Caches static files (images, JS, CSS) close to users for fast delivery and far less load on your origin.
5. **Load Balancer** — Spreads incoming requests across many servers so no single one gets overwhelmed.
6. **WAF** — Web Application Firewall — blocks malicious traffic (attacks, bots) before it reaches your app.
7. **API Gateway** — A single front door for client requests: routing, authentication, and rate limiting in one place.
8. **Ingress** — Cluster entry point that routes external traffic to the right internal service.

**Compute** (8):
9. **App Server** — Runs your application logic — handles requests and talks to databases, caches, and queues.
10. **Worker** — Processes background jobs off the request path (sending emails, resizing images, etc.).
11. **Serverless** — On-demand functions that scale automatically per request, with no servers to manage.
12. **Auth Service** — Handles login, tokens, and permissions — verifies who the user is and what they can do.
13. **Search** — A search index (e.g., Elasticsearch) for fast full-text queries over large datasets.
14. **Scheduler** — Triggers recurring or delayed jobs (cron-like) for background work.
15. **Notifications** — Sends push, SMS, or in-app alerts out to users.
16. **Analytics** — Collects and processes usage events to produce metrics and insights.

**Storage** (6):
17. **SQL Database** — Relational store for structured data with strong consistency (e.g. Postgres). Every write must land here — it can't be cached away.
18. **NoSQL DB** — Flexible, horizontally-scalable store for large or semi-structured data (e.g. MongoDB, Cassandra).
19. **Cache** — In-memory store (e.g. Redis) that serves repeated READS fast, taking load off the database. It does NOT help writes.
20. **Object Store** — Stores large files and blobs like images and videos (e.g. S3).
21. **Data Warehouse** — Holds huge volumes of historical data for analytics queries — not live user traffic.
22. **Vector DB** — Stores embeddings for similarity search — powers AI and semantic-search features.

**Messaging** (4):
23. **Message Queue** — Buffers work between services so producers and consumers can run at their own pace (e.g. SQS). Great for absorbing write bursts.
24. **Pub/Sub** — Broadcasts each event to many subscribers at once — decouples senders from receivers.
25. **Event Stream** — An ordered, replayable log of events that multiple consumers can read independently.
26. **Kafka** — High-throughput event log built to ingest and distribute massive write streams.

**Observability** (5):
27. **Metrics** — Numeric time-series (latency, error rate, throughput) for monitoring system health.
28. **Logs** — Recorded events and messages used for debugging and auditing.
29. **Tracing** — Follows a single request across services to show where time is spent.
30. **Alerting** — Notifies your team when a metric crosses a dangerous threshold.
31. **Health Check** — Periodically probes services so unhealthy ones can be restarted or pulled from rotation.

**Network** (5):
32. **VPC** — An isolated private network that contains your cloud resources.
33. **Subnet** — A segment of a VPC used to group and isolate resources.
34. **NAT Gateway** — Lets private resources reach the internet without being publicly exposed.
35. **VPN** — An encrypted tunnel for secure access between networks.
36. **Service Mesh** — Manages service-to-service traffic: routing, retries, security, and observability.

**AI & Agents** (5):
37. **LLM Gateway** — Routes and manages requests to large language models, with caching and rate limits.
38. **Orchestrator** — Coordinates multi-step AI agent workflows and tool calls.
39. **Tool Registry** — A catalog of tools and functions an AI agent is allowed to call.
40. **Memory Fabric** — Stores an agent's long-term memory and context for later retrieval.
41. **Safety Mesh** — Filters and guards AI inputs and outputs for safety and policy compliance.

**External** (3):
42. **3rd Party API** — An external service you depend on — outside your control, so it can be slow or fail.
43. **Payment** — An external payment processor (e.g. Stripe) that handles transactions.
44. **Email** — An external email delivery provider (e.g. SendGrid).

##### 3.3.2.2 Node Component Properties (Canvas Elements)
Each component added to the canvas becomes a **React Flow node** with the following properties:

- **Visual styling**:
  - Blue border (rgb: 59, 130, 246), 2px width
  - Semi-transparent background (rgba: 255, 255, 255, 0.12)
  - Min-width: 110px
  - Rounded corners, monospace font label
  - Class: `.react-flow__node-system`
- **Edge connection handles** (2 per node):
  - **Left handle**: Target/input connection point. Classes: `react-flow__handle-left target`
  - **Right handle**: Source/output connection point. Classes: `react-flow__handle-right source`
  - Both handles are white circles (w-2 h-2), marked `connectable`
- **Node data attributes**: data-nodeid="node-X", data-testid="node-node-X"
- **Title tooltip**: Shows the component description (e.g., "Client — A user's web browser...")
- **Draggable** and **selectable** on canvas
- **On-node controls** (3 buttons per node):
  1. **Add implementation notes** (aria-label="Add implementation notes"): Opens a text input for design rationale. This action redirects to sign-in if user is not authenticated.
  2. **Decrement replica** (data-testid="button-replica-dec-node-X"): Decreases the replica count. Disabled (opacity-30) when count is 1 (minimum).
  3. **Increment replica** (data-testid="button-replica-inc-node-X"): Increases the replica count. Enabled by default.
- **Replica count**: Displays "X rep" text between the increment/decrement buttons. Default: "1 rep".

##### 3.3.2.3 Canvas Toolbar (Bottom or floating area)
- **Zoom in**: React Flow control. Disabled at maximum zoom.
- **Zoom out**: React Flow control.
- **Fit view**: Centers and fits all nodes into the viewport.
- **Toggle interactivity**: Locks/unlocks the canvas (prevents node dragging when locked).
- **Map** (title="Show map"): Toggles the React Flow minimap overlay (a small bird's-eye view of the canvas).
- **React Flow attribution**: Link to reactflow.dev

**Conditionally visible buttons** (appear only for signed-in users or when specific conditions are met):
- **Live Metrics**: Displays real-time simulation metrics (may appear after simulation starts).
- **Quick Chaos**: One-click chaos injection (may appear after simulation starts).

##### 3.3.2.4 Reference Architecture
- Displayed on the problem brief page (not inside the canvas)
- A textual flow description showing one strong solution approach
- Example (URL Shortener):
  ```
  Client → Load Balancer → App Servers (redirect + shorten API)
  App Servers → Cache (hot short-code mappings ~95% hit rate)
  App Servers → SQL Database (code to URL mappings)
  Analytics Queue → Worker → Data Warehouse
  ```

#### 3.3.3 Session Simulation Behavior
- Clicking "Start" (button-toggle-sim) launches a simulation run
- The Speed slider (0-5, default 1) controls simulation speed
- The Traffic slider (0-5, default 1) controls traffic volume
- The Reads vs Writes slider (0-1, default 0.92 per problem) adjusts the traffic profile
- Free users have 1 simulation per day (shown as "X/1 sims today")

#### 3.3.4 Chaos Tab
Chaos engineering tab with **30 chaos events** organized into 4 categories. Each event is a clickable button with emoji icon, title, and description. A "Start Simulation" button launches the chaos scenario.

**Category A: Infrastructure Failures (10 events):**
1. Availability Zone 🏚️ — An entire AZ goes offline — every tier loses about half its capacity.
2. Data Center 🔥 — A data center outage cripples capacity across the whole fleet.
3. Instance Crash 💥 — The instance crashes and stops serving traffic.
4. Instance Slow 🐢 — A degraded instance responds far slower.
5. Disk Failure 💽 — Disk failure causes errors and reduced throughput.
6. Disk Corruption 🧟 — Corrupted data drives a spike in errors.
7. Storage IOPS 📉 — IOPS throttling slows the node and cuts capacity.
8. File System 🗂️ — File system trouble adds latency and errors.
9. VM CPU 🌡️ — CPU starvation halves capacity and slows responses.
10. Host Hardware 🔌 — Host hardware failure takes the node down.

**Category B: Network Chaos (11 events):**
11. Network Partition ✂️ — A partition drops most connections to the node.
12. Cross-Region Loss 🌐 — Cross-region packet loss adds drops and latency.
13. Packet Loss 📦 — Random packet loss degrades throughput.
14. High Latency 🕰️ — Network latency balloons response times.
15. Bandwidth Throttle 🚰 — Throttled bandwidth caps capacity and adds latency.
16. Connection Flap 🔁 — Flapping connections drop a chunk of traffic.
17. Load Balancer ⚖️ — LB degradation cuts capacity and drops requests.
18. Backend Port 🚪 — A closed backend port refuses connections.
19. Health Check 🩺 — Failing health checks pull the node from rotation.
20. TLS Certificate 🔐 — An invalid TLS cert breaks secure connections.
21. DNS Resolution 🧭 — DNS resolution failures drop and slow traffic.

**Category C: Application-Level Chaos (8 events):**
22. Memory Leak 🩸 — A leak slowly starves the node of capacity.
23. Out of Memory 🧠 — The process is OOM-killed and goes down.
24. Thread Pool 🧵 — Thread pool exhaustion cuts capacity and slows.
25. Deadlock 🔒 — A deadlock stalls requests and raises errors.
26. Cache Stampede 🐂 — Hot keys expire at once — the cache's hit rate collapses and misses flood the origin.
27. Error Storm ⛈️ — An error storm spikes the node's error rate.
28. CPU Spike 📈 — A CPU spike chokes capacity and slows responses.

**Category D: Global Events (1 event):**
29. Traffic Surge 🌊 — A global traffic surge multiplies inbound RPS 3x.

**Chaos targeting**: "Inject failures into your design. Targeted failures apply to the bottleneck node (none selected). Global events affect everything." — Suggests users can select a specific node for targeted chaos, with global events affecting the entire system.

#### 3.3.5 Mermaid Tab
- **Status**: Premium feature behind paywall
- **Unlock requirement**: Yearly subscription ($49/year) or Stupid Button Club membership
- **Expected behavior**: Once unlocked, allows users to write/editing Mermaid diagram syntax that likely syncs bidirectionally with the canvas
- **Current state**: Displays a premium paywall card: "Mermaid editor is premium. Unlock the Mermaid diagram editor with a yearly subscription or a Stupid Button Club membership."

#### 3.3.6 AI Judges Section
- **Free trial state**: "You're on a free trial — design and stress-test all you like. Create an account to have two AI judges score your design and debate a verdict."
- **Prompt to sign up**: Large call-to-action button "Sign up for your AI verdict" linking to /sign-up
- **Scoring trigger**: "Click 'Score My Design' to get AI feedback on your architecture" (button only visible after sign-up)
- **Judging result** (post sign-up):
  - Two AI judges with different philosophies (rigor vs. pragmatism)
  - Independent scores (0-100, paid tier)
  - Debate and consensus verdict (Pass/Fail/Borderline)
  - Full written feedback with specific improvement suggestions
  - Allows iterative improvement by re-designing and re-scoring

### 3.4 User Accounts & Authentication
- **Sign Up / Sign In**: Standard email/password, accessible from header "Get started" / "Sign in" links
- **Free Trial**: Design and stress-test freely without account; AI judging requires account
- **Account Benefits**: Desktop dashboard (view past designs, scores, progress, subscription status)
- **Gated Features**: Implementation notes on components redirect to sign-in, AI scores, Mermaid editor, possibly Live Metrics and Quick Chaos, simulation replay

### 3.5 Pricing & Monetization
- **Free Tier ($0 forever)**:
  - Unlimited practice sessions
  - Canvas editor with all 44 components
  - 1 chaos simulation per day
  - 27-article learning library
  - Problem library access (5 problems visible; sign-up may unlock more)
  - Community leaderboard
- **Yearly ($49/year)**:
  - Everything in Free
  - AI scores from 2 judges (0-100)
  - Pass/Fail/Borderline verdict
  - Full written feedback & consensus
  - Mermaid diagram editor
- **Stupid Button Club** (via stupidbutton.club):
  - Everything in Yearly
  - Unlocked via club membership (request with member email, approved by admin)

### 3.6 Notifications
- Accessible via `F8` key
- Rendered as a "region \"Notifications (F8)\"" in the DOM
- Used for system updates, feedback, new problems, etc.

## 4. User Flows

### 4.1 New User Exploration
1. User lands on homepage — sees hero describing free system design practice with AI feedback
2. Clicks "Get started" or navigates to /problems
3. Browses problem cards (filterable by difficulty, searchable)
4. Reads a problem brief (e.g., URL Shortener), reviews requirements and reference architecture
5. Clicks "Start" to enter design session

### 4.2 Design Session Flow
1. User starts a problem session
2. Views the session header: problem title, status, Start/Stop button, sliders (Speed, Traffic, Read/Write), problem brief
3. Interacts with **Canvas** tab:
   a. Adds components from palette by clicking "+" buttons
   b. Drags components around the canvas to compose the architecture
   c. Connects components by dragging from right handle (source) to left handle (target)
   d. Adjusts replica count (min 1) via +/- buttons per component
   e. Optionally clicks "Add implementation notes" (sign-up required)
   f. Uses canvas controls: zoom, fit, toggle interactivity, minimap
4. Switches to **Mermaid** tab (premium — sees paywall if not subscribed)
5. Switches to **Chaos** tab:
   a. Selects a component node for targeted failure (optional)
   b. Clicks a chaos event from Infrastructure/Network/Application/Global categories
   c. Clicks "Start Simulation" to run the chaos experiment
6. Clicks "Start" (in session header) to begin the simulation with current settings
7. (If signed up) Clicks "Score My Design" — triggers AI judging
8. Receives AI feedback: two scores, debate, verdict, written suggestions
9. Iterates on design based on feedback, re-scores

### 4.3 Learning Flow
1. User navigates to /learn
2. Browses or searches 27 articles across Foundations, Feeds & Storage, and Realtime & Geo categories
3. Follows suggested path: Structure → Concept → Session → Score
4. Reads an article, then applies concept in a design session

### 4.4 Account & Subscription Flow
1. User clicks "Sign up" → standard sign-up flow
2. Redirected to dashboard (past designs, scores, subscription)
3. Unlocks: AI judging, implementation notes, possibly Live Metrics/Quick Chaos
4. May upgrade to Yearly ($49/yr) for numeric AI scores and Mermaid editor
5. Stupid Button Club members get everything via external club membership

## 5. Technical Architecture (Inferred)

### 5.1 Frontend
- **Framework**: React with TypeScript (Vite-based SPA, based on `/assets/index-*.js` builds)
- **Canvas**: React Flow (reactflow.dev) for drag-and-drop node/edge management
- **Styling**: Tailwind CSS, custom dark theme with blue accent palette
- **Fonts**: IBM Plex Mono (code), Inter (UI), Space Grotesk (headings)
- **Tabs**: Radix UI tabs primitive
- **Charts/Simulation**: Unknown charting library (for Live Metrics and simulation visualization)
- **Deployment**: Hosted on Google Cloud (server: Google Frontend)

### 5.2 State Management
- User session: JWT-based (inferred from sign-in flow)
- Canvas state: React Flow state (nodes, edges, positions)
- Simulation state: Managed server-side for chaos simulation

### 5.3 AI Judging
- Two backend LLM calls with different judge personas: "rigor" (strict academic) and "pragmatism" (industry practitioner)
- Debate logic: Compares both judge outputs, generates consensus
- Input: Serialized architecture (node types, connections, replicas, implementation notes)
- Output: Scores (0-100), verdict (Pass/Fail/Borderline), written feedback

## 6. Non-Functional Requirements

### 6.1 Performance
- Canvas interactions < 100ms for drag/drop
- AI feedback within 10-30 seconds
- Page load < 3 seconds on broadband
- Simulation tick rate smooth at default speed (1×)

### 6.2 Scalability
- Target: 1000+ concurrent users
- Horizontal scaling for AI judgment service
- Efficient React Flow state synchronization

### 6.3 Accessibility
- WCAG 2.1 AA target
- ARIA labels on all interactive elements (partially implemented — some buttons have aria-label, many use title alone)
- Keyboard navigation for canvas (React Flow supports keyboard)
- Color contrast — dark theme with white text on dark backgrounds

### 6.4 Security
- HTTPS enforced (HSTS header present)
- Authentication likely JWT-based
- XSS prevention via React's built-in sanitization
- Implementation notes and user content sanitized

### 6.5 Reliability
- Graceful degradation when AI services down (canvas still usable)
- Canvas state persisted (auto-save likely)
- Simulation state consistent

## 7. Complete Canvas Node Interaction Map

| Interaction | Component in Palette | In Canvas Node | Requires Sign-in |
|---|---|---|---|
| Add to canvas | ✅ "+" button | — | ❌ |
| Remove from canvas | — | 🗑️ (delete key or right-click?) | ❌ |
| Drag/reposition | — | ✅ Drag on canvas | ❌ |
| Connect (source→target) | — | ✅ Right handle → Left handle | ❌ |
| Zoom/Pan | — | ✅ Scroll wheel, click-drag | ❌ |
| Replica increment | — | ✅ "+" button per node | ❌ |
| Replica decrement | — | ✅ "-" button per node (disabled at min) | ❌ |
| Implementation notes | — | ✅ Text input per node | ✅ |
| Add edge label | — | ❓ (not observed) | — |
| Delete node | — | Possibly backspace/delete key | ❌ |
| Select multiple | — | ✅ Shift+click or box select | ❌ |
| Toggle minimap | — | ✅ "Map" button | ❌ |
| Lock canvas | — | ✅ "Toggle interactivity" | ❌ |

## 8. Complete Chaos Event Map

| Category | Events | Scope |
|---|---|---|
| Infrastructure Failures | 10 (AZ, Data Center, Instance Crash/Slow, Disk Failure/Corruption, IOPS, File System, VM CPU, Host Hardware) | Targeted or Global |
| Network Chaos | 11 (Partition, Cross-Region Loss, Packet Loss, High Latency, Bandwidth Throttle, Connection Flap, LB Degradation, Backend Port, Health Check, TLS, DNS) | Targeted or Global |
| Application-Level Chaos | 8 (Memory Leak, OOM, Thread Pool, Deadlock, Cache Stampede, Error Storm, CPU Spike) | Targeted or Global |
| Global Events | 1 (Traffic Surge ×3 RPS) | Global only |

## 9. Success Metrics

### 9.1 Acquisition
- Monthly Active Users (MAU), Registration conversion rate, Traffic sources

### 9.2 Engagement
- DAU/MAU ratio (stickiness), Average session duration, Problems attempted per user, Design iterations per session, AI judgment requests per user, Chaos simulations per user

### 9.3 Retention
- Day 1/7/30 retention, Weekly active users, Cohort analysis, Churn rate (paid)

### 9.4 Satisfaction
- NPS, CSAT, Feature-specific feedback (AI usefulness, canvas usability, chaos tool)

### 9.5 Conversion
- Free → Paid conversion rate, MRR, ARPU, Stupid Button Club acquisition

## 10. Open Questions & Assumptions

1. **AI Feedback Tiers**: Exactly what AI feedback is included in free vs. paid? Homepage says "Two AI judges with debate and consensus scoring" is free; pricing page puts scores/verdicts in Yearly. Likely free = qualitative feedback, paid = numeric scores + verdict.
2. **Data Persistence**: Are designs auto-saved for anonymous users? For how long?
3. **Collaboration**: Any plans for real-time collaborative design sessions?
4. **AI Models**: What LLMs power the judges? Fine-tuned for system design?
5. **Problem Count**: Are there more than 5 problems behind the sign-in wall?
6. **Simulation Internals**: What metrics does the simulation track? Latency, throughput, error rate, availability?
7. **Node Edge Labels**: Can edges be labelled (e.g., protocol, data type)?
8. **Quick Chaos / Live Metrics**: Do these only appear after sign-up or after simulation start?
9. **Mermaid Sync**: Is Mermaid ↔ Canvas sync bidirectional?
10. **Implementation Notes Length**: What's the character limit?

## 11. Release Philosophy

### MVP (Current State)
- Full problem library (5+ problems)
- Interactive canvas with 44 components
- Chaos engineering with 30 event types
- AI judging framework
- 27-article learning library
- Simulation engine (speed, traffic, read/write controls)
- Account system with free and paid tiers

### Phase 1 (Immediate)
- Clarify AI feedback tier differences
- Improve onboarding tutorial (canvas tutorial exists but could expand)
- Add edge labels and better connection visualization
- Save/share designs

### Phase 2 (Near-term)
- Collaborative sessions
- More advanced AI metrics (component-level scoring)
- Expanded problem library with user-submitted questions
- Enhanced analytics and progress tracking
- Mobile-responsive canvas

### Phase 3 (Long-term)
- Mobile application
- Interview simulation mode (timed)
- Integration with interview prep platforms
- Enterprise/team features
- Advanced chaos (network partitioning, region failover, CRDT testing)

## 12. Conclusion

System Design Arena delivers a uniquely comprehensive, interactive environment for system design interview preparation. Its standout features include:
1. **44 drag-and-drop components** covering modern system design patterns, including AI/agent infrastructure
2. **30 chaos engineering events** spanning infrastructure, network, application, and global failures — a rare educational feature
3. **Dual AI judges** with debate and consensus feedback
4. **Simulation engine** with configurable speed, traffic, and read/write profiles
5. **27 learning articles** connected to specific problems
6. **Clear monetization**: free canvas + paid AI scoring/Mermaid

The platform demonstrates strong product-market fit by combining interactive design, chaos engineering, and AI feedback into a cohesive educational experience unmatched in the interview preparation space.
