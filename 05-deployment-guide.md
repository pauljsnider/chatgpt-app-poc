# Deployment Guide

Complete guide to deploying your ChatGPT App to production.

## Table of Contents
1. [Deployment Options](#deployment-options)
2. [Local Development](#local-development)
3. [Environment Configuration](#environment-configuration)
4. [Dogfood and Rollout](#dogfood-and-rollout)
5. [Connecting to ChatGPT](#connecting-to-chatgpt)
6. [Testing Your Integration](#testing-your-integration)

---

## Deployment Options

### Requirements
- **Stable HTTPS endpoint**
- **Responsive `/mcp` path**
- **Streaming response support**
- **Appropriate HTTP status codes**

### Recommended Platforms

#### Managed Containers (Best for Most Apps)
Quick spin-up with automatic TLS:
- **Fly.io**: Global edge deployment
- **Render**: Simple auto-deploy from Git
- **Railway**: Developer-friendly platform

#### Cloud Serverless
Scale-to-zero options:
- **Google Cloud Run**
- **Azure Container Apps**
- **AWS App Runner**

**Warning**: Long cold starts can interrupt streaming HTTP

#### Kubernetes
For teams with existing clusters:
- Front pods with ingress controller
- Must support server-sent events
- Ensure proper load balancing

---

## Local Development

### Using ngrok for HTTPS Tunnel

ChatGPT requires HTTPS. During development, expose local server:

```bash
ngrok http <port>
# Example output:
# Forwarding: https://<subdomain>.ngrok.app -> http://127.0.0.1:<port>
```

Keep tunnel running while iterating. When you change code:

1. **Rebuild component bundle**
   ```bash
   cd web
   npm run build
   ```

2. **Restart MCP server**
   ```bash
   # Node
   cd pizzaz_server_node
   pnpm start

   # Python
   uvicorn server.main:app --port 8000
   ```

3. **Refresh connector in ChatGPT settings**
   - Pulls latest metadata
   - Updates tool definitions
   - Reloads component templates

---

## Environment Configuration

### Secrets Management

**Never commit secrets to repo**. Use platform-specific secret managers:

```bash
# Fly.io
fly secrets set OAUTH_CLIENT_SECRET=xxx

# Render
# Use environment variables in dashboard

# Railway
# Use environment variables in UI
```

**Inject as environment variables**:

```python
import os

OAUTH_CLIENT_SECRET = os.environ.get("OAUTH_CLIENT_SECRET")
```

### Logging

Log critical information for debugging:

```python
import logging

logger = logging.getLogger(__name__)

@tool
async def my_tool(args):
    logger.info(f"Tool called with args: {args}")
    # ... tool logic
    logger.info(f"Tool response latency: {latency}ms")
```

**What to Log**:
- Tool-call IDs
- Request latency
- Error payloads
- Authentication events
- User-specific debugging info (if consented)

### Observability

Monitor key metrics:
- **CPU usage**
- **Memory consumption**
- **Request counts**
- **Error rates**
- **Response times**

**Tools**:
- Datadog
- New Relic
- Grafana
- Built-in platform monitoring

---

## Dogfood and Rollout

### Pre-Launch Checklist

Before launching broadly:

#### 1. Gate Access
- Keep connector behind developer mode
- Or use feature flag (Statsig, LaunchDarkly)
- Test with limited user group

#### 2. Run Golden Prompts
- Exercise discovery prompts from planning phase
- Note precision/recall changes
- Test edge cases and error handling
- Verify component renders correctly

#### 3. Capture Artifacts
- Record screenshots or screen captures
- Test in MCP Inspector
- Test in ChatGPT
- Document expected behavior

#### 4. Verify Authentication
- Test OAuth flow end-to-end
- Verify token expiration handling
- Test refresh token flow
- Confirm proper error messages

#### 5. Check Storage & State
- Verify widget state persistence
- Test state across sessions
- Confirm data isolation per user

### Production Readiness

When ready for production:

1. **Update directory metadata**
   - App name, description, icon
   - Screenshots
   - Category tags

2. **Confirm configurations**
   - Authentication properly configured
   - Storage/database ready for scale
   - Secrets properly injected

3. **Publish change notes**
   - Document in release notes
   - Communicate to early users

---

## Connecting to ChatGPT

### Enable Developer Mode

1. Open ChatGPT settings
2. Navigate to "Features" or "Beta features"
3. Enable "Developer mode"

### Add Your Connector

1. Click "Add connector" or similar option
2. Enter your MCP server URL:
   ```
   https://your-domain.com/mcp
   ```
   or for ngrok:
   ```
   https://<subdomain>.ngrok.app/mcp
   ```

3. ChatGPT will:
   - Query your server for capabilities
   - Discover tools and resources
   - Register OAuth client (if auth enabled)

4. Test discovery:
   - Try named mention: "[Your App Name], ..."
   - Try contextual discovery
   - Verify tool is called correctly

### Refresh Connector

When you update your MCP server:
1. Go to connector settings
2. Click "Refresh" or "Reload"
3. ChatGPT re-queries server for latest metadata

---

## Testing Your Integration

### MCP Inspector Testing

Before connecting to ChatGPT, test with MCP Inspector:

1. Point Inspector to your endpoint:
   ```
   http://localhost:<port>/mcp
   ```

2. **List Tools**
   - Verify all tools appear
   - Check descriptions are clear
   - Confirm schemas are correct

3. **Call Tools**
   - Test with various inputs
   - Verify responses include:
     - `structuredContent`
     - `content` (if applicable)
     - `_meta` (if applicable)
   - Check component metadata present

4. **Render Components**
   - Inspector should render component inline
   - Verify component receives correct data
   - Test component interactions

### ChatGPT Testing

#### Discovery Testing
- **Named Mention**: "[App Name], do something"
- **Contextual**: Ask related question, see if app suggests
- **Launcher**: Check app appears in + button menu

#### Functionality Testing
- **Tool Calls**: Verify correct tools are called
- **Component Rendering**: Check UI displays correctly
- **Interactions**: Test buttons, forms, navigation
- **Follow-ups**: Verify conversation continues naturally

#### Error Handling
- **Invalid Inputs**: Test with bad data
- **Auth Failures**: Test expired tokens
- **Network Issues**: Test timeout handling
- **Edge Cases**: Test boundary conditions

### Performance Testing

Monitor:
- **Cold start time** (should be < 2s)
- **Tool call latency** (target < 500ms)
- **Component load time** (should be fast)
- **Memory usage** (watch for leaks)

### Security Testing

Verify:
- **Auth tokens** properly validated
- **HTTPS** enforced in production
- **CSP** properly configured
- **User data** properly isolated
- **No XSS vulnerabilities** in component

---

## Troubleshooting

Common issues and solutions:

### Server Not Responding
- Check server is running
- Verify HTTPS endpoint is accessible
- Test with curl or Postman
- Check firewall rules

### Tools Not Appearing
- Verify tools properly registered
- Check MCP Inspector shows tools
- Refresh connector in ChatGPT
- Check server logs for errors

### Component Not Rendering
- Verify component template registered
- Check `outputTemplate` matches resource URI
- Test component bundle loads
- Check browser console for errors

### Auth Not Working
- Verify OAuth configuration
- Test discovery endpoints accessible
- Check token verification logic
- Review auth server logs

---

## Next Steps

With app deployed and connected:
1. Monitor usage and performance
2. Iterate based on user feedback
3. Prepare for submission when process opens (later 2025)
4. Review developer guidelines (`07-developer-guidelines.md`)
