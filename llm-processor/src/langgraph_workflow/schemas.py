"""
Pydantic schemas for LangGraph structured outputs
All LLM nodes must use with_structured_output() with these schemas
"""

from typing import List, Literal, Optional
from pydantic import BaseModel, Field


# =============================================================================
# Intent Detection
# =============================================================================

class IntentDetectionOutput(BaseModel):
    """Output schema for intent detection node"""
    
    intent: Literal["chat", "retrieval", "crawl_web"] = Field(
        description="The detected intent category"
    )
    confidence: float = Field(
        description="Confidence score between 0.0 and 1.0"
    )
    search_query: Optional[str] = Field(
        default=None,
        description="Extracted search keywords for retrieval intent"
    )
    url: Optional[str] = Field(
        default=None,
        description="Extracted URL for crawl_web intent"
    )
    reasoning: str = Field(
        description="Brief explanation of why this intent was chosen"
    )


# =============================================================================
# Chat Response
# =============================================================================

class ChatResponse(BaseModel):
    """Output schema for direct chat responses"""
    
    response_text: str = Field(
        description="The conversational response to the user"
    )
    tone: Literal["friendly", "professional", "helpful"] = Field(
        description="The tone used in the response"
    )
    follow_up_suggestions: Optional[List[str]] = Field(
        default=None,
        description="Optional suggested follow-up questions"
    )


# =============================================================================
# RAG Processing
# =============================================================================

class RagDocument(BaseModel):
    """Individual document from RAG search"""
    
    content: str = Field(description="The document content")
    source: str = Field(description="The source name or URL")
    relevance_score: float = Field(
        description="Relevance score between 0.0 and 1.0"
    )


class RagSearchResult(BaseModel):
    """Output schema for RAG synthesis node"""
    
    response_text: str = Field(
        description="Synthesized response using retrieved documents"
    )
    sources_used: List[str] = Field(
        description="List of source names/URLs that were cited"
    )
    confidence: float = Field(
        description="Confidence in the answer based on document relevance between 0.0 and 1.0"
    )
    has_complete_answer: bool = Field(
        description="Whether the documents fully answered the query"
    )


# =============================================================================
# Web Crawl
# =============================================================================

class WebCrawlResult(BaseModel):
    """Output schema for web crawl synthesis node"""
    
    response_text: str = Field(
        description="Synthesized summary of crawled content"
    )
    source_url: str = Field(
        description="The URL that was crawled"
    )
    crawl_success: bool = Field(
        description="Whether the crawl was successful"
    )
    key_points: List[str] = Field(
        description="List of key points extracted from the page"
    )


# =============================================================================
# Final Output
# =============================================================================

class FinalResponse(BaseModel):
    """Final output schema for the entire workflow"""
    
    response_text: str = Field(
        description="The final polished response to show the user"
    )
    intent_used: Literal["chat", "retrieval", "crawl_web"] = Field(
        description="Which intent path was taken"
    )
    sources: List[str] = Field(
        description="List of source names or URLs used to generate the response"
    )
    confidence: float = Field(
        description="Overall confidence in the response between 0.0 and 1.0"
    )
