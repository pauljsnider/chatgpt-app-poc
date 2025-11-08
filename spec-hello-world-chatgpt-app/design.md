# Design: Hello World ChatGPT App

## Reference Documentation

This design is based on comprehensive research documentation located in `/Users/paulsnider/chatgpt-admin/`:

- **[00-overview.md](../00-overview.md)** - Architecture overview and technology stack
- **[01-core-concepts.md](../01-core-concepts.md)** - MCP protocol, display modes, design guidelines
- **[02-mcp-server-guide.md](../02-mcp-server-guide.md)** - Complete MCP server implementation guide
- **[03-component-building-guide.md](../03-component-building-guide.md)** - React component patterns and window.openai API
- **[05-deployment-guide.md](../05-deployment-guide.md)** - Local development and ngrok setup
- **[08-quick-start.md](../08-quick-start.md)** - Quick start examples and patterns

Also reference: [OpenAI Apps SDK Examples](https://github.com/openai/openai-apps-sdk-examples)

## Overview

This design document specifies the implementation details for a minimal Hello World ChatGPT App. The application follows the Apps SDK architecture with two primary components: an MCP (Model Context Protocol) server and a React-based UI component that renders in ChatGPT's iframe.

The design prioritizes simplicity and clarity, using the official TypeScript SDK for the MCP server and React for the component, following patterns from the research documentation and official examples.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         ChatGPT                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  User: "Say hello"                                     │  │
│  └───────────────────────────────────────────────────────┘  │
│                           │                                  │
│                           ▼                                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  ChatGPT calls MCP tool: "hello_world"                │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────┬───────────────────────────────┘
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    MCP Server (Node.js)                      │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Tool: hello_world                                     │  │
│  │  - Accepts: { name?: string }                          │  │
│  │  - Returns: { greeting: "Hello, {name}!" }             │  │
│  │  - Template: ui://widget/hello.html                    │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Resource: ui://widget/hello.html                      │  │
│  │  - Embeds: component.js bundle                         │  │
│  │  - Provides: <div id="root"></div>                     │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              ChatGPT Iframe (Sandboxed)                      │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  React Component                                       │  │
│  │  - Reads: window.openai.toolOutput.greeting            │  │
│  │  - Displays: Greeting card with message               │  │
│  │  - Adapts: To ChatGPT theme (light/dark)              │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Backend (MCP Server):**
- Runtime: Node.js 18+
- SDK: `@modelcontextprotocol/sdk` (official TypeScript SDK)
- Web Framework: Express.js
- Language: JavaScript (ES modules)

**Frontend (Component):**
- Library: React 18+
- Language: TypeScript
- Bundler: esbuild
- Build output: Single ES module (`component.js`)

**Development Tools:**
- Package Manager: npm
- Local Tunnel: ngrok
- Testing: MCP Inspector

## Components

### 1. MCP Server (`server/server.js`)

**Responsibilities:**
- Expose `/mcp` endpoint for MCP protocol communication
- Register the `hello_world` tool
- Register the HTML component resource
- Read and embed the component bundle
- Handle tool invocation requests

**Key Code Structure:**
```javascript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import express from "express";
import { readFileSync } from "fs";

// Create MCP server instance
const server = new McpServer({
  name: "hello-world-app",
  version: "1.0.0"
});

// Load component bundle from disk
const COMPONENT_JS = readFileSync("web/dist/component.js", "utf8");

// Register HTML resource with embedded component
server.registerResource(
  "hello-component",
  "ui://widget/hello.html",
  {},
  async () => ({
    contents: [{
      uri: "ui://widget/hello.html",
      mimeType: "text/html+skybridge",
      text: `<div id="root"></div><script type="module">${COMPONENT_JS}</script>`
    }]
  })
);

// Register hello_world tool
server.registerTool(
  "hello_world",
  {
    title: "Say Hello",
    description: "Displays a friendly hello message",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Name to greet" }
      }
    },
    _meta: {
      "openai/outputTemplate": "ui://widget/hello.html"
    }
  },
  async ({ input }) => {
    const name = input?.name || "World";
    return {
      structuredContent: {
        greeting: `Hello, ${name}!`
      },
      content: [{ type: "text", text: `Greeted ${name}` }]
    };
  }
);

// Mount MCP endpoint on Express
const app = express();
app.use("/mcp", server.handler());
app.listen(2091, () => console.log("MCP server running on port 2091"));
```

**Dependencies (`server/package.json`):**
```json
{
  "type": "module",
  "dependencies": {
    "@modelcontextprotocol/sdk": "latest",
    "express": "^4.18.0"
  }
}
```

### 2. React Component (`web/src/component.tsx`)

**Responsibilities:**
- Mount React app to `#root` element
- Read greeting from `window.openai.toolOutput`
- Display greeting in styled card
- Adapt to ChatGPT theme

**Key Code Structure:**
```typescript
import React from "react";
import { createRoot } from "react-dom/client";

// Type definition for tool output
interface ToolOutput {
  greeting: string;
}

// Main component
function HelloWorld() {
  const toolOutput = (window as any).openai?.toolOutput as ToolOutput;
  const theme = (window as any).openai?.theme || "light";

  return (
    <div style={{
      padding: "24px",
      textAlign: "center",
      borderRadius: "8px",
      backgroundColor: theme === "dark" ? "#2d2d2d" : "#f5f5f5",
      color: theme === "dark" ? "#ffffff" : "#000000"
    }}>
      <h2 style={{ margin: "0 0 12px 0", fontSize: "24px" }}>
        {toolOutput?.greeting || "Hello!"}
      </h2>
      <p style={{ margin: 0, fontSize: "14px", opacity: 0.7 }}>
        This is a simple Hello World ChatGPT App
      </p>
    </div>
  );
}

// Mount to root element
const root = document.getElementById("root");
if (root) {
  createRoot(root).render(<HelloWorld />);
}
```

**Dependencies (`web/package.json`):**
```json
{
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "devDependencies": {
    "esbuild": "^0.19.0",
    "typescript": "^5.0.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0"
  },
  "scripts": {
    "build": "esbuild src/component.tsx --bundle --format=esm --outfile=dist/component.js"
  }
}
```

### 3. Build Process

**Build Steps:**
1. **Component Build**: `npm run build` in `web/` directory
   - Input: `web/src/component.tsx`
   - Output: `web/dist/component.js`
   - Process: esbuild bundles React component into single ES module

2. **Server Start**: `node server/server.js`
   - Reads bundled component from disk
   - Starts Express server on port 2091
   - Registers MCP tools and resources

**Build Artifacts:**
- `web/dist/component.js` - Bundled React component (~40KB)
- No compilation needed for server (ES modules)

## Data Models

### Tool Input Schema

```typescript
interface HelloWorldInput {
  name?: string;  // Optional name to greet (default: "World")
}
```

### Tool Output Schema

```typescript
interface HelloWorldOutput {
  structuredContent: {
    greeting: string;  // Formatted greeting message
  };
  content: Array<{
    type: "text";
    text: string;      // Plain text version for model
  }>;
}
```

### Component Props (via window.openai)

```typescript
interface WindowOpenAI {
  toolOutput: {
    greeting: string;  // The greeting message to display
  };
  theme: "light" | "dark";  // ChatGPT theme
}
```

## Error Handling

### Server-Side Errors

**Missing Component Bundle:**
```javascript
try {
  const COMPONENT_JS = readFileSync("web/dist/component.js", "utf8");
} catch (error) {
  console.error("ERROR: Component bundle not found!");
  console.error("Run 'npm run build' in web/ directory first");
  process.exit(1);
}
```

**Port Already in Use:**
```javascript
app.listen(2091, () => {
  console.log("✓ MCP server running on http://localhost:2091");
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error("ERROR: Port 2091 already in use");
    console.error("Stop other process or change PORT in server.js");
    process.exit(1);
  }
});
```

**Tool Invocation Errors:**
- Catch all errors in tool handler
- Return error in content field
- Log error details to console

```javascript
async ({ input }) => {
  try {
    const name = input?.name || "World";
    return {
      structuredContent: { greeting: `Hello, ${name}!` },
      content: [{ type: "text", text: `Greeted ${name}` }]
    };
  } catch (error) {
    console.error("Tool error:", error);
    return {
      structuredContent: { greeting: "Error occurred" },
      content: [{ type: "text", text: "Failed to generate greeting" }]
    };
  }
}
```

### Client-Side Errors

**Missing Tool Output:**
```typescript
const toolOutput = (window as any).openai?.toolOutput as ToolOutput;
const greeting = toolOutput?.greeting || "Hello!";  // Fallback
```

**Missing Root Element:**
```typescript
const root = document.getElementById("root");
if (!root) {
  console.error("Root element not found");
} else {
  createRoot(root).render(<HelloWorld />);
}
```

## Testing Strategy

### Phase 1: Local Server Testing

**Test with MCP Inspector:**
1. Start server: `node server/server.js`
2. Open MCP Inspector
3. Connect to: `http://localhost:2091/mcp`
4. Verify:
   - ✓ Tool "hello_world" appears in list
   - ✓ Tool has correct schema
   - ✓ Can invoke tool with/without name parameter
   - ✓ Returns correct structured content
   - ✓ Component renders inline in Inspector

**Manual curl Tests:**
```bash
# Test MCP endpoint is accessible
curl http://localhost:2091/mcp

# Should return MCP protocol response
```

### Phase 2: ngrok Tunnel Testing

**Setup:**
1. Start ngrok: `ngrok http 2091`
2. Copy HTTPS URL (e.g., `https://abc123.ngrok.app`)
3. Keep tunnel running during testing

**Verification:**
```bash
# Test public endpoint
curl https://abc123.ngrok.app/mcp
```

### Phase 3: ChatGPT Integration Testing

**Connection:**
1. Open ChatGPT → Settings → Beta Features
2. Enable "Developer mode"
3. Add connector: `https://abc123.ngrok.app/mcp`
4. Verify connector connects successfully

**Functional Tests:**

| Test Case | User Input | Expected Result |
|-----------|------------|-----------------|
| Default greeting | "Say hello" | Component displays "Hello, World!" |
| Named greeting | "Say hello to Alice" | Component displays "Hello, Alice!" |
| Theme adaptation | Toggle ChatGPT theme | Component colors change |
| Multiple invocations | Call tool 3 times | Each renders correctly |

**Success Criteria:**
- ✓ Tool appears when user says "Say hello"
- ✓ Component renders inline in conversation
- ✓ Greeting message displays correctly
- ✓ Theme adapts to light/dark mode
- ✓ No console errors in browser

### Phase 4: Error Testing

**Error Scenarios:**
1. **Server not running**: Connector should show error
2. **Component not built**: Server should fail to start
3. **Invalid input**: Tool should handle gracefully
4. **Network interruption**: ChatGPT should show appropriate error

## Deployment Considerations

**For this Hello World app:**
- Local development only (ngrok tunnel)
- No production deployment required
- No authentication needed
- No database or persistence

**If deploying to production later:**
- Use Fly.io, Render, or Railway
- Ensure HTTPS endpoint
- Set up proper logging
- Monitor performance

## File Structure

```
/Users/paulsnider/chatgpt-admin/
├── spec-hello-world-chatgpt-app/
│   ├── requirements.md
│   ├── design.md          ← This file
│   └── tasks.md           ← To be created
├── server/                 ← To be created
│   ├── server.js
│   └── package.json
├── web/                    ← To be created
│   ├── src/
│   │   └── component.tsx
│   ├── dist/              ← Created by build
│   │   └── component.js
│   ├── package.json
│   └── tsconfig.json
└── README-hello-world.md  ← To be created
```

## Design Decisions & Rationale

### 1. TypeScript SDK over Python
**Rationale:** Single language (JavaScript/TypeScript) for both server and component simplifies development and learning.

### 2. Inline Component Bundle
**Rationale:** Simplifies deployment - no CDN or separate asset hosting required for Hello World demo.

### 3. No State Management
**Rationale:** Greeting is stateless - no need for `window.openai.setWidgetState` complexity.

### 4. Direct Theme Reading
**Rationale:** Simple inline styles more appropriate than CSS framework for minimal component.

### 5. Default Port 2091
**Rationale:** Matches OpenAI examples; unlikely to conflict with common services.

## Next Steps

After design approval:
1. Generate tasks.md with incremental implementation steps
2. Execute tasks one-by-one to build the app
3. Test at each milestone
4. Document usage in README
