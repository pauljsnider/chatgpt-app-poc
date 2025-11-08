# Tasks: Hello World ChatGPT App

Implementation tasks for building the Hello World ChatGPT App. Execute tasks sequentially, testing after each step.

**Base Directory:** `/Users/paulsnider/chatgpt-admin/`

## Reference Documentation

Refer to these comprehensive research guides during implementation:

- **[00-overview.md](../00-overview.md)** - What you're building and why
- **[01-core-concepts.md](../01-core-concepts.md)** - MCP protocol fundamentals
- **[02-mcp-server-guide.md](../02-mcp-server-guide.md)** - MCP server code patterns
- **[03-component-building-guide.md](../03-component-building-guide.md)** - React component implementation
- **[05-deployment-guide.md](../05-deployment-guide.md)** - ngrok setup and ChatGPT connection
- **[08-quick-start.md](../08-quick-start.md)** - Quick reference examples

---

## Phase 1: Project Structure Setup

### Task 1: Create Project Directories
**Objective:** Set up the basic folder structure for server and web components.

**Requirements Reference:** 3.1.1, 3.1.2

**Implementation:**
- [ ] Create `server/` directory in `/Users/paulsnider/chatgpt-admin/`
- [ ] Create `web/` directory in `/Users/paulsnider/chatgpt-admin/`
- [ ] Create `web/src/` directory for component source
- [ ] Create `web/dist/` directory for build output

**Validation:** Verify all directories exist with `ls -la` command.

---

### Task 2: Initialize Server Package
**Objective:** Create package.json for the MCP server with required dependencies.

**Requirements Reference:** 3.1.1, 5.5

**Implementation:**
- [ ] Create `server/package.json` with:
  - Package name: "hello-world-mcp-server"
  - Version: "1.0.0"
  - Type: "module" (for ES modules)
  - Dependencies: "@modelcontextprotocol/sdk" (latest) and "express" (^4.18.0)
- [ ] Run `npm install` in `server/` directory

**Validation:** Verify `server/node_modules/` exists and contains both dependencies.

---

### Task 3: Initialize Web Package
**Objective:** Create package.json for the React component with build tooling.

**Requirements Reference:** 3.1.2, 3.1.3

**Implementation:**
- [ ] Create `web/package.json` with:
  - Package name: "hello-world-component"
  - Version: "1.0.0"
  - Dependencies: "react" (^18.0.0) and "react-dom" (^18.0.0)
  - DevDependencies: "esbuild" (^0.19.0), "typescript" (^5.0.0), "@types/react" (^18.0.0), "@types/react-dom" (^18.0.0)
  - Scripts: `"build": "esbuild src/component.tsx --bundle --format=esm --outfile=dist/component.js"`
- [ ] Create `web/tsconfig.json` with React TypeScript configuration
- [ ] Run `npm install` in `web/` directory

**Validation:** Verify `web/node_modules/` exists and build script is defined.

---

## Phase 2: React Component Implementation

### Task 4: Create React Component
**Objective:** Implement the greeting component that displays "Hello, {name}!" message.

**Requirements Reference:** 2.1, 2.2.1, 2.2.2, 2.2.3

**Implementation:**
- [ ] Create `web/src/component.tsx` file
- [ ] Import React and ReactDOM dependencies
- [ ] Define `ToolOutput` interface with `greeting: string` field
- [ ] Create `HelloWorld` functional component that:
  - Reads `window.openai.toolOutput.greeting` (with fallback to "Hello!")
  - Renders greeting in an h2 element
  - Displays "This is a simple Hello World ChatGPT App" subtitle
  - Uses centered text alignment and 24px padding
- [ ] Mount component to element with id "root" using `createRoot`
- [ ] Add null check for root element before mounting

**Validation:** Code compiles without TypeScript errors (run `npm run build` test).

---

### Task 5: Add Theme Support to Component
**Objective:** Make component adapt to ChatGPT's light and dark themes.

**Requirements Reference:** 2.3

**Implementation:**
- [ ] Read `window.openai.theme` property in component (default to "light")
- [ ] Apply conditional styling based on theme:
  - Dark theme: background `#2d2d2d`, text `#ffffff`
  - Light theme: background `#f5f5f5`, text `#000000`
- [ ] Add border-radius of 8px for card appearance
- [ ] Set subtitle opacity to 0.7 for visual hierarchy

**Validation:** Code builds successfully with `npm run build` in `web/` directory.

---

### Task 6: Build Component Bundle
**Objective:** Generate the production JavaScript bundle for the component.

**Requirements Reference:** 3.2

