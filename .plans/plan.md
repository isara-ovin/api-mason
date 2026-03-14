# APIMason — Master Plan

> **API Orchestration Tool** — Drag-and-drop API call flows from Postman collections, with conditional logic, delays, polling, and data-passing between blocks.

---

## Architecture

```
┌──────────────────────────────────────────────────────┐
│                    APIMason App                       │
│                                                      │
│  ┌──────────────┐   ┌─────────────────────────────┐  │
│  │  Sidebar      │   │       Canvas (React Flow)   │  │
│  │              │   │                             │  │
│  │ • Collections│   │  ┌─────┐    ┌─────┐        │  │
│  │   tree view  │──▶│  │ GET │───▶│ POST│        │  │
│  │              │   │  │/user│    │/order│       │  │
│  │ • Block      │   │  └─────┘    └──┬──┘        │  │
│  │   palette    │   │               │            │  │
│  │  (if, delay, │   │          ┌────▼────┐       │  │
│  │   poll, etc.)│   │          │ IF Block│       │  │
│  │              │   │          └────┬────┘       │  │
│  │ • Saved      │   │               │            │  │
│  │   flows      │   │          ┌────▼────┐       │  │
│  └──────────────┘   │          │  Delay  │       │  │
│                      │          └─────────┘       │  │
│                      └─────────────────────────────┘  │
│                                                      │
│  ┌──────────────────────────────────────────────────┐ │
│  │  Execution Panel (bottom/side)                   │ │
│  │  • Run logs  • Response viewer  • Variable state │ │
│  └──────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────┘
         │
         ▼
   ┌──────────┐
   │  SQLite   │   (local persistence)
   │  Database │
   └──────────┘
```

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| UI Theme | **Dark mode default** + light toggle | Developer-tool feel (like Postman/N8N) |
| Auth | **None** (future-ready) | Local tool; can add later for containers |
| Execution | **Sequential only** | Simpler v1; parallel branches deferred |
| Language | **TypeScript** (frontend + backend) | Type safety across the stack |
| Postman support | **v2.0 + v2.1** | Both collection formats supported |
| Monorepo or split? | **Monorepo** (`client/` + `server/`) | Single Docker build, simpler DX |
| State management | **Zustand** | Lightweight, great React Flow integration |
| Canvas | **React Flow** | Battle-tested for flow editors |
| Execution location | **Backend** (Node.js) | Avoids CORS; handles long-running polls |
| Data passing | **JSONPath** (`$.blockId.body.field`) | Familiar, well-supported library |
| Animations | **Motion + CSS** hybrid | Motion for components, CSS for ambient |
| DB (local) | **SQLite via better-sqlite3** | Zero config, single file, fast sync API |
| Export format | **JSON** | Self-contained orchestration files |

## Sub-plans

| File | Contents |
|------|----------|
| [tech-stack.md](./tech-stack.md) | All open-source packages & their roles |
| [skills-mcps.md](./skills-mcps.md) | Agent skills & MCPs for vibe coding |
| [database-schema.md](./database-schema.md) | SQLite tables & relationships |
| [blocks-and-data.md](./blocks-and-data.md) | Block types & data-passing design |
| [build-phases.md](./build-phases.md) | Phased build timeline with checkboxes |
| [animations.md](./animations.md) | Animation strategy & performance rules |
| [folder-structure.md](./folder-structure.md) | Project file & folder layout |
