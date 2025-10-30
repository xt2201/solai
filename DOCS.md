# SolAI MVP - Comprehensive Project Documentation

This monorepo implements the SolAI MVP, an AI-powered DeFi advisor combining on-chain accountability with RAG-augmented language models.

## Project Status

✅ **Complete**: Anchor smart contract with user PDAs, fee tracking, and hash logging  
✅ **Complete**: Node.js API Gateway with transaction assembly and LLM proxy  
✅ **Complete**: Python LLM Processor with Cerebras/Gemini, RAG (Pinecone + Ollama), wallet context  
✅ **Complete**: TypeScript Client SDK for API/blockchain interactions  
✅ **Complete**: Next.js frontend with wallet integration, chat UI, and on-chain transaction signing  

## Architecture Summary

The stack follows the Hybrid Architecture pattern from `Project Structure.md`:

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Next.js UI     │────▶│  API Gateway     │────▶│ LLM Processor   │
│  (Wallet Sign)  │◀────│  (Node.js/TS)    │◀────│ (Python/FastAPI)│
└─────────────────┘     └──────────────────┘     └─────────────────┘
        │                        │                         │
        │                        │                         ├─ Cerebras LLM
        │                        │                         ├─ Gemini (fallback)
        │                        │                         ├─ Pinecone (RAG)
        │                        │                         ├─ Ollama (embeddings)
        │                        │                         ├─ Helius (indexer)
        │                        │                         └─ Firecrawl (ingestion)
        │                        │
        └────────────────────────┴─────────────────────────▶ Solana Blockchain
                                                              (Anchor Program)
```

## Repository Structure

```
solai/
├── programs/                  # Anchor smart contract (Rust)
│   ├── src/lib.rs            # User accounts, fee deduction, hash logging
│   └── tests/integration.rs  # Integration test placeholders
├── api-gateway/              # Express.js gateway (Node.js/TypeScript)
│   ├── src/
│   │   ├── api/
│   │   │   ├── accounts.ts   # POST /accounts/init (user PDA setup)
│   │   │   └── chat.ts       # POST /chat (prompt → LLM → transaction)
│   │   ├── services/
│   │   │   ├── llmProxy.ts   # Proxy to Python processor
│   │   │   └── solanaTx.ts   # Transaction builders
│   │   ├── utils/
│   │   │   ├── config.ts     # Load config.yml
│   │   │   └── logger.ts     # JSON logging
│   │   └── index.ts          # Express server entry
│   └── package.json
├── llm-processor/            # FastAPI service (Python)
│   ├── src/
│   │   ├── main.py           # POST /process_prompt endpoint
│   │   ├── settings.py       # Config loader
│   │   ├── llm/
│   │   │   ├── cerebras_handler.py
│   │   │   └── gemini_handler.py
│   │   ├── rag/
│   │   │   ├── rag_logic.py      # RAG orchestration + LangSmith
│   │   │   ├── vector_store.py   # Pinecone client
│   │   │   └── embeddings.py     # Ollama embedding client
│   │   ├── context/
│   │   │   └── context_builder.py # Helius wallet data
│   │   └── data_ingestion/
│   │       ├── firecrawl_worker.py
│   │       └── indexer_formatter.py
│   ├── requirements.txt
│   └── Dockerfile
├── client-sdk/               # TypeScript SDK
│   ├── src/
│   │   ├── api.ts            # SolAIApiClient (REST calls)
│   │   ├── blockchain.ts     # Transaction submission helpers
│   │   └── index.ts
│   └── package.json
├── app/                      # Next.js frontend
│   ├── src/
│   │   ├── components/
│   │   │   └── SolAIChat.tsx # Main chat component
│   │   ├── providers/
│   │   │   └── SolAIProviders.tsx # Wallet providers
│   │   ├── pages/
│   │   │   ├── _app.tsx
│   │   │   └── index.tsx
│   │   ├── lib/runtime.ts    # Runtime config from config.yml
│   │   └── styles/globals.css
│   ├── next.config.js        # Reads config.yml at build time
│   └── package.json
├── scripts/
│   ├── deploy_program.sh     # Anchor build + deploy
│   └── update_rag_index.sh   # Run Firecrawl worker
├── config.yml                # Central configuration
├── Anchor.toml               # Anchor workspace config
└── README.md
```

## Configuration

All services read from `config.yml`. Key sections:

- `global.langsmith`: Enable tracing for RAG debugging
- `solana.program.id`: Injected into Rust program at build time
- `solana.tokenomics`: Fee amounts (lamports per query)
- `api_gateway.llm_processor.base_url`: Python processor endpoint
- `llm_processor.provider`: Set to `CEREBRAS` (primary LLM)
- `llm_processor.rag`: Pinecone + Ollama embedding config
- `llm_processor.firecrawl`: Source URLs for RAG ingestion

Override config path: `export SOLAI_CONFIG_PATH=/path/to/config.yml`

## Quick Start

### 1. Build and Deploy Solana Program

```bash
# Requires Anchor CLI installed
cd programs
anchor build
anchor deploy

