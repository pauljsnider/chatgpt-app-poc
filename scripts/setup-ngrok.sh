#!/bin/bash

# Setup ngrok for ChatGPT App development
# This script configures ngrok with your auth token and starts a tunnel

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Setting up ngrok for ChatGPT App...${NC}\n"

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}Error: .env file not found${NC}"
    echo "Please copy .env.example to .env and add your ngrok auth token"
    exit 1
fi

# Load environment variables
source .env

# Check if ngrok auth token is set
if [ -z "$NGROK_AUTH_TOKEN" ] || [ "$NGROK_AUTH_TOKEN" = "your_ngrok_auth_token_here" ]; then
    echo -e "${RED}Error: NGROK_AUTH_TOKEN not set in .env file${NC}"
    echo "Please add your ngrok auth token to the .env file"
    exit 1
fi

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo -e "${YELLOW}ngrok not found. Installing via Homebrew...${NC}"
    brew install ngrok/ngrok/ngrok
fi

# Configure ngrok with auth token
echo -e "${GREEN}Configuring ngrok with auth token...${NC}"
ngrok config add-authtoken $NGROK_AUTH_TOKEN

# Get port from .env or use default
PORT=${PORT:-2091}

echo -e "${GREEN}✓ ngrok configured successfully!${NC}\n"
echo -e "${GREEN}Starting ngrok tunnel on port $PORT...${NC}"
echo -e "${YELLOW}Note: Keep this terminal open while developing${NC}\n"

# Start ngrok
ngrok http $PORT
