"""
Script to seed Pinecone with sample Solana DeFi documentation.
Creates a knowledge base for RAG queries about Solana protocols.

Usage:
    python -m scripts.seed_pinecone
"""

from __future__ import annotations

import asyncio
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.rag.embeddings import OllamaEmbeddings
from src.rag.vector_store import PineconeVectorStore


# Sample DeFi documentation for Solana ecosystem
SAMPLE_DOCUMENTS = [
    {
        "text": """
Jupiter Aggregator is the key liquidity aggregator for Solana, offering the widest range of tokens and best route discovery between any token pair. Jupiter aggregates all DEX markets and AMM pools to provide the best swap rates. Key features include:
- Smart routing across multiple DEXs (Orca, Raydium, Serum, etc.)
- Price impact minimization through split trades
- Limit orders and DCA (Dollar Cost Averaging)
- Token list with 1000+ verified tokens
- MEV protection through private transactions
        """,
        "metadata": {
            "source": "Jupiter Aggregator Documentation",
            "source_url": "https://docs.jup.ag/",
            "protocol": "Jupiter",
            "category": "DEX Aggregator",
            "last_updated": "2025-10-28"
        }
    },
    {
        "text": """
Raydium is an automated market maker (AMM) built on Solana that provides on-chain liquidity to the central limit order book of OpenBook. Key features:
- Hybrid AMM + order book model for deep liquidity
- Concentrated liquidity pools (CLMM) for capital efficiency
- Farm staking rewards for liquidity providers
- AcceleRaytor launchpad for new token launches
- Integration with Serum's order book for optimal pricing
        """,
        "metadata": {
            "source": "Raydium Documentation",
            "source_url": "https://docs.raydium.io/",
            "protocol": "Raydium",
            "category": "AMM",
            "last_updated": "2025-10-28"
        }
    },
    {
        "text": """
Marinade Finance is a liquid staking protocol that allows you to stake SOL and receive mSOL (Marinade Staked SOL) in return. Benefits include:
- Automatic delegation to high-performance validators
- Maintain liquidity while staking through mSOL
- No lock-up period - unstake anytime
- Staking rewards distributed automatically
- Protection against validator slashing
- mSOL can be used in DeFi protocols for additional yield
        """,
        "metadata": {
            "source": "Marinade Finance Documentation",
            "source_url": "https://docs.marinade.finance/",
            "protocol": "Marinade",
            "category": "Liquid Staking",
            "last_updated": "2025-10-28"
        }
    },
    {
        "text": """
Orca is a user-friendly DEX on Solana focused on simplicity and fair pricing. Features:
- Concentrated liquidity pools (Whirlpools) for up to 3000x capital efficiency
- Fair Price Indicator to prevent MEV exploitation
- Climate-friendly with carbon offset partnerships
- Low slippage on most trading pairs
- Aquafarms for LP token staking rewards
- Clean UI optimized for beginners
        """,
        "metadata": {
            "source": "Orca Documentation",
            "source_url": "https://docs.orca.so/",
            "protocol": "Orca",
            "category": "DEX",
            "last_updated": "2025-10-28"
        }
    },
    {
        "text": """
Drift Protocol is a decentralized perpetual futures exchange on Solana. Key features:
- Up to 10x leverage on perpetual contracts
- Cross-collateral margin using multiple tokens
- Deep liquidity through virtual AMM (vAMM) model
- Low trading fees (0.03% maker, 0.05% taker)
- Insurance fund for position protection
- Decentralized orderbook with on-chain settlement
        """,
        "metadata": {
            "source": "Drift Protocol Documentation",
            "source_url": "https://docs.drift.trade/",
            "protocol": "Drift",
            "category": "Perpetuals",
            "last_updated": "2025-10-28"
        }
    },
    {
        "text": """
Mango Markets is a decentralized trading platform offering spot margin trading, perpetual futures, and lending. Features:
- Cross-margined accounts for capital efficiency
- Borrow against any collateral in your account
- Lending pools with dynamic interest rates
- Flash loans for arbitrage opportunities
- Decentralized governance through MNGO token
- Risk engine with automatic liquidations
        """,
        "metadata": {
            "source": "Mango Markets Documentation",
            "source_url": "https://docs.mango.markets/",
            "protocol": "Mango",
            "category": "Trading Platform",
            "last_updated": "2025-10-28"
        }
    },
    {
        "text": """
Solend is the leading decentralized lending protocol on Solana. Key features:
- Algorithmic interest rates based on supply and demand
- Collateralized borrowing with multiple token support
- Flash loans for instant uncollateralized borrowing
- Isolated pools for riskier assets
- SLND token staking rewards
- Risk-adjusted interest rates and liquidation thresholds
- Mobile-optimized interface
        """,
        "metadata": {
            "source": "Solend Documentation",
            "source_url": "https://docs.solend.fi/",
            "protocol": "Solend",
            "category": "Lending",
            "last_updated": "2025-10-28"
        }
    },
    {
        "text": """
Phoenix is a fully on-chain central limit order book (CLOB) built on Solana. Features:
- Non-custodial with complete transparency
- Professional trading interface with advanced order types
- Maker rebates and competitive fee structure
- High throughput leveraging Solana's speed
- API access for trading bots and market makers
- Deep liquidity for major trading pairs
        """,
        "metadata": {
            "source": "Phoenix Documentation",
            "source_url": "https://docs.phoenix.trade/",
            "protocol": "Phoenix",
            "category": "Order Book",
            "last_updated": "2025-10-28"
        }
    },
    {
        "text": """
Kamino Finance is an automated liquidity management protocol for concentrated liquidity positions. Features:
- Automated rebalancing of Orca Whirlpool positions
- Multiply leverage strategies up to 3x
- k-Lend: Leverage lending with isolated pools
- Risk-managed vaults with different strategies
- Fee compounding for optimal returns
- Integration with major Solana DEXs
        """,
        "metadata": {
            "source": "Kamino Finance Documentation",
            "source_url": "https://docs.kamino.finance/",
            "protocol": "Kamino",
            "category": "Liquidity Management",
            "last_updated": "2025-10-28"
        }
    },
    {
        "text": """
Magic Eden is the largest NFT marketplace on Solana with expansion to multi-chain. Features:
- Low listing fees (2% transaction fee)
- Launchpad for new NFT collections
- Advanced filtering and rarity tools
- Wallet analytics and portfolio tracking
- Bidding and auction functionality
- Creator royalty enforcement options
- ME token for platform governance
        """,
        "metadata": {
            "source": "Magic Eden Documentation",
            "source_url": "https://docs.magiceden.io/",
            "protocol": "Magic Eden",
            "category": "NFT Marketplace",
            "last_updated": "2025-10-28"
        }
    },
    {
        "text": """
Solana Token Program (SPL Token) is the standard for fungible and non-fungible tokens on Solana. Key concepts:
- Token mints define the token properties
- Associated token accounts hold token balances
- Token extensions for advanced features (transfer fees, metadata)
- Mint authority controls token supply
- Freeze authority can freeze token accounts
- Multi-signature support for authority management
        """,
        "metadata": {
            "source": "Solana Token Program Documentation",
            "source_url": "https://spl.solana.com/token",
            "protocol": "SPL Token",
            "category": "Token Standard",
            "last_updated": "2025-10-28"
        }
    },
    {
        "text": """
Solana transaction fees and priority fees explained:
- Base fee: 5000 lamports per signature (~0.000005 SOL)
- Priority fees: Optional additional fee to prioritize transaction processing
- Compute units: Transactions consume compute units (max 1.4M per tx)
- Fee markets: Higher priority fees during network congestion
- Fee estimation: Use getRecentPrioritizationFees RPC method
- Sponsored transactions: Fee payer can be different from signer
        """,
        "metadata": {
            "source": "Solana Fee Documentation",
            "source_url": "https://docs.solana.com/transaction_fees",
            "protocol": "Solana",
            "category": "Network Fees",
            "last_updated": "2025-10-28"
        }
    },
    {
        "text": """
Best practices for Solana DeFi security:
- Always verify program addresses before interacting
- Use hardware wallets for large amounts
- Check token mint addresses against official sources
- Review transaction details before signing
- Be aware of impermanent loss in liquidity pools
- Understand liquidation risks when borrowing
- Use limit orders to avoid front-running
- Enable transaction simulation before sending
- Monitor wallet for unauthorized approvals
        """,
        "metadata": {
            "source": "Solana Security Best Practices",
            "source_url": "https://docs.solana.com/security",
            "protocol": "Solana",
            "category": "Security",
            "last_updated": "2025-10-28"
        }
    },
    {
        "text": """
Yield optimization strategies on Solana:
- Stake SOL for 6-8% APY base rewards
- Provide liquidity on Raydium/Orca for trading fees + farm rewards
- Use liquid staking (mSOL, jitoSOL) to earn staking + DeFi yields
- Leverage farming on Kamino for boosted returns
- Lend idle assets on Solend for passive income
- Participate in liquidity mining programs for new protocols
- Monitor APYs across protocols using yield aggregators
- Consider impermanent loss vs. fees earned in LP positions
        """,
        "metadata": {
            "source": "Solana Yield Strategies",
            "source_url": "https://docs.solana.com/defi",
            "protocol": "Solana",
            "category": "Yield Farming",
            "last_updated": "2025-10-28"
        }
    },
    {
        "text": """
Understanding Solana wallets and account model:
- Wallets are simply keypairs (public + private key)
- Accounts store data and require rent (SOL) to stay active
- Associated Token Accounts (ATA) are derived addresses for token balances
- Program Derived Addresses (PDA) are accounts controlled by programs
- Account rent is refunded when account is closed
- Minimum balance: ~0.002 SOL per account for rent exemption
- Wallet adapters available for web: Phantom, Solflare, Backpack
        """,
        "metadata": {
            "source": "Solana Account Model",
            "source_url": "https://docs.solana.com/account-model",
            "protocol": "Solana",
            "category": "Wallets",
            "last_updated": "2025-10-28"
        }
    }
]


