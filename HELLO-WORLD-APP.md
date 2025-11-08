# Hello World ChatGPT App - Implementation Guide

A simple Hello World application demonstrating how to build a ChatGPT App using the Model Context Protocol (MCP). This project shows the fundamentals of creating a tool that can be invoked from ChatGPT with a custom React UI component.

## What This Demonstrates

- **MCP Server**: An HTTP server that exposes tools to ChatGPT
- **Tool Registration**: A `hello_world` tool that accepts a name parameter
- **React Component**: A themed UI component that displays the greeting
- **SSE Transport**: Server-Sent Events for real-time communication
- **Resource Management**: HTML resource registration with embedded JavaScript

## Prerequisites

- **Node.js**: Version 18 or higher
- **npm**: Comes with Node.js
- **ngrok**: For exposing your local server to ChatGPT (free account required)

## Installation

1. **Navigate to this project directory**

2. **Install server dependencies:**
   ```bash
   cd server
   npm install
   ```

3. **Install web dependencies:**
   ```bash
   cd ../web
   npm install
   ```

## Building the Component

Before starting the server, you must build the React component:

```bash
cd web
npm run build
```

This creates `web/dist/component.js` (986KB) which the server loads at startup.

## Running the Server

Start the MCP server:

```bash
cd server
npm start
```

You should see:
```
✓ MCP server running on http://localhost:2091
✓ MCP endpoint: http://localhost:2091/mcp/sse
✓ Ready to connect to ChatGPT!
```

## Connecting to ChatGPT

### 1. Install and Setup ngrok

