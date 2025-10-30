"""
Test end-to-end RAG pipeline: query -> embedding -> retrieval -> context.

Usage:
    python -m scripts.test_rag
"""

from __future__ import annotations

import asyncio
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.rag.rag_logic import RagEngine


async def main():
    print("🧪 Testing End-to-End RAG Pipeline...\n")
    
    # Initialize RAG engine
    rag = RagEngine()
    
    # Test queries
    test_queries = [
        "How do I provide liquidity on Raydium?",
        "What is Jupiter aggregator?",
        "How to stake SOL with Marinade?",
        "Best yield farming strategies on Solana",
        "What are Solana transaction fees?"
    ]
    
    print(f"🔍 Testing {len(test_queries)} queries...\n")
    
    for i, query in enumerate(test_queries, 1):
        print(f"{'='*80}")
        print(f"Query {i}: {query}")
        print(f"{'='*80}")
        
        try:
            # Retrieve context
            contexts, scores = await rag.retrieve_context(query)
            
            if not contexts:
                print("⚠️  No context retrieved")
                continue
            
            print(f"✅ Retrieved {len(contexts)} documents\n")
            
            # Show top result
            for j, (context, (doc_id, score)) in enumerate(zip(contexts, scores.items()), 1):
                if j > 2:  # Show only top 2
                    break
                    
                print(f"  Result {j}:")
                print(f"    Score: {score:.4f}")
                print(f"    Preview: {context[:200]}...")
                print()
                
        except Exception as e:
            print(f"❌ Error: {e}\n")
    
    print("\n🎉 RAG pipeline testing complete!")


if __name__ == "__main__":
    asyncio.run(main())
