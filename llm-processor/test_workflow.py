#!/usr/bin/env python3
"""
Quick test script for LangGraph workflow
"""
import asyncio
from src.langgraph_workflow import create_chat_workflow

async def test_workflow():
    workflow = create_chat_workflow()
    
    workflow_input = {
        "query": "What is Solana?",
        "context": "No additional context",
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
    
    print("Starting workflow...")
    try:
        async for event in workflow.astream(workflow_input):
            print(f"\nEvent: {event}")
    except Exception as e:
        print(f"\nError: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_workflow())
