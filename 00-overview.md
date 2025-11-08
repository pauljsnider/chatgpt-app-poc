# ChatGPT Apps SDK - Complete Overview

**Last Updated:** January 2025
**Source:** OpenAI Developer Documentation

## What are ChatGPT Apps?

ChatGPT Apps are a new generation of interactive applications that run **inside ChatGPT conversations**. Introduced at OpenAI's DevDay 2025, they represent a fundamental shift in how users interact with third-party services through AI.

### Key Characteristics

- **Conversational Integration**: Apps appear naturally in chat when relevant
- **Interactive UI**: Blend conversation with custom components (maps, cards, media players, etc.)
- **Context-Aware**: Understand and respond to conversation history
- **Native Experience**: Feel like part of ChatGPT, not external tools

## Architecture Overview

ChatGPT apps consist of **two main components**:

### 1. MCP Server (Backend)
- Built on the **Model Context Protocol (MCP)** - an open standard
- Exposes **tools** that ChatGPT can call during conversations
- Handles **authentication** and **data access**
- Returns **structured data** + **HTML component references**
- Can be written in **Python** or **TypeScript/Node.js**

### 2. React Component (Frontend)
- Runs in a **sandboxed iframe** inside ChatGPT
- Renders **interactive UI** (maps, lists, media players, forms, etc.)
- Communicates with ChatGPT via **`window.openai` API**
- **Bundled as a single JavaScript module**
- Supports React, but can use any framework that compiles to JS

## How It Works

```
User Message → ChatGPT → Calls MCP Tool → Returns Structured Data + Component
                                                    ↓
                                    Component Renders in Iframe
                                                    ↓
                                    User Interacts with Component
                                                    ↓
                                    Component Calls Tools or Sends Messages
```

## Discovery & Entry Points

Apps can be discovered through:

1. **Named Mention**: User starts message with app name ("Spotify, make a playlist...")
2. **In-Conversation Discovery**: ChatGPT suggests apps based on context
3. **Directory**: Browse all available apps (coming later in 2025)
4. **Launcher**: Explicit app selection from the + button

## Display Modes

Apps can render in three modes:

1. **Inline**: Lightweight cards/carousels in conversation flow
2. **Fullscreen**: Immersive experiences for complex workflows
3. **Picture-in-Picture (PiP)**: Persistent floating windows for ongoing sessions

## Current Status (January 2025)

- ✅ **Apps SDK Preview Available** - Start building today
- ✅ **Developer Mode Testing** - Test in ChatGPT now
- ✅ **Available to 800M+ Users** - Free, Plus, Pro, Business plans
- ⏳ **App Submissions Open** - Later in 2025
- ⏳ **Monetization Details** - Coming soon
- ⏳ **Agentic Commerce Protocol** - For instant checkout

## Available Apps (Launch Partners)

### Live Now
- **Booking.com** - Hotel search and booking
- **Canva** - Slide deck design and creation
- **Coursera** - Course viewing with AI elaboration
- **Expedia** - Travel planning and booking
- **Figma** - Design file access and collaboration
- **Spotify** - Playlist creation and music playback
- **Zillow** - Real estate search with interactive maps

### Coming Soon
- AllTrails, Peloton, OpenTable, Target, theFork, Uber, and more

## Key Benefits

### For Users
- **Seamless Workflows**: Complete tasks without leaving ChatGPT
- **Rich Interactions**: Beyond text - maps, media, interactive elements
- **Context Retention**: Apps understand conversation history
- **Trusted Experience**: Apps vetted for safety and quality

### For Developers
- **Massive Reach**: 800M+ ChatGPT users worldwide
- **Contextual Discovery**: Apps surface when users need them
- **Open Standard**: Built on MCP, works anywhere MCP is adopted
- **Monetization Coming**: Opportunities to earn from your app

## Getting Started

Three main phases to building a ChatGPT app:

1. **Plan**: Research use cases, define tools, design components
2. **Build**: Set up MCP server, build custom UX, add authentication
3. **Deploy**: Host on HTTPS, connect to ChatGPT, test integration

## Key Resources

- **Documentation**: https://developers.openai.com/apps-sdk
- **GitHub Examples**: https://github.com/openai/openai-apps-sdk-examples
- **MCP Specification**: https://modelcontextprotocol.io
- **Figma Components**: https://www.figma.com/community/file/1560064615791108827

## Technology Stack

### Backend Options
- **Python SDK**: Official, includes FastMCP module
- **TypeScript SDK**: Official, ideal for Node/React stacks
- **Any MCP-compatible server**: Protocol is open

### Frontend Stack
- **React** (recommended, has official examples)
- **Any framework** that compiles to a single JS bundle
- **esbuild** or **Vite** for bundling
- **TypeScript** (optional but recommended)

### Infrastructure
- **HTTPS required** for production
- **ngrok** or similar for local development
- **Managed containers** (Fly.io, Render, Railway)
- **Cloud serverless** (Google Cloud Run, Azure Container Apps)
- **Kubernetes** (for teams with existing clusters)

## Open Standard

The Apps SDK is built on the **Model Context Protocol (MCP)**, an open standard that means:

- Apps built with it can run **anywhere that adopts MCP**
- **Not locked** into OpenAI's ecosystem
- **Community-driven** specification
- **Interoperable** across different AI platforms

## Next Steps

Explore the detailed guides in this folder:
- `01-core-concepts.md` - Deep dive into MCP, user interaction, design
- `02-mcp-server-guide.md` - Complete MCP server setup instructions
- `03-component-building-guide.md` - Build custom React components
- `04-authentication-guide.md` - Implement OAuth 2.1 authentication
- `05-deployment-guide.md` - Deploy and connect to ChatGPT
- `06-examples-and-resources.md` - Code examples and references
- `07-developer-guidelines.md` - Policies and submission requirements
- `08-quick-start.md` - Get started in 30 minutes
