# 📖 Comprehensive User Review & Staging Workflow Guide

To maximize code parsing and deployment efficiency, navigate your workspace playground session along this optimized interaction pipeline:

---

## 🔄 The Core Workspace Pipeline

### 1. Interactive Source Node Mapping
* **Action:** Click on any workspace file node directly on the central interactive dependency map canvas.
* **Mechanism:** The inspector module will slide open, initializing automated code metrics validation routines to print instant layout overviews, cognitive weight analytics, flow logs, and implementation syntax blocks.

### 2. Live Monaco Session Edits
* **Action:** Select a valid file node to load its raw strings array into the Monaco workspace editor window.
* **Mechanism:** As you append statements or clean modular code inside the editor pane, the state manager tracks changes on the fly. The Git console drawer immediately flags the asset row with an active tracking indicator (`Modified`), and ticks up the `Changes (count)` tab badge instantly.

### 3. Invoking the Groq AI Integrity Layer
* **Action:** Switch to the **AI Integrity** panel in the workspace control console drawer and hit **Run Scan**.
* **Mechanism:** The server action pipelines the current text configuration buffer straight to the Groq Llama-3.3 cluster. The infrastructure reviews code semantics for potential edge crashes, performance drops, or execution blocks, parsing results back into clean cards loaded with precise line fix recommendations and technical hazard summaries.

### 4. Code Commits & Log Registries
* **Action:** When your refactoring and code fixes are complete, return to the **Changes** tab inside the Git Console drawer. Type an explicit, clean message into the console input field (e.g., `feat: optimize data stream payload buffers`) and hit **Commit changes**.
* **Localhost Behavioral Matrix:** The tracking state cleanly resets to zero, clearing editor changes tags. A fresh item containing a randomized SHA hash string shifts onto the top of your **Branch History Logs** timeline marked `Just now`. Your master repository remains unpolluted while you test code changes locally!
* **Vercel Production Behavioral Matrix:** The layout bypasses local hooks, triggers your real-time GitHub repository tree update API, flushes mutations, and pushes messages down your web socket channels to auto-refresh all collaborative canvas sessions instantly via Pusher webhooks.

---

## ⚡ Technical Stack Specification Matrix

| Architecture Layer | Technology Selection | Operational Purpose |
| :--- | :--- | :--- |
| **Framework Runtime Engine** | Next.js 14 | App Router structure supporting React Server Components and Atomic Server Actions. |
| **State Architecture Core** | Zustand v4+ | Client-side reactive hub utilizing strict shallow-copy array reference overrides. |
| **Code IDE Wrapper** | `@monaco-editor/react` | In-browser multi-tab text surface running an isolated web worker parser model. |
| **AI Processing Layer** | Groq Cloud SDK | Ultra-low latency pipeline executing evaluations on `llama-3.3-70b-versatile`. |
| **Realtime Web Sockets Matrix**| Pusher Channels | Multi-tenant communication layer distributing dynamic canvas states instantly. |
| **Icon Portfolio Assets** | Lucide React | Lightweight vector asset markers providing consistent visual context. |
| **Visual Interface Primitives** | Tailwind CSS + Shadcn | Accessible layout framework paired with low-level copy-pasted source controls. |

---

## 📂 Source Directory Reference Map

```
└── src
    ├── app
    │   ├── actions
    │   │   └── ai-analyzer.ts          # Server Action isolating Groq Llama-3.3 API calls
    │   └── dashboard
    │       └── visualizer
    │           └── [playground]
    │               └── page.tsx        # Dashboard frame orchestrating Monaco & D3 Canvas
    ├── components
    │   └── visualizer
    │       └── global-git-drawer.tsx   # Slide-out staging terminal, branches & review logs
    └── store
        └── use-visualizer-store.ts     # Central Zustand state engine managing dynamic logs





### 🎛️ `src/store/use-visualizer-store.ts` (Global State Center)
Manages workspace nodes, dependency lines, metrics views, live multiplayer cursors, and branch commits. Implements cross-boundary trigger updates (`syncLiveUnstagedChanges`) to dynamically calculate repository modification states instantly as keys are hit.

### 🗲 `src/app/actions/ai-analyzer.ts` (Groq Review Pipeline)
Isolates sensitive api variables (`process.env.GROQ_API_KEY`) safely away from client browsers. Built with defensive string cleanups that remove accidental code block backticks (` ```json `) to ensure raw data flows safely into JSON parsers.

### 💻 `src/app/dashboard/visualizer/[playground]/page.tsx` (IDE Shell Window)
The central terminal space housing split layouts, file tab navigation arrays, drag-to-resize panel controls, and chat dialog layers. Wraps key text streams inside React transition boundaries (`startTransition`) to process extensive codebase blocks concurrently without dropping visual feedback frames.

