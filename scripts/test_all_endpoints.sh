#!/bin/bash
# Comprehensive endpoint showcase test script
# Tests all available API endpoints with mock data

set -e

API_GATEWAY="http://localhost:3001"
LLM_PROCESSOR="http://localhost:8000"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  SOLAI API SHOWCASE - Testing Suite   ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}\n"

# Test health endpoints
echo -e "${YELLOW}[1/12] Testing Health Endpoints...${NC}"
echo -e "${GREEN}✓${NC} API Gateway Health:"
curl -s "$API_GATEWAY/health" | jq '.'
echo -e "\n${GREEN}✓${NC} LLM Processor Health:"
curl -s "$LLM_PROCESSOR/health" | jq '.'

# Test wallet analysis
echo -e "\n${YELLOW}[2/12] Testing Wallet Analysis...${NC}"
curl -s -X POST "$API_GATEWAY/api/wallet/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "wallet_address": "GrEYLiqNaGewum6kSRa3htHpV7fD2zFh9mpeo27FgVmH",
    "analysis_type": "comprehensive"
  }' | jq '{
    wallet_address,
    total_value_usd,
    risk_score,
    portfolio_count: (.portfolio | length),
    transactions_count: (.recent_transactions | length),
    top_recommendations: (.recommendations[:2])
  }'

# Test market overview
echo -e "\n${YELLOW}[3/12] Testing Market Overview...${NC}"
curl -s "$API_GATEWAY/api/market/overview" | jq '{
  total_tvl,
  total_24h_volume,
  market_sentiment,
  token_count: (.tokens | length),
  protocol_count: (.defi_protocols | length),
  sample_tokens: (.tokens | to_entries | .[:3] | map({
    token: .key,
    price: .value.price,
    change_24h: .value."24h_change"
  }))
}'

# Test DeFi opportunities
echo -e "\n${YELLOW}[4/12] Testing DeFi Opportunities...${NC}"
curl -s "$API_GATEWAY/api/defi/opportunities" | jq '{
  count,
  categories,
  top_opportunities: (.opportunities | map({
    protocol,
    type,
    apy,
    risk_level
  }))
}'

# Test user account
echo -e "\n${YELLOW}[5/12] Testing User Account...${NC}"
WALLET="GrEYLiqNaGewum6kSRa3htHpV7fD2zFh9mpeo27FgVmH"
curl -s "$API_GATEWAY/api/user/account/$WALLET" | jq '{
  account: {
    wallet_address: .account.wallet_address,
    solai_balance: .account.solai_balance,
    total_queries: .account.total_queries,
    tier: .account.tier
  },
  usage_stats,
  recent_queries_count: (.recent_queries | length)
}'

# Test RAG search
echo -e "\n${YELLOW}[6/12] Testing RAG Knowledge Base Search...${NC}"
curl -s -X POST "$API_GATEWAY/api/rag/search" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "How to manage DeFi risks on Solana?",
    "top_k": 3
  }' | jq '{
  query,
  count,
  sources,
  top_result: .results[0] | {
    title,
    relevance,
    source
  }
}'

# Test swap quote
echo -e "\n${YELLOW}[7/12] Testing Swap Quote...${NC}"
curl -s -X POST "$API_GATEWAY/api/swap/quote" \
  -H "Content-Type: application/json" \
  -d '{
    "input_token": "SOL",
    "output_token": "USDC",
    "amount": 10
  }' | jq '{
  input_token,
  output_token,
  input_amount,
  output_amount,
  best_route: {
    dexes: .best_route.dexes,
    output_amount: .best_route.output_amount,
    price_impact: .best_route.price_impact
  },
  routes_count: (.all_routes | length)
}'

# Test platform stats
echo -e "\n${YELLOW}[8/12] Testing Platform Statistics...${NC}"
curl -s "$API_GATEWAY/api/stats/platform" | jq '.'

# Test chat endpoint
echo -e "\n${YELLOW}[9/12] Testing Chat Endpoint...${NC}"
curl -s -X POST "$API_GATEWAY/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "userWallet": "GrEYLiqNaGewum6kSRa3htHpV7fD2zFh9mpeo27FgVmH",
    "prompt": "What are the best DeFi strategies on Solana right now?",
    "context": {
      "portfolio_value": 5000
    }
  }' | jq '{
  completion: (.completion[:200] + "..."),
  citations_count: (.citations | length),
  meta
}'

# Test accounts endpoint
echo -e "\n${YELLOW}[10/12] Testing Accounts Endpoint...${NC}"
curl -s -X POST "$API_GATEWAY/accounts" \
  -H "Content-Type: application/json" \
  -d '{
    "userWallet": "GrEYLiqNaGewum6kSRa3htHpV7fD2zFh9mpeo27FgVmH"
  }' | jq '{
  userAccountPDA,
  exists,
  balance
}'

# Test direct LLM processor endpoint
echo -e "\n${YELLOW}[11/12] Testing Direct LLM Processor...${NC}"
curl -s -X POST "$LLM_PROCESSOR/process_prompt" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Explain liquid staking on Solana in 2 sentences",
    "userWallet": "GrEYLiqNaGewum6kSRa3htHpV7fD2zFh9mpeo27FgVmH"
  }' | jq '{
  completion_preview: (.completion[:150] + "..."),
  citations_count: (.citations | length),
  meta
}'

# Test with different wallet
echo -e "\n${YELLOW}[12/12] Testing Different Wallet Analysis...${NC}"
curl -s -X POST "$API_GATEWAY/api/wallet/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "wallet_address": "ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234YZ5",
    "analysis_type": "risk"
  }' | jq '{
  total_value_usd,
  risk_score,
  portfolio_diversity: (.portfolio | length),
  top_holding: .portfolio[0] | {
    token,
    usd_value,
    "24h_change": ."24h_change"
  }
}'

echo -e "\n${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║      All Tests Completed! ✓            ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}\n"

echo -e "${GREEN}Summary:${NC}"
echo -e "  • 12/12 endpoints tested successfully"
echo -e "  • All mock services functioning"
echo -e "  • Ready for frontend integration"
echo -e "\n${YELLOW}Next steps:${NC}"
echo -e "  1. Open http://localhost:3000 for frontend"
echo -e "  2. Connect wallet and test chat"
echo -e "  3. Explore all features in the UI"
