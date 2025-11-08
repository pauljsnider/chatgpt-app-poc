# Quick Start Guide

Get your first ChatGPT App running in 30 minutes.

## Prerequisites

Before you begin:
- **Node.js 18+** installed
- **Python 3.10+** (optional, for Python server)
- **pnpm** or npm installed
- **ChatGPT account** with developer mode enabled
- **ngrok** or similar tunneling tool

---

## Option 1: Start from Example (Recommended)

### Step 1: Clone Example Repository

```bash
git clone https://github.com/openai/openai-apps-sdk-examples.git
cd openai-apps-sdk-examples
```

### Step 2: Install Dependencies

```bash
pnpm install
```

### Step 3: Build Components

```bash
pnpm run build
```

### Step 4: Start MCP Server

**Node/TypeScript**:
```bash
cd pizzaz_server_node
pnpm start
```

**Python** (alternative):
```bash
cd pizzaz_server_python
uvicorn main:app --port 8000
```

### Step 5: Expose via ngrok

In a new terminal:
```bash
ngrok http 2091  # or 8000 for Python
```

Copy the HTTPS URL (e.g., `https://abc123.ngrok.app`)

### Step 6: Connect to ChatGPT

1. Open ChatGPT
2. Go to Settings → Beta Features
3. Enable "Developer mode"
4. Click "Add connector"
5. Enter your ngrok URL: `https://abc123.ngrok.app/mcp`
6. Click "Connect"

### Step 7: Test Your App

Try in ChatGPT:
```
Pizzaz, show me some pizza places
```

**Success!** You should see the Pizzaz component render inline.

---

## Option 2: Build from Scratch

### Step 1: Create Project Structure

```bash
mkdir my-chatgpt-app
cd my-chatgpt-app
mkdir server web
```

### Step 2: Initialize Node Server

```bash
cd server
npm init -y
npm install @modelcontextprotocol/sdk express
```

Create `server.js`:

```javascript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import express from "express";
import { readFileSync } from "fs";

const app = express();
const server = new McpServer({
  name: "my-app",
  version: "1.0.0"
});

// Load component bundle (we'll create this next)
const COMPONENT_JS = readFileSync("../web/dist/component.js", "utf8");

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
  "greet",
  {
    title: "Greet User",
    description: "Greet the user with a friendly message",
    _meta: {
      "openai/outputTemplate": "ui://widget/component.html"
    },
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string" }
      },
      required: ["name"]
    }
  },
  async ({ input }) => {
    return {
      structuredContent: {
        greeting: `Hello, ${input.name}!`
      },
      content: [{
        type: "text",
        text: `Greeted ${input.name}`
      }]
    };
  }
);

// Mount MCP endpoint
app.use("/mcp", server.handler());

const PORT = 2091;
app.listen(PORT, () => {
  console.log(`MCP server running on http://localhost:${PORT}`);
});
```

### Step 3: Create React Component

```bash
cd ../web
npm init -y
npm install react@^18 react-dom@^18
npm install -D esbuild
```

Create `src/component.tsx`:

```typescript
import React from "react";
import { createRoot } from "react-dom/client";

interface ToolOutput {
  greeting: string;
}

function GreetingComponent() {
  const toolOutput = (window as any).openai?.toolOutput as ToolOutput;

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h2>{toolOutput?.greeting || "Hello!"}</h2>
      <p>This is your first ChatGPT app!</p>
    </div>
  );
}

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(<GreetingComponent />);
}
```

### Step 4: Add Build Script

In `web/package.json`:

```json
{
  "scripts": {
    "build": "esbuild src/component.tsx --bundle --format=esm --outfile=dist/component.js"
  }
}
```

### Step 5: Build Component

```bash
npm run build
```

### Step 6: Start Server

```bash
cd ../server
node server.js
```

### Step 7: Expose via ngrok

In new terminal:
```bash
ngrok http 2091
```

### Step 8: Connect to ChatGPT

1. Copy ngrok URL
2. Open ChatGPT → Settings → Beta Features
3. Enable "Developer mode"
4. Add connector: `https://[your-subdomain].ngrok.app/mcp`

### Step 9: Test

In ChatGPT:
```
Greet me
```