### 📦 `src/components/visualizer/global-git-drawer.tsx` (Console Panel Interface)
A collapsible slide-out layout hosting your three primary development views: Uncommitted modifications staging array, Branch selection tree histories, and Groq performance check lists.

---

## 🚀 Step-by-Step Installation & Local Workspace Activation

Follow these explicit commands to mount dependencies, build configurations, and spin up the developer compilation server layer:

### Step 1: Clone the Codebase Repository & Install Dependencies

# Clone the project source branch code
git clone https://github.com/ShreenandBandre/VibeDev_v2.git
cd vvibedev_v2

# Pull down official production node modules securely
npm install
Step 2: Establish Your Environment Variable Configuration Matrix
Create a localized variables tracking file named .env.local inside the root workspace folder and populate your secure service parameters:

DATABASE_URL=""  (MongoDb + Prisma)
AUTH_SECRET=""   (NextAuth JS V5) 
AUTH_GITHUB_ID=""  (your Github App OAuth Id)
AUTH_GITHUB_SECRET=""  (your Github App OAuth Secret)
NEXTAUTH_URL="http://localhost:3000"
GROQ_API_KEY=""
NEXT_PUBLIC_SOCKET_SERVER_URL="http://localhost:3001"  #Optional

NEXT_PUBLIC_PUSHER_KEY=""
NEXT_PUBLIC_PUSHER_CLUSTER=""
PUSHER_APP_ID=""
PUSHER_SECRET=""
GITHUB_WEBHOOK_SECRET=""  (For local Testing)
NEXT_PUBLIC_GITHUB_PAT="" (Your Personal Access Token for local and after deployment proceeding)(For Triggering webhook to listen and commit changes from VibeDev)

Code snippet
# 🧠 Groq Cloud Secure Cluster Key (Obtained via console.groq.com)
GROQ_API_KEY=gsk_your_live_production_secure_key_here

# 📡 Realtime Synchronizer Socket Primitives (Pusher Infrastructure)
NEXT_PUBLIC_PUSHER_KEY=your_pusher_application_public_key
NEXT_PUBLIC_PUSHER_CLUSTER=ap2

Step 3: Launch the Hot-Reloading Development Server
Fire up the Next.js local compiler architecture:

Bash
npm run dev
Navigate to http://localhost:3000 inside your web browser to initialize your live canvas dashboard playground session.


[ Monaco Editor Changes ] ──(Auto-Staging)──> [ Zustand Store (Dirty State: True) ]
                                                            │
                                                   (Hybrid Host Detection)
                                                            │
                            ┌───────────────────────────────┴───────────────────────────────┐
                            ▼                                                               ▼
             ⚡ LOCALHOST MODE (Sandbox)                                     🌐 VERCEL PRODUCTION (Live API)
  - Intercepts actual server network pushes.                     - Routes changes into Next.js Server Actions.
  - Cleans node tracking buffers instantly in UI.               - Pushes live commit blobs directly to GitHub API.
  - Injects Mock SHA Hash onto history logs ("Just now").       - Triggers Pusher Webhook to broadcast all users.


# 🗺️ Project Architecture & Implementation Roadmap

This section documents the step-by-step technical progression of the codebase, tracing the lifecycle from initial setup to fully integrated cloud service layers.

---

## 🛠️ Step 1: Base System Initialization & Installation

The project foundational layer is built upon the Next.js 14 runtime environment utilizing the modern React Server Components (RSC) topology.

* **Project Core Generation:** Scaffolded utilizing the official compiler configuration with explicit TypeScript typing boundaries.
    ```bash
    npx create-next-team@latest architecture-explorer-canvas --typescript --tailwind --eslint
    ```
* **Module Synchronization:** Standardized on strict package version lock configurations (`package-lock.json` / `pnpm-lock.yaml`) to avoid dependency drifting across developer workspaces.
* **Path Mapping Configuration:** Modified `tsconfig.json` to assign an absolute root alias (`@/*` pointing to `src/`), eliminating complex, brittle relative paths inside source blocks.
    ```json
    "paths": {
      "@/*": ["./src/*"]
    }
    ```

---

## 🎨 Step 2: Design Primitives & UI Architecture (Shadcn UI)

Rather than consuming an abstract, unalterable external UI module package, the system utilizes raw, copy-pasted layout components embedded directly within your workspace control bounds.

* **Shadcn CLI Bootstrapping:** Initialized the component styling manifest to generate the design tokens configuration layer.
    ```bash
    npx shadcn-ui@latest init
    ```
