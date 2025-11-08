# MCP Server Setup Guide

Complete guide to creating and configuring an MCP server for ChatGPT Apps.

## Table of Contents
1. [Choose an SDK](#choose-an-sdk)
2. [Describe Your Tools](#describe-your-tools)
3. [Point to Component Templates](#point-to-component-templates)
4. [Structure Tool Returns](#structure-tool-returns)
5. [Advanced Features](#advanced-features)
6. [Running Locally](#running-locally)

---

## Choose an SDK

Apps SDK supports any server that implements the MCP specification. Official SDKs are the fastest way to start:

### Python SDK (Official)
**Great for**: Rapid prototyping, includes FastMCP module

```bash
pip install mcp
```

**Repository**: https://github.com/modelcontextprotocol/python-sdk

**Note**: This is the official SDK, distinct from community "FastMCP" projects.

### TypeScript SDK (Official)
**Ideal for**: Node/React stacks

```bash
npm install @modelcontextprotocol/sdk
```

**Documentation**: https://modelcontextprotocol.io

### Installation with Web Framework

Install both SDK and your preferred web framework:

```bash
# Python with FastAPI
pip install mcp fastapi uvicorn

# Node with Express
npm install @modelcontextprotocol/sdk express
```

---

## Describe Your Tools

Tools are the **contract between ChatGPT and your backend**. Define:
- Clear **machine name**
- Human-friendly **title**
- **JSON schema** for inputs/outputs
- Per-tool **metadata** (auth hints, status strings, component config)

### Basic Tool Registration

**TypeScript Example**:

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const server = new McpServer({
  name: "kanban-server",
  version: "1.0.0"
});

server.registerTool(
  "kanban-board",
  {
    title: "Show Kanban Board",
    description: "Use this when the user wants to view their kanban board",
    inputSchema: {
      tasks: z.string()
    },
    _meta: {
      "openai/outputTemplate": "ui://widget/kanban-board.html",
      "openai/toolInvocation/invoking": "Displaying the board",
      "openai/toolInvocation/invoked": "Displayed the board"
    }
  },
  async ({ input }) => {
    return {
      content: [{ type: "text", text: "Displayed the kanban board!" }],
      structuredContent: {}
    };
  }
);
```

**Python Example** (FastMCP):

```python
from mcp.server.fastmcp import FastMCP

mcp = FastMCP(name="kanban-server")

@mcp.tool(
    title="Show Kanban Board",
    description="Use this when the user wants to view their kanban board"
)
async def kanban_board(tasks: str):
    """Display a kanban board with the given tasks."""
    return {
        "content": [{"type": "text", "text": "Displayed the kanban board!"}],
        "structuredContent": {}
    }
```

---

## Point to Component Templates

Each tool should reference an **HTML UI template** in its descriptor. This template renders in an iframe by ChatGPT.

### Three-Step Process

#### 1. Register the Template

Expose a **resource** with:
- `mimeType`: `text/html+skybridge`
- Body loads compiled JS/CSS bundle
- URI becomes canonical ID (e.g., `ui://widget/kanban-board.html`)

**TypeScript Example**:

```typescript
import { readFileSync } from "node:fs";

// Load locally built assets
const KANBAN_JS = readFileSync("web/dist/kanban.js", "utf8");
const KANBAN_CSS = (() => {
  try {
    return readFileSync("web/dist/kanban.css", "utf8");
  } catch {
    return ""; // CSS optional
  }
})();

server.registerResource(
  "kanban-widget",
  "ui://widget/kanban-board.html",
  {},
  async () => ({
    contents: [
      {
        uri: "ui://widget/kanban-board.html",
        mimeType: "text/html+skybridge",
        text: `
          <div id="kanban-root"></div>
          ${KANBAN_CSS ? `<style>${KANBAN_CSS}</style>` : ""}
          <script type="module">${KANBAN_JS}</script>
        `.trim(),
        _meta: {
          // Renders widget with border and shadow
          "openai/widgetPrefersBorder": true,

          // Assigns subdomain for HTML
          "openai/widgetDomain": "https://chatgpt.com",

          // Content Security Policy
          "openai/widgetCSP": {
            // Maps to connect-src rule in iframe CSP
            connect_domains: ["https://chatgpt.com"],
            // Maps to style-src, img-src, font-src, etc.
            resource_domains: ["https://*.oaistatic.com"]
          }
        }
      }
    ]
  })
);
```

#### 2. Link Tool to Template

Inside tool descriptor, set `_meta["openai/outputTemplate"]` to same URI:

```typescript
server.registerTool(
  "kanban-board",
  {
    title: "Show Kanban Board",
    _meta: {
      "openai/outputTemplate": "ui://widget/kanban-board.html",
      "openai/toolInvocation/invoking": "Displaying the board",
      "openai/toolInvocation/invoked": "Displayed the board"
    },
    inputSchema: { tasks: z.string() }
  },
  async () => { /* ... */ }
);
```

#### 3. Version Carefully

When shipping breaking component changes:
- Register a **new resource URI**
- Update tool metadata in lockstep
- ChatGPT caches templates aggressively
- Unique URIs prevent stale assets

---

## Structure Tool Returns

Each tool result can include **three sibling fields** that shape how ChatGPT and your component consume the payload:

### Field Breakdown

#### `structuredContent`
- **Structured data** that hydrates your component
- Examples: tracks for playlist, homes for realtor app, tasks for kanban
- ChatGPT injects as `window.openai.toolOutput`
- Keep scoped to data your UI needs
- **Model reads and may narrate/summarize these values**

#### `content`
- **Optional free-form text** (Markdown or plain strings)
- Model receives verbatim
- Not automatically displayed to user
- Good for providing context to model

#### `_meta`
- **Arbitrary JSON** passed only to component
- **Never shown to model**
- Use for data that shouldn't influence model reasoning
- Example: full set of locations backing a dropdown

### Control Text Under Component

To control text displayed under component, use `widgetDescription`:

```typescript
{
  _meta: {
    "openai/widgetDescription": "Renders an interactive kanban board"
  }
}
```

### Example: Kanban Board

```typescript
async function loadKanbanBoard() {
  const tasks = [
    { id: "task-1", title: "Design empty states", assignee: "Ada", status: "todo" },
    { id: "task-2", title: "Wireframe admin panel", assignee: "Grace", status: "in-progress" },
    { id: "task-3", title: "QA onboarding flow", assignee: "Lin", status: "done" }
  ];

  return {
    columns: [
      { id: "todo", title: "To do", tasks: tasks.filter(t => t.status === "todo") },
      { id: "in-progress", title: "In progress", tasks: tasks.filter(t => t.status === "in-progress") },
      { id: "done", title: "Done", tasks: tasks.filter(t => t.status === "done") }
    ],
    tasksById: Object.fromEntries(tasks.map(t => [t.id, t])),
    lastSyncedAt: new Date().toISOString()
  };
}

server.registerTool(
  "kanban-board",
  {
    title: "Show Kanban Board",
    _meta: {
      "openai/outputTemplate": "ui://widget/kanban-board.html",
      "openai/toolInvocation/invoking": "Displaying the board",
      "openai/toolInvocation/invoked": "Displayed the board"
    },
    inputSchema: { tasks: z.string() }
  },
  async () => {
    const board = await loadKanbanBoard();

    return {
      structuredContent: {
        columns: board.columns.map(column => ({
          id: column.id,
          title: column.title,
          tasks: column.tasks.slice(0, 5) // keep payload concise for model
        }))
      },
      content: [{
        type: "text",
        text: "Here's your latest board. Drag cards in the component to update status."
      }],
      _meta: {
        tasksById: board.tasksById, // full task map for component only
        lastSyncedAt: board.lastSyncedAt
      }
    };
  }
);
```

---

## Advanced Features

### Allow Component-Initiated Tool Access

To allow component to call tools directly:

```typescript
{
  _meta: {
    "openai/outputTemplate": "ui://widget/kanban-board.html",
    "openai/widgetAccessible": true // Allow component to call this tool
  }
}
```

### Define Content Security Policies

Widgets require strict CSP for broad distribution. Declare in component resource:

```typescript
server.registerResource(
  "html",
  "ui://widget/widget.html",
  {},
  async () => ({
    contents: [{
      uri: "ui://widget/widget.html",
      mimeType: "text/html",
      text: `
        <div id="kitchen-sink-root"></div>
        <link rel="stylesheet" href="https://persistent.oaistatic.com/ecosystem-built-assets/kitchen-sink-2d2b.css">
        <script type="module" src="https://persistent.oaistatic.com/ecosystem-built-assets/kitchen-sink-2d2b.js"></script>
      `.trim(),
      _meta: {
        "openai/widgetCSP": {
          connect_domains: [],
          resource_domains: ["https://persistent.oaistatic.com"]
        }
      }
    }]
  })
);
```

CSP maps to:
```
script-src 'self' ${resources}
img-src 'self' data: ${resources}
font-src 'self' ${resources}
connect-src 'self' ${connects}
```

### Configure Component Subdomains

For public API keys that need origin/referrer restrictions:

```typescript
{
  "openai/widgetDomain": "https://chatgpt.com"
}
```

Converts to: `https://chatgpt-com.web-sandbox.oaiusercontent.com`

**Notes**:
- Domains unique to each partner
- No cookie storage/access even with dedicated subdomains
- Enables ChatGPT punchout button in desktop fullscreen

### Configure Status Strings

Provide localized status strings during/after invocation:

```typescript
{
  _meta: {
    "openai/outputTemplate": "ui://widget/kanban-board.html",
    "openai/toolInvocation/invoking": "Organizing tasks…",
    "openai/toolInvocation/invoked": "Board refreshed."
  }
}
```

### Serve Localized Content

ChatGPT advertises user's preferred locale during MCP initialize handshake.

**Locale Request**:
```json
{
  "jsonrpc": "2.0",
  "method": "initialize",
  "params": {
    "protocolVersion": "2024-11-05",
    "_meta": {
      "openai/locale": "en-GB"
    }
  }
}
```

**Locale Response**:
```typescript
{
  _meta: {
    "openai/outputTemplate": "ui://widget/kanban-board.html",
    "openai/locale": "en" // Echo resolved locale
  }
}
```

**Locale Tags**: Follow IETF BCP 47 (`en-US`, `fr-FR`, `es-419`)

**Negotiation**: Use RFC 4647 lookup rules for closest match

### Inspect Client Context Hints

Operation-phase requests may include hints under `_meta.openai/*`:

- **`_meta["openai/userAgent"]`**: Client identifier (e.g., `ChatGPT/1.2025.012`)
- **`_meta["openai/userLocation"]`**: Coarse location (country, region, city, timezone, coordinates)

**Important**: Advisory only, never rely for authorization

### Add Component Descriptions

Help model understand what's displayed to avoid redundant responses:

```typescript
server.registerResource("html", "ui://widget/widget.html", {}, async () => ({
  contents: [{
    uri: "ui://widget/widget.html",
    mimeType: "text/html",
    text: componentHtml,
    _meta: {
      "openai/widgetDescription": "Renders an interactive UI showcasing the zoo animals returned by get_zoo_animals"
    }
  }]
}));

server.registerTool(
  "get_zoo_animals",
  {
    title: "get_zoo_animals",
    description: "Lists zoo animals and facts about them",
    inputSchema: { count: z.number().int().min(1).max(20).optional() },
    annotations: {
      readOnlyHint: true
    },
    _meta: {
      "openai/outputTemplate": "ui://widget/widget.html"
    }
  },
  async ({ count = 10 }) => {
    const animals = generateZooAnimals(count);
    return {
      content: [],
      structuredContent: { animals }
    };
  }
);
```

**Note**: Must refresh actions in dev mode for description to take effect

---

## Running Locally

### Build Component Bundle

See `03-component-building-guide.md` for detailed instructions.

```bash
cd web
npm run build
```

### Start MCP Server

**TypeScript**:
```bash
cd pizzaz_server_node
pnpm start
```

**Python**:
```bash
uvicorn server.main:app --port 8000
```

### Test with MCP Inspector

1. Point Inspector to `http://localhost:<port>/mcp`
2. List tools
3. Call them
4. Verify response includes structured content and component metadata
5. Inspector renders component inline

### Expose Public Endpoint

ChatGPT requires HTTPS. Use ngrok during development:

```bash
ngrok http <port>
# Forwarding: https://<subdomain>.ngrok.app -> http://127.0.0.1:<port>
```

Use resulting URL when creating connector in developer mode.

For production, deploy to HTTPS endpoint with low cold-start latency (see `05-deployment-guide.md`).

### Layer in Authentication & Storage

Once server handles anonymous traffic, add:
- **Authentication**: OAuth 2.1 flows (see `04-authentication-guide.md`)
- **State Management**: User persistence and sessions

---

## Next Steps

With MCP server configured:
1. Build your component bundle (`03-component-building-guide.md`)
2. Add authentication if needed (`04-authentication-guide.md`)
3. Deploy and connect (`05-deployment-guide.md`)
