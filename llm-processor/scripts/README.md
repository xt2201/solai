# LLM Processor Scripts

Utility scripts for managing the SolAI LLM Processor.

## Setup

Install dependencies:
```bash
pip install -r requirements.txt
```

## Scripts

### 1. Test Ollama Connection
Verifies that the Ollama embedding server is accessible and working.

```bash
python -m scripts.test_ollama
```

**Requirements:**
- Ollama server running at configured URL (default: http://10.8.0.10:11434)
- BGE-M3 model pulled: `ollama pull bge-m3`

### 2. Test Pinecone Connection
Verifies Pinecone vector database connectivity and checks for existing data.

```bash
python -m scripts.test_pinecone
```

**Requirements:**
- Valid Pinecone API key in config.yml
- Pinecone index created (name: `solana-defi-docs`)

### 3. Seed Pinecone Database
Populates Pinecone with sample Solana DeFi documentation for RAG queries.

```bash
python -m scripts.seed_pinecone
```

**What it does:**
- Generates embeddings for 15 curated Solana DeFi protocol documents
- Uploads documents and embeddings to Pinecone
- Tests retrieval with a sample query
- Provides knowledge base for protocols:
  - Jupiter (DEX Aggregator)
  - Raydium (AMM)
  - Orca (DEX)
  - Marinade (Liquid Staking)
  - Drift (Perpetuals)
  - Mango Markets (Trading)
  - Solend (Lending)
  - Phoenix (Order Book)
  - Kamino (Liquidity Management)
  - Magic Eden (NFT Marketplace)
  - And more...

**Requirements:**
- Ollama server running
- Valid Pinecone API key
- Pinecone index created with dimension: 1024 (for BGE-M3)

## Workflow

Recommended order for first-time setup:

1. **Test Ollama:**
   ```bash
   python -m scripts.test_ollama
   ```
   Fix any connection issues before proceeding.

2. **Test Pinecone:**
   ```bash
   python -m scripts.test_pinecone
   ```
   Ensure index exists and is accessible.

3. **Seed Database:**
   ```bash
   python -m scripts.seed_pinecone
   ```
   Populate with initial knowledge base.

4. **Start LLM Processor:**
   ```bash
   cd llm-processor
   uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload
   ```

## Configuration

All scripts read from `/config/config.yml`:

```yaml
llm_processor:
  ollama_embedding:
    base_url: "http://10.8.0.10:11434"
    model: "bge-m3"
  
  rag:
    enabled: true
    vector_db:
      provider: "PINECONE"
      api_key: "your-api-key"
      environment: "gcp-starter"
      index_name: "solana-defi-docs"
      top_k_results: 5
```

## Troubleshooting

### Ollama Connection Failed
- Check if Ollama server is running: `curl http://10.8.0.10:11434/api/version`
- Verify model is pulled: `ollama list`
- Pull BGE-M3 if missing: `ollama pull bge-m3`

### Pinecone API Error
- Verify API key in config.yml
- Check index exists in Pinecone dashboard
- Ensure index dimension is 1024 (for BGE-M3 embeddings)
- Try recreating index if corrupted

### Import Errors
- Ensure you're in the llm-processor directory
- Run scripts as modules: `python -m scripts.script_name`
- Install all dependencies: `pip install -r requirements.txt`

## Creating Your Own Dataset

To add custom documentation:

1. Edit `scripts/seed_pinecone.py`
2. Add documents to `SAMPLE_DOCUMENTS` list:
   ```python
   {
       "text": "Your documentation content here...",
       "metadata": {
           "source": "Protocol Name",
           "source_url": "https://docs.example.com",
           "protocol": "ProtocolName",
           "category": "Category",
           "last_updated": "2025-10-28"
       }
   }
   ```
3. Run seeding script again

The script will:
- Generate embeddings automatically
- Create unique IDs for each document
- Upload to Pinecone with metadata
- Test retrieval after upload
