# Component Building Guide

Complete guide to building custom UI components for ChatGPT Apps.

## Table of Contents
1. [Understanding window.openai API](#understanding-windowopenai-api)
2. [Scaffold Component Project](#scaffold-component-project)
3. [Author React Component](#author-react-component)
4. [Bundle for Iframe](#bundle-for-iframe)
5. [Embed in Server Response](#embed-in-server-response)

---

## Understanding window.openai API

`window.openai` is the **bridge between your frontend and ChatGPT**. It provides data, state management, and layout controls.

### Type Definitions

```typescript
declare global {
  interface Window {
    openai: API & OpenAiGlobals;
  }
  interface WindowEventMap {
    [SET_GLOBALS_EVENT_TYPE]: SetGlobalsEvent;
  }
}

type OpenAiGlobals<
  ToolInput extends UnknownObject = UnknownObject,
  ToolOutput extends UnknownObject = UnknownObject,
  ToolResponseMetadata extends UnknownObject = UnknownObject,
  WidgetState extends UnknownObject = UnknownObject
> = {
  // Theme & User Agent
  theme: Theme;  // "light" | "dark"
  userAgent: UserAgent;
  locale: string;

  // Layout
  maxHeight: number;
  displayMode: DisplayMode;  // "pip" | "inline" | "fullscreen"
  safeArea: SafeArea;

  // State
  toolInput: ToolInput;
  toolOutput: ToolOutput | null;
  toolResponseMetadata: ToolResponseMetadata | null;
  widgetState: WidgetState | null;
};

type API<WidgetState extends UnknownObject> = {
  /** Calls a tool on your MCP. Returns the full response. */
  callTool: (
    name: string,
    args: Record<string, unknown>
  ) => Promise<CallToolResponse>;

  /** Triggers a followup turn in the ChatGPT conversation */
  sendFollowUpMessage: (args: { prompt: string }) => Promise<void>;

  /** Opens an external link, redirects web page or mobile app */
  openExternal(payload: { href: string }): void;

  /** For transitioning an app from inline to fullscreen or pip */
  requestDisplayMode: (args: { mode: DisplayMode }) => Promise<{
    mode: DisplayMode; // Granted display mode (may be coerced)
  }>;

  setWidgetState: (state: WidgetState) => Promise<void>;
};
```

### useOpenAiGlobal Hook

Create a reusable hook to subscribe to global values:

```typescript
import { useSyncExternalStore } from "react";

export function useOpenAiGlobal<K extends keyof OpenAiGlobals>(
  key: K
): OpenAiGlobals[K] {
  return useSyncExternalStore(
    (onChange) => {
      const handleSetGlobal = (event: SetGlobalsEvent) => {
        const value = event.detail.globals[key];
        if (value === undefined) return;
        onChange();
      };

      window.addEventListener(SET_GLOBALS_EVENT_TYPE, handleSetGlobal, {
        passive: true
      });

      return () => {
        window.removeEventListener(SET_GLOBALS_EVENT_TYPE, handleSetGlobal);
      };
    },
    () => window.openai[key]
  );
}
```

### Common Helper Hooks

```typescript
export function useToolInput() {
  return useOpenAiGlobal("toolInput");
}

export function useToolOutput() {
  return useOpenAiGlobal("toolOutput");
}

export function useToolResponseMetadata() {
  return useOpenAiGlobal("toolResponseMetadata");
}

export function useTheme() {
  return useOpenAiGlobal("theme");
}

export function useDisplayMode() {
  return useOpenAiGlobal("displayMode");
}
```

### Persist Component State

Widget state is scoped to **specific widget instance** on a single conversation message.

**Key Points**:
- State stored under `message_id/widgetId` pair
- Rehydrated only for that widget
- Follow-up turns keep same widget (and state) when submitted through widget controls
- Main chat composer creates new widget with fresh `widgetState`
- Keep payload < 4k tokens for performance

**useWidgetState Hook**:

```typescript
export function useWidgetState<T extends WidgetState>(
  defaultState: T | (() => T)
): readonly [T, (state: SetStateAction<T>) => void];

export function useWidgetState<T extends WidgetState>(
  defaultState?: T | (() => T | null) | null
): readonly [T | null, (state: SetStateAction<T | null>) => void] {
  const widgetStateFromWindow = useOpenAiGlobal("widgetState") as T;

  const [widgetState, _setWidgetState] = useState<T | null>(() => {
    if (widgetStateFromWindow != null) {
      return widgetStateFromWindow;
    }
    return typeof defaultState === "function"
      ? defaultState()
      : defaultState ?? null;
  });

  useEffect(() => {
    _setWidgetState(widgetStateFromWindow);
  }, [widgetStateFromWindow]);

  const setWidgetState = useCallback(
    (state: SetStateAction<T | null>) => {
      _setWidgetState((prevState) => {
        const newState = typeof state === "function" ? state(prevState) : state;
        if (newState != null) {
          window.openai.setWidgetState(newState);
        }
        return newState;
      });
    },
    [window.openai.setWidgetState]
  );

  return [widgetState, setWidgetState] as const;
}
```

### Trigger Server Actions

Component can call MCP tools directly with `callTool`:

```typescript
async function refreshPlaces(city: string) {
  await window.openai?.callTool("refresh_pizza_list", { city });
}
```

**Note**: Tool must be marked with `"openai/widgetAccessible": true` in MCP server

### Send Conversational Follow-ups

Insert message into conversation as if user asked it:

```typescript
await window.openai?.sendFollowUpMessage({
  prompt: "Draft a tasting itinerary for the pizzerias I favorited."
});
```

### Request Alternate Layouts

For maps, tables, or editors needing more space:

```typescript
await window.openai?.requestDisplayMode({ mode: "fullscreen" });
// Note: on mobile, PiP may be coerced to fullscreen
```

### Use Host-Backed Navigation

Skybridge mirrors iframe history into ChatGPT's UI. Use standard routing:

**Router Setup** (React Router):

```typescript
import { BrowserRouter, Routes, Route } from "react-router-dom";

export default function PizzaListRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PizzaListApp />}>
          <Route path="place/:placeId" element={<PizzaListApp />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
```

**Programmatic Navigation**:

```typescript
import { useNavigate } from "react-router-dom";

const navigate = useNavigate();

function openDetails(placeId: string) {
  navigate(`place/${placeId}`, { replace: false });
}

function closeDetails() {
  navigate("..", { replace: true });
}
```

---

## Scaffold Component Project

### Recommended Project Structure

```
app/
├── server/              # MCP server (Python or Node)
└── web/                 # Component bundle source
    ├── package.json
    ├── tsconfig.json
    ├── src/
    │   └── component.tsx
    └── dist/
        └── component.js  # Build output
```

### Create Project

```bash
cd app/web
npm init -y
npm install react@^18 react-dom@^18
npm install -D typescript esbuild
```

### Optional Libraries

Add as needed, but keep bundle lean:
- **React Router**: Navigation
- **Embla Carousel**: Carousels
- **Mapbox GL**: Maps
- **React DnD**: Drag and drop
- **Chart.js**: Charts

---

## Author React Component

Your entry file should:
1. Mount component into `root` element
2. Read initial data from `window.openai.toolOutput` or persisted state

### Example: Pizzaz List Component

```typescript
import React from "react";
import { createRoot } from "react-dom/client";
import { useToolOutput, useWidgetState, useTheme } from "./hooks";

interface Place {
  id: string;
  name: string;
  rating: number;
  image: string;
}

function PizzaList() {
  const toolOutput = useToolOutput();
  const [favorites, setFavorites] = useWidgetState<string[]>([]);
  const theme = useTheme();

  const places = toolOutput?.places as Place[] || [];

  const toggleFavorite = (id: string) => {
    setFavorites(prev =>
      prev.includes(id)
        ? prev.filter(fid => fid !== id)
        : [...prev, id]
    );
  };

  return (
    <div className={`pizza-list theme-${theme}`}>
      {places.map(place => (
        <div key={place.id} className="place-card">
          <img src={place.image} alt={place.name} />
          <h3>{place.name}</h3>
          <p>Rating: {place.rating}/5</p>
          <button onClick={() => toggleFavorite(place.id)}>
            {favorites.includes(place.id) ? "★" : "☆"}
          </button>
        </div>
      ))}
    </div>
  );
}

// Mount component
const root = document.getElementById("pizza-root");
if (root) {
  createRoot(root).render(<PizzaList />);
}
```

### Example Component Gallery

See `06-examples-and-resources.md` for full examples:

- **Pizzaz List**: Ranked card list with favorites and CTAs
- **Pizzaz Carousel**: Horizontal scroller for media-heavy layouts
- **Pizzaz Map**: Mapbox integration with fullscreen inspector
- **Pizzaz Album**: Stacked gallery view for deep dives
- **Pizzaz Video**: Scripted player with overlays and controls

---

## Bundle for Iframe

Once component is complete, build into single JavaScript module:

### Build Script (package.json)

```json
{
  "scripts": {
    "build": "esbuild src/component.tsx --bundle --format=esm --outfile=dist/component.js"
  }
}
```

### Run Build

```bash
npm run build
```

**Output**: `dist/component.js`

### Advanced Build Options

With CSS:

```json
{
  "scripts": {
    "build": "esbuild src/component.tsx --bundle --format=esm --outfile=dist/component.js --loader:.css=css --inject:src/styles.css"
  }
}
```

With Vite (for larger projects):

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: 'src/component.tsx',
      formats: ['es'],
      fileName: 'component'
    },
    rollupOptions: {
      external: [],
      output: {
        globals: {}
      }
    }
  }
});
```

### Troubleshooting Build Issues

If esbuild complains about missing dependencies:
1. Confirm you ran `npm install` in `web/` directory
2. Check imports match installed package names
3. Verify package versions are compatible

---

## Embed in Server Response

### Method 1: Inline Component in Resource (Recommended for Development)

Load bundle and inline in HTML resource:

```typescript
import { readFileSync } from "node:fs";

const COMPONENT_JS = readFileSync("web/dist/component.js", "utf8");
const COMPONENT_CSS = readFileSync("web/dist/component.css", "utf8");

server.registerResource(
  "component",
  "ui://widget/component.html",
  {},
  async () => ({
    contents: [{
      uri: "ui://widget/component.html",
      mimeType: "text/html+skybridge",
      text: `
        <div id="pizza-root"></div>
        <style>${COMPONENT_CSS}</style>
        <script type="module">${COMPONENT_JS}</script>
      `.trim(),
      _meta: {
        "openai/widgetPrefersBorder": true,
        "openai/widgetDomain": "https://chatgpt.com",
        "openai/widgetCSP": {
          connect_domains: ["https://chatgpt.com"],
          resource_domains: ["https://*.oaistatic.com"]
        }
      }
    }]
  })
);
```

### Method 2: Hosted Assets (Recommended for Production)

Host assets on CDN and reference:

```typescript
server.registerResource(
  "component",
  "ui://widget/component.html",
  {},
  async () => ({
    contents: [{
      uri: "ui://widget/component.html",
      mimeType: "text/html+skybridge",
      text: `
        <div id="pizza-root"></div>
        <link rel="stylesheet" href="https://persistent.oaistatic.com/your-app/component.css">
        <script type="module" src="https://persistent.oaistatic.com/your-app/component.js"></script>
      `.trim(),
      _meta: {
        "openai/widgetCSP": {
          resource_domains: ["https://persistent.oaistatic.com"]
        }
      }
    }]
  })
);
```

### Development Hot-Reload

During development:
1. Rebuild component bundle when React code changes
2. Restart MCP server
3. Refresh connector in ChatGPT settings to pull latest metadata

---

## Next Steps

With component built and embedded:
1. Test with MCP Inspector
2. Add authentication if needed (`04-authentication-guide.md`)
3. Deploy to production (`05-deployment-guide.md`)
