# SolAI - AI-Powered DeFi Advisor on Solana

**SolAI** is an intelligent AI agent platform that helps users discover, analyze, and interact with the DeFi ecosystem on Solana blockchain. The project combines the power of Large Language Models (LLMs), Retrieval-Augmented Generation (RAG), and on-chain smart contracts to create a transparent and accountable DeFi advisory experience.

![Solana](https://img.shields.io/badge/Solana-14F195?style=flat&logo=solana&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=flat&logo=python&logoColor=white)
![Rust](https://img.shields.io/badge/Rust-000000?style=flat&logo=rust&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=next.js&logoColor=white)

## 🌟 Features

- **💬 AI Chat Assistant**: Ask any DeFi question and get personalized recommendations based on your risk profile
- **📊 Real-time Dashboard**: Live data from 1,597+ DeFi pools, top APY opportunities, market sentiment
- **💼 Wallet Analytics**: Comprehensive portfolio analysis with risk scoring and diversification metrics
- **🔄 Jupiter Swap Integration**: Best price aggregation from 10+ DEXs with one-click execution
- **🔗 Blockchain Transparency**: Every AI recommendation logged immutably on Solana blockchain
- **🔍 RAG-Powered Search**: Semantic search across DeFi protocol documentation

## 🏗️ Architecture

### Frontend (Next.js)
Interactive dashboard with wallet integration, chat interface with LangGraph workflow visualization, portfolio tracking, and DeFi opportunities explorer.

### API Gateway (Node.js/TypeScript)
Orchestration layer connecting frontend with LLM processor, handling authentication, rate limiting, and transaction proxy.

### LLM Processor (Python/FastAPI)
Core AI engine with LangGraph workflow for intent detection (chat/retrieval/crawl_web), intelligent routing, RAG search via Pinecone vector store, and web crawling with Firecrawl. Supports Cerebras (primary) and Gemini (fallback) with structured output using Pydantic schemas.

### Solana Program (Rust/Anchor)
Smart contract managing user accounts, logging queries on-chain, calculating transaction fees, ensuring transparency and immutability.

### RAG System
Embedding engine with Ollama (bge-m3 model), vector search on Pinecone, automatic collection and update of documentation from DeFi protocols (Jupiter, Raydium, Drift, Solend...).

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ (for API gateway and frontend)
- Python 3.11+ (for LLM processor)
- Rust & Anchor CLI (for Solana program)
- Ollama (for embeddings)

### 1. Configuration

Copy and configure the example config file:

```bash
cp config.example.yml config.yml
```

Edit `config.yml` with your API keys:
- Cerebras API key (https://cerebras.ai/)
- Gemini API key (https://aistudio.google.com/)
- Pinecone API key (https://pinecone.io/)
- Helius API key (https://helius.dev/)
- Firecrawl API key (https://firecrawl.dev/)

### 2. Solana Program

```bash
cd programs
anchor build
anchor deploy
# Update config.yml with the deployed program ID
```

### 3. API Gateway

```bash
cd api-gateway
npm install
npm run build
npm run dev
```

### 4. LLM Processor

```bash
cd llm-processor
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn src.main:app --reload
```

### 5. Frontend

```bash
cd app
npm install
npm run dev
```

Open http://localhost:3000 to see the application.

## 📁 Project Structure

```
solai/
├── programs/           # Anchor smart contract (Rust)
├── api-gateway/        # Express API server (TypeScript)
├── llm-processor/      # FastAPI LLM service (Python)
├── app/               # Next.js frontend
├── client-sdk/        # TypeScript SDK for integrations
├── scripts/           # Deployment and utility scripts
└── config.yml         # Central configuration file
```

## 🔧 Technology Stack

- **Blockchain**: Solana, Anchor Framework
- **LLM**: Cerebras (primary), Gemini (fallback)
- **AI Framework**: LangGraph, LangChain
- **Vector DB**: Pinecone
- **Embeddings**: Ollama (bge-m3)
- **Web Crawling**: Firecrawl
- **Frontend**: Next.js 14, React, TailwindCSS
- **Backend**: Node.js, Express, FastAPI
- **Language**: TypeScript, Python, Rust

## 🌐 API Endpoints

### Smart Contract
- `GET /api/program/info` - Program statistics
- `GET /api/program/user/:address` - User account info
- `POST /api/program/initialize` - Initialize user account
- `POST /api/program/log` - Log AI interaction

### Dashboard
- `GET /dashboard/metrics` - System metrics
- `GET /dashboard/market` - Market data
- `GET /dashboard/recent-logs` - Recent activities

### DeFi
- `GET /api/defi/opportunities` - Top DeFi opportunities
- `POST /api/swap/quote` - Get swap quote from Jupiter
- `POST /api/swap/execute` - Execute swap transaction

### AI & RAG
- `POST /api/chat` - Chat with AI assistant
- `POST /api/rag/search` - Semantic search in DeFi docs
- `POST /api/wallet/analyze` - Analyze wallet portfolio

## 📊 Smart Contract

**Program ID**: `8pMVJamgnZKWmYJQQ8gvPaT7UFVg5BAr3Rg5HY8epYyh` (Devnet)

Features:
- Initialize user accounts (PDA-based)
- Log AI interactions on-chain
- Track query counts and fees
- Maintain program treasury

## 🧪 Testing

Run integration tests:

```bash
cd api-gateway
npm test

cd ../llm-processor
pytest

cd ../programs
anchor test
```

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Contact

For questions and support, please open an issue on GitHub.

---

**Built with ❤️ on Solana**
   ```bash
   cd app
   npm install
   npm run dev
   ```

## Key API Flows

- `POST /accounts/init`: Returns a serialized transaction to create the on-chain user account if it does not already exist.
- `POST /chat`: Deducts SOLAI fees by returning a serialized `log_interaction` transaction, proxies the prompt to the LLM processor, and returns hashes for on-chain provenance.

## Testing & Operations

- Run `scripts/deploy_program.sh` to build/deploy via Anchor.
- Run `scripts/update_rag_index.sh` to execute the Firecrawl ingestion worker and refresh the Pinecone vector index.

## Roadmap

- Implement the Next.js UI consuming the client SDK.
- Expand automated tests for Anchor programs and Python services.
- Integrate real wallet signature flows within the frontend.
