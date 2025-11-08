/**
 * Hello World ChatGPT App - MCP Server
 *
 * This server implements the Model Context Protocol (MCP) to connect with ChatGPT.
 * It demonstrates:
 * - Tool registration (hello_world tool)
 * - HTML resource registration (React component)
 * - SSE (Server-Sent Events) transport for real-time communication
 * - Structured content return for component hydration
 */

// Import MCP SDK core classes
// Server: Main MCP server class that handles protocol communication
// SSEServerTransport: Transport layer for HTTP/SSE connections
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";

// Import Express for HTTP server and Node.js file system utilities
import express from "express";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import https from "https";
import ical from "node-ical";

// Import MCP SDK types
import { InitializeRequestSchema } from "@modelcontextprotocol/sdk/types.js";

// Import MCP request schemas
// These schemas define the structure of MCP protocol messages
import {
  ListToolsRequestSchema,      // Lists available tools to ChatGPT
  CallToolRequestSchema,        // Executes a specific tool
  ListResourcesRequestSchema,   // Lists available UI resources
  ReadResourceRequestSchema,    // Retrieves a specific UI resource
} from "@modelcontextprotocol/sdk/types.js";

/**
 * Load the React component bundle from disk
 *
 * This bundle contains the entire React component code and will be embedded
 * directly in the HTML resource. ChatGPT will execute this JavaScript in an
 * iframe when the tool is called.
 *
 * The component must be built first using: npm run build in web/ directory
 */
const __dirname = dirname(fileURLToPath(import.meta.url));
let COMPONENT_JS;
try {
  COMPONENT_JS = readFileSync(join(__dirname, "../web/dist/component.js"), "utf8");
} catch (error) {
  console.error("❌ ERROR: Component bundle not found!");
  console.error("Run 'npm run build' in web/ directory first");
  console.error("Error details:", error.message);
  process.exit(1);
}

// Calendar cache
let calendarCache = { data: null, timestamp: 0 };
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Fetch and parse calendar
async function fetchCalendarEvents(searchQuery = '', daysAhead = 30) {
  const now = Date.now();

  // Check cache
  if (calendarCache.data && (now - calendarCache.timestamp) < CACHE_TTL) {
    console.log('Using cached calendar data');
    return filterEvents(calendarCache.data, searchQuery, daysAhead);
  }

  // Fetch calendar
  return new Promise((resolve, reject) => {
    https.get('https://paulsnider.net/family/family-calendar-combined.ics', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const events = ical.parseICS(data);
          calendarCache = { data: events, timestamp: now };
          console.log('Fetched and cached calendar data');
          resolve(filterEvents(events, searchQuery, daysAhead));
        } catch (err) {
          reject(new Error('Failed to parse calendar: ' + err.message));
        }
      });
    }).on('error', (err) => {
      reject(new Error('Failed to fetch calendar: ' + err.message));
    });
  });
}

function filterEvents(events, searchQuery, daysAhead) {
  const now = new Date();
  const futureDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);

  const filtered = Object.values(events)
    .filter(event => event.type === 'VEVENT')
    .filter(event => {
      const start = new Date(event.start);
      return start >= now && start <= futureDate;
    })
    .filter(event => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        event.summary?.toLowerCase().includes(query) ||
        event.description?.toLowerCase().includes(query) ||
        event.location?.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => new Date(a.start) - new Date(b.start))
    .slice(0, 20)
    .map(event => ({
      summary: event.summary || 'Untitled Event',
      start: event.start,
      end: event.end,
      location: event.location || '',
      description: event.description || ''
    }));

  return filtered;
}

// Create MCP Server Instance
const server = new Server(
  {
    name: "hello-world-app",
    version: "1.0.0",
  },
  {
    capabilities: {
      resources: {},  // This server can provide UI resources (HTML components)
      tools: {},      // This server can execute tools (actions/functions)
    },
  }
);

// Initialize Handler
server.setRequestHandler(InitializeRequestSchema, async (request) => {
  console.log('Handling initialize request:', JSON.stringify(request, null, 2));
  return {
    protocolVersion: "2025-06-18",
    capabilities: {
      resources: {},
      tools: {},
    },
    serverInfo: {
      name: "hello-world-app",
      version: "1.0.0",
    },
  };
});

// Resource List Handler
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  console.log('Handling resources/list');
  return {
    resources: [
      {
        uri: "ui://widget/hello.html",
        name: "Hello World Component",
        mimeType: "text/html+skybridge",
      },
      {
        uri: "ui://widget/calendar.html",
        name: "Calendar Events Component",
        mimeType: "text/html+skybridge",
      },
    ],
  };
});

// Resource Read Handler
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  console.log('Handling resources/read for URI:', request.params.uri);
  if (request.params.uri === "ui://widget/hello.html") {
    return {
      contents: [
        {
          uri: "ui://widget/hello.html",
          mimeType: "text/html+skybridge",
          text: `
            <div id="root"></div>
            <script type="module">${COMPONENT_JS}</script>
          `.trim(),
        },
      ],
    };
  }
  if (request.params.uri === "ui://widget/calendar.html") {
    return {
      contents: [
        {
          uri: "ui://widget/calendar.html",
          mimeType: "text/html+skybridge",
          text: `
            <div id="root"></div>
            <script type="module">${COMPONENT_JS}</script>
          `.trim(),
        },
      ],
    };
  }
  throw new Error("Resource not found");
});

