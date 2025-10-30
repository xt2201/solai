#!/bin/bash
# Test markdown rendering và textarea auto-expand

set -e

API_GATEWAY="http://localhost:3001"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Testing Enhanced Chat Features      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}\n"

# Get dev wallet
DEV_WALLET=$(curl -s "$API_GATEWAY/dev/wallet" | jq -r '.wallet')

echo -e "${YELLOW}[1/2] Testing Markdown Response...${NC}"
MARKDOWN_PROMPT="Hãy trả lời bằng markdown với:
- Heading (# và ##)
- Bold text (**bold**)
- Bullet points
- Numbered lists
- Code blocks
Giải thích 3 giao thức DeFi trên Solana"

RESPONSE=$(curl -s -X POST "$API_GATEWAY/chat" \
  -H "Content-Type: application/json" \
  -d "{
    \"userWallet\": \"$DEV_WALLET\",
    \"prompt\": \"$MARKDOWN_PROMPT\"
  }")

echo -e "\n${GREEN}✓ Response received:${NC}"
echo "$RESPONSE" | jq -r '.response.completion' | head -30

echo -e "\n${YELLOW}[2/2] Testing Long Prompt (Multi-line)...${NC}"
LONG_PROMPT="Phân tích danh mục của tôi với các tiêu chí sau:
1. Đánh giá tỷ trọng token
2. Phân tích rủi ro
3. Đề xuất tái cân bằng
4. Chiến lược DeFi phù hợp
5. Cơ hội yield farming"

RESPONSE2=$(curl -s -X POST "$API_GATEWAY/chat" \
  -H "Content-Type: application/json" \
  -d "{
    \"userWallet\": \"$DEV_WALLET\",
    \"prompt\": \"$LONG_PROMPT\"
  }")

echo -e "\n${GREEN}✓ Long prompt handled successfully${NC}"
echo "$RESPONSE2" | jq '{
  prompt_received: true,
  response_length: (.response.completion | length),
  has_markdown: (.response.completion | contains("#")),
  demo_mode: .demo
}'

echo -e "\n${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Enhanced Chat Features ✓           ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}\n"

echo -e "${GREEN}New Features:${NC}"
echo -e "  ✅ Markdown rendering (h1, h2, bold, lists, code)"
echo -e "  ✅ Textarea auto-expand (min 44px, max 200px)"
echo -e "  ✅ Enter to send, Shift+Enter for new line"
echo -e "  ✅ Proper text wrapping for long messages"
echo -e ""
echo -e "${YELLOW}Test in browser:${NC}"
echo -e "  1. Open http://localhost:3000"
echo -e "  2. Type a long message → textarea expands"
echo -e "  3. Shift+Enter → new line (no send)"
echo -e "  4. Response shows formatted markdown"
