import React from "react";
import { createRoot } from "react-dom/client";

interface CalendarEvent {
  summary: string;
  start: string;
  end: string;
  location: string;
  description: string;
}

interface ToolOutput {
  greeting?: string;
  events?: CalendarEvent[];
  query?: string;
  daysAhead?: number;
  error?: string;
}

function HelloWorld({ greeting, theme }: { greeting: string; theme: string }) {
  return (
    <div
      style={{
        padding: "24px",
        textAlign: "center",
        borderRadius: "8px",
        backgroundColor: theme === "dark" ? "#2d2d2d" : "#f5f5f5",
        color: theme === "dark" ? "#ffffff" : "#000000",
      }}
    >
      <h2 style={{ margin: "0 0 12px 0", fontSize: "24px" }}>
        {greeting}
      </h2>
      <p style={{ margin: 0, fontSize: "14px", opacity: 0.7 }}>
        This is a simple Hello World ChatGPT App
      </p>
    </div>
  );
}

function CalendarEvents({ events, query, theme }: { events: CalendarEvent[]; query?: string; theme: string }) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const bgColor = theme === "dark" ? "#1a1a1a" : "#ffffff";
  const cardBg = theme === "dark" ? "#2d2d2d" : "#f9f9f9";
  const textColor = theme === "dark" ? "#ffffff" : "#000000";
  const mutedColor = theme === "dark" ? "#a0a0a0" : "#666666";
  const borderColor = theme === "dark" ? "#404040" : "#e5e5e5";

  return (
    <div
      style={{
        padding: "16px",
        backgroundColor: bgColor,
        color: textColor,
        maxHeight: "600px",
        overflowY: "auto",
      }}
    >
      <div style={{ marginBottom: "16px", padding: "0 8px" }}>
        <h2 style={{ margin: "0 0 4px 0", fontSize: "20px", fontWeight: "600" }}>
          {query ? `Calendar Results for "${query}"` : 'Upcoming Events'}
        </h2>
        <p style={{ margin: 0, fontSize: "14px", color: mutedColor }}>
          {events.length} event{events.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {events.length === 0 ? (
        <div style={{ padding: "32px", textAlign: "center", color: mutedColor }}>
          No events found
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {events.map((event, index) => (
            <div
              key={index}
              style={{
                padding: "16px",
                backgroundColor: cardBg,
                borderRadius: "8px",
                border: `1px solid ${borderColor}`,
              }}
            >
              <div style={{ marginBottom: "8px" }}>
                <h3 style={{ margin: "0 0 4px 0", fontSize: "16px", fontWeight: "600" }}>
                  {event.summary}
                </h3>
                <div style={{ fontSize: "14px", color: mutedColor }}>
                  {formatDate(event.start)} • {formatTime(event.start)}
                  {event.end && ` - ${formatTime(event.end)}`}
                </div>
              </div>

              {event.location && (
                <div style={{ fontSize: "14px", marginBottom: "4px", color: textColor }}>
                  📍 {event.location}
                </div>
              )}

              {event.description && (
                <div style={{ fontSize: "14px", marginTop: "8px", color: mutedColor, whiteSpace: "pre-wrap" }}>
                  {event.description}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function App() {
  const toolOutput = (window as any).openai?.toolOutput as ToolOutput;
  const theme = (window as any).openai?.theme || "light";

  // Calendar view
  if (toolOutput?.events !== undefined) {
    return (
      <CalendarEvents
        events={toolOutput.events}
        query={toolOutput.query}
        theme={theme}
      />
    );
  }

  // Hello world view
  const greeting = toolOutput?.greeting || "Hello!";
  return <HelloWorld greeting={greeting} theme={theme} />;
}

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(<App />);
} else {
  console.error("Root element not found");
}
