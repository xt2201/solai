from __future__ import annotations

import json
import os
from typing import Any, Dict, List, Optional

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from .context.context_builder import ContextBuilder
from .llm.cerebras_handler import CerebrasClient
from .llm.gemini_handler import GeminiClient
from .rag.rag_logic import RagEngine
from .settings import get_config
from .langgraph_workflow import create_chat_workflow

app = FastAPI(title="SolAI LLM Processor", version="0.1.0")

rag_engine = RagEngine()
cerebras_client = CerebrasClient()
gemini_client = GeminiClient()
context_builder = ContextBuilder()
config = get_config()

# Initialize LangGraph workflow
try:
    chat_workflow = create_chat_workflow()
except Exception as e:
    print(f"Warning: Failed to initialize LangGraph workflow: {e}")
    chat_workflow = None

langsmith_cfg = config["global"].get("langsmith", {})
if langsmith_cfg.get("enabled"):
    os.environ.setdefault("LANGCHAIN_API_KEY", langsmith_cfg.get("api_key", ""))
    os.environ.setdefault("LANGCHAIN_ENDPOINT", langsmith_cfg.get("endpoint", ""))
    if langsmith_cfg.get("tracing_v2"):
        os.environ.setdefault("LANGCHAIN_TRACING_V2", "true")


class ProcessPromptRequest(BaseModel):
    prompt: str = Field(..., min_length=1)
    userWallet: str = Field(..., min_length=4)
    context: Optional[Dict[str, Any]] = None


class ProcessPromptResponse(BaseModel):
    completion: str
    citations: List[Dict[str, Any]]
    meta: Dict[str, Any]


@app.post("/process_prompt", response_model=ProcessPromptResponse)
async def process_prompt(payload: ProcessPromptRequest) -> ProcessPromptResponse:
    base_context_blocks: List[str] = []
    if payload.context:
        base_context_blocks.append(
            "Client context: " + json.dumps(payload.context, ensure_ascii=False)
        )

    wallet_context = await context_builder.build_wallet_context(payload.userWallet)
    base_context_blocks.extend(wallet_context.text_blocks)

    rag_docs: List[str] = []
    scores: Dict[str, Any] = {}
    try:
        rag_docs, scores = await rag_engine.retrieve_context(payload.prompt)
        if rag_docs:
            rag_engine.trace(payload.prompt, rag_docs)
    except Exception:  # noqa: BLE001
        rag_docs = []
        scores = {"error": "rag_failure"}

    aggregated_context = "\n---\n".join(base_context_blocks + rag_docs)

    try:
        result = await cerebras_client.generate(payload.prompt, aggregated_context)
        model_provider = config["llm_processor"]["provider"]
    except Exception:  # noqa: BLE001
        result = await gemini_client.generate(payload.prompt, aggregated_context)
        rag_docs.append("[Fallback] Gemini response used due to Cerebras failure")
        model_provider = "GEMINI"

    wallet_citations = [
        {"id": f"wallet-{idx}", "excerpt": block[:160]}
        for idx, block in enumerate(wallet_context.text_blocks)
    ]
    citations = wallet_citations + [
        {"id": f"doc-{idx}", "excerpt": doc[:160]}
        for idx, doc in enumerate(rag_docs)
    ]
    meta = {
        "rag_scores": scores,
        "model": model_provider,
        "wallet_context": wallet_context.metadata,
    }
    return ProcessPromptResponse(completion=result.get("completion", ""), citations=citations, meta=meta)


# =============================================================================
# LangGraph Chat Endpoint (New Implementation)
# =============================================================================

class LangGraphChatRequest(BaseModel):
    query: str = Field(..., min_length=1, description="User's question or query")
    user_wallet: Optional[str] = Field(None, description="User's Solana wallet address")
    include_portfolio_context: bool = Field(True, description="Whether to include user's portfolio context")


class LangGraphChatResponse(BaseModel):
    response_text: str = Field(..., description="Final response text")
    intent_used: str = Field(..., description="Intent detected: chat, retrieval, or crawl_web")
    sources: List[str] = Field(default_factory=list, description="Source documents or URLs used")
    confidence: float = Field(..., description="Confidence score of the response")
    workflow_steps: List[Dict[str, Any]] = Field(default_factory=list, description="Track each workflow step")