# Update config.yml with deployed program ID
```

### 2. Start API Gateway

```bash
cd api-gateway
npm install
npm run dev
# Listens on port from config.yml (default 3001)
```

### 3. Start LLM Processor

```bash
cd llm-processor
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn src.main:app --reload
# Listens on port from config.yml (default 8000)
```

### 4. Start Frontend

```bash
cd app
npm install
npm run dev
# Listens on http://localhost:3000
```

### 5. Use the Application

1. Navigate to http://localhost:3000
2. Click "Select Wallet" and connect Phantom (or compatible wallet)
3. Ensure wallet has devnet SOL for transaction fees
4. Type a DeFi question and click "Gửi"
5. Sign two transactions:
   - First time: Initialize your user account (one-time setup)
   - Every query: Log interaction hash on-chain
6. View response with on-chain signature and hash metadata

## Key Features

### On-Chain Accountability
- Every prompt/response pair is hashed (SHA-256)
- Hashes logged to Solana via `log_interaction` instruction
- Treasury PDA collects fees transparently
- User PDAs track query count and total fees paid

### RAG-Augmented Intelligence
- Ollama (`bge-m3`) generates embeddings for queries
- Pinecone vector search retrieves top-k relevant documents
- Context includes wallet transaction history (Helius)
- Firecrawl ingests fresh documentation from DeFi protocols

### Dual-LLM Fallback
- Primary: Cerebras (`qwen-3-32b`) for fast inference
- Fallback: Gemini (`gemini-2.0-flash-lite`) on errors
- LangSmith traces all RAG steps for debugging

### Transaction Flow
```
User submits prompt
    ↓
Frontend: initUser (if needed) → sign → submit
    ↓
Frontend: POST /chat {prompt, wallet}
    ↓
API Gateway: Fetch context, call Python processor
    ↓
LLM Processor: RAG retrieval → Cerebras/Gemini → response
    ↓
API Gateway: Hash prompt/response → build log_interaction tx
    ↓
Frontend: Sign transaction → submit → confirm
    ↓
