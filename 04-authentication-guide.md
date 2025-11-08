# Authentication Guide

Complete guide to implementing authentication for ChatGPT Apps using OAuth 2.1.

## Table of Contents
1. [When to Use Authentication](#when-to-use-authentication)
2. [Custom Auth with OAuth 2.1](#custom-auth-with-oauth-21)
3. [Per-Tool Authentication](#per-tool-authentication)
4. [Client Identification](#client-identification)

---

## When to Use Authentication

### Anonymous Mode
Many apps can operate in read-only, anonymous mode:
- Public data access
- No user-specific information
- No write actions

### Authenticated Mode Required
Use authentication when app needs to:
- Expose customer-specific data
- Perform write actions
- Access user's account on external systems
- Share data between users

---

## Custom Auth with OAuth 2.1

### Components

#### Resource Server
- Your MCP server
- Exposes tools
- Verifies access tokens on each request

#### Authorization Server
- Your identity provider (Auth0, Okta, Cognito, or custom)
- Issues tokens
- Publishes discovery metadata

#### Client
- ChatGPT acting on behalf of user
- Supports dynamic client registration
- Implements PKCE

### Required Endpoints

Authorization server must expose discovery metadata per [MCP authorization spec](https://modelcontextprotocol.io/specification/2025-06-18/basic/authorization):

- **Authorization server metadata discovery**: Required discovery document (authorization, token, registration, JWKs endpoints)
- **Authorization server location**: Where document is hosted and how client resolves it

### Flow in Practice

1. **Protected Resource Metadata**
   ```python
   # Python (FastMCP)
   mcp = FastMCP(
       name="kanban-mcp",
       stateless_http=True,
       token_verifier=MyVerifier(),
       auth=AuthSettings(
           issuer_url="https://your-tenant.us.auth0.com",
           resource_server_url="https://example.com/mcp",
           required_scopes=["user"]
       )
   )
   ```

2. **Dynamic Client Registration**
   - ChatGPT queries MCP server for protected resource metadata
   - Registers with authorization server using `registration_endpoint`
   - Obtains `client_id`

3. **OAuth Authorization Code + PKCE Flow**
   - User first invokes tool
   - ChatGPT launches OAuth flow
   - User authenticates and consents to scopes

4. **Token Exchange**
   - ChatGPT exchanges authorization code for access token
   - Attaches to subsequent MCP requests: `Authorization: Bearer <token>`

5. **Token Verification**
   - Server verifies token on each request
   - Checks: issuer, audience, expiration, scopes

### Implementing Verification

**Python (FastMCP) Example**:

```python
from mcp.server.fastmcp import FastMCP
from mcp.server.auth.settings import AuthSettings
from mcp.server.auth.provider import TokenVerifier, AccessToken

class MyVerifier(TokenVerifier):
    async def verify_token(self, token: str) -> AccessToken | None:
        payload = validate_jwt(token, jwks_url)

        if "user" not in payload.get("permissions", []):
            return None

        return AccessToken(
            token=token,
            client_id=payload["azp"],
            subject=payload["sub"],
            scopes=payload.get("permissions", []),
            claims=payload
        )

mcp = FastMCP(
    name="kanban-mcp",
    stateless_http=True,
    token_verifier=MyVerifier(),
    auth=AuthSettings(
        issuer_url="https://your-tenant.us.auth0.com",
        resource_server_url="https://example.com/mcp",
        required_scopes=["user"]
    )
)
```

**Failed Verification Response**:
- Return `401 Unauthorized`
- Include `WWW-Authenticate` header pointing to protected-resource metadata
- Client runs OAuth flow again

### Choosing an Authorization Provider

#### Auth0 (Popular Option)

**Configuration Steps**:
1. Create API in Auth0 dashboard
2. Record identifier (token audience)
3. Enable RBAC and add permissions (`user`, etc.)
4. Turn on OIDC dynamic application registration
5. Enable at least one login connection for dynamic clients

#### Other Providers
- **Okta**: Supports same pattern
- **Azure AD**: Compatible with proper metadata exposure
- **Custom OAuth 2.1 servers**: Must expose required metadata

### Client Identification Roadmap

#### Current: Dynamic Client Registration (DCR)
- ChatGPT registers new OAuth client when connecting
- Exchanges `client_id` during token issuance
- Authorization server uses record to identify caller
- **Issue**: Creates thousands of short-lived clients, strains dashboards

#### Future: Client Metadata Documents (CMID)
- ChatGPT will publish document at `https://openai.com/chatgpt.json`
- Describes OAuth configuration
- Authorization server fetches over HTTPS
- Treats as stable client identifier
- Verifies caller is OpenAI
- **Status**: Draft, continue supporting DCR until spec freezes

---

## Per-Tool Authentication

Different tools often have different access requirements.

### Scope and Semantics

**Supported Scheme Types**:
- `noauth` - Callable anonymously
- `oauth2` - Requires OAuth 2.0, optional scopes

**Behavior**:
- Missing field: Inherit server default policy
- Both `noauth` and `oauth2`: Anonymous works, auth unlocks more
- Servers must enforce regardless of client hints

### Public + Optional Auth Example

**TypeScript SDK**:

```typescript
server.registerTool(
  "search",
  {
    title: "Public Search",
    description: "Search public documents.",
    inputSchema: {
      type: "object",
      properties: { q: { type: "string" } },
      required: ["q"]
    },
    securitySchemes: [
      { type: "noauth" },
      { type: "oauth2", scopes: ["search.read"] }
    ]
  },
  async ({ input }) => {
    return {
      content: [{ type: "text", text: `Results for ${input.q}` }],
      structuredContent: {}
    };
  }
);
```

### Auth Required Example

**TypeScript SDK**:

```typescript
server.registerTool(
  "create_doc",
  {
    title: "Create Document",
    description: "Make a new doc in your account.",
    inputSchema: {
      type: "object",
      properties: { title: { type: "string" } },
      required: ["title"]
    },
    securitySchemes: [{ type: "oauth2", scopes: ["docs.write"] }]
  },
  async ({ input }) => {
    return {
      content: [{ type: "text", text: `Created doc: ${input.title}` }],
      structuredContent: {}
    };
  }
);
```

---

## Client Identification

### Important Notes

**What ChatGPT Does NOT Support**:
- Machine-to-machine OAuth flows
- Client credentials
- Service accounts
- JWT bearer assertions
- Custom API keys
- Mutual TLS handshakes
- Operation without interactive user session

**All Requests**:
- Originate from ChatGPT user session
- Should be treated accordingly

### Network-Level Controls

To ensure only ChatGPT can reach server-to-server endpoints:
- **Allowlist ChatGPT's egress IP addresses**
- Same ranges as ChatGPT actions
- Use network-level controls, not credential types

### Future: CMID

Once rolled out, CMID will:
- Provide signed, HTTPS-hosted declaration of ChatGPT identity
- Eliminate DCR churn
- Clarify "which service is this?"
- Provide consistent way to recognize ChatGPT traffic

---

## Testing and Rollout

### Local Testing
- Start with development tenant
- Issue short-lived tokens
- Iterate quickly

### Dogfood
- Gate access to trusted testers
- Can require linking for specific tools or entire connector

### Rotation
- Plan for token revocation, refresh, scope changes
- Treat missing/stale tokens as unauthenticated
- Return helpful error messages

---

## Next Steps

With authentication in place:
1. Test auth flow in MCP Inspector
2. Deploy to production (`05-deployment-guide.md`)
3. Confidently expose user-specific data and write actions