* **Tailwind Theme Variable Integration:** The configuration creates an atomic CSS mapping sheet within `src/app/globals.css`, binding semantic variables (`--background`, `--foreground`, `--primary`, `--accent`) optimized for high-contrast engineering dark themes.
* **Component Staging:** Individual structural elements are added directly into local subfolders, providing full flexibility for low-level internal design overrides.
    ```bash
    npx shadcn-ui@latest add button dialogue sheet input drawer
    ```

---

## 🔐 Step 3: Identity Federation & Route Security (Auth.js / NextAuth)

Authentication is handled via a stateless, serverless-optimized session approach using Auth.js (NextAuth v5 ecosystem).

* **Package Mounts:** Added core authentication adapters and cryptographic utility layers.
    ```bash
    npm install next-auth@beta @auth/prisma-adapter
    ```
* **Edge Router Middleware:** Configured a native Edge middleware proxy file (`src/middleware.ts`) to intercept inbound HTTP traffic, immediately blocking unauthenticated access before hitting heavy layout compilation threads.
* **Multi-Provider Pipelines:** Integrated secure multi-provider auth endpoints. Credentials flows are securely verified, while OAuth callbacks (GitHub, Google) map straight into clean session targets.

---

## 🗄️ Step 4: Data Layer Models & Connections (Prisma + MongoDB)

Persistent documents, multi-tenant users, active files, and tracking histories are stored within a cloud-native MongoDB Atlas database cluster managed through Prisma ORM.

* **Prisma Client Core Installation:**
    ```bash
    npm install @prisma/client
    npm install prisma --save-dev
    npx prisma init
    ```
* **Singleton Client Safeguard:** Created an explicit global database client instance container (`src/lib/db.ts`) to prevent hot-reloads during local development from exhausting the MongoDB pool limit.
* **Relational Document Schemas:** Configured `schema.prisma` with exact database mapping overrides to properly format incoming user nodes and workspace files.
    ```prisma
    model User {
      id    String @id @default(auto()) @map("_id") @db.ObjectId
      email String @unique
      nodes Node[]
    }
    ```
* **Schema Push Synchronization:**
    ```bash
    npx prisma db push
    ```

---

## 💻 Step 5: Multi-Page Dynamic Shell Layouts

The frontend maps pages directly to file folders via Next.js App Router conventions, splitting layout frames into isolated runtime nodes.

* **Dynamic Routing Segments:** Created `src/app/dashboard/visualizer/[playground]/page.tsx` to read explicit workspace IDs directly from the URI address path.
* **Asynchronous Sublayouts:** Implemented nested `layout.tsx` files to isolate specialized view shells (Auth screens vs. Code Editor terminals), wrapping pages in targeted Error Boundary fallbacks.
* **Concurrent Thread Markers:** Wrapped heavy canvas switching states inside React `startTransition` markers, enabling smooth file loading without blocking typing inputs or drop-down interactions.

---

## 🚀 Step 6: Reactive Git Orchestration & State Synchronization

The engine uses custom change tracking logic to keep client components fully synced while completely protecting production data stores.

* **Reference-Immutability Enforcement:** Bypassed traditional object mutations (`array.push()`) which fail to trigger React updates. The core Zustand store handles updates via explicit shallow-copy array destruction (`set({ nodes: [...newNodes] })`), forcing immediate visual updates.
* **Environment-Aware Dual Execution Paths:**
    * **Local Prototyping Path (`localhost`):** Intercepts push actions during local development. It safely clears modified file badges and injects dummy SHA logs into the history timeline—giving a real-time responsive experience without polluting your remote GitHub branches.
    * **Vercel Production Deployment Path:** Forpasses simulation blocks, sending the staged file payloads directly to production Next.js Server Actions to securely execute live upstream repository updates.

---

## 🧠 Step 7: AI Diagnostic Integrations & Real-Time Sync Insertions

The canvas hooks directly into high-speed AI clusters and live multi-user communication websockets.

* **Deterministic AI Analysis Pipeline:** Wired server actions directly to the Groq Cloud SDK using the hyper-fast `llama-3.3-70b-versatile` model model group.
* **Structured JSON Output Constraints:** Passed explicit system string instructions paired with low execution temperatures (`0.1`) and strict formatting boundaries (`response_format: { type: "json_object" }`). This ensures the AI returns clean, parsable data arrays instead of loose markdown prose.
* **Real-Time WebSocket Sync:** Configured Pusher client connections within React `useEffect` roots, establishing a secure multi-user communication channel that auto-refreshes code state visuals across all open browser tabs the moment an update completes.
