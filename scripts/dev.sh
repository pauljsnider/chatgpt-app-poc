#!/bin/bash

# Development script for ChatGPT App
# Starts the MCP server and provides instructions for ngrok

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║        ChatGPT App Development Environment            ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}\n"

# Check if component is built
if [ ! -f "web/dist/component.js" ]; then
    echo -e "${YELLOW}⚠ Component not built yet. Building...${NC}"
    cd web
    npm install
    npm run build
    cd ..
    echo -e "${GREEN}✓ Component built successfully${NC}\n"
else
    echo -e "${GREEN}✓ Component bundle found${NC}"
fi

# Check server dependencies
if [ ! -d "server/node_modules" ]; then
    echo -e "${YELLOW}⚠ Server dependencies not installed. Installing...${NC}"
    cd server
    npm install
    cd ..
    echo -e "${GREEN}✓ Server dependencies installed${NC}\n"
else
    echo -e "${GREEN}✓ Server dependencies installed${NC}"
fi

# Get port
PORT=${PORT:-2091}

echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Starting MCP server on port $PORT...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

echo -e "${YELLOW}📝 Next steps (in a new terminal):${NC}"
echo -e "   1. Run: ${GREEN}./scripts/setup-ngrok.sh${NC}"
echo -e "   2. Copy the HTTPS URL (e.g., https://abc123.ngrok.io)"
echo -e "   3. In ChatGPT Settings > Apps > Developer, add: ${GREEN}https://abc123.ngrok.io/mcp${NC}"
echo -e "   4. Test your app in ChatGPT!\n"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

# Start server
cd server
npm start
