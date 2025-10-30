# 🚀 SOLAI Quick Reference Card

## Services Status
- **LLM Processor**: `http://localhost:8000` ✅
- **API Gateway**: `http://localhost:3001` ✅  
- **Frontend**: `http://localhost:3000` (run: `cd app && npm run dev`)

## Quick Test Commands

### 1. Health Checks
```bash
curl http://localhost:8000/health
curl http://localhost:3001/health
```

### 2. Market Data
```bash
# Market overview
curl http://localhost:3001/api/market/overview | jq

# DeFi opportunities
curl http://localhost:3001/api/defi/opportunities | jq
```

### 3. Wallet Analysis
```bash
curl -X POST http://localhost:3001/api/wallet/analyze \
  -H "Content-Type: application/json" \
  -d '{"wallet":"GrEYLiqNaGewum6kSRa3htHpV7fD2zFh9mpeo27FgVmH"}' | jq
```

### 4. Swap Quote
```bash
curl -X POST http://localhost:3001/api/swap/quote \
  -H "Content-Type: application/json" \
  -d '{
    "inputMint": "So11111111111111111111111111111111111111112",
    "outputMint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    "amount": 1000000,
    "slippageBps": 50
  }' | jq
```

### 5. RAG Knowledge Search
```bash
curl -X POST http://localhost:3001/api/rag/search \
  -H "Content-Type: application/json" \
  -d '{"query":"How to use Jupiter DEX","top_k":3}' | jq
```

### 6. Platform Stats
```bash
curl http://localhost:3001/api/stats/platform | jq
```

### 7. User Account
```bash
curl http://localhost:3001/api/user/account/GrEYLiqNaGewum6kSRa3htHpV7fD2zFh9mpeo27FgVmH | jq
```

## Run Complete Test Suite
```bash
./scripts/showcase_all_endpoints.sh
```

## Key Files
- **Test Script**: `scripts/showcase_all_endpoints.sh`
- **Results**: `SHOWCASE_RESULTS.md`
- **Config**: `config.yml`
- **API Docs**: `DOCS.md`

## Working Features ✅
- ✓ Health monitoring
- ✓ Market data & analytics
- ✓ Wallet portfolio analysis
- ✓ DeFi opportunities
- ✓ Token swap quotes
- ✓ RAG knowledge search
- ✓ Platform statistics
- ✓ Mock data for all endpoints

## Next Steps 🎯
1. Deploy smart contract (~0.4 SOL needed)
2. Initialize user account PDA
3. Add real API integrations (Helius, Jupiter, CoinGecko)
4. Deploy to production