Download ngrok from [ngrok.com](https://ngrok.com) and sign up for a free account.

### 2. Expose Your Local Server

In a new terminal, run:

```bash
ngrok http 2091
```

You'll see output like:
```
Forwarding    https://abc123.ngrok.io -> http://localhost:2091
```

Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`).

### 3. Configure in ChatGPT

1. Open ChatGPT and go to Settings
2. Navigate to the Apps section
3. Click "Add App" or "Connect App"
4. Enter your ngrok URL with the MCP endpoint:
   ```
   https://abc123.ngrok.io/mcp/sse
   ```
5. Save the configuration

### 4. Test the App

In ChatGPT, type:
```
Use the hello_world tool to greet Alice
```

You should see the Hello World component appear with "Hello, Alice!" displayed in a themed card that adapts to your ChatGPT theme (light/dark).

## Project Structure

```
chatgpt-admin/
├── server/
│   ├── package.json       # Server dependencies (MCP SDK, Express)
│   └── server.js          # MCP server with SSE transport
├── web/
│   ├── package.json       # Component dependencies (React, esbuild)
│   ├── tsconfig.json      # TypeScript configuration
│   ├── src/
│   │   └── component.tsx  # React component source
│   └── dist/
│       └── component.js   # Built component bundle (986KB)
├── spec-hello-world-chatgpt-app/
│   ├── requirements.md    # Functional requirements (EARS format)
│   ├── design.md          # Architecture and design decisions
│   └── tasks.md           # Implementation tasks (14 tasks)
├── README.md              # Research documentation index
└── HELLO-WORLD-APP.md     # This file
```

## Key Concepts

### MCP Server (server/server.js)

The server uses the Model Context Protocol SDK to:
- Accept connections from ChatGPT via SSE (Server-Sent Events)
- Register tools that ChatGPT can invoke
- Register HTML resources (UI components)
- Return structured data to hydrate the component

**Key Code Sections:**
- Lines 1-11: Import MCP SDK classes and types
- Lines 16-23: Load component bundle with error handling
- Lines 29-138: GET /mcp/sse endpoint - establishes SSE connection and registers handlers
- Lines 31-42: Create Server instance with capabilities
- Lines 46-54: ListResources handler - lists available UI components
- Lines 56-72: ReadResource handler - returns HTML with embedded component
- Lines 76-95: ListTools handler - lists available tools with schemas
- Lines 98-133: CallTool handler - executes tool logic and returns results
- Lines 136-137: Connect server to SSE transport
- Lines 141-146: POST /mcp/message endpoint - receives client messages

### Tool Definition

Tools are defined in the `ListToolsRequestSchema` handler with:
- **name**: Identifier for the tool (`hello_world`)
- **description**: What the tool does ("Displays a friendly hello message")
- **inputSchema**: JSON Schema for parameters (name: string)
- **_meta**: Metadata including `openai/outputTemplate` pointing to the UI resource

### Component (web/src/component.tsx)

The React component:
- Reads `window.openai.toolOutput.greeting` for the greeting text
- Reads `window.openai.theme` to adapt colors (light/dark mode)
- Renders a centered card with the greeting and subtitle
- Uses inline styles for simplicity (no CSS files needed)

### Component Hydration Flow

When the tool is called:
1. Server's `CallToolRequestSchema` handler executes
2. Returns `structuredContent: { greeting: "Hello, Alice!" }`
3. ChatGPT requests the HTML resource (`ui://widget/hello.html`)
4. Server's `ReadResourceRequestSchema` handler returns HTML with embedded JS
5. ChatGPT renders the HTML in an iframe
6. Component JavaScript executes and reads `window.openai.toolOutput`
7. React hydrates the UI with the greeting data

### Theme Adaptation

The component reads `window.openai.theme` to match ChatGPT's current theme:
- **dark**: `#2d2d2d` background, white text
- **light**: `#f5f5f5` background, black text

This ensures the component feels native to ChatGPT's interface.

## Code Walkthrough

### Server Registration Flow

```javascript
// 1. Create server with capabilities
const server = new Server(
  { name: "hello-world-app", version: "1.0.0" },
  { capabilities: { resources: {}, tools: {} } }
);

// 2. Register resource list handler
server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: [{
    uri: "ui://widget/hello.html",
    name: "Hello World Component",
    mimeType: "text/html+skybridge"
  }]
}));

// 3. Register resource read handler
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  if (request.params.uri === "ui://widget/hello.html") {
    return {
      contents: [{
        uri: "ui://widget/hello.html",
        mimeType: "text/html+skybridge",
        text: `<div id="root"></div><script type="module">${COMPONENT_JS}</script>`
      }]
    };
  }
});

// 4. Register tool list handler
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [{
    name: "hello_world",
    description: "Displays a friendly hello message",
    inputSchema: { /* JSON Schema */ },
    _meta: { "openai/outputTemplate": "ui://widget/hello.html" }
  }]
}));

// 5. Register tool call handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "hello_world") {
    const name = request.params.arguments?.name || "World";
    return {
      content: [{ type: "text", text: `Greeted ${name}` }],
      structuredContent: { greeting: `Hello, ${name}!` }
    };
  }
});

// 6. Connect to SSE transport
const transport = new SSEServerTransport("/mcp/message", res);
await server.connect(transport);
```

## Troubleshooting

### "Component bundle not found" Error

**Problem**: Server can't find `web/dist/component.js`

**Solution**: Build the component first:
```bash
cd web
npm run build
```

The build creates a 986KB bundle containing React, ReactDOM, and your component code.

### Port 2091 Already in Use

**Problem**: Another process is using port 2091

**Solutions**:
1. Stop the other process: `lsof -ti:2091 | xargs kill`
2. Or change PORT in `server/server.js` line 149
3. Remember to update ngrok if you change the port

### Server Starts But ChatGPT Can't Connect

**Problem**: ChatGPT can't reach your local server

**Solutions**:
1. Ensure ngrok is running: `ngrok http 2091`
2. Use the HTTPS URL from ngrok (not HTTP)
3. Include the `/mcp/sse` endpoint: `https://abc123.ngrok.io/mcp/sse`
4. Check firewall allows ngrok connections
5. Verify ngrok session hasn't expired (free tier has time limits)

### Tool Not Appearing in ChatGPT

**Problem**: The hello_world tool doesn't show up

**Solutions**:
1. Verify server is running (check console output)
2. Verify ngrok is forwarding correctly (visit the ngrok URL in browser)
3. Try disconnecting and reconnecting the app in ChatGPT settings
4. Check server logs for errors (watch the terminal)
5. Ensure endpoint URL is exactly: `https://your-id.ngrok.io/mcp/sse`

### Component Shows But Greeting is Blank

**Problem**: UI appears but no greeting text

**Solutions**:
1. Check browser console in ChatGPT (F12)
2. Verify `window.openai.toolOutput` exists
3. Check server returned `structuredContent` with `greeting` field
4. Ensure component bundle is the latest build (rebuild if changed)

## Development

### Rebuilding After Component Changes

When you modify `web/src/component.tsx`:

1. **Rebuild the bundle:**
   ```bash
   cd web
   npm run build
   ```

2. **Restart the server:**
   ```bash
   cd ../server
   npm start
   ```

3. **Refresh ChatGPT**: The server loads the bundle at startup, so restart is required

### Modifying the Tool

Edit `server/server.js`:

- **Tool metadata** (lines 76-95): Change name, description, input schema
- **Tool logic** (lines 98-133): Modify what the tool does
- **Component template** (line 91): Change which UI component to use
- **Return data** (lines 105-114): Modify `structuredContent` and `content`

### Adding New Tools

To add more tools:

1. Add tool definition in `ListToolsRequestSchema` handler
2. Add tool logic in `CallToolRequestSchema` handler with `if/else` branches
3. Create new component or reuse existing one
4. Register new HTML resource if needed

### Debugging Tips

**Server-side:**
- Add `console.log()` in request handlers to trace execution
- Check server terminal for error messages
- Use MCP Inspector tool for protocol debugging

**Client-side:**
- Open browser console in ChatGPT (F12)
- Check for JavaScript errors
- Inspect `window.openai` object
- Verify component rendering with React DevTools

## Learning Resources

### Official Documentation

- **ChatGPT Apps SDK**: [OpenAI Apps Documentation](https://platform.openai.com/docs/apps)
- **Model Context Protocol**: [MCP Specification](https://modelcontextprotocol.io)
- **MCP TypeScript SDK**: [GitHub Repository](https://github.com/modelcontextprotocol/typescript-sdk)

### Research Documentation (In This Repository)

Comprehensive research documentation is available in the project root:

- `00-overview.md` - ChatGPT Apps SDK complete overview
- `01-core-concepts.md` - MCP fundamentals, discovery, design guidelines
- `02-mcp-server-guide.md` - Complete MCP server implementation guide
- `03-component-building-guide.md` - React component development patterns
- `04-authentication-guide.md` - OAuth 2.1 implementation guide
- `05-deployment-guide.md` - Deployment options and strategies
- `06-examples-and-resources.md` - Code examples and community resources
- `07-developer-guidelines.md` - Policies and submission requirements
- `08-quick-start.md` - 30-minute quick start guide
- `README.md` - Master index for all research documentation

### Spec-Driven Development Process

This project was built using a spec-driven development approach:

1. **Requirements** (`spec-hello-world-chatgpt-app/requirements.md`)
   - User stories and acceptance criteria
   - EARS-formatted functional requirements
   - Success criteria and constraints

2. **Design** (`spec-hello-world-chatgpt-app/design.md`)
   - Architecture decisions (TypeScript SDK, Express, React)
   - Component specifications
   - Data models and error handling
   - Testing strategy

3. **Tasks** (`spec-hello-world-chatgpt-app/tasks.md`)
   - 14 incremental implementation tasks
   - Clear success criteria for each task
   - Task dependencies and ordering

This approach ensures validated, traceable development from concept to implementation.

## Next Steps

Now that you have a working Hello World app, you can:

1. **Add More Tools**: Create tools that fetch data, perform calculations, etc.
2. **Enhance the Component**: Add interactivity, forms, data visualization
3. **Add Authentication**: Implement OAuth 2.1 for user-specific data
4. **Connect to APIs**: Make tools fetch data from external services (weather, stocks, etc.)
5. **Support Multiple Display Modes**: Try fullscreen and picture-in-picture modes
6. **Deploy to Production**: Use Render, Fly.io, or Railway instead of ngrok
7. **Submit to App Directory**: When submissions open later in 2025

### Example Next Features

**Multi-parameter Tool:**
```javascript
// Add parameters: greeting style, language
inputSchema: {
  type: "object",
  properties: {
    name: { type: "string" },
    style: { type: "string", enum: ["formal", "casual", "funny"] },
    language: { type: "string", enum: ["en", "es", "fr"] }
  }
}
```

**Interactive Component:**
```typescript
// Add button to trigger follow-up
<button onClick={() => window.openai.sendFollowUpMessage({
  prompt: "Tell me more about the greeting"
})}>
  Learn More
</button>
```

**External API Integration:**
```javascript
// Call weather API
const weather = await fetch(`https://api.weather.com/...`);
return {
  structuredContent: { temperature, conditions },
  content: [{ type: "text", text: `Weather: ${temp}°F` }]
};
```

## License

This is a demonstration project. Feel free to use it as a template for your own ChatGPT Apps.

---

**Built with**: MCP SDK 0.6.1 | React 18 | Express 4 | esbuild 0.19
**Architecture**: SSE Transport over HTTP | Inline Component Bundle | Themed React UI
**Development Date**: November 2025