**Implementation:**
- [ ] Run `npm run build` in `web/` directory
- [ ] Verify `web/dist/component.js` is created
- [ ] Check bundle size (should be ~40-50KB)
- [ ] Verify no build errors or warnings

**Validation:** `web/dist/component.js` exists and contains bundled React code.

---

## Phase 3: MCP Server Implementation

### Task 7: Create Basic MCP Server
**Objective:** Set up Express server with MCP SDK integration.

**Requirements Reference:** 1.1, 3.3.1, 3.3.2, 3.3.3

**Implementation:**
- [ ] Create `server/server.js` file
- [ ] Import `McpServer` from "@modelcontextprotocol/sdk/server/mcp.js"
- [ ] Import `express` and `readFileSync` from Node.js
- [ ] Create McpServer instance with name "hello-world-app" and version "1.0.0"
- [ ] Create Express app and mount MCP server at `/mcp` endpoint using `server.handler()`
- [ ] Start Express server on port 2091
- [ ] Add startup console log: "✓ MCP server running on http://localhost:2091"
- [ ] Add error handler for EADDRINUSE (port in use)

**Validation:** Server starts without errors and logs startup message.

---

### Task 8: Add Component Bundle Loading with Error Handling
**Objective:** Load the React component bundle from disk with proper error messages.

**Requirements Reference:** 3.3.1, Error Handling (missing bundle)

**Implementation:**
- [ ] Add try-catch block to read `web/dist/component.js` using `readFileSync`
- [ ] Store bundle contents in `COMPONENT_JS` constant
- [ ] If file not found, log error:
  - "ERROR: Component bundle not found!"
  - "Run 'npm run build' in web/ directory first"
- [ ] Exit process with code 1 if bundle missing

**Validation:** Server fails gracefully with clear error if component not built.

---

### Task 9: Register HTML Component Resource
**Objective:** Register the component HTML resource with embedded JavaScript bundle.

**Requirements Reference:** 1.4.1, 1.4.2, 1.4.3

**Implementation:**
- [ ] Call `server.registerResource()` with:
  - Name: "hello-component"
  - URI: "ui://widget/hello.html"
  - Empty context object
  - Handler function that returns:
    - `contents` array with single object
    - `uri`: "ui://widget/hello.html"
    - `mimeType`: "text/html+skybridge"
    - `text`: HTML string with `<div id="root"></div>` and inline script containing `COMPONENT_JS`

**Validation:** Server starts and can serve the resource (test with MCP Inspector).

---

### Task 10: Register Hello World Tool
**Objective:** Implement the main "hello_world" tool with name parameter support.

**Requirements Reference:** 1.2.1, 1.2.2, 1.2.3, 1.3.1, 1.3.2

**Implementation:**
- [ ] Call `server.registerTool()` with tool name "hello_world"
- [ ] Set tool descriptor:
  - `title`: "Say Hello"
  - `description`: "Displays a friendly hello message"
  - `inputSchema`: Object type with optional `name` property (string)
  - `_meta`: Object with `"openai/outputTemplate"` set to "ui://widget/hello.html"
- [ ] Implement tool handler that:
  - Extracts `name` from input (default to "World" if not provided)
  - Returns object with:
    - `structuredContent`: Object with `greeting` field set to "Hello, {name}!"
    - `content`: Array with single text object: "Greeted {name}"

**Validation:** Tool appears in MCP Inspector and can be called successfully.

---

### Task 11: Add Tool Error Handling
**Objective:** Wrap tool handler in try-catch for robust error handling.

**Requirements Reference:** Error Handling (tool invocation)

**Implementation:**
- [ ] Wrap tool handler logic in try-catch block
- [ ] In catch block:
  - Log error to console with `console.error("Tool error:", error)`
  - Return structured content with `greeting: "Error occurred"`
  - Return content text: "Failed to generate greeting"

**Validation:** Server handles errors gracefully without crashing.

---

## Phase 4: Documentation

### Task 12: Create README Documentation
**Objective:** Write comprehensive setup and usage instructions.

**Requirements Reference:** 6.1.1, 6.1.2, 6.1.3, 6.1.4, 6.1.5