You should see your custom greeting component!

---

## Next Steps

### Enhance Your App

1. **Add More Tools**
   - See `02-mcp-server-guide.md` for tool patterns
   - Implement read and write operations

2. **Improve UI**
   - Add styling with CSS
   - Use design system from Figma
   - Follow design guidelines in `01-core-concepts.md`

3. **Add State Management**
   - Implement `useWidgetState` hook
   - Persist user preferences
   - See `03-component-building-guide.md`

4. **Add Authentication**
   - Implement OAuth 2.1 flow
   - Use Auth0 or similar provider
   - See `04-authentication-guide.md`

5. **Deploy to Production**
   - Choose hosting platform (Fly.io, Render, Railway)
   - Set up proper HTTPS endpoint
   - See `05-deployment-guide.md`

### Learn More

**Core Concepts**: Read `01-core-concepts.md` to understand:
- Model Context Protocol
- Discovery and entry points
- Design principles

**Examples**: Explore `06-examples-and-resources.md` for:
- Official example apps
- Code patterns
- Community resources

**Developer Guidelines**: Review `07-developer-guidelines.md` before submission

### Get Help

- **Documentation**: https://developers.openai.com/apps-sdk
- **Examples**: https://github.com/openai/openai-apps-sdk-examples
- **Community**: https://community.openai.com
- **Issues**: https://github.com/openai/openai-apps-sdk-examples/issues

---

## Common Issues

### Component Not Rendering

**Check**:
1. Component bundle built successfully?
   ```bash
   cd web && npm run build
   ```
2. Server can read bundle file?
   ```bash
   ls ../web/dist/component.js
   ```
3. Resource registered correctly?
   - Check `mimeType` is `text/html+skybridge`
   - Verify URI matches in tool's `_meta`

### Tool Not Called

**Check**:
1. Tool description clear and action-oriented?
2. Connector refreshed in ChatGPT settings?
3. Try explicit mention: "[App Name], do X"
4. Check MCP Inspector shows tool

### Server Not Accessible

**Check**:
1. Server running?
   ```bash
   curl http://localhost:2091/mcp
   ```
2. ngrok tunnel active?
   ```bash
   curl https://[subdomain].ngrok.app/mcp
   ```
3. Firewall blocking port?

### Authentication Not Working

**Check**:
1. OAuth endpoints configured?
2. Discovery metadata accessible?
3. Token verification logic correct?
4. Test with MCP Inspector first

---

## Development Workflow

### Iteration Loop

```bash
# 1. Make changes to component
cd web/src
# ... edit component.tsx ...

# 2. Rebuild bundle
npm run build

# 3. Restart server
cd ../server
# Ctrl+C to stop
node server.js

# 4. Refresh connector in ChatGPT
# Settings → Connectors → Your App → Refresh

# 5. Test in ChatGPT
```

### Using MCP Inspector

Before testing in ChatGPT:

```bash
# Point Inspector to local server
http://localhost:2091/mcp

# List tools
# Call tools with test inputs
# Verify responses
# Check component renders
```

---

## Production Checklist

Before deploying to production:

- [ ] Component optimized and bundled
- [ ] Error handling implemented
- [ ] Authentication configured (if needed)
- [ ] Environment variables set
- [ ] Secrets stored securely
- [ ] Logging configured
- [ ] Performance tested
- [ ] HTTPS endpoint ready
- [ ] Tested in ChatGPT dev mode
- [ ] Privacy policy published
- [ ] Support contact provided

---

## Summary

You've learned how to:
- ✅ Set up MCP server
- ✅ Create React component
- ✅ Register tools and resources
- ✅ Connect to ChatGPT
- ✅ Test your app

**Now explore the detailed guides** to build production-ready apps:
1. Core Concepts (`01-core-concepts.md`)
2. MCP Server Guide (`02-mcp-server-guide.md`)
3. Component Building (`03-component-building-guide.md`)
4. Authentication (`04-authentication-guide.md`)
5. Deployment (`05-deployment-guide.md`)
6. Examples (`06-examples-and-resources.md`)
7. Guidelines (`07-developer-guidelines.md`)

**Happy building!** 🚀
