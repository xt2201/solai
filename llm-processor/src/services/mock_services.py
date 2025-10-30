"""
Mock services for demo/showcase purposes.
These services provide realistic data when external services are unavailable.
"""
import random
from typing import Dict, List, Any
from datetime import datetime, timedelta

class MockIndexerService:
    """Mock Helius Indexer for transaction history"""
    
    @staticmethod
    def get_wallet_transactions(wallet_address: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Generate mock transaction history"""
        transactions = []
        base_time = datetime.now()
        
        mock_tokens = ["SOL", "USDC", "BONK", "JUP", "ORCA"]
        mock_actions = ["swap", "transfer", "stake", "unstake", "add_liquidity"]
        
        for i in range(limit):
            tx_time = base_time - timedelta(hours=random.randint(1, 240))
            transactions.append({
                "signature": f"mock_tx_{i}_{random.randint(10000, 99999)}",
                "timestamp": int(tx_time.timestamp()),
                "type": random.choice(mock_actions),
                "tokens_involved": random.sample(mock_tokens, k=random.randint(1, 3)),
                "amount_sol": round(random.uniform(0.1, 10.0), 4),
                "fee": round(random.uniform(0.00001, 0.0001), 6),
                "status": "success",
                "description": f"Mock transaction {i+1}"
            })
        
        return transactions
    
    @staticmethod
    def get_wallet_portfolio(wallet_address: str, top_k: int = 5) -> List[Dict[str, Any]]:
        """Generate mock portfolio data"""
        tokens = [
            {"symbol": "SOL", "name": "Solana", "decimals": 9},
            {"symbol": "USDC", "name": "USD Coin", "decimals": 6},
            {"symbol": "BONK", "name": "Bonk", "decimals": 5},
            {"symbol": "JUP", "name": "Jupiter", "decimals": 6},
            {"symbol": "ORCA", "name": "Orca", "decimals": 6},
            {"symbol": "RAY", "name": "Raydium", "decimals": 6},
            {"symbol": "MNGO", "name": "Mango", "decimals": 6},
        ]
        
        portfolio = []
        for token in random.sample(tokens, min(top_k, len(tokens))):
            amount = round(random.uniform(10, 10000), 2)
            usd_price = round(random.uniform(0.001, 200), 4)
            portfolio.append({
                "token": token["symbol"],
                "name": token["name"],
                "amount": amount,
                "usd_value": round(amount * usd_price, 2),
                "price_usd": usd_price,
                "24h_change": round(random.uniform(-15, 25), 2),
                "mint_address": f"mock_{token['symbol']}_mint_address"
            })
        
        # Sort by USD value
        portfolio.sort(key=lambda x: x["usd_value"], reverse=True)
        return portfolio


class MockMarketDataService:
    """Mock market data service"""
    
    @staticmethod
    def get_token_prices(symbols: List[str]) -> Dict[str, Dict[str, Any]]:
        """Get mock token prices"""
        prices = {}
        for symbol in symbols:
            base_price = {
                "SOL": 155.23,
                "USDC": 1.0,
                "BONK": 0.000025,
                "JUP": 0.92,
                "ORCA": 3.45,
                "RAY": 2.18,
                "MNGO": 0.05
            }.get(symbol, random.uniform(0.01, 100))
            
            prices[symbol] = {
                "price": base_price,
                "24h_change": round(random.uniform(-10, 15), 2),
                "24h_volume": round(random.uniform(1000000, 50000000), 2),
                "market_cap": round(random.uniform(10000000, 5000000000), 2),
                "liquidity": round(random.uniform(500000, 10000000), 2)
            }
        
        return prices
    
    @staticmethod
    def get_defi_protocols() -> List[Dict[str, Any]]:
        """Get mock DeFi protocol data"""
        protocols = [
            {
                "name": "Jupiter",
                "tvl": 1250000000,
                "24h_volume": 450000000,
                "category": "DEX Aggregator",
                "risk_score": 8.5,
                "apy": "Dynamic"
            },
            {
                "name": "Raydium",
                "tvl": 890000000,
                "24h_volume": 320000000,
                "category": "DEX",
                "risk_score": 8.2,
                "apy": "12-45%"
            },
            {
                "name": "Orca",
                "tvl": 650000000,
                "24h_volume": 180000000,
                "category": "DEX",
                "risk_score": 8.7,
                "apy": "8-35%"
            },
            {
                "name": "Marinade Finance",
                "tvl": 1100000000,
                "24h_volume": 25000000,
                "category": "Liquid Staking",
                "risk_score": 9.0,
                "apy": "6.8%"
            },
            {
                "name": "Kamino",
                "tvl": 780000000,
                "24h_volume": 85000000,
                "category": "Lending",
                "risk_score": 7.8,
                "apy": "5-18%"
            }
        ]
        return protocols


class MockRAGService:
    """Mock RAG service when Pinecone is unavailable"""
    
    @staticmethod
    def search_documents(query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        """Return mock relevant documents"""
        
        # Mock document database
        documents = [
            {
                "text": "Solana is a high-performance blockchain supporting up to 65,000 transactions per second with sub-second finality. It uses Proof of History (PoH) combined with Proof of Stake (PoS) for consensus.",
                "source": "https://solana.com/docs",
                "title": "Solana Overview",
                "relevance": 0.92
            },
            {
                "text": "Jupiter is the key liquidity aggregator for Solana, offering the best token swap rates by routing through multiple DEXs. It supports limit orders, DCA, and perpetual trading.",
                "source": "https://docs.jup.ag",
                "title": "Jupiter Aggregator",
                "relevance": 0.88
            },
            {
                "text": "DeFi risk management involves monitoring smart contract audits, protocol TVL changes, impermanent loss in liquidity pools, and diversification across multiple protocols.",
                "source": "https://station.jup.ag/docs",
                "title": "DeFi Risk Management",
                "relevance": 0.85
            },
            {
                "text": "Liquid staking on Solana allows users to stake SOL while maintaining liquidity through derivative tokens like mSOL or JitoSOL, enabling participation in DeFi while earning staking rewards.",
                "source": "https://docs.marinade.finance",
                "title": "Liquid Staking",
                "relevance": 0.82
            },
            {
                "text": "Token swaps on Solana are optimized through aggregators that split orders across multiple liquidity sources. Best practices include checking slippage tolerance and using versioned transactions.",
                "source": "https://docs.jup.ag/swap-api",
                "title": "Swap Optimization",
                "relevance": 0.78
            }
        ]
        
        # Simple keyword matching to make it more realistic
        query_lower = query.lower()
        scored_docs = []
        
        for doc in documents:
            score = doc["relevance"]
            # Boost score if keywords match
            keywords = ["defi", "risk", "swap", "stake", "jupiter", "solana", "trade"]
            for keyword in keywords:
                if keyword in query_lower and keyword in doc["text"].lower():
                    score += 0.05
            
            scored_docs.append({**doc, "relevance": min(score, 0.99)})
        
        # Sort by relevance and return top_k
        scored_docs.sort(key=lambda x: x["relevance"], reverse=True)
        return scored_docs[:top_k]


class MockUserAccountService:
    """Mock Solana user account data"""
    
    @staticmethod
    def get_user_account(wallet_address: str) -> Dict[str, Any]:
        """Get or create mock user account"""
        return {
            "wallet_address": wallet_address,
            "solai_balance": round(random.uniform(10, 1000), 2),
            "total_queries": random.randint(0, 150),
            "last_query_time": int(datetime.now().timestamp()),
            "tier": "Premium" if random.random() > 0.5 else "Standard",
            "created_at": int((datetime.now() - timedelta(days=random.randint(1, 365))).timestamp()),
            "is_active": True
        }
    
    @staticmethod
    def get_query_history(wallet_address: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Get mock query history"""
        queries = []
        base_time = datetime.now()
        
        sample_queries = [
            "What's the risk of my portfolio?",
            "Analyze my recent transactions",
            "Best DeFi yields on Solana",
            "How to swap SOL to USDC efficiently?",
            "Explain liquid staking",
            "Compare Jupiter vs Raydium",
            "What are the fees on Solana?",
            "How to provide liquidity safely?",
            "Best time to buy SOL?",
            "Analyze market trends"
        ]
        
        for i in range(min(limit, len(sample_queries))):
            query_time = base_time - timedelta(hours=random.randint(1, 720))
            queries.append({
                "query": sample_queries[i],
                "timestamp": int(query_time.timestamp()),
                "fee_paid": 0.5,
                "response_time_ms": random.randint(800, 3000),
                "tx_signature": f"mock_tx_{random.randint(10000, 99999)}",
                "status": "completed"
            })
        
        return queries
