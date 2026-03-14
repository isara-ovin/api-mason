# APIMason — Block Types & Data Passing

## Block Types (Custom React Flow Nodes)

### Core Blocks

| Block | Icon | Purpose | Configuration |
|-------|------|---------|---------------|
| **Start** | ▶️ | Entry point of the flow | — |
| **API Request** | 🌐 | Execute an HTTP request | Method, URL, headers, body, auth (from Postman) |
| **IF Condition** | 🔀 | Branch flow based on expression | JSONPath expr + comparator + expected value |
| **Delay** | ⏱️ | Wait for N seconds/ms | Duration input (number + unit) |
| **Polling** | 🔄 | Repeat API call until condition met | Interval, max retries, stop condition (JSONPath) |
| **Transform** | 🔧 | Transform/map response data | JSONPath mapping or JS expression |
| **End** | ⏹️ | Terminal node (marks flow complete) | — |

### Block Anatomy (UI)

```
┌──────────────────────────┐
│ ● GET  /api/users        │  ← Header (type + label)
│──────────────────────────│
│ Status: 200 ✓            │  ← Runtime status (during execution)
│ Duration: 145ms          │
│──────────────────────────│
│ ○ output                 │  ← Output handle (connects to next block)
└──────────────────────────┘
```

### IF Block (Special: Two Outputs)

```
┌──────────────────────────┐
│ 🔀 IF Condition          │
│──────────────────────────│
│ $.block_1.body.active    │
│    == true               │
│──────────────────────────│
│ ○ true    ○ false        │  ← Two output handles
└──────────────────────────┘
```

---

## Data Passing Between Blocks

### Context Object

Each block receives a **context object** that accumulates outputs from all prior blocks:

```typescript
interface ExecutionContext {
  [blockId: string]: {
    status: number;
    headers: Record<string, string>;
    body: any;
    duration: number;    // ms
    timestamp: string;   // ISO
  };
}

// Example at block #3:
{
  "block_abc123": {
    status: 200,
    headers: { "content-type": "application/json" },
    body: { userId: 42, name: "Alice", active: true },
    duration: 145,
    timestamp: "2026-03-13T10:00:00Z"
  },
  "block_def456": {
    status: 201,
    body: { orderId: 99, total: 59.99 },
    duration: 230,
    timestamp: "2026-03-13T10:00:01Z"
  }
}
```

### JSONPath References

In any block's configuration, reference prior block data using JSONPath:

| Expression | Resolves to |
|-----------|-------------|
| `$.block_abc123.body.userId` | `42` |
| `$.block_abc123.body.name` | `"Alice"` |
| `$.block_def456.body.orderId` | `99` |
| `$.block_abc123.status` | `200` |
| `$.block_def456.body.total` | `59.99` |

### Environment Variables

Postman-style `{{variable}}` syntax for environment substitution:

```
URL: {{baseUrl}}/users/{{userId}}
Header: Authorization: Bearer {{token}}
```

Variables are resolved from:
1. Postman environment file (imported)
2. Runtime context (block outputs)
3. User-defined overrides

---

## Import/Export Format

Orchestrations export as self-contained JSON (no collection dependency):

```json
{
  "version": "1.0",
  "name": "My Orchestration",
  "description": "Fetches user then creates order",
  "nodes": [ ],
  "edges": [ ],
  "blockConfigs": {
    "node-1": {
      "type": "api-request",
      "method": "GET",
      "url": "{{baseUrl}}/users/{{userId}}",
      "headers": { "Authorization": "Bearer {{token}}" }
    },
    "node-2": {
      "type": "if-condition",
      "expression": "$.node-1.body.active",
      "comparator": "equals",
      "value": true
    }
  }
}
```

> **Note:** Importing an orchestration does **not** require the original Postman collection. The JSON is self-contained with all request details embedded.
