# ChatGPT Calendar App - Proof of Concept

A working ChatGPT App that integrates with family calendar data using the OpenAI Apps SDK and Model Context Protocol (MCP).

## 🎯 Features

- **Calendar Search**: Search upcoming family events by keywords, date ranges, or view all events
- **Interactive UI**: Beautiful event cards with date/time, location, and descriptions
- **Real-time Data**: Fetches live calendar data from ICS feed with 5-minute caching
- **Theme Support**: Adapts to ChatGPT's light/dark theme
- **Responsive Design**: Works across desktop and mobile

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or pnpm
- ngrok account and auth token

### Setup

1. **Clone and install dependencies:**
   ```bash
   git clone <your-repo-url>
   cd chatgpt-app-poc
   npm install
   cd server && npm install
   cd ../web && npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env and add your ngrok auth token
   ```

3. **Build the React component:**
   ```bash
   npm run build
   ```

4. **Start the MCP server:**
   ```bash
   npm run dev
   ```

5. **Expose via ngrok:**
   ```bash
   npm run setup-ngrok
   ```

6. **Connect to ChatGPT:**
   - Copy the ngrok HTTPS URL
   - Go to ChatGPT Settings → Beta Features → Developer mode
   - Add connector with your ngrok URL + `/mcp`

### Usage

Try these queries in ChatGPT:
- "Show me upcoming events"
- "Search for birthday events"
- "What events are happening next week?"
- "Find events with 'practice' in the title"

## 🏗️ Architecture

### MCP Server (`server/`)
- **Framework**: Node.js + Express
- **Protocol**: Model Context Protocol (MCP)
- **Tools**: `calendar_search` - searches family calendar events
- **Resources**: HTML components for UI rendering
- **Data Source**: ICS calendar feed from `https://paulsnider.net/family/family-calendar-combined.ics`

### React Component (`web/`)
- **Framework**: React 18 with TypeScript
- **Bundler**: esbuild
- **Styling**: Theme-aware CSS with system colors
- **Integration**: `window.openai` API for ChatGPT communication

### Key Files
```
├── server/server.js          # MCP server implementation
├── web/src/component.tsx     # React calendar component
├── spec/calendar-search/     # Requirements and specifications
├── scripts/                  # Development utilities
└── .env                      # Environment configuration (gitignored)
```

## 🔧 Development

### Available Scripts
- `npm run dev` - Start MCP server in development mode
- `npm run build` - Build React component bundle
- `npm run setup-ngrok` - Configure and start ngrok tunnel
- `npm run start` - Start production server

### Testing
- Use MCP Inspector: `http://localhost:2091/mcp`
- Test calendar parsing: `node server/test-calendar.js`
- Check component build: `cd web && npm run build`

## 📋 API Reference

### Tools

#### `calendar_search`
Search family calendar events with optional filtering.

**Parameters:**
- `query` (string, optional): Search keywords for title, description, or location
- `days` (number, optional): Number of days ahead to search (default: 30)

**Returns:**
- `events`: Array of calendar events
- `query`: Original search query
- `daysAhead`: Days searched

### Component Props
The React component receives `toolOutput` with:
```typescript
{
  events: Array<{
    summary: string;
    start: string;
    end: string;
    location: string;
    description: string;
  }>;
  query?: string;
  daysAhead?: number;
}
```

## 🔒 Security

- Calendar data is public (no authentication required)
- HTTPS required for ChatGPT integration
- Sensitive data excluded from version control via `.gitignore`
- Environment variables used for configuration

## 📚 Documentation

This project includes comprehensive documentation for the ChatGPT Apps SDK:

- `01-core-concepts.md` - MCP protocol and design principles
- `02-mcp-server-guide.md` - Server implementation guide
- `03-component-building-guide.md` - React component development
- `08-quick-start.md` - Getting started guide

## 🤝 Contributing

1. Follow the spec-driven development approach in `spec/`
2. Test with MCP Inspector before ChatGPT integration
3. Ensure components work in all display modes
4. Add tests for new functionality

## 📄 License

MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- Built with [OpenAI Apps SDK](https://developers.openai.com/apps-sdk)
- Uses [Model Context Protocol](https://modelcontextprotocol.io)
- Calendar data provided by family calendar system
- Icons and styling follow ChatGPT design guidelines

---

**Status**: Working proof-of-concept with calendar search functionality
**Next Steps**: Add fullscreen mode, event filtering, and state persistence</content>
</xai:function_call">Now let me add all the files to git and create the initial commit. I'll exclude the .env file since it's already in .gitignore. 

<xai:function_call name="bash">
<parameter name="command">git add .