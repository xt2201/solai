"""
LangGraph workflow implementation
Defines nodes, edges, and state management for chat processing
"""

from __future__ import annotations

import logging
from typing import Any, Dict, List, Literal, TypedDict

from langgraph.graph import StateGraph, END
from langchain_core.messages import HumanMessage, SystemMessage

from ..llm.cerebras_handler import CerebrasHandler
from ..llm.gemini_handler import GeminiHandler
from ..rag.vector_store import PineconeVectorStore
from ..rag.embeddings import OllamaEmbeddings
from ..data_ingestion.firecrawl_worker import FirecrawlWorker
from ..settings import get_config
from .schemas import (
    IntentDetectionOutput,
    ChatResponse,
    RagSearchResult,
    WebCrawlResult,
    FinalResponse,
)
from .prompts import (
    INTENT_DETECTION_PROMPT,
    CHAT_RESPONSE_PROMPT,
    RAG_SYNTHESIS_PROMPT,
    WEB_CRAWL_SYNTHESIS_PROMPT,
    FINAL_OUTPUT_PROMPT,
)

logger = logging.getLogger(__name__)


# =============================================================================
# State Definition
# =============================================================================

class WorkflowState(TypedDict):
    """State passed between nodes in the graph"""
    
    # Input
    query: str
    context: str  # User context (wallet, history, etc.)
    
    # Intent Detection
    intent: str
    intent_confidence: float
    intent_reasoning: str
    search_query: str | None
    url: str | None
    
    # Processing Results
    chat_response: str | None
    rag_response: str | None
    rag_sources: List[str]
    crawl_response: str | None
    crawl_url: str | None
    
    # Final Output
    final_response: str
    sources: List[str]
    confidence: float
    metadata: Dict[str, Any]


# =============================================================================
# Helper Functions
# =============================================================================

def get_llm_with_structured_output(schema: Any):
    """
    Get LLM instance with structured output support
    Uses Cerebras as primary, Gemini as fallback
    """
    config = get_config()
    provider = config["llm_processor"]["provider"]
    
    try:
        if provider == "CEREBRAS":
            handler = CerebrasHandler()
            llm = handler.get_langchain_llm()
        else:
            handler = GeminiHandler()
            llm = handler.get_langchain_llm()
        
        return llm.with_structured_output(schema)
    except Exception as e:
        logger.warning(f"Failed to get {provider} LLM: {e}, falling back to Gemini")
        handler = GeminiHandler()
        llm = handler.get_langchain_llm()
        return llm.with_structured_output(schema)


# =============================================================================
# Node Implementations
# =============================================================================

async def intent_detection_node(state: WorkflowState) -> Dict:
    """
    Node 1: Detect user intent using LLM with structured output
    """
    logger.info("Intent Detection Node: Starting")
    
    # Get LLM with structured output
    llm = get_llm_with_structured_output(IntentDetectionOutput)
    
    # Format prompt
    prompt = INTENT_DETECTION_PROMPT.format(
        context=state.get("context", "No context provided"),
        query=state["query"]
    )
    
    # Invoke LLM
    messages = [SystemMessage(content=prompt)]
    result: IntentDetectionOutput = await llm.ainvoke(messages)
    
    logger.info(f"Intent detected: {result.intent} (confidence: {result.confidence})")
    
    return {
        "intent": result.intent,
        "intent_confidence": result.confidence,
        "intent_reasoning": result.reasoning,
        "search_query": result.search_query,
        "url": result.url,
    }


async def chat_node(state: WorkflowState) -> Dict:
    """
    Node 2a: Generate direct chat response using LLM knowledge
    """
    logger.info("Chat Node: Starting")
    
    # Get LLM with structured output
    llm = get_llm_with_structured_output(ChatResponse)
    
    # Format prompt
    prompt = CHAT_RESPONSE_PROMPT.format(
        context=state.get("context", "No context provided"),
        conversation_history="",  # TODO: Add conversation history
        query=state["query"]
    )
    
    # Invoke LLM
    messages = [SystemMessage(content=prompt)]
    result: ChatResponse = await llm.ainvoke(messages)
    
    logger.info("Chat Node: Response generated")
    
    return {
        "chat_response": result.response_text,
        "metadata": {
            "tone": result.tone,
            "follow_up_suggestions": result.follow_up_suggestions or [],
        }
    }


async def rag_node(state: WorkflowState) -> Dict:
    """
    Node 2b: Retrieve documents and synthesize response using RAG
    """
    logger.info("RAG Node: Starting")
    
    # Perform RAG search
    vector_store = PineconeVectorStore()
    embeddings = OllamaEmbeddings()
    search_query = state.get("search_query") or state["query"]
    
    logger.info(f"RAG Node: Searching for: {search_query}")
    
    # Generate embedding for the query
    query_embedding = await embeddings.embed_query(search_query)
    
    # Search using embedding
    results = vector_store.similarity_search(query_embedding)
    
    # Format retrieved documents
    retrieved_docs = "\n\n---\n\n".join([
        f"**Document {i+1}** (Score: {doc.get('score', 0.0):.2f}):\n{doc.get('text', '')}\n"
        f"Source: {doc.get('source', 'Unknown')}"
        for i, doc in enumerate(results)
    ])
    
    sources = [
        doc.get("source", doc.get("source_url", "Unknown"))
        for doc in results
    ]
    
    # Get LLM with structured output for synthesis
    llm = get_llm_with_structured_output(RagSearchResult)
    
    # Format prompt
    prompt = RAG_SYNTHESIS_PROMPT.format(
        context=state.get("context", "No context provided"),
        query=state["query"],
        retrieved_docs=retrieved_docs,
        sources=", ".join(set(sources))
    )
    
    # Invoke LLM
    messages = [SystemMessage(content=prompt)]
    result: RagSearchResult = await llm.ainvoke(messages)
    
    logger.info(f"RAG Node: Response synthesized (confidence: {result.confidence})")
    
    return {
        "rag_response": result.response_text,
        "rag_sources": result.sources_used,
        "confidence": result.confidence,
        "metadata": {
            "has_complete_answer": result.has_complete_answer,
            "documents_retrieved": len(results),
        }
    }


async def firecrawl_node(state: WorkflowState) -> Dict:
    """
    Node 2c: Crawl web URL and synthesize response
    """
    logger.info("Firecrawl Node: Starting")
    
    url = state.get("url")
    if not url:
        logger.warning("Firecrawl Node: No URL provided")
        return {
            "crawl_response": "No URL was provided to crawl.",
            "crawl_url": None,
            "metadata": {"crawl_success": False}
        }
    
    # Perform web crawl
    worker = FirecrawlWorker()
    logger.info(f"Firecrawl Node: Crawling {url}")
    
    try:
        documents = await worker.crawl_single_url(url)
        
        if not documents:
            crawled_content = "Failed to retrieve content from the URL."
            crawl_success = False
        else:
            # Take first document content
            crawled_content = documents[0].get("markdown", documents[0].get("content", ""))
            # Limit content size
            if len(crawled_content) > 4000:
                crawled_content = crawled_content[:4000] + "\n\n[Content truncated...]"
            crawl_success = True
    except Exception as e:
        logger.error(f"Firecrawl Node: Error crawling {url}: {e}")
        crawled_content = f"Error crawling the URL: {str(e)}"
        crawl_success = False
    
    # Get LLM with structured output for synthesis
    llm = get_llm_with_structured_output(WebCrawlResult)
    
    # Format prompt
    prompt = WEB_CRAWL_SYNTHESIS_PROMPT.format(
        context=state.get("context", "No context provided"),
        query=state["query"],
        url=url,
        crawled_content=crawled_content
    )
    
    # Invoke LLM
    messages = [SystemMessage(content=prompt)]
    result: WebCrawlResult = await llm.ainvoke(messages)
    
    logger.info(f"Firecrawl Node: Response synthesized")
    
    return {
        "crawl_response": result.response_text,
        "crawl_url": result.source_url,
        "metadata": {
            "crawl_success": result.crawl_success,
            "key_points": result.key_points,
        }
    }


async def final_synthesis_node(state: WorkflowState) -> Dict:
    """
    Node 3: Final synthesis - create polished output
    """
    logger.info("Final Synthesis Node: Starting")
    
    # Determine which processing path was taken
    intent = state["intent"]
    
    if intent == "chat":
        processed_content = state.get("chat_response", "")
        sources = [{"type": "llm_knowledge", "name": "AI Assistant Knowledge"}]
    elif intent == "retrieval":
        processed_content = state.get("rag_response", "")
        sources = [
            {"type": "documentation", "name": source}
            for source in state.get("rag_sources", [])
        ]
    else:  # crawl_web
        processed_content = state.get("crawl_response", "")
        crawl_url = state.get("crawl_url")
        # Handle None URL case
        sources = [
            {"type": "web_crawl", "url": crawl_url if crawl_url else "No URL provided"}
        ]
    
    # Get LLM with structured output
    llm = get_llm_with_structured_output(FinalResponse)
    
    # Format prompt - ensure all source values are strings
    source_names = []
    for s in sources:
        name = s.get("name") or s.get("url") or "Unknown"
        # Ensure name is not None
        source_names.append(str(name) if name else "Unknown")
    
    prompt = FINAL_OUTPUT_PROMPT.format(
        context=state.get("context", "No context provided"),
        query=state["query"],
        processed_content=processed_content,
        intent=intent,
        sources=", ".join(source_names)
    )
    
    # Invoke LLM
    messages = [SystemMessage(content=prompt)]
    result: FinalResponse = await llm.ainvoke(messages)
    
    logger.info("Final Synthesis Node: Complete")
    
    return {
        "final_response": result.response_text,
        "sources": result.sources,  # Already List[str], no need to call .dict()
        "confidence": result.confidence,
        "metadata": {
            **state.get("metadata", {}),
            "intent": result.intent_used,
        }
    }


# =============================================================================
# Routing Logic
# =============================================================================

def route_by_intent(state: WorkflowState) -> Literal["chat", "retrieval", "crawl_web"]:
    """
    Conditional edge: Route to appropriate processing node based on intent
    """
    intent = state["intent"]
    logger.info(f"Routing to: {intent}")
    return intent


# =============================================================================
# Graph Construction
# =============================================================================

def create_chat_workflow():
    """
    Create and compile the LangGraph workflow
    
    Returns:
        Compiled StateGraph for chat processing
    """
    # Create graph
    workflow = StateGraph(WorkflowState)
    
    # Add nodes
    workflow.add_node("intent_detection", intent_detection_node)
    workflow.add_node("chat", chat_node)
    workflow.add_node("retrieval", rag_node)
    workflow.add_node("crawl_web", firecrawl_node)
    workflow.add_node("final_synthesis", final_synthesis_node)
    
    # Set entry point
    workflow.set_entry_point("intent_detection")
    
    # Add conditional edges from intent detection
    workflow.add_conditional_edges(
        "intent_detection",
        route_by_intent,
        {
            "chat": "chat",
            "retrieval": "retrieval",
            "crawl_web": "crawl_web",
        }
    )
    
    # All processing nodes go to final synthesis
    workflow.add_edge("chat", "final_synthesis")
    workflow.add_edge("retrieval", "final_synthesis")
    workflow.add_edge("crawl_web", "final_synthesis")
    
    # Final synthesis ends the workflow
    workflow.add_edge("final_synthesis", END)
    
    # Compile and return
    compiled_workflow = workflow.compile()
    logger.info("LangGraph workflow compiled successfully")
    
    return compiled_workflow
