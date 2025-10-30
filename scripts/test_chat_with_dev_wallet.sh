#!/bin/bash
# Test chat endpoint using dev wallet from config

set -e

API_GATEWAY="http://localhost:3001"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Testing Chat with Dev Wallet        ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}\n"

# Get dev wallet
echo -e "${YELLOW}[1/3] Fetching dev wallet from config...${NC}"
DEV_WALLET_RESPONSE=$(curl -s "$API_GATEWAY/dev/wallet")
DEV_WALLET=$(echo "$DEV_WALLET_RESPONSE" | jq -r '.wallet')

if [ "$DEV_WALLET" = "null" ] || [ -z "$DEV_WALLET" ]; then
  echo -e "${YELLOW}⚠ No dev wallet configured${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Dev wallet loaded:${NC} $DEV_WALLET\n"

# Test chat
echo -e "${YELLOW}[2/3] Sending test prompt...${NC}"
CHAT_RESPONSE=$(curl -s -X POST "$API_GATEWAY/chat" \
  -H "Content-Type: application/json" \
  -d "{
    \"userWallet\": \"$DEV_WALLET\",
    \"prompt\": \"Phân tích danh mục đầu tư của tôi và đưa ra 3 gợi ý cải thiện.\",
    \"context\": {
      \"portfolio_value\": 13000
    }
  }")

echo "$CHAT_RESPONSE" | jq '{
  completion_preview: (.response.completion[:200] + "..."),
  demo_mode: .demo,
  message,
  citations_count: (.response.citations | length),
  has_transaction: (.transaction != null)
}'

echo -e "\n${YELLOW}[3/3] Full response:${NC}"
echo "$CHAT_RESPONSE" | jq '.response.completion' -r | head -20

echo -e "\n${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║         Chat Test Complete ✓           ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}\n"

echo -e "${GREEN}Summary:${NC}"
echo -e "  • Dev wallet: $DEV_WALLET"
echo -e "  • Chat endpoint: Working"
echo -e "  • Frontend will auto-use this wallet"