Display response + signature + hashes
```

## API Endpoints

### API Gateway (port 3001)

**GET /health**
- Returns: `{"status": "ok"}`

**POST /accounts/init**
- Body: `{"wallet": "base58_pubkey"}`
- Returns: `{"initialized": true}` or `{"initialized": false, "transaction": {...}}`
- Transaction must be signed by wallet and submitted

**POST /chat**
- Body: `{"prompt": "string", "wallet": "base58_pubkey"}`
- Returns:
  ```json
  {
    "response": {
      "completion": "string",
      "citations": [{"id": "string", "excerpt": "string"}],
      "meta": {"model": "CEREBRAS", "rag_scores": {...}}
    },
    "promptHash": "hex_string",
    "responseHash": "hex_string",
    "transaction": {
      "serialized": "base64_string",
      "recentBlockhash": "string",
      "feeLamports": 10000,
      "userAccount": "base58_pda",
      "treasury": "base58_pda"
    }
  }
  ```

### LLM Processor (port 8000)

**GET /health**
- Returns: `{"status": "ok"}`

**POST /process_prompt**
- Body:
  ```json
  {
    "prompt": "string",
    "userWallet": "base58_pubkey",
    "context": {"optional": "metadata"}
  }
  ```
- Returns:
  ```json
  {
    "completion": "string",
    "citations": [{"id": "string", "excerpt": "string"}],
    "meta": {
      "model": "CEREBRAS",
      "rag_scores": {"doc-0": 0.95},
      "wallet_context": {"count": 10}
    }
  }
  ```

## Testing

### Manual Testing
1. Use devnet SOL for all operations
2. Check Solana Explorer for transaction signatures
3. Verify user PDA and treasury PDA balances

### Anchor Tests
```bash
cd programs
anchor test
```

### Integration Testing
- Use Postman/curl to test API Gateway endpoints
- Verify Python processor independently:
  ```bash
  curl -X POST http://localhost:8000/process_prompt \
    -H "Content-Type: application/json" \
    -d '{"prompt": "What is DeFi?", "userWallet": "..."}'
  ```

## Maintenance Scripts

### Deploy Program
```bash
./scripts/deploy_program.sh
```
Builds and deploys the Anchor program to the cluster specified in `Anchor.toml`.

### Update RAG Index
```bash
./scripts/update_rag_index.sh
```
Runs Firecrawl worker to ingest fresh docs and update Pinecone index.

## Troubleshooting

### "SOLAI_USER_ACCOUNT_NOT_INITIALIZED"
- User hasn't called `/accounts/init` yet
- Frontend should auto-detect and prompt for initialization

### "Cannot find module" errors
- Run `npm install` in affected directory
- For Python: activate venv and `pip install -r requirements.txt`

### Wallet connection issues
- Ensure Phantom is installed and unlocked
- Check browser console for detailed errors
- Verify network is set to Devnet in wallet settings

### Transaction failures
- Check wallet has sufficient SOL for fees (~0.001 SOL minimum)
- Verify program ID in config.yml matches deployed program
- Inspect error via Solana Explorer using transaction signature

### RAG returns empty context
- Verify Pinecone API key and index name in config.yml
- Check Ollama is running and accessible at configured URL
- Confirm Pinecone index has embeddings (use Pinecone console)

### LangSmith not tracing
- Verify `global.langsmith.enabled: true` in config.yml
- Check API key is valid
- Inspect LangSmith dashboard for project runs

## Production Considerations

1. **Security**
   - Never commit private keys or API keys
   - Use environment variables or secrets management
   - Enable CORS whitelist in production

2. **Scaling**
   - API Gateway: Deploy behind load balancer
   - LLM Processor: Horizontal scaling with queue system
   - Consider caching LLM responses for common queries

3. **Monitoring**
   - Integrate structured logging (e.g., DataDog, Sentry)
   - Set up alerts for transaction failures
   - Monitor Solana program rent and treasury balance

4. **Costs**
   - Cerebras API usage per token
   - Pinecone index storage and queries
   - Solana transaction fees (minimal on mainnet)

## Contributing

1. Follow existing code structure from `Project Structure.md`
2. Ensure all config flows through `config.yml`
3. Add tests for new features
4. Update this README when adding endpoints/features

## License

Apache-2.0 (see program metadata)

## Resources

- Anchor Documentation: https://www.anchor-lang.com/
- Solana Cookbook: https://solanacookbook.com/
- Wallet Adapter: https://github.com/solana-labs/wallet-adapter
- Cerebras API: https://inference-docs.cerebras.ai/
- Pinecone: https://docs.pinecone.io/
