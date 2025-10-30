#!/bin/bash

# API Integration Test Script
# Tests all dashboard endpoints to verify integration

API_BASE="http://localhost:3001"

echo "🧪 Testing SolAI API Integration..."
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test function
test_endpoint() {
    local endpoint=$1
    local name=$2
    
    echo -n "Testing $name... "
    
    response=$(curl -s -w "\n%{http_code}" "$API_BASE$endpoint")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "200" ]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $http_code)"
        # echo "   Response: $(echo $body | jq -c '.' 2>/dev/null || echo $body | head -c 100)..."
    else
        echo -e "${RED}✗ FAIL${NC} (HTTP $http_code)"
        echo "   Response: $body"
    fi
}

# Check if API is running
echo "Checking if API Gateway is running..."
if ! curl -s "$API_BASE/health" > /dev/null 2>&1; then
    echo -e "${RED}✗ API Gateway is not running!${NC}"
    echo ""
    echo "Please start the API Gateway first:"
    echo "  cd api-gateway && npm run dev"
    echo ""
    exit 1
fi

echo -e "${GREEN}✓ API Gateway is running${NC}"
echo ""

# Test Dashboard Endpoints
echo "📊 Dashboard Endpoints:"
echo "----------------------"
test_endpoint "/dashboard/metrics" "System Metrics"
test_endpoint "/dashboard/market" "Market Data"
test_endpoint "/dashboard/recent-logs" "Recent Logs"
test_endpoint "/dashboard/wallet/7xKXGp9QMKePRM3zrMKdVcJk3bR9Pz3" "Wallet Data"

echo ""
echo "🔌 Additional Endpoints:"
echo "-----------------------"
test_endpoint "/api/market/overview" "Market Overview"
test_endpoint "/api/defi/opportunities" "DeFi Opportunities"
test_endpoint "/api/stats/platform" "Platform Stats"

echo ""
echo "=================================="
echo "✅ Integration Test Complete!"
echo ""
echo "Next steps:"
echo "1. Start frontend: cd app && npm run dev"
echo "2. Visit: http://localhost:3000"
echo "3. Verify all dashboard components load with data"
echo ""
