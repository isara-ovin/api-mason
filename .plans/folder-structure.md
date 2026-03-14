# APIMason — Folder Structure

```
APIMason/
├── .plans/                         # Plans & requirements
│   ├── requirment.md               # Original requirements
│   ├── plan.md                     # Master plan (overview + decisions)
│   ├── tech-stack.md               # Packages & tools
│   ├── skills-mcps.md              # Agent skills for vibe coding
│   ├── database-schema.md          # SQLite schema
│   ├── blocks-and-data.md          # Block types & data passing
│   ├── build-phases.md             # Phased build plan
│   ├── animations.md               # Animation strategy
│   └── folder-structure.md         # This file
│
├── client/                         # React frontend (Vite + TypeScript)
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── Canvas/             # React Flow wrapper
│   │   │   │   ├── FlowCanvas.tsx  # Main canvas component
│   │   │   │   ├── CanvasControls.tsx
│   │   │   │   └── MiniMap.tsx
│   │   │   ├── Nodes/              # Custom React Flow nodes
│   │   │   │   ├── ApiRequestNode.tsx
│   │   │   │   ├── IfConditionNode.tsx
│   │   │   │   ├── DelayNode.tsx
│   │   │   │   ├── PollingNode.tsx
│   │   │   │   ├── TransformNode.tsx
│   │   │   │   ├── StartNode.tsx
│   │   │   │   ├── EndNode.tsx
│   │   │   │   └── nodeTypes.ts    # Registry of custom nodes
│   │   │   ├── Edges/              # Custom animated edges
│   │   │   │   ├── AnimatedEdge.tsx
│   │   │   │   └── edgeTypes.ts
│   │   │   ├── Sidebar/            # Left sidebar
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── CollectionTree.tsx
│   │   │   │   ├── BlockPalette.tsx
│   │   │   │   └── SavedFlows.tsx
│   │   │   ├── Panels/             # Right & bottom panels
│   │   │   │   ├── ConfigPanel.tsx       # Block configuration
│   │   │   │   ├── ExecutionPanel.tsx     # Run logs
│   │   │   │   ├── ResponseViewer.tsx     # JSON response viewer
│   │   │   │   └── VariableState.tsx      # Current context vars
│   │   │   ├── Toolbar/            # Top toolbar
│   │   │   │   ├── Toolbar.tsx
│   │   │   │   ├── SaveButton.tsx
│   │   │   │   ├── PlayButton.tsx
│   │   │   │   └── ThemeToggle.tsx
│   │   │   └── Common/             # Shared UI components
│   │   │       ├── Button.tsx
│   │   │       ├── Input.tsx
│   │   │       ├── Modal.tsx
│   │   │       ├── Dropdown.tsx
│   │   │       └── FileUpload.tsx
│   │   ├── hooks/
│   │   │   ├── useOrchestration.ts  # Load/save/manage orchestrations
│   │   │   ├── useExecution.ts      # Start/stop/monitor execution
│   │   │   ├── useDragDrop.ts       # Sidebar → canvas drag-drop
│   │   │   └── useTheme.ts          # Dark/light theme toggle
│   │   ├── store/
│   │   │   ├── flowStore.ts         # React Flow nodes/edges state
│   │   │   ├── collectionStore.ts   # Imported collections & envs
│   │   │   ├── executionStore.ts    # Execution status & logs
│   │   │   └── uiStore.ts           # Panel visibility, selected block
│   │   ├── styles/
│   │   │   ├── index.css            # Global styles + CSS reset
│   │   │   ├── tokens.css           # Design tokens (colors, spacing)
│   │   │   ├── themes.css           # Dark/light theme variables
│   │   │   ├── animations.css       # Keyframe animations
│   │   │   └── reactflow.css        # React Flow overrides
│   │   ├── utils/
│   │   │   ├── constants.ts
│   │   │   ├── types.ts             # Shared TypeScript types
│   │   │   └── helpers.ts
│   │   ├── motion/
│   │   │   ├── variants.ts          # Motion animation variants
│   │   │   └── springs.ts           # Spring configs
│   │   ├── App.tsx                  # Root component
│   │   └── main.tsx                 # Entry point
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── server/                         # Node.js backend (Express + TypeScript)
│   ├── src/
│   │   ├── routes/
│   │   │   ├── collections.ts      # POST /import, GET /, GET /:id, DELETE
│   │   │   ├── environments.ts     # CRUD for environments
│   │   │   ├── orchestrations.ts   # CRUD + import/export
│   │   │   └── execute.ts          # POST /execute, GET /execute/:id/status (SSE)
│   │   ├── services/
│   │   │   ├── collectionParser.ts # Parse Postman v2.0/v2.1 JSON
│   │   │   ├── executor.ts         # Sequential execution engine
│   │   │   ├── jsonpathResolver.ts # Resolve JSONPath in block configs
│   │   │   └── envResolver.ts      # Resolve {{variable}} templates
│   │   ├── db/
│   │   │   ├── connection.ts       # better-sqlite3 setup
│   │   │   ├── migrations.ts       # Schema migrations
│   │   │   └── queries.ts          # Prepared statements
│   │   ├── models/
│   │   │   ├── collection.ts       # Collection interface
│   │   │   ├── orchestration.ts    # Orchestration interface
│   │   │   ├── execution.ts        # Execution interface
│   │   │   └── blocks.ts           # Block type interfaces
│   │   └── index.ts                # Express server entry point
│   ├── data/                       # SQLite database file location
│   │   └── .gitkeep
│   ├── package.json
│   └── tsconfig.json
│
├── docker-compose.yml
├── Dockerfile
├── README.md
├── .gitignore
├── .eslintrc.cjs
└── .prettierrc
```
