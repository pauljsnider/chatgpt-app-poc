# Examples and Resources

Code examples, repositories, and learning resources for building ChatGPT Apps.

## Table of Contents
1. [Official Examples Repository](#official-examples-repository)
2. [Example Apps](#example-apps)
3. [SDK Documentation](#sdk-documentation)
4. [Community Resources](#community-resources)
5. [Design Resources](#design-resources)

---

## Official Examples Repository

### GitHub: openai-apps-sdk-examples

**URL**: https://github.com/openai/openai-apps-sdk-examples

**Description**: Official example apps demonstrating UI components and MCP servers for ChatGPT applications.

### Repository Structure

```
openai-apps-sdk-examples/
├── src/                          # Widget component source code
├── assets/                        # Generated HTML, JS, CSS bundles
├── pizzaz_server_node/           # TypeScript MCP server
├── pizzaz_server_python/         # Python MCP server
├── solar-system_server_python/   # 3D solar system widget server
├── build-all.mts                 # Vite build orchestrator
├── package.json                  # Node package management
├── pnpm-workspace.yaml           # pnpm workspace config
└── vite.config.*.ts              # Frontend build configs
```

### Setup Instructions

**Prerequisites**:
- Node.js 18+
- pnpm (recommended package manager)
- Python 3.10+
- pre-commit tool

**Installation**:
```bash
git clone https://github.com/openai/openai-apps-sdk-examples.git
cd openai-apps-sdk-examples
pnpm install
pre-commit install
```

**Build & Serve**:
```bash
pnpm run build      # Creates versioned asset bundles
pnpm run dev        # Local development server
pnpm run serve      # Serves assets at http://localhost:4444
```

**Running MCP Servers**:

Node Server:
```bash
cd pizzaz_server_node
pnpm start
```

Python Server:
```bash
cd pizzaz_server_python
uvicorn main:app --port 8000
```

---

## Example Apps

### 1. Pizzaz (Node & Python)

Pizza-inspired collection demonstrating comprehensive UI widget integration.

**Features**:
- Multiple display modes (list, carousel, map, album, video)
- State management examples
- OAuth authentication patterns
- Component-initiated tool calls

**Variants**:
- **TypeScript/Node**: Full-featured MCP server
- **Python**: Equivalent implementation with FastMCP

#### Pizzaz List

**Use Case**: Ranked card list with favorites

**Key Features**:
- Inline card display
- State persistence (favorites)
- Call-to-action buttons
- Theme support

**Code Location**: `src/pizzaz-list/`

#### Pizzaz Carousel

**Use Case**: Horizontal scroller for media-heavy layouts

**Key Features**:
- Embla carousel integration
- Image optimization
- Smooth scrolling
- Responsive design

**Code Location**: `src/pizzaz-carousel/`

#### Pizzaz Map

**Use Case**: Interactive map with location pins

**Key Features**:
- Mapbox GL integration
- Fullscreen mode support
- Pin clustering
- Host state sync

**Code Location**: `src/pizzaz-map/`

#### Pizzaz Album

**Use Case**: Gallery view for single item deep dive

**Key Features**:
- Stacked image layout
- Swipe gestures
- Lazy loading
- Fullscreen gallery

**Code Location**: `src/pizzaz-album/`

#### Pizzaz Video

**Use Case**: Video player with controls

**Key Features**:
- Custom video controls
- Fullscreen support
- Playback state management
- Overlay UI

**Code Location**: `src/pizzaz-video/`

### 2. Solar System (Python)

3D solar system viewer demonstrating advanced graphics.

**Features**:
- Three.js integration
- 3D rendering in iframe
- Interactive controls
- Educational content

**Key Learnings**:
- Complex component bundling
- 3D graphics in sandboxed iframe
- Performance optimization
- Rich visual experiences

**Code Location**: `solar-system_server_python/`

---

## SDK Documentation

### Python SDK

**Repository**: https://github.com/modelcontextprotocol/python-sdk

**Key Features**:
- FastMCP module for rapid development
- Built-in auth support
- Type hints
- Async/await patterns

**Documentation**: Included in repository README

**Example**:
```python
from mcp.server.fastmcp import FastMCP

mcp = FastMCP(name="my-app")

@mcp.tool()
async def search(query: str):
    """Search for items."""
    return {
        "content": [{"type": "text", "text": f"Results for {query}"}],
        "structuredContent": {}
    }
```

### TypeScript SDK

**Repository**: https://github.com/modelcontextprotocol/typescript-sdk

**Package**: `@modelcontextprotocol/sdk`

**Key Features**:
- Full TypeScript support
- Express/Fastify integration
- Streaming responses
- Type-safe tool definitions

**Documentation**: https://modelcontextprotocol.io

**Example**:
```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const server = new McpServer({
  name: "my-app",
  version: "1.0.0"
});

server.registerTool(
  "search",
  {
    title: "Search",
    inputSchema: { /* ... */ }
  },
  async ({ input }) => {
    return {
      content: [{ type: "text", text: `Results for ${input.query}` }],
      structuredContent: {}
    };
  }
);
```

### MCP Inspector

**URL**: https://modelcontextprotocol.io/docs/tools/inspector

**Purpose**: Local testing and debugging tool

**Features**:
- List tools from MCP server
- Call tools with custom inputs
- View responses and metadata
- Render components inline

**Usage**:
```bash
# Point Inspector to local server
http://localhost:<port>/mcp
```

---

## Community Resources

### MCP Specification

**URL**: https://modelcontextprotocol.io/specification

**Contents**:
- Protocol overview
- Message formats
- Authentication flows
- Tool definitions
- Resource handling

### OpenAI Community Forum

**URL**: https://community.openai.com

**Topics**:
- Apps SDK discussions
- Troubleshooting
- Best practices
- Feature requests

### GitHub Issues

**URL**: https://github.com/openai/openai-apps-sdk-examples/issues

**Use For**:
- Bug reports
- Feature requests
- Example requests
- Documentation improvements

---

## Design Resources

### Figma Component Library

**URL**: https://www.figma.com/community/file/1560064615791108827/apps-in-chatgpt-components-templates

**Contents**:
- Official design system
- Component templates
- Layout examples
- Color palettes
- Typography styles
- Icon library

**How to Use**:
1. Open Figma community file
2. Duplicate to your workspace
3. Use templates as starting point
4. Follow design guidelines from documentation

### Design Guidelines Reference

See `01-core-concepts.md` section on Design Guidelines for:
- Display modes (inline, fullscreen, PiP)
- Visual design rules
- Color usage
- Typography
- Spacing and layout
- Icons and imagery
- Accessibility requirements

---

## Official Documentation Links

### Apps SDK Docs
**URL**: https://developers.openai.com/apps-sdk

**Sections**:
- Getting started
- Core concepts
- Build guides
- Deploy guides
- API reference

### ChatGPT Docs
**URL**: https://chatgpt.com/overview

**Info**: General ChatGPT features and capabilities

### OpenAI API Platform
**URL**: https://platform.openai.com/docs

**Info**: OpenAI API documentation (separate from Apps SDK)

---

## Code Snippets

### Basic MCP Server (TypeScript)

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { readFileSync } from "node:fs";

const server = new McpServer({
  name: "example-server",
  version: "1.0.0"
});

// Load component bundle
const COMPONENT_JS = readFileSync("dist/component.js", "utf8");

// Register HTML resource
server.registerResource(
  "component",
  "ui://widget/component.html",
  {},
  async () => ({
    contents: [{
      uri: "ui://widget/component.html",
      mimeType: "text/html+skybridge",
      text: `
        <div id="root"></div>
        <script type="module">${COMPONENT_JS}</script>
      `.trim()
    }]
  })
);

// Register tool
server.registerTool(
  "example_tool",
  {
    title: "Example Tool",
    _meta: {
      "openai/outputTemplate": "ui://widget/component.html"
    },
    inputSchema: { query: { type: "string" } }
  },
  async ({ input }) => {
    return {
      structuredContent: { result: input.query },
      content: [{ type: "text", text: "Success" }]
    };
  }
);
```

### Basic Component (React)

```typescript
import React from "react";
import { createRoot } from "react-dom/client";

interface ToolOutput {
  result: string;
}

function ExampleComponent() {
  const toolOutput = window.openai?.toolOutput as ToolOutput;
  const [state, setState] = React.useState(0);

  return (
    <div>
      <h2>Result: {toolOutput?.result}</h2>
      <button onClick={() => setState(s => s + 1)}>
        Count: {state}
      </button>
    </div>
  );
}

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(<ExampleComponent />);
}
```

---

## Next Steps

Use these resources to:
1. Study example implementations
2. Copy code patterns
3. Test with MCP Inspector
4. Deploy your app
5. Join community discussions