**Implementation:**
- [ ] Create `README-hello-world.md` in `/Users/paulsnider/chatgpt-admin/`
- [ ] Add sections:
  - **Overview**: Brief description of the Hello World app
  - **Prerequisites**: Node.js 18+, npm, ngrok
  - **Setup Instructions**:
    - Install server dependencies: `cd server && npm install`
    - Install web dependencies: `cd web && npm install`
  - **Build Component**: `cd web && npm run build`
  - **Start Server**: `cd server && node server.js`
  - **Local Testing**: How to use MCP Inspector at `http://localhost:2091/mcp`
  - **Connect to ChatGPT**:
    - Start ngrok: `ngrok http 2091`
    - Enable developer mode in ChatGPT
    - Add connector with ngrok URL
  - **Usage**: Example prompts to test ("Say hello", "Say hello to Alice")
  - **Troubleshooting**: Common issues and solutions
- [ ] Add file structure diagram showing all project files

**Validation:** README is complete and easy to follow.

---

### Task 13: Add Inline Code Comments
**Objective:** Document key concepts in code for learning purposes.

**Requirements Reference:** 6.2

**Implementation:**
- [ ] Add comments to `server/server.js`:
  - Explain MCP server initialization
  - Describe component bundle loading
  - Document resource registration purpose
  - Explain tool registration and handler
- [ ] Add comments to `web/src/component.tsx`:
  - Explain window.openai API access
  - Document theme adaptation logic
  - Describe component mounting process

**Validation:** Code is well-commented and self-documenting.

---

## Phase 5: ChatGPT Integration

### Task 14: Connect App to ChatGPT
**Objective:** Expose the local server via ngrok and connect it to ChatGPT for end-to-end testing.

**Requirements Reference:** 4.1.2, 4.2.1, 4.2.2, 4.2.3

**Reference Guide:** See [05-deployment-guide.md](../05-deployment-guide.md) sections on "Local Development" and "Connecting to ChatGPT"

**Implementation:**
- [ ] Ensure MCP server is running: `node server/server.js`
- [ ] In a new terminal, start ngrok tunnel: `ngrok http 2091`
- [ ] Copy the HTTPS forwarding URL (e.g., `https://abc123.ngrok-free.app`)
- [ ] Open ChatGPT in browser
- [ ] Navigate to Settings → Beta Features (or Features)
- [ ] Enable "Developer mode" toggle
- [ ] Click "Add connector" or similar option
- [ ] Enter connector URL: `https://[your-ngrok-subdomain].ngrok-free.app/mcp`
- [ ] Wait for ChatGPT to connect and verify the connector
- [ ] Verify connector shows as "Connected" in settings
- [ ] Test with basic prompt: "Say hello"
- [ ] Verify the hello_world tool is called
- [ ] Confirm greeting component renders inline in conversation
- [ ] Test with name parameter: "Say hello to [YourName]"
- [ ] Verify component displays "Hello, [YourName]!"
- [ ] Test theme adaptation by toggling ChatGPT theme (light/dark)
- [ ] Verify component colors adapt appropriately

**Validation:**
- ✅ Connector connects successfully to ChatGPT
- ✅ Tool responds to "Say hello" prompts
- ✅ Component renders inline in ChatGPT conversation
- ✅ Named greetings work correctly
- ✅ Theme adaptation works in both light and dark modes

**Troubleshooting:**
- If connector fails: Verify ngrok tunnel is running and URL is correct
- If tool doesn't trigger: Try explicit mention "hello world app, say hello"
- If component doesn't render: Check browser console for iframe errors
- If ngrok session expires: Restart ngrok and update connector URL in ChatGPT

---

## Testing & Validation Checklist

After completing all tasks, verify:

- [ ] **Build Process**: Component builds without errors
- [ ] **Server Startup**: Server starts on port 2091
- [ ] **MCP Inspector**: Tool visible and callable in Inspector
- [ ] **Component Rendering**: Greeting displays in Inspector
- [ ] **ngrok Tunnel**: Server accessible via HTTPS
- [ ] **ChatGPT Connection**: Connector connects successfully
- [ ] **Functional Test**: "Say hello" triggers component in ChatGPT
- [ ] **Named Greeting**: "Say hello to Alice" shows "Hello, Alice!"
- [ ] **Theme Support**: Component adapts to light/dark theme
- [ ] **Documentation**: README instructions work end-to-end

---

## Success Criteria (from Requirements)

✅ MCP server starts without errors
✅ Tool appears in MCP Inspector
✅ Component can be called from MCP Inspector
✅ Component renders greeting message
✅ Can connect to ChatGPT via ngrok
✅ User can invoke tool in ChatGPT
✅ Greeting component displays correctly in ChatGPT

---

## Execution Notes

- Execute tasks in order (1-14)
- Test after each task before proceeding
- If a task fails, debug before moving forward
- Keep terminal output visible for error messages
- Use MCP Inspector frequently to validate server behavior
- Keep ngrok tunnel running during ChatGPT testing (Task 14)
