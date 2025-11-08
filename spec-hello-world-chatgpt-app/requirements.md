# Requirements: Hello World ChatGPT App

## Reference Documentation

This specification is based on comprehensive research documentation located in `/Users/paulsnider/chatgpt-admin/`:

- **[00-overview.md](../00-overview.md)** - Complete overview of ChatGPT Apps SDK
- **[01-core-concepts.md](../01-core-concepts.md)** - MCP, discovery, and design principles
- **[02-mcp-server-guide.md](../02-mcp-server-guide.md)** - MCP server setup and configuration
- **[03-component-building-guide.md](../03-component-building-guide.md)** - React component development
- **[08-quick-start.md](../08-quick-start.md)** - Quick start patterns and examples

For detailed implementation guidance, refer to these research documents throughout development.

## Introduction

This specification defines a minimal "Hello World" ChatGPT App that demonstrates the fundamental components required to build an app for ChatGPT using the Apps SDK. The app will consist of a basic MCP (Model Context Protocol) server and a simple React component that displays a greeting message when invoked.

The goal is to create the simplest possible working implementation that can be tested locally and connected to ChatGPT, serving as a learning foundation for more complex applications.

## User Stories

**As a developer**, I want to create a minimal working ChatGPT app so that I can understand the basic architecture and workflow.

**As a user**, I want to invoke a simple greeting tool in ChatGPT and see a friendly message displayed in a custom component.

## Requirements (EARS Format)

### 1. MCP Server Requirements

1.1. **WHEN** the MCP server starts, **THE SYSTEM SHALL** expose an HTTP endpoint at `/mcp` that accepts MCP protocol requests

1.2. **WHEN** a tool list request is received, **THE SYSTEM SHALL** return a single tool named "hello_world" with:
   - 1.2.1. A clear title "Say Hello"
   - 1.2.2. A description "Displays a friendly hello message"
   - 1.2.3. An input schema accepting a `name` parameter (string, optional, default: "World")

1.3. **WHEN** the "hello_world" tool is invoked, **THE SYSTEM SHALL** return:
   - 1.3.1. Structured content containing the greeting message
   - 1.3.2. A reference to the component HTML resource in `_meta.openai/outputTemplate`

1.4. **WHEN** the HTML resource is requested, **THE SYSTEM SHALL** return:
   - 1.4.1. An HTML document with `mimeType: "text/html+skybridge"`
   - 1.4.2. A container div with id "root"
   - 1.4.3. The bundled React component JavaScript embedded inline

### 2. React Component Requirements

2.1. **WHEN** the component loads, **THE SYSTEM SHALL** mount a React application to the element with id "root"

2.2. **WHEN** the component renders, **THE SYSTEM SHALL** display:
   - 2.2.1. The greeting message from `window.openai.toolOutput.greeting`
   - 2.2.2. A styled card with padding and centered text
   - 2.2.3. A welcome message explaining this is a Hello World app

2.3. **WHERE** the theme changes, **THE SYSTEM SHALL** adapt styling to match ChatGPT's light or dark theme

### 3. Build & Development Requirements

3.1. **WHEN** setting up the project, **THE SYSTEM SHALL** provide:
   - 3.1.1. A server directory with MCP server code
   - 3.1.2. A web directory with React component code
   - 3.1.3. Build scripts to bundle the React component

3.2. **WHEN** the component is built, **THE SYSTEM SHALL** generate a single JavaScript bundle at `web/dist/component.js`

3.3. **WHEN** the server is started, **THE SYSTEM SHALL**:
   - 3.3.1. Read the component bundle from disk
   - 3.3.2. Listen on a configurable port (default: 2091)
   - 3.3.3. Log startup confirmation to console

### 4. Testing & Integration Requirements

4.1. **WHEN** testing locally, **THE SYSTEM SHALL** support:
   - 4.1.1. Running the server with `node server/server.js` or equivalent
   - 4.1.2. Exposing via ngrok for ChatGPT connectivity
   - 4.1.3. Testing with MCP Inspector at `http://localhost:2091/mcp`

4.2. **WHEN** connected to ChatGPT, **THE SYSTEM SHALL**:
   - 4.2.1. Respond to user requests like "Say hello" or "Hello, [name]"
   - 4.2.2. Render the greeting component inline in the conversation
   - 4.2.3. Display the greeting message clearly

### 5. Simplicity Constraints

5.1. **THE SYSTEM SHALL NOT** include authentication (anonymous access only)

5.2. **THE SYSTEM SHALL NOT** include state management or persistence

5.3. **THE SYSTEM SHALL NOT** include multiple tools or complex workflows

5.4. **THE SYSTEM SHALL NOT** include external API calls or database connections

5.5. **THE SYSTEM SHALL** use minimal dependencies (only essential packages)

### 6. Documentation Requirements

6.1. **THE SYSTEM SHALL** include a README with:
   - 6.1.1. Setup instructions (prerequisites, installation)
   - 6.1.2. How to build the component
   - 6.1.3. How to start the server
   - 6.1.4. How to connect to ChatGPT
   - 6.1.5. How to test the app

6.2. **THE SYSTEM SHALL** include inline code comments explaining key concepts

## Success Criteria

✅ MCP server starts without errors
✅ Tool appears in MCP Inspector
✅ Component can be called from MCP Inspector
✅ Component renders greeting message
✅ Can connect to ChatGPT via ngrok
✅ User can invoke tool in ChatGPT
✅ Greeting component displays correctly in ChatGPT

## Edge Cases & Constraints

- **Empty name parameter**: Should default to "World"
- **Server restart**: Should reload component bundle from disk
- **Port conflicts**: Should fail with clear error if port already in use
- **Missing bundle**: Should fail with clear error if component not built
- **Browser compatibility**: Component should work in ChatGPT's iframe sandbox
