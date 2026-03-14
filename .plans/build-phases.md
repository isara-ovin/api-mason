# APIMason — Build Phases

## Phase 1 — Foundation (Week 1–2)

- [ ] Project scaffolding: Vite + React + TypeScript (`client/`)
- [ ] Backend scaffolding: Express + TypeScript (`server/`)
- [ ] Setup `better-sqlite3` with migration system
- [ ] Create database tables (collections, environments, orchestrations, executions)
- [ ] Postman collection parser — accept v2.0 + v2.1 JSON
- [ ] Postman environment parser
- [ ] REST API: CRUD for collections & environments
- [ ] REST API: CRUD for orchestrations
- [ ] Dark/light theme setup with CSS variables

---

## Phase 2 — Canvas & Blocks (Week 2–3)

- [ ] React Flow canvas setup (zoom, pan, grid/dot background)
- [ ] Zustand store for flow state (nodes, edges, selected block)
- [ ] Sidebar: collection tree view (folders → requests)
- [ ] Sidebar: block palette (IF, Delay, Polling, Transform)
- [ ] Sidebar: saved orchestrations list
- [ ] Drag-and-drop from sidebar → canvas (create nodes)
- [ ] Custom node: **API Request** (method badge, URL, status)
- [ ] Custom node: **IF Condition** (two output handles)
- [ ] Custom node: **Delay** (duration display)
- [ ] Custom node: **Polling** (interval + retry count)
- [ ] Custom node: **Transform** (JSONPath mapping)
- [ ] Custom node: **Start** / **End** markers
- [ ] Custom animated edges
- [ ] Block configuration panel (slide-in from right)
- [ ] Monaco editor for request body / JSONPath expressions

---

## Phase 3 — Orchestration Engine (Week 3–4)

- [ ] Sequential execution engine (backend)
- [ ] Execute API requests via axios (resolve env vars + JSONPath refs)
- [ ] Build and propagate execution context between blocks
- [ ] IF condition evaluator (JSONPath expression → branch)
- [ ] Delay block implementation (`setTimeout`)
- [ ] Polling block with retry logic + stop condition
- [ ] Transform block (JSONPath re-mapping)
- [ ] Real-time execution status via **Server-Sent Events (SSE)**
- [ ] Execution log panel (step-by-step results, expandable)
- [ ] Response viewer with syntax-highlighted JSON (Monaco readonly)

---

## Phase 4 — Persistence & Polish (Week 4–5)

- [ ] Save orchestration → SQLite (serialize React Flow state + block configs)
- [ ] Load orchestration → restore canvas
- [ ] Play button → trigger execution against backend
- [ ] Multiple orchestrations management (list, rename, delete)
- [ ] Import orchestration from JSON file
- [ ] Export orchestration to JSON file
- [ ] Environment variable substitution in request configs
- [ ] Toast notifications (success, error, info) via react-hot-toast

---

## Phase 5 — Animations & UX Polish (Week 5)

- [ ] Node insert animation (spring scale-in)
- [ ] Edge drawing animation (SVG stroke trace)
- [ ] Panel slide transitions (AnimatePresence)
- [ ] Execution progress pulse on active node (CSS glow)
- [ ] Step-complete checkmark animation (spring)
- [ ] Hover effects on nodes and sidebar items
- [ ] Loading / skeleton states
- [ ] Minimap with smooth transitions
- [ ] Keyboard shortcuts (Save, Run, Delete, Undo)

---

## Phase 6 — Containerisation & Release (Week 6)

- [ ] Multi-stage Dockerfile (build frontend + serve with backend)
- [ ] `docker-compose.yml` (single service, volume mount for SQLite file)
- [ ] README with setup instructions (local + Docker)
- [ ] GitHub Actions CI (lint, typecheck, test, build)
- [ ] License file (MIT or choice)

---

## Phase 7 — Future (Deferred)

- [ ] Vercel deployment support
- [ ] Supabase / PostgreSQL adapter (swap SQLite)
- [ ] Parallel execution branches (fan-out/fan-in)
- [ ] Webhook trigger blocks
- [ ] Basic auth for containerised version
- [ ] Team collaboration / shared orchestrations
- [ ] WebSocket support for long-running executions
- [ ] Pre/post request scripts (like Postman tests)
