# 🚀 SolAI Quick Start Guide

## ✅ Installation Complete!

All dependencies have been installed and the smart contract has been built successfully.

## 📋 What's Ready

- ✅ **Rust toolchain** (v1.90.0)
- ✅ **Anchor CLI** (v0.32.1)
- ✅ **Solana CLI** (v2.1.17)
- ✅ **Smart Contract** compiled (`solai_program.so`)
- ✅ **All npm packages** installed
- ✅ **Python dependencies** installed

## 🔑 Before You Start

### 1. Configure API Keys

Edit `config.yml` and add your API keys:

```bash
nano config.yml
```

Required keys:
- **Cerebras API Key** - Get from https://cerebras.ai/
- **Google Gemini API Key** - Get from https://makersuite.google.com/app/apikey
- **Pinecone API Key** - Get from https://www.pinecone.io/

Optional but recommended:
- **Helius RPC URL** - Get from https://helius.dev/
- **Firecrawl API Key** - Get from https://firecrawl.dev/

### 2. Set Up Solana Wallet (for deployment)

```bash
# Generate a new wallet
solana-keygen new --outfile ~/.config/solana/id.json

# Get devnet SOL
solana airdrop 2 --url devnet
```

## 🚀 Start Development

### Option A: Using the Start Script (Recommended)

```bash
./start-dev.sh
```

This starts all services in tmux:
- Window 0: API Gateway (port 3001)
- Window 1: LLM Processor (port 8001)  
- Window 2: Next.js App (port 3000)
- Window 3: Ollama commands

**Tmux Commands:**
- Switch windows: `Ctrl+b` then `0`, `1`, `2`, or `3`
- Detach: `Ctrl+b` then `d`
- Reattach: `tmux attach -t solai-dev`
- Kill all: `tmux kill-session -t solai-dev`

### Option B: Manual Start (4 terminals)

**Terminal 1 - API Gateway:**
```bash
cd api-gateway
npm run dev
# Runs on http://localhost:3001
```

**Terminal 2 - LLM Processor:**
```bash
cd llm-processor
uvicorn src.main:app --reload --port 8001
# Runs on http://localhost:8001
```

**Terminal 3 - Next.js Frontend:**
```bash
cd app
npm run dev
# Runs on http://localhost:3000
```

**Terminal 4 - Ollama (optional, for embeddings):**
```bash
ollama serve
ollama pull bge-m3
```

## 📱 Test the Application

1. Open browser: http://localhost:3000
2. Connect Phantom wallet (switch to Devnet)
3. Click "Connect Wallet"
4. Submit a test prompt
5. Check transaction on Solana Explorer

## 🌐 Deploy Smart Contract

```bash
cd programs

# Deploy to devnet
anchor deploy --provider.cluster devnet

# Verify deployment
solana program show 418pP8xfhqtve8RNf36ETEoAKRwxNSCSMbLTJ17nywy4 --url devnet
```

## 📁 Important Files

| File | Description |
|------|-------------|
| `config.yml` | Main configuration with API keys |
| `Anchor.toml` | Anchor workspace configuration |
| `programs/target/deploy/solai_program.so` | Compiled smart contract |
| `programs/target/deploy/solai_program-keypair.json` | Program keypair |
| `SETUP_STATUS.md` | Detailed setup status |

## 🔍 Verify Installation

```bash
# Check Rust
rustc --version
cargo --version

# Check Solana
solana --version
solana-keygen --version

# Check Anchor
anchor --version

# Check Node.js
node --version
npm --version

# Check Python
python3 --version
pip --version
```

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Find process using port 3000
lsof -ti:3000 | xargs kill -9

# Or change port in respective config
```

### Python Dependencies Issues

```bash
cd llm-processor
pip install -r requirements.txt --force-reinstall
```

### Solana CLI Not Found

```bash
# Add to PATH
export PATH="/home/thanhnx/.local/share/solana/install/active_release/bin:$PATH"

# Make permanent
echo 'export PATH="/home/thanhnx/.local/share/solana/install/active_release/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

### Anchor Build Fails

```bash
cd programs
cargo clean
anchor build
```

## �� Additional Resources

- **Anchor Documentation**: https://www.anchor-lang.com/
- **Solana Documentation**: https://docs.solana.com/
- **Next.js Documentation**: https://nextjs.org/docs

## 🆘 Getting Help

Check the following files for more details:
- `SETUP_STATUS.md` - Installation status and issues
- `DOCS.md` - Project documentation
- `Project Structure.md` - Code organization

## 🎉 You're All Set!

Your SolAI development environment is ready. Start building your AI-powered Solana application!