@app.post("/chat/langgraph", response_model=LangGraphChatResponse)
async def chat_langgraph(payload: LangGraphChatRequest) -> LangGraphChatResponse:
    """
    Process chat query using LangGraph workflow with intent detection and routing
    """
    if not chat_workflow:
        raise HTTPException(
            status_code=503,
            detail="LangGraph workflow not available"
        )
    
    # Build context
    context_parts = []
    
    if payload.include_portfolio_context and payload.user_wallet:
        try:
            wallet_context = await context_builder.build_wallet_context(payload.user_wallet)
            context_parts.extend(wallet_context.text_blocks)
        except Exception as e:
            context_parts.append(f"Wallet context unavailable: {str(e)}")
    
    context_str = "\n---\n".join(context_parts) if context_parts else "No additional context"
    
    # Prepare workflow input
    workflow_input = {
        "query": payload.query,
        "context": context_str,
        # Initialize other state fields
        "intent": "",
        "intent_confidence": 0.0,
        "intent_reasoning": "",
        "search_query": None,
        "url": None,
        "chat_response": None,
        "rag_response": None,
        "rag_sources": [],
        "crawl_response": None,
        "crawl_url": None,
        "final_response": "",
        "sources": [],
        "confidence": 0.0,
        "metadata": {},
    }
    
    # Execute workflow
    try:
        workflow_steps = []
        final_result = None
        
        # Stream through workflow to track steps
        async for event in chat_workflow.astream(workflow_input):
            for node_name, node_state in event.items():
                step = {
                    "node": node_name,
                    "status": "completed"
                }
                
                # Add specific info based on node type
                if node_name == "intent_detection":
                    step["intent"] = node_state.get("intent")
                    step["confidence"] = node_state.get("intent_confidence")
                    step["reasoning"] = node_state.get("intent_reasoning")
                elif node_name == "chat":
                    step["response_preview"] = (node_state.get("chat_response") or "")[:200]
                elif node_name == "retrieval":
                    step["sources_count"] = len(node_state.get("rag_sources", []))
                    step["confidence"] = node_state.get("confidence")
                elif node_name == "crawl_web":
                    step["url"] = node_state.get("crawl_url")
                    step["success"] = node_state.get("metadata", {}).get("crawl_success")
                elif node_name == "final_synthesis":
                    step["final"] = True
                
                workflow_steps.append(step)
                final_result = node_state
        
        if not final_result:
            raise ValueError("Workflow did not produce final result")
        
        return LangGraphChatResponse(
            response_text=final_result["final_response"],
            intent_used=final_result.get("metadata", {}).get("intent", "unknown"),
            sources=final_result["sources"],
            confidence=final_result["confidence"],
            workflow_steps=workflow_steps
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Workflow execution failed: {str(e)}"
        )


class CrawlRequest(BaseModel):
    urls: Optional[List[str]] = None  # If None, uses config URLs


class CrawlResponse(BaseModel):
    status: str
    documents_crawled: int
    chunks_prepared: int
    message: str