// Tool List Handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  console.log('Handling tools/list');
  return {
    tools: [
      {
        name: "hello_world",
        description: "Displays a friendly hello message",
        inputSchema: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "Name to greet (defaults to 'World')",
            },
          },
        },
      },
      {
        name: "calendar_search",
        description: "Search family calendar events. Shows upcoming events, can filter by keywords or date range.",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Search query to filter events (searches title, description, location). Leave empty for all events.",
            },
            days: {
              type: "number",
              description: "Number of days ahead to search (defaults to 30)",
            },
          },
        },
      },
    ],
    _meta: {
      "openai/outputTemplate": "ui://widget/hello.html",
    },
  };
});

// Tool Call Handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  console.log('Handling tools/call for tool:', request.params.name);
  if (request.params.name === "hello_world") {
    try {
      const name = request.params.arguments?.name || "World";
      console.log('Greeting name:', name);
      return {
        content: [
          {
            type: "text",
            text: `Greeted ${name}`,
          },
        ],
        structuredContent: {
          greeting: `Hello, ${name}!`,
        },
      };
    } catch (error) {
      console.error("Tool error:", error);
      return {
        content: [
          {
            type: "text",
            text: "Failed to generate greeting",
          },
        ],
        structuredContent: {
          greeting: "Error occurred",
        },
      };
    }
  }

  if (request.params.name === "calendar_search") {
    try {
      const query = request.params.arguments?.query || '';
      const days = request.params.arguments?.days || 30;
      console.log('Searching calendar:', { query, days });

      const events = await fetchCalendarEvents(query, days);

      return {
        content: [
          {
            type: "text",
            text: `Found ${events.length} event(s)`,
          },
        ],
        structuredContent: {
          events: events,
          query: query,
          daysAhead: days,
        },
        _meta: {
          "openai/outputTemplate": "ui://widget/calendar.html",
        },
      };
    } catch (error) {
      console.error("Calendar search error:", error);
      return {
        content: [
          {
            type: "text",
            text: `Failed to search calendar: ${error.message}`,
          },
        ],
        structuredContent: {
          events: [],
          error: error.message,
        },
      };
    }
  }

  throw new Error("Tool not found");
});

// Session management (like official examples)
const sessions = new Map();

// Create Express HTTP server
const app = express();

// Add CORS headers for ChatGPT
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  next();
});

/**
 * MCP SSE Endpoint - /mcp (alias: /mcp/sse)
 *
 * This is the main endpoint that ChatGPT connects to. It uses Server-Sent Events (SSE)
 * to maintain a persistent connection for real-time bidirectional communication.
 *
 * Flow:
 * 1. ChatGPT makes GET request to /mcp (or legacy /mcp/sse)
 * 2. Server creates an MCP Server instance for this connection
 * 3. Server registers all tools and resources
 * 4. Server connects via SSE transport
 * 5. ChatGPT can now discover tools, call them, and request resources
 */
const handleMcpConnection = async (req, res) => {
  console.log('New MCP connection established from:', req.ip);
  // HEAD requests should not establish SSE connection
  if (req.method === 'HEAD') {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    return res.status(200).end();
  }

  /**
   * Connect Server to SSE Transport (per official examples)
   */
  const transport = new SSEServerTransport("/mcp/messages", res);
  const sessionId = transport.sessionId;

  // Store session
  sessions.set(sessionId, { server, transport });

  // Cleanup on close
  transport.onclose = async () => {
    console.log('Session closed:', sessionId);
    sessions.delete(sessionId);
  };

  transport.onerror = (error) => {
    console.error('SSE transport error:', error);
  };

  try {
    await server.connect(transport);
    console.log('Server connected, sessionId:', sessionId);
  } catch (error) {
    console.error('Failed to start SSE session:', error);
    sessions.delete(sessionId);
    if (!res.headersSent) {
      res.status(500).end('Failed to establish SSE connection');
    }
  }
};

// Primary MCP endpoint required by specification
app.get("/mcp", handleMcpConnection);
app.head("/mcp", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.status(200).end();
});
// Legacy alias maintained for compatibility with earlier instructions/tools
app.get("/mcp/sse", handleMcpConnection);
app.head("/mcp/sse", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.status(200).end();
});

/**
 * Process MCP Request
 *
 * Manually handle JSON-RPC requests since the MCP SDK transport system
 * is designed for SSE, but ChatGPT's connector expects HTTP responses.
 */
