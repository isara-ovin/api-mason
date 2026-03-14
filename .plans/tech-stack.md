# APIMason — Technology Stack & Packages

## Frontend

| Package | npm | Purpose | Why? |
|---------|-----|---------|------|
| **React Flow** | `@xyflow/react` | Node-based canvas, drag-drop, edges, zoom/pan | Industry standard for flow editors; MIT; custom nodes as React components |
| **Motion** | `motion` (formerly Framer Motion) | Animations (node entrance, edge draw, panel transitions) | GPU-accelerated, tree-shakable to ~4.6kb via `LazyMotion`, 120fps |
| **Zustand** | `zustand` | Global state management | Tiny, fast, perfect React Flow integration |
| **Monaco Editor** | `@monaco-editor/react` | Code/JSON editor for request body, scripts, JSONPath | VS Code engine, syntax highlighting, autocomplete |
| **React Hot Toast** | `react-hot-toast` | Toast notifications | Lightweight, animated, accessible |
| **Lucide Icons** | `lucide-react` | Icon set | Consistent, tree-shakable |
| **Resizable Panels** | `react-resizable-panels` | Resizable sidebar/panel layout | Well-maintained, supports persistence |

## Backend

| Package | npm | Purpose | Why? |
|---------|-----|---------|------|
| **postman-collection** | `postman-collection` | Parse Postman Collection v2.0/v2.1 JSON | Official Postman SDK; reads items, auth, variables |
| **better-sqlite3** | `better-sqlite3` | SQLite database | Fastest Node.js SQLite driver, sync API for local tools |
| **jsonpath** | `jsonpath` | Extract data from API responses | 3M+ weekly downloads, safe BNF parser |
| **axios** | `axios` | Execute HTTP requests during orchestration | Interceptors, timeout support, widely adopted |
| **Express** | `express` | REST API server | Simple, well-known |
| **uuid** | `uuid` | Generate unique IDs | Standard UUID generation |
| **cors** | `cors` | CORS middleware | Dev: Vite ↔ Express communication |

## DevOps & Tooling

| Tool | Purpose |
|------|---------|
| **Vite** | Frontend bundler (fast HMR, optimized builds) |
| **TypeScript** | Type safety across frontend + backend |
| **Docker + docker-compose** | Containerised deployment |
| **ESLint + Prettier** | Code quality & formatting |
| **Vitest** | Unit & integration tests |
