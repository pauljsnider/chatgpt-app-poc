# Core Concepts - ChatGPT Apps SDK

## Table of Contents
1. [Model Context Protocol (MCP)](#model-context-protocol-mcp)
2. [User Interaction & Discovery](#user-interaction--discovery)
3. [Design Guidelines](#design-guidelines)

---

## Model Context Protocol (MCP)

### What is MCP?

The **Model Context Protocol** is an open specification for connecting large language model clients to external tools and resources. It's like "a USB-C port for AI applications" - a standardized way to connect AI systems to external data and functionality.

### Why MCP for Apps SDK?

MCP is the **backbone** that keeps server, model, and UI in sync. By standardizing the wire format, authentication, and metadata, it lets ChatGPT reason about your app the same way it reasons about built-in tools.

### Protocol Building Blocks

A minimal MCP server for Apps SDK implements three capabilities:

#### 1. List Tools
Your server advertises the tools it supports, including:
- **JSON Schema** input and output contracts
- **Metadata** (descriptions, annotations)
- **Optional configurations** (auth requirements, UI templates)

#### 2. Call Tools
When the model selects a tool to use:
- ChatGPT sends a `call_tool` request with arguments
- Your server executes the action
- Returns **structured content** the model can parse

#### 3. Return Components
In addition to structured content:
- Each tool can point to an **embedded resource** (HTML template)
- This template represents the **UI to render** in ChatGPT
- Supports custom components, not just plain data

### Transport Options

The protocol is **transport agnostic**. Supports:
- **Server-Sent Events (SSE)**
- **Streamable HTTP** (recommended for Apps SDK)

### Benefits of MCP Standardization

#### Discovery Integration
- Model consumes your tool metadata like first-party connectors
- Enables natural-language discovery
- Launcher ranking based on conversation context

#### Conversation Awareness
- Structured content flows through conversation history
- Model can inspect JSON results
- Reference IDs in follow-up turns
- Render components again later

#### Multiclient Support
- MCP is self-describing
- Works across ChatGPT web and mobile
- No custom client code needed

#### Extensible Auth
- Spec includes protected resource metadata
- OAuth 2.1 flows built-in
- Dynamic client registration
- Control access without proprietary handshake

### Key MCP Resources

- **Specification**: https://modelcontextprotocol.io/specification
- **Python SDK**: https://github.com/modelcontextprotocol/python-sdk
- **TypeScript SDK**: https://github.com/modelcontextprotocol/typescript-sdk
- **MCP Inspector**: https://modelcontextprotocol.io/docs/tools/inspector

---

## User Interaction & Discovery

### How Users Find Apps

#### 1. Named Mention
When a user mentions your app name at the **beginning of a prompt**:
```
"Spotify, make a playlist for my party this Friday"
```
- Your app surfaces automatically
- No ambiguity about which app to use
- Direct invocation guaranteed

#### 2. In-Conversation Discovery
ChatGPT evaluates multiple factors to suggest apps:

**Conversation Context**
- Chat history
- Previous tool results
- Memories
- Explicit tool preferences

**Brand Mentions & Citations**
- Brand explicitly requested in query
- Brand surfaced as source/citation in search results

**Tool Metadata Quality**
- Names, descriptions, parameter documentation
- How well they match user intent

**User Linking State**
- Whether user already granted access
- Or needs to connect before tool can run

#### Improving In-Conversation Discovery

You can influence discovery by:

1. **Action-Oriented Tool Descriptions**
   ```
   ✅ "Use this when the user wants to view their kanban board"
   ❌ "Kanban board tool"
   ```

2. **Clear Component Descriptions**
   - Add descriptions to resource UI template metadata
   - Help model understand what will be displayed

3. **Regular Testing**
   - Test golden prompt set in developer mode
   - Log precision/recall metrics
   - Iterate on metadata

#### 3. Directory (Coming Later 2025)
Will include:
- App name and icon
- Short and long descriptions
- Tags or categories
- Optional onboarding instructions or screenshots

### Entry Points

Once a user links your app, several surfaces are available:

#### In-Conversation Entry
- **Always on** in model's context
- Model decides based on conversation + metadata
- **Best Practices**:
  - Keep descriptions action-oriented
  - Return structured content with stable IDs
  - Provide `_meta` hints for streamlined UX

#### Launcher
- High-intent entry point (+ button in composer)
- User explicitly chooses an app
- **Considerations**:
  - Include starter prompts
  - Support deep linking with entry arguments
  - Keep metadata aligned with supported scenarios

---

## Design Guidelines

### Design Philosophy

Apps extend ChatGPT without breaking conversational flow. They should feel:
- **Conversational**: Natural extension of ChatGPT
- **Intelligent**: Context-aware, anticipate user intent
- **Simple**: Single clear action per interaction
- **Responsive**: Fast, lightweight, not overwhelming
- **Accessible**: Support wide range of users and assistive tech

### Boundaries

**ChatGPT Controls**:
- System voice and tone
- Chrome and navigation
- Base styles and typography
- Composer interface

**Developers Provide**:
- Custom content
- Brand presence
- Actions and interactions
- Component-specific UI

This balance ensures apps feel **native to ChatGPT** while expressing **unique brand value**.

### Good Use Cases

A good app should answer "yes" to most:

- ✅ Fits naturally into conversation (booking, ordering, scheduling)
- ✅ Time-bound or action-oriented (clear start and end)
- ✅ Information valuable in the moment (actionable right away)
- ✅ Can be summarized visually and simply (card + key details + CTA)
- ✅ Extends ChatGPT in additive or differentiated way

### Poor Use Cases

Avoid apps that:

- ❌ Display long-form or static content (better suited for website)
- ❌ Require complex multi-step workflows (exceed display modes)
- ❌ Use space for ads, upsells, or irrelevant messaging
- ❌ Surface sensitive/private information directly in cards
- ❌ Duplicate ChatGPT's system functions (e.g., input composer)

### Display Modes

#### Inline
Appears directly in conversation flow. Always shows **before** model response.

**Layout Components**:
- Icon & tool call label
- Lightweight inline display
- Model-generated follow-up

**Types**:

1. **Inline Card**
   - Single-purpose widgets
   - Quick confirmations, simple actions
   - Visual aids (map, order summary, status)
   - **Max 2 primary actions**
   - No deep navigation or nested scrolling

2. **Inline Carousel**
   - Set of cards presented side-by-side
   - 3-8 items per carousel
   - Good for: restaurants, playlists, events
   - Each card may have single optional CTA

#### Fullscreen
Immersive experience for complex workflows.

**When to Use**:
- Rich tasks beyond single card (maps, editing canvas)
- Browsing detailed content (listings, menus)

**Layout**:
- System close button
- Fullscreen content area
- ChatGPT composer overlay (for continued conversation)

**Interaction**:
- Chat sheet maintains conversational context
- Composer "shimmers" during response streaming
- Truncated snippet shows above composer when complete

#### Picture-in-Picture (PiP)
Persistent floating window for ongoing sessions.

**When to Use**:
- Activities running parallel with conversation (games, live collaboration)
- PiP widget reacts to chat input (game rounds, live data refresh)

**Behavior**:
- Stays fixed to top of viewport on scroll
- Remains pinned until user dismisses
- Returns to inline position when session ends

### Visual Design Guidelines

#### Color
- **Use system colors** for text, icons, dividers
- **Brand accents** for logos, primary buttons (inside display modes)
- **Avoid** custom gradients or patterns
- **Don't override** backgrounds or text colors

#### Typography
- **Inherit system font** (SF Pro on iOS, Roboto on Android)
- **Respect system sizing** for headings, body, captions
- **Use styling** (bold, italic, highlights) only within content areas
- **Limit font size variation** - prefer body and body-small

#### Spacing & Layout
- Use **system grid spacing**
- Keep padding consistent
- Respect **system corner rounds**
- Maintain clear **visual hierarchy**

#### Icons & Imagery
- Use **system icons** or custom monochromatic outlined icons
- **Don't include logo** in response (ChatGPT appends automatically)
- Follow **enforced aspect ratios** to avoid distortion
- Provide **alt text** for all images

#### Accessibility
- **Minimum contrast ratio** (WCAG AA)
- **Alt text** for all images
- **Support text resizing** without breaking layouts

### Tone & Proactivity

#### Tone Ownership
- **ChatGPT** sets overall voice
- **Partners** provide content within framework
- Result should feel **seamless**

#### Content Guidelines
- Keep content **concise and scannable**
- Always **context-driven** (respond to what user asked)
- Avoid **spam, jargon, promotional language**
- Focus on **helpfulness and clarity** over brand personality

#### Proactivity Rules

**Allowed** ✅:
- Contextual nudges tied to user intent
- "Your order is ready for pickup"
- "Your ride is arriving"

**Not Allowed** ❌:
- Unsolicited promotions or upsells
- "Check out our latest deals"
- "Haven't used us in a while?"

#### Transparency
- Always show **why and when** tool is resurfacing
- Provide enough context for understanding
- Proactivity should feel like **natural continuation**, not interruption

---

## Summary

Understanding these core concepts is essential:

1. **MCP** provides the foundation - open standard for tool integration
2. **Discovery** happens through multiple channels - optimize for all
3. **Design** follows ChatGPT principles - conversational, simple, trustworthy

Next, dive into the practical guides for building your app:
- MCP Server Setup (`02-mcp-server-guide.md`)
- Component Building (`03-component-building-guide.md`)
- Authentication (`04-authentication-guide.md`)