async def main():
    print("🚀 Starting Pinecone seeding process...")
    
    # Initialize components
    print("📦 Initializing embeddings and vector store...")
    embeddings = OllamaEmbeddings()
    vector_store = PineconeVectorStore()
    
    # Generate embeddings for all documents
    print(f"🔮 Generating embeddings for {len(SAMPLE_DOCUMENTS)} documents...")
    texts = [doc["text"] for doc in SAMPLE_DOCUMENTS]
    
    try:
        embedding_vectors = await embeddings.embed_documents(texts)
        print(f"✅ Generated {len(embedding_vectors)} embeddings")
    except Exception as e:
        print(f"❌ Error generating embeddings: {e}")
        print("💡 Make sure Ollama server is running at the configured URL")
        return
    
    # Prepare documents with IDs
    documents = []
    for i, doc in enumerate(SAMPLE_DOCUMENTS):
        protocol = doc["metadata"].get("protocol", "Unknown")
        category = doc["metadata"].get("category", "general")
        documents.append({
            "id": f"solana-defi-{protocol.lower()}-{i}",
            "text": doc["text"].strip(),
            "metadata": doc["metadata"]
        })
    
    # Upsert to Pinecone
    print(f"📤 Uploading documents to Pinecone...")
    try:
        result = await vector_store.upsert_documents(documents, embedding_vectors)
        print(f"✅ Successfully upserted {result['upserted']} documents")
        print(f"📊 Total documents in index: {result['total']}")
    except Exception as e:
        print(f"❌ Error upserting to Pinecone: {e}")
        return
    
    # Test retrieval
    print("\n🔍 Testing retrieval with sample query...")
    test_query = "How do I provide liquidity on Raydium?"
    test_embedding = await embeddings.embed_query(test_query)
    
    results = vector_store.similarity_search(test_embedding)
    print(f"✅ Retrieved {len(results)} relevant documents")
    
    if results:
        print(f"\nTop result for '{test_query}':")
        print(f"  Protocol: {results[0].get('protocol', 'N/A')}")
        print(f"  Category: {results[0].get('category', 'N/A')}")
        print(f"  Score: {results[0].get('score', 0):.4f}")
        print(f"  Text preview: {results[0].get('text', '')[:200]}...")
    
    print("\n🎉 Pinecone seeding completed successfully!")
    print(f"📚 Knowledge base now contains documentation for:")
    protocols = sorted(set(doc["metadata"]["protocol"] for doc in SAMPLE_DOCUMENTS))
    for protocol in protocols:
        print(f"   - {protocol}")


if __name__ == "__main__":
    asyncio.run(main())
