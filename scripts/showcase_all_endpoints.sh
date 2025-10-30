#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# API endpoints
LLM_API="http://localhost:8000"
GATEWAY_API="http://localhost:3001"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║         SOLAI - Complete API Showcase & Testing Suite         ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}\n"

# Function to make API call and display result
test_endpoint() {
    local name=$1
    local method=$2
    local url=$3
    local data=$4
    
    echo -e "\n${YELLOW}┌─ Testing: ${name}${NC}"
    echo -e "${YELLOW}│  ${method} ${url}${NC}"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$url")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$url" \
            -H "Content-Type: application/json" \
            -d "$data")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "200" ]; then
        echo -e "${GREEN}│  ✓ Success (HTTP $http_code)${NC}"
        echo -e "${GREEN}│  Response:${NC}"
        echo "$body" | jq '.' 2>/dev/null || echo "$body" | head -c 500
    else
        echo -e "${RED}│  ✗ Failed (HTTP $http_code)${NC}"
        echo -e "${RED}│  Response:${NC}"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
    fi
    echo -e "${YELLOW}└─────────────────────────────────────────────────────────────${NC}"
}

echo -e "\n${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  SECTION 1: Health Checks${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"

test_endpoint "LLM Processor Health" "GET" "$LLM_API/health"
test_endpoint "API Gateway Health" "GET" "$GATEWAY_API/health"

echo -e "\n${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  SECTION 2: Account Management & Portfolio${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"

# Mock wallet address for testing
WALLET="GrEYLiqNaGewum6kSRa3htHpV7fD2zFh9mpeo27FgVmH"

test_endpoint "Get User Account Info" "GET" "$GATEWAY_API/api/user/account/$WALLET"

WALLET_ANALYSIS='{
  "wallet": "'"$WALLET"'",
  "analysisType": "full"
}'

test_endpoint "Analyze Wallet Portfolio" "POST" "$GATEWAY_API/api/wallet/analyze" "$WALLET_ANALYSIS"

echo -e "\n${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  SECTION 3: DeFi Market Data${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"

test_endpoint "Get Market Overview" "GET" "$GATEWAY_API/api/market/overview"

test_endpoint "Get DeFi Opportunities" "GET" "$GATEWAY_API/api/defi/opportunities"

SWAP_QUOTE='{
  "inputMint": "So11111111111111111111111111111111111111112",
  "outputMint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  "amount": 1000000,
  "slippageBps": 50
}'

test_endpoint "Get Swap Quote" "POST" "$GATEWAY_API/api/swap/quote" "$SWAP_QUOTE"

echo -e "\n${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  SECTION 4: AI Chat & Analysis${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"

CHAT_DATA='{
  "wallet": "'"$WALLET"'",
  "prompt": "What is my current portfolio allocation and what should I do?",
  "demo": true
}'

test_endpoint "Chat with AI (Demo Mode)" "POST" "$GATEWAY_API/chat" "$CHAT_DATA"

echo -e "\n${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  SECTION 5: RAG & Knowledge Base${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"

SEARCH_DATA='{
  "query": "How to swap tokens on Jupiter DEX",
  "top_k": 3
}'

test_endpoint "Search Knowledge Base" "POST" "$GATEWAY_API/api/rag/search" "$SEARCH_DATA"

test_endpoint "Get RAG Status" "GET" "$LLM_API/rag/status"

echo -e "\n${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  SECTION 6: Platform Stats & Monitoring${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"

test_endpoint "Get Platform Statistics" "GET" "$GATEWAY_API/api/stats/platform"

test_endpoint "Get System Configuration" "GET" "$LLM_API/config"

echo -e "\n${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  SECTION 7: LLM Direct Endpoints${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"

COMPLETION_DATA='{
  "prompt": "Explain what is DeFi in 2 sentences",
  "max_tokens": 100
}'

test_endpoint "LLM Completion" "POST" "$LLM_API/completion" "$COMPLETION_DATA"

test_endpoint "Get Available Models" "GET" "$LLM_API/models"

echo -e "\n${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                    Testing Complete!                           ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}\n"

echo -e "${BLUE}📊 Summary:${NC}"
echo -e "  • LLM Processor: $LLM_API"
echo -e "  • API Gateway: $GATEWAY_API"
echo -e "  • Frontend: http://localhost:3000"
echo -e "\n${YELLOW}💡 Tip: Open http://localhost:3000 to interact with the UI${NC}\n"
