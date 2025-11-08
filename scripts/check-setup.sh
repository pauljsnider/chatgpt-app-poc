#!/bin/bash

# Check if the development environment is set up correctly

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║           ChatGPT App Setup Verification              ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}\n"

# Check Node.js
echo -e "${YELLOW}Checking Node.js...${NC}"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✓ Node.js installed: $NODE_VERSION${NC}"

    # Check if version is 18+
    MAJOR_VERSION=$(echo $NODE_VERSION | cut -d. -f1 | sed 's/v//')
    if [ "$MAJOR_VERSION" -lt 18 ]; then
        echo -e "${RED}✗ Node.js version 18+ required (you have $NODE_VERSION)${NC}"
    fi
else
    echo -e "${RED}✗ Node.js not found. Install from https://nodejs.org${NC}"
fi

# Check npm
echo -e "\n${YELLOW}Checking npm...${NC}"
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo -e "${GREEN}✓ npm installed: $NPM_VERSION${NC}"
else
    echo -e "${RED}✗ npm not found${NC}"
fi

# Check .env file
echo -e "\n${YELLOW}Checking .env file...${NC}"
if [ -f .env ]; then
    echo -e "${GREEN}✓ .env file exists${NC}"

    # Check if ngrok token is set
    if grep -q "NGROK_AUTH_TOKEN=your_ngrok_auth_token_here" .env; then
        echo -e "${RED}✗ ngrok auth token not configured in .env${NC}"
        echo -e "  Update NGROK_AUTH_TOKEN in .env file"
    elif grep -q "NGROK_AUTH_TOKEN=" .env && ! grep -q "NGROK_AUTH_TOKEN=$" .env; then
        echo -e "${GREEN}✓ ngrok auth token configured${NC}"
    else
        echo -e "${RED}✗ ngrok auth token missing in .env${NC}"
    fi
else
    echo -e "${RED}✗ .env file not found${NC}"
    echo -e "  Copy .env.example to .env and add your credentials"
fi

# Check server dependencies
echo -e "\n${YELLOW}Checking server dependencies...${NC}"
if [ -d "server/node_modules" ]; then
    echo -e "${GREEN}✓ Server dependencies installed${NC}"
else
    echo -e "${RED}✗ Server dependencies not installed${NC}"
    echo -e "  Run: ${GREEN}cd server && npm install${NC}"
fi

# Check web dependencies
echo -e "\n${YELLOW}Checking web dependencies...${NC}"
if [ -d "web/node_modules" ]; then
    echo -e "${GREEN}✓ Web dependencies installed${NC}"
else
    echo -e "${RED}✗ Web dependencies not installed${NC}"
    echo -e "  Run: ${GREEN}cd web && npm install${NC}"
fi

# Check if component is built
echo -e "\n${YELLOW}Checking component build...${NC}"
if [ -f "web/dist/component.js" ]; then
    FILE_SIZE=$(du -h web/dist/component.js | cut -f1)
    echo -e "${GREEN}✓ Component bundle exists ($FILE_SIZE)${NC}"
else
    echo -e "${RED}✗ Component not built${NC}"
    echo -e "  Run: ${GREEN}npm run build${NC}"
fi

# Check ngrok
echo -e "\n${YELLOW}Checking ngrok...${NC}"
if command -v ngrok &> /dev/null; then
    NGROK_VERSION=$(ngrok version | head -n1)
    echo -e "${GREEN}✓ ngrok installed: $NGROK_VERSION${NC}"
else
    echo -e "${YELLOW}⚠ ngrok not found (will be installed on first run)${NC}"
fi

# Summary
echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}                        Summary                         ${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

ALL_GOOD=true

if ! command -v node &> /dev/null; then
    ALL_GOOD=false
fi

if ! [ -f .env ]; then
    ALL_GOOD=false
fi

if ! [ -d "server/node_modules" ] || ! [ -d "web/node_modules" ]; then
    ALL_GOOD=false
fi

if ! [ -f "web/dist/component.js" ]; then
    ALL_GOOD=false
fi

if [ "$ALL_GOOD" = true ]; then
    echo -e "${GREEN}✓ All checks passed! You're ready to start development.${NC}\n"
    echo -e "${YELLOW}To start:${NC}"
    echo -e "  Terminal 1: ${GREEN}npm run dev${NC}"
    echo -e "  Terminal 2: ${GREEN}npm run setup-ngrok${NC}\n"
else
    echo -e "${YELLOW}⚠ Some setup steps are incomplete.${NC}"
    echo -e "${YELLOW}Please fix the issues above and run this script again.${NC}\n"
    echo -e "${YELLOW}Quick fix:${NC}"
    echo -e "  ${GREEN}npm run install-all${NC}"
    echo -e "  ${GREEN}npm run build${NC}\n"
fi