@app.post("/admin/crawl", response_model=CrawlResponse)
async def trigger_crawl(payload: CrawlRequest) -> CrawlResponse:
    """
    Admin endpoint to trigger Firecrawl crawling and indexing.
    Requires RAG to be enabled in config.
    """
    if not config["llm_processor"]["rag"].get("enabled"):
        raise HTTPException(status_code=400, detail="RAG is not enabled in config")
    
    try:
        from .data_ingestion.firecrawl_worker import FirecrawlWorker
        from .rag.embeddings import OllamaEmbeddingClient
        from .rag.vector_store import PineconeVectorStore
        
        worker = FirecrawlWorker()
        
        # Override URLs if provided
        if payload.urls:
            worker.source_urls = payload.urls
        
        # Crawl documents
        documents = await worker.crawl_all_sources()
        
        if not documents:
            return CrawlResponse(
                status="completed",
                documents_crawled=0,
                chunks_prepared=0,
                message="No documents were crawled"
            )
        
        # Prepare chunks
        chunks = worker.prepare_for_indexing(documents)
        
        # Generate embeddings
        embedding_client = OllamaEmbeddingClient()
        embeddings = []
        for chunk in chunks:
            emb = await embedding_client.embed(chunk['text'])
            embeddings.append(emb)
        
        # Upsert to Pinecone
        vector_store = PineconeVectorStore()
        result = await vector_store.upsert_documents(chunks, embeddings)
        
        return CrawlResponse(
            status="success",
            documents_crawled=len(documents),
            chunks_prepared=result['upserted'],
            message=f"Successfully indexed {result['upserted']} chunks from {len(documents)} documents"
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Crawl failed: {str(e)}")


@app.get("/health")
async def health() -> Dict[str, str]:
    return {"status": "ok"}


# ============================================================================
# SHOWCASE ENDPOINTS - Mock data for demo purposes
# ============================================================================

from .services.mock_services import (
    MockIndexerService,
    MockMarketDataService,
    MockRAGService,
    MockUserAccountService
)


class WalletAnalysisRequest(BaseModel):
    wallet_address: str = Field(..., min_length=32)
    analysis_type: str = Field(default="comprehensive")  # comprehensive, risk, performance


class WalletAnalysisResponse(BaseModel):
    wallet_address: str
    portfolio: List[Dict[str, Any]]
    recent_transactions: List[Dict[str, Any]]
    total_value_usd: float
    risk_score: float
    recommendations: List[str]


@app.post("/api/wallet/analyze", response_model=WalletAnalysisResponse)
async def analyze_wallet(payload: WalletAnalysisRequest) -> WalletAnalysisResponse:
    """Analyze wallet portfolio and provide insights"""
    
    # Get mock portfolio data
    portfolio = MockIndexerService.get_wallet_portfolio(payload.wallet_address, top_k=5)
    transactions = MockIndexerService.get_wallet_transactions(payload.wallet_address, limit=10)
    
    # Calculate total value
    total_value = sum(item["usd_value"] for item in portfolio)
    
    # Calculate risk score (0-10, higher is better)
    risk_score = round(8.5 - (len([t for t in transactions if t["type"] == "swap"]) * 0.1), 1)
    risk_score = max(5.0, min(9.5, risk_score))
    
    # Generate recommendations
    recommendations = [
        "Consider diversifying into stablecoins for reduced volatility",
        "Your portfolio is heavily weighted in SOL - consider rebalancing",
        "High transaction frequency detected - review gas optimization strategies",
        "Explore liquid staking options to earn passive income on SOL holdings"
    ]
    
    return WalletAnalysisResponse(
        wallet_address=payload.wallet_address,
        portfolio=portfolio,
        recent_transactions=transactions,
        total_value_usd=round(total_value, 2),
        risk_score=risk_score,
        recommendations=recommendations[:3]
    )


@app.get("/api/market/overview")
async def market_overview() -> Dict[str, Any]:
    """Get market overview for major Solana tokens"""
    
    tokens = ["SOL", "USDC", "BONK", "JUP", "ORCA", "RAY"]
    prices = MockMarketDataService.get_token_prices(tokens)
    protocols = MockMarketDataService.get_defi_protocols()
    
    return {
        "tokens": prices,
        "defi_protocols": protocols,
        "total_tvl": sum(p["tvl"] for p in protocols),
        "total_24h_volume": sum(p["24h_volume"] for p in protocols),
        "market_sentiment": "Bullish" if sum(prices[t]["24h_change"] for t in tokens) > 0 else "Bearish",
        "timestamp": int(datetime.now().timestamp())
    }


@app.get("/api/defi/opportunities")
async def defi_opportunities() -> Dict[str, Any]:
    """Get current DeFi yield opportunities"""
    
    opportunities = [
        {
            "protocol": "Marinade Finance",
            "type": "Liquid Staking",
            "apy": "6.8%",
            "tvl": 1100000000,
            "risk_level": "Low",
            "min_deposit": 0.01,
            "token": "SOL",
            "description": "Stake SOL and receive mSOL liquid staking token"
        },
        {
            "protocol": "Kamino",
            "type": "Lending",
            "apy": "12.5%",
            "tvl": 780000000,
            "risk_level": "Medium",
            "min_deposit": 10,
            "token": "USDC",
            "description": "Lend USDC to earn interest"
        },
        {
            "protocol": "Raydium",
            "type": "Liquidity Pool",
            "apy": "45.2%",
            "tvl": 890000000,
            "risk_level": "High",
            "min_deposit": 50,
            "token": "SOL-USDC",
            "description": "Provide liquidity to SOL-USDC pool"
        },
        {
            "protocol": "Jupiter",
            "type": "Limit Orders",
            "apy": "Variable",
            "tvl": 1250000000,
            "risk_level": "Low",
            "min_deposit": 5,
            "token": "Any",
            "description": "Set limit orders for token swaps"
        }
    ]
    
    return {
        "opportunities": opportunities,
        "count": len(opportunities),
        "categories": ["Liquid Staking", "Lending", "Liquidity Pool", "Limit Orders"]
    }


@app.get("/api/user/account/{wallet_address}")
async def get_user_account(wallet_address: str) -> Dict[str, Any]:
    """Get user account information"""
    
    account = MockUserAccountService.get_user_account(wallet_address)
    query_history = MockUserAccountService.get_query_history(wallet_address, limit=5)
    
    return {
        "account": account,
        "recent_queries": query_history,
        "usage_stats": {
            "total_queries": account["total_queries"],
            "total_spent": round(account["total_queries"] * 0.5, 2),
            "avg_response_time_ms": 1250,
            "success_rate": 99.5
        }
    }


@app.post("/api/rag/search")
async def search_knowledge_base(query: str = "DeFi risks", top_k: int = 5) -> Dict[str, Any]:
    """Search the RAG knowledge base"""
    
    documents = MockRAGService.search_documents(query, top_k)
    
    return {
        "query": query,
        "results": documents,
        "count": len(documents),
        "sources": list(set(doc["source"] for doc in documents))
    }


class SwapQuoteRequest(BaseModel):
    input_token: str = Field(..., examples=["SOL"])
    output_token: str = Field(..., examples=["USDC"])
    amount: float = Field(..., gt=0)


@app.post("/api/swap/quote")
async def get_swap_quote(payload: SwapQuoteRequest) -> Dict[str, Any]:
    """Get swap quote (mock Jupiter aggregator)"""
    
    import random
    
    # Mock price calculation
    base_prices = {
        "SOL": 155.23, "USDC": 1.0, "BONK": 0.000025,
        "JUP": 0.92, "ORCA": 3.45, "RAY": 2.18
    }
    
    input_price = base_prices.get(payload.input_token, 1.0)
    output_price = base_prices.get(payload.output_token, 1.0)
    
    output_amount = (payload.amount * input_price) / output_price
    
    # Mock routes
    routes = [
        {
            "route_id": 1,
            "dexes": ["Raydium", "Orca"],
            "output_amount": output_amount * 0.998,
            "price_impact": 0.12,
            "fee_pct": 0.3
        },
        {
            "route_id": 2,
            "dexes": ["Orca"],
            "output_amount": output_amount * 0.997,
            "price_impact": 0.15,
            "fee_pct": 0.25
        },
        {
            "route_id": 3,
            "dexes": ["Raydium"],
            "output_amount": output_amount * 0.996,
            "price_impact": 0.18,
            "fee_pct": 0.3
        }
    ]
    
    best_route = max(routes, key=lambda r: r["output_amount"])
    
    return {
        "input_token": payload.input_token,
        "output_token": payload.output_token,
        "input_amount": payload.amount,
        "output_amount": round(best_route["output_amount"], 6),
        "best_route": best_route,
        "all_routes": routes,
        "estimated_execution_time_ms": 850
    }


@app.get("/api/stats/platform")
async def platform_stats() -> Dict[str, Any]:
    """Get platform statistics"""
    
    from datetime import datetime
    
    return {
        "total_users": 1247,
        "total_queries": 15832,
        "total_transactions": 8956,
        "total_volume_usd": 4523789.50,
        "avg_response_time_ms": 1150,
        "uptime_pct": 99.97,
        "active_users_24h": 342,
        "queries_24h": 1891,
        "timestamp": int(datetime.now().timestamp())
    }


from datetime import datetime

# ============================================================================
# ADDITIONAL ENDPOINTS FOR COMPLETE SHOWCASE
# ============================================================================

@app.get("/rag/status")
async def rag_status() -> Dict[str, Any]:
    """Get RAG system status and statistics"""
    
    rag_config = config["llm_processor"]["rag"]
    is_enabled = rag_config.get("enabled", False)
    
    return {
        "enabled": is_enabled,
        "vector_db": {
            "provider": rag_config["vector_db"]["provider"],
            "index_name": rag_config["vector_db"]["index_name"],
            "status": "ready" if is_enabled else "disabled"
        },
        "embedding_model": {
            "provider": config["llm_processor"]["ollama_embedding"]["provider"],
            "model": config["llm_processor"]["ollama_embedding"]["model"],
            "dimension": 1024
        },
        "indexed_documents": 156 if is_enabled else 0,
        "last_index_update": "2025-10-27T10:30:00Z" if is_enabled else None,
        "sources": config["llm_processor"]["firecrawl"]["source_urls"]
    }


@app.get("/config")
async def get_configuration() -> Dict[str, Any]:
    """Get system configuration (sanitized)"""
    
    llm_config = config["llm_processor"]
    
    return {
        "environment": config["global"]["environment"],
        "llm_provider": llm_config["provider"],
        "models": {
            "cerebras": {
                "model": llm_config["cerebras"]["model_name"],
                "endpoint": llm_config["cerebras"]["endpoint_url"]
            },
            "gemini": {
                "model": llm_config["gemini"]["model_name"],
                "temperature": llm_config["gemini"]["temperature"],
                "max_tokens": llm_config["gemini"]["max_output_tokens"]
            }
        },
        "rag": {
            "enabled": llm_config["rag"]["enabled"],
            "provider": llm_config["rag"]["vector_db"]["provider"],
            "top_k": llm_config["rag"]["vector_db"]["top_k_results"]
        },
        "embedding": {
            "provider": llm_config["ollama_embedding"]["provider"],
            "model": llm_config["ollama_embedding"]["model"],
            "base_url": llm_config["ollama_embedding"]["base_url"]
        },
        "firecrawl": {
            "mode": llm_config["firecrawl"]["mode"],
            "max_depth": llm_config["firecrawl"]["max_crawl_depth"],
            "sources_count": len(llm_config["firecrawl"]["source_urls"])
        }
    }


class CompletionRequest(BaseModel):
    prompt: str = Field(..., min_length=1)
    max_tokens: Optional[int] = Field(default=500, ge=1, le=4000)
    temperature: Optional[float] = Field(default=0.7, ge=0.0, le=2.0)


@app.post("/completion")
async def llm_completion(payload: CompletionRequest) -> Dict[str, Any]:
    """Direct LLM completion endpoint"""
    
    try:
        # Use configured LLM provider
        provider = config["llm_processor"]["provider"]
        
        if provider == "CEREBRAS":
            # Use the generate method with empty context for direct completion
            result = await cerebras_client.generate(
                prompt=payload.prompt,
                context=""
            )
            response = result["completion"]
        else:  # GEMINI
            result = await gemini_client.generate(
                prompt=payload.prompt,
                context=""
            )
            response = result["completion"]
        
        return {
            "completion": response,
            "model": config["llm_processor"][provider.lower()]["model_name"],
            "provider": provider,
            "tokens_used": len(response.split()),  # Approximation
            "prompt_length": len(payload.prompt)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LLM completion failed: {str(e)}")


@app.get("/models")
async def available_models() -> Dict[str, Any]:
    """Get list of available LLM models"""
    
    llm_config = config["llm_processor"]
    
    return {
        "primary_provider": llm_config["provider"],
        "models": {
            "cerebras": {
                "name": llm_config["cerebras"]["model_name"],
                "description": "Cerebras LLaMA 3.3 70B - Ultra-fast inference",
                "context_window": 8192,
                "pricing": "Free tier available",
                "status": "available"
            },
            "gemini": {
                "name": llm_config["gemini"]["model_name"],
                "description": "Google Gemini 2.0 Flash - Multimodal AI",
                "context_window": 32768,
                "pricing": "Free tier: 1500 requests/day",
                "status": "available"
            }
        },
        "embedding_model": {
            "name": llm_config["ollama_embedding"]["model"],
            "description": "BGE-M3 - Multilingual embedding model",
            "dimension": 1024,
            "provider": llm_config["ollama_embedding"]["provider"],
            "status": "available"
        }
    }
