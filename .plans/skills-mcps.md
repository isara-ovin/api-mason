# APIMason — Agent Skills & MCPs for Vibe Coding

## Skills Matrix

| Skill / MCP | What it helps with | When to use |
|-------------|-------------------|-------------|
| **React Flow knowledge** | Custom nodes, edges, drag-drop from sidebar, minimap, controls | Canvas component development |
| **Web Development skill** | HTML/CSS/JS, responsive layouts, design system, dark/light theme | All UI work — sidebar, panels, modals |
| **Motion / Framer Motion** | `motion.div`, `AnimatePresence`, `layoutId`, spring configs | Node insert, panel transitions, execution progress |
| **File System MCP** | Reading/writing local files (Postman JSON imports, SQLite DB, export) | Import/export features, DB operations |
| **Browser MCP** | Testing UI in a real browser, verifying drag-drop, responsive layout | Verification and visual QA |
| **Terminal / Shell MCP** | Running dev server, Docker builds, npm installs, running tests | Build & deploy workflows |
| **Fetch / HTTP MCP** | Making HTTP requests to test the orchestration engine APIs | Backend API testing |
| **SQLite MCP** | Querying and managing the SQLite database directly | Database schema design, data debugging |
| **Docker MCP** | Building and managing Docker images/containers | Containerisation phase |

## Recommended Agent/Cursor Rules

```
- Use React Flow (@xyflow/react) for the canvas — never build a custom canvas
- Use Motion (motion) for animations — prefer GPU-accelerated properties
- Use LazyMotion + m components to keep bundle size under 5kb for animations
- Use better-sqlite3 for all database operations — synchronous API
- Use jsonpath for data extraction between blocks
- Use Zustand for global state — keep React Flow state in Zustand store
- Prefer existing open-source packages over custom implementations
- All animations must use transform/opacity only — no layout-triggering properties
- Keep micro-animations under 300ms for snappy feel
- Use TypeScript everywhere — no `any` types unless unavoidable
- Dark mode is the default theme — all components must support both themes
```

## Skill Usage by Phase

| Phase | Primary Skills | MCPs |
|-------|---------------|------|
| **1. Foundation** | Web Dev, TypeScript | Terminal, File System |
| **2. Canvas & Blocks** | React Flow, Motion, Web Dev | Browser, Terminal |
| **3. Orchestration Engine** | TypeScript, HTTP knowledge | Fetch, Terminal, SQLite |
| **4. Persistence & Polish** | Web Dev, Motion | File System, SQLite, Browser |
| **5. Animations & UX** | Motion, CSS Animations | Browser |
| **6. Containerisation** | Docker | Docker, Terminal |
