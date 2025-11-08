import React, { useState, useCallback } from "react";
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

// Hook to get display mode
function useDisplayMode() {
  return (window as any).openai?.displayMode || "inline";
}

// Hook to request display mode change
function useRequestDisplayMode() {
  return useCallback(async (mode: "inline" | "fullscreen" | "pip") => {
    if ((window as any).openai?.requestDisplayMode) {
      await (window as any).openai.requestDisplayMode({ mode });
    }
  }, []);
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
  const displayMode = useDisplayMode();
  const requestDisplayMode = useRequestDisplayMode();
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

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
  const accentColor = theme === "dark" ? "#60a5fa" : "#3b82f6";

  // Fullscreen calendar view
  if (displayMode === "fullscreen") {
    return (
      <FullscreenCalendar
        events={events}
        query={query}
        theme={theme}
        onBackToInline={() => requestDisplayMode("inline")}
      />
    );
  }

  // Inline calendar view
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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <h2 style={{ margin: "0 0 4px 0", fontSize: "20px", fontWeight: "600" }}>
            {query ? `Calendar Results for "${query}"` : 'Upcoming Events'}
          </h2>
          <button
            onClick={() => requestDisplayMode("fullscreen")}
            style={{
              padding: "6px 12px",
              backgroundColor: accentColor,
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontSize: "12px",
              cursor: "pointer",
              fontWeight: "500",
            }}
          >
            📅 Full Calendar
          </button>
        </div>
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
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onClick={() => setSelectedEvent(event)}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = accentColor;
                e.currentTarget.style.boxShadow = theme === "dark" ? "0 0 0 1px rgba(96, 165, 250, 0.3)" : "0 0 0 1px rgba(59, 130, 246, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = borderColor;
                e.currentTarget.style.boxShadow = "none";
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
                <div style={{
                  fontSize: "14px",
                  marginTop: "8px",
                  color: mutedColor,
                  whiteSpace: "pre-wrap",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}>
                  {event.description}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setSelectedEvent(null)}
        >
          <div
            style={{
              backgroundColor: bgColor,
              color: textColor,
              padding: "24px",
              borderRadius: "12px",
              maxWidth: "500px",
              maxHeight: "80vh",
              overflow: "auto",
              margin: "20px",
              border: `1px solid ${borderColor}`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <h2 style={{ margin: "0", fontSize: "24px", fontWeight: "600" }}>
                {selectedEvent.summary}
              </h2>
              <button
                onClick={() => setSelectedEvent(null)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  color: mutedColor,
                  padding: "0",
                  lineHeight: "1",
                }}
              >
                ×
              </button>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <div style={{ fontSize: "18px", fontWeight: "500", marginBottom: "8px" }}>
                📅 {formatDate(selectedEvent.start)}
              </div>
              <div style={{ fontSize: "16px", color: mutedColor }}>
                🕐 {formatTime(selectedEvent.start)}
                {selectedEvent.end && ` - ${formatTime(selectedEvent.end)}`}
              </div>
            </div>

            {selectedEvent.location && (
              <div style={{ marginBottom: "16px" }}>
                <div style={{ fontSize: "16px", fontWeight: "500", marginBottom: "4px" }}>
                  📍 Location
                </div>
                <div style={{ fontSize: "16px", color: textColor }}>
                  {selectedEvent.location}
                </div>
              </div>
            )}

            {selectedEvent.description && (
              <div>
                <div style={{ fontSize: "16px", fontWeight: "500", marginBottom: "8px" }}>
                  📝 Description
                </div>
                <div style={{ fontSize: "16px", color: textColor, whiteSpace: "pre-wrap", lineHeight: "1.5" }}>
                  {selectedEvent.description}
                </div>
              </div>
            )}
          </div>
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

// Fullscreen Calendar Component
function FullscreenCalendar({
  events,
  query,
  theme,
  onBackToInline
}: {
  events: CalendarEvent[];
  query?: string;
  theme: string;
  onBackToInline: () => void;
}) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [filterText, setFilterText] = useState(query || '');

  const bgColor = theme === "dark" ? "#1a1a1a" : "#ffffff";
  const cardBg = theme === "dark" ? "#2d2d2d" : "#f9f9f9";
  const textColor = theme === "dark" ? "#ffffff" : "#000000";
  const mutedColor = theme === "dark" ? "#a0a0a0" : "#666666";
  const borderColor = theme === "dark" ? "#404040" : "#e5e5e5";
  const accentColor = theme === "dark" ? "#60a5fa" : "#3b82f6";
  const headerBg = theme === "dark" ? "#2d2d2d" : "#f8f9fa";

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

  // Group events by date
  const eventsByDate = events.reduce((acc, event) => {
    const date = new Date(event.start).toDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(event);
    return acc;
  }, {} as Record<string, CalendarEvent[]>);

  // Filter events based on search
  const filteredEvents = events.filter(event => {
    if (!filterText) return true;
    const searchLower = filterText.toLowerCase();
    return (
      event.summary.toLowerCase().includes(searchLower) ||
      event.description?.toLowerCase().includes(searchLower) ||
      event.location?.toLowerCase().includes(searchLower)
    );
  });

  const filteredEventsByDate = filteredEvents.reduce((acc, event) => {
    const date = new Date(event.start).toDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(event);
    return acc;
  }, {} as Record<string, CalendarEvent[]>);

  return (
    <div style={{
      height: "100vh",
      backgroundColor: bgColor,
      color: textColor,
      display: "flex",
      flexDirection: "column",
    }}>
      {/* Header */}
      <div style={{
        padding: "16px 24px",
        backgroundColor: headerBg,
        borderBottom: `1px solid ${borderColor}`,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <div>
          <h1 style={{ margin: "0 0 4px 0", fontSize: "28px", fontWeight: "700" }}>
            📅 Family Calendar
          </h1>
          <p style={{ margin: 0, color: mutedColor, fontSize: "16px" }}>
            {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} found
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <input
            type="text"
            placeholder="Search events..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: "6px",
              border: `1px solid ${borderColor}`,
              backgroundColor: cardBg,
              color: textColor,
              fontSize: "14px",
              minWidth: "200px",
            }}
          />

          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => setViewMode('list')}
              style={{
                padding: "8px 16px",
                backgroundColor: viewMode === 'list' ? accentColor : cardBg,
                color: viewMode === 'list' ? 'white' : textColor,
                border: `1px solid ${borderColor}`,
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              📋 List
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              style={{
                padding: "8px 16px",
                backgroundColor: viewMode === 'calendar' ? accentColor : cardBg,
                color: viewMode === 'calendar' ? 'white' : textColor,
                border: `1px solid ${borderColor}`,
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              📅 Calendar
            </button>
          </div>

          <button
            onClick={onBackToInline}
            style={{
              padding: "8px 16px",
              backgroundColor: cardBg,
              color: textColor,
              border: `1px solid ${borderColor}`,
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            ← Back to Chat
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: "auto", padding: "24px" }}>
        {viewMode === 'list' ? (
          <ListView
            eventsByDate={filteredEventsByDate}
            formatDate={formatDate}
            formatTime={formatTime}
            theme={theme}
          />
        ) : (
          <CalendarView
            eventsByDate={filteredEventsByDate}
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            theme={theme}
          />
        )}
      </div>
    </div>
  );
}

// List View Component
function ListView({
  eventsByDate,
  formatDate,
  formatTime,
  theme
}: {
  eventsByDate: Record<string, CalendarEvent[]>;
  formatDate: (date: string) => string;
  formatTime: (time: string) => string;
  theme: string;
}) {
  const cardBg = theme === "dark" ? "#2d2d2d" : "#f9f9f9";
  const textColor = theme === "dark" ? "#ffffff" : "#000000";
  const mutedColor = theme === "dark" ? "#a0a0a0" : "#666666";
  const borderColor = theme === "dark" ? "#404040" : "#e5e5e5";

  const sortedDates = Object.keys(eventsByDate).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  if (sortedDates.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "64px", color: mutedColor }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>📅</div>
        <h3 style={{ margin: "0 0 8px 0", fontSize: "24px" }}>No events found</h3>
        <p>Try adjusting your search or date range</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {sortedDates.map(dateStr => {
        const events = eventsByDate[dateStr];
        const date = new Date(dateStr);

        return (
          <div key={dateStr}>
            <h2 style={{
              margin: "0 0 16px 0",
              fontSize: "20px",
              fontWeight: "600",
              color: textColor,
              borderBottom: `1px solid ${borderColor}`,
              paddingBottom: "8px",
            }}>
              {date.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
              })}
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {events.map((event, index) => (
                <div
                  key={index}
                  style={{
                    padding: "20px",
                    backgroundColor: cardBg,
                    borderRadius: "8px",
                    border: `1px solid ${borderColor}`,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                    <h3 style={{ margin: "0", fontSize: "18px", fontWeight: "600", color: textColor }}>
                      {event.summary}
                    </h3>
                    <div style={{ fontSize: "16px", color: mutedColor, fontWeight: "500" }}>
                      {formatTime(event.start)}
                      {event.end && ` - ${formatTime(event.end)}`}
                    </div>
                  </div>

                  {event.location && (
                    <div style={{ fontSize: "16px", marginBottom: "8px", color: textColor }}>
                      📍 {event.location}
                    </div>
                  )}

                  {event.description && (
                    <div style={{ fontSize: "16px", color: mutedColor, whiteSpace: "pre-wrap", lineHeight: "1.5" }}>
                      {event.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Calendar View Component (simplified grid)
function CalendarView({
  eventsByDate,
  selectedDate,
  onDateSelect,
  theme
}: {
  eventsByDate: Record<string, CalendarEvent[]>;
  selectedDate: Date | null;
  onDateSelect: (date: Date | null) => void;
  theme: string;
}) {
  const cardBg = theme === "dark" ? "#2d2d2d" : "#f9f9f9";
  const textColor = theme === "dark" ? "#ffffff" : "#000000";
  const mutedColor = theme === "dark" ? "#a0a0a0" : "#666666";
  const borderColor = theme === "dark" ? "#404040" : "#e5e5e5";
  const accentColor = theme === "dark" ? "#60a5fa" : "#3b82f6";

  // Generate calendar grid for current month
  const today = new Date();
  const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = currentMonth.getDay();

  const calendarDays = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null); // Empty cells for days before month starts
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const getEventsForDate = (day: number) => {
    const date = new Date(today.getFullYear(), today.getMonth(), day);
    const dateStr = date.toDateString();
    return eventsByDate[dateStr] || [];
  };

  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: "24px" }}>
        <h2 style={{ margin: "0", fontSize: "24px", fontWeight: "600", color: textColor }}>
          {today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h2>
      </div>

      {/* Day headers */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(7, 1fr)",
        gap: "8px",
        marginBottom: "16px",
      }}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} style={{
            padding: "8px",
            textAlign: "center",
            fontSize: "14px",
            fontWeight: "600",
            color: mutedColor,
          }}>
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(7, 1fr)",
        gap: "8px",
      }}>
        {calendarDays.map((day, index) => {
          if (day === null) {
            return <div key={index} />; // Empty cell
          }

          const events = getEventsForDate(day);
          const isToday = day === today.getDate();
          const isSelected = selectedDate?.getDate() === day && selectedDate?.getMonth() === today.getMonth();

          return (
            <div
              key={index}
              onClick={() => onDateSelect(isSelected ? null : new Date(today.getFullYear(), today.getMonth(), day))}
              style={{
                minHeight: "80px",
                padding: "8px",
                backgroundColor: isSelected ? accentColor : cardBg,
                color: isSelected ? 'white' : textColor,
                borderRadius: "6px",
                border: `1px solid ${isToday ? accentColor : borderColor}`,
                cursor: "pointer",
                position: "relative",
              }}
            >
              <div style={{
                fontSize: "14px",
                fontWeight: isToday ? "600" : "400",
                marginBottom: "4px",
              }}>
                {day}
              </div>

              {events.length > 0 && (
                <div style={{ fontSize: "10px", opacity: 0.8 }}>
                  {events.length} event{events.length > 1 ? 's' : ''}
                </div>
              )}

              {/* Event dots */}
              {events.slice(0, 3).map((_, i) => (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    bottom: "4px",
                    left: `${4 + i * 6}px`,
                    width: "4px",
                    height: "4px",
                    backgroundColor: isSelected ? 'rgba(255,255,255,0.8)' : accentColor,
                    borderRadius: "50%",
                  }}
                />
              ))}
            </div>
          );
        })}
      </div>

      {/* Selected date events */}
      {selectedDate && (
        <div style={{ marginTop: "24px" }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: "20px", fontWeight: "600", color: textColor }}>
            Events on {selectedDate.toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric'
            })}
          </h3>

          {getEventsForDate(selectedDate.getDate()).length === 0 ? (
            <p style={{ color: mutedColor }}>No events on this date</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {getEventsForDate(selectedDate.getDate()).map((event, index) => (
                <div
                  key={index}
                  style={{
                    padding: "16px",
                    backgroundColor: cardBg,
                    borderRadius: "8px",
                    border: `1px solid ${borderColor}`,
                  }}
                >
                  <h4 style={{ margin: "0 0 8px 0", fontSize: "16px", fontWeight: "600" }}>
                    {event.summary}
                  </h4>
                  <div style={{ fontSize: "14px", color: mutedColor, marginBottom: "8px" }}>
                    {new Date(event.start).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    })}
                    {event.end && ` - ${new Date(event.end).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    })}`}
                  </div>
                  {event.location && (
                    <div style={{ fontSize: "14px", color: textColor }}>
                      📍 {event.location}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(<App />);
} else {
  console.error("Root element not found");
}