const processRequest = async (request) => {
  const { method, params, id } = request;
  console.log(`Processing ${method} request`);
  let result;
  switch (method) {
    case 'initialize':
      result = {
        protocolVersion: "2025-06-18",
        capabilities: {
          resources: {},
          tools: {},
        },
        serverInfo: {
          name: "hello-world-app",
          version: "1.0.0",
        },
      };
      break;
    case 'tools/list':
      result = {
        tools: [
          {
            name: "hello_world",
            description: "Displays a friendly hello message",
            inputSchema: {
              type: "object",
              properties: {
                name: {
                  type: "string",
                  description: "Name to greet (defaults to 'World')",
                },
              },
            },
          },
          {
            name: "calendar_search",
            description: "Search family calendar events. Shows upcoming events, can filter by keywords or date range.",
            inputSchema: {
              type: "object",
              properties: {
                query: {
                  type: "string",
                  description: "Search query to filter events (searches title, description, location). Leave empty for all events.",
                },
                days: {
                  type: "number",
                  description: "Number of days ahead to search (defaults to 30)",
                },
              },
            },
          },
        ],
        _meta: {
          "openai/outputTemplate": "ui://widget/hello.html",
        },
      };
      break;
    case 'resources/list':
      result = {
        resources: [
          {
            uri: "ui://widget/hello.html",
            name: "Hello World Component",
            mimeType: "text/html+skybridge",
          },
          {
            uri: "ui://widget/calendar.html",
            name: "Calendar Events Component",
            mimeType: "text/html+skybridge",
          },
        ],
      };
      break;
    case 'resources/read':
      if (params.uri === "ui://widget/hello.html") {
        result = {
          contents: [
            {
              uri: "ui://widget/hello.html",
              mimeType: "text/html+skybridge",
              text: `
                <div id="root"></div>
                <script type="module">${COMPONENT_JS}</script>
              `.trim(),
            },
          ],
        };
      } else if (params.uri === "ui://widget/calendar.html") {
        result = {
          contents: [
            {
              uri: "ui://widget/calendar.html",
              mimeType: "text/html+skybridge",
              text: `
                <div id="root"></div>
                <script type="module">${COMPONENT_JS}</script>
              `.trim(),
            },
          ],
        };
      } else {
        throw new Error("Resource not found");
      }
      break;
    case 'tools/call':
      if (params.name === "hello_world") {
        const name = params.arguments?.name || "World";
        console.log('Greeting name:', name);
        result = {
          content: [
            {
              type: "text",
              text: `Greeted ${name}`,
            },
          ],
          structuredContent: {
            greeting: `Hello, ${name}!`,
          },
        };
      } else if (params.name === "calendar_search") {
        // Simplified version for legacy HTTP - in real MCP this uses the async handler above
        result = {
          content: [
            {
              type: "text",
              text: "Calendar search tool called (use MCP SSE for full functionality)",
            },
          ],
          structuredContent: {
            events: [],
            message: "Use MCP SSE connection for calendar search",
          },
        };
      } else {
        throw new Error("Tool not found");
      }
      break;
    default:
      throw new Error(`Unknown method: ${method}`);
  }
  return { jsonrpc: '2.0', id, result };
};

/**
 * Message POST Endpoint - /mcp/messages
 *
 * Per official examples: use transport.handlePostMessage()
 */
app.post("/mcp/messages", async (req, res) => {
  const sessionId = req.query.sessionId;
  console.log('Received message for session:', sessionId);

  if (!sessionId) {
    return res.status(400).end('Missing sessionId query parameter');
  }

  const session = sessions.get(sessionId);
  if (!session) {
    console.error('Unknown session:', sessionId);
    return res.status(404).end('Unknown session');
  }

  try {
    // Let the transport handle the message (official example pattern)
    await session.transport.handlePostMessage(req, res);
  } catch (error) {
    console.error('Failed to process message:', error);
    if (!res.headersSent) {
      res.status(500).end('Failed to process message');
    }
  }
});

/**
 * Start HTTP Server
 *
 * Listen on port 2091 for incoming connections.
 * This port will be exposed to ChatGPT via ngrok during development.
 *
 * For production, you'd deploy this to a hosting service with HTTPS.
 * ChatGPT requires HTTPS for security (ngrok provides this for local dev).
 */
const PORT = 2091;
app.listen(PORT, () => {
  console.log(`✓ MCP server running on http://localhost:${PORT}`);
  console.log(`✓ MCP endpoint: http://localhost:${PORT}/mcp`);
  console.log(`✓ SSE alias:   http://localhost:${PORT}/mcp/sse`);
  console.log(`✓ Ready to connect to ChatGPT!`);
  console.log(`\n📝 Next steps:`);
  console.log(`   1. Run: ngrok http ${PORT}`);
  console.log(`   2. Copy the HTTPS URL from ngrok`);
  console.log(`   3. In ChatGPT Settings > Apps, add: https://your-id.ngrok.io/mcp`);
}).on("error", (err) => {
  /**
   * Error Handler
   *
   * Handles common server startup errors:
   * - EADDRINUSE: Port is already in use by another process
   * - Other errors: Network issues, permission problems, etc.
   */
  if (err.code === "EADDRINUSE") {
    console.error(`❌ ERROR: Port ${PORT} already in use`);
    console.error(`💡 Solution: Run 'lsof -ti:${PORT} | xargs kill' to stop the process`);
    console.error(`   Or change PORT in server.js to a different number`);
    process.exit(1);
  } else {
    console.error("❌ Server error:", err);
    process.exit(1);
  }
});
