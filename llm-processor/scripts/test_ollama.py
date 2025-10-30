"""
Test script to verify Ollama embedding server connectivity.

Usage:
    python -m scripts.test_ollama
"""

from __future__ import annotations

import asyncio
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.rag.embeddings import OllamaEmbeddings
from src.settings import get_config


async def main():
    print("🔍 Testing Ollama Embedding Server Connection...\n")
    
    # Load config
    config = get_config()
    ollama_cfg = config["llm_processor"]["ollama_embedding"]
    
    print(f"Configuration:")
    print(f"  Base URL: {ollama_cfg['base_url']}")
    print(f"  Model: {ollama_cfg['model']}")
    print(f"  Provider: {ollama_cfg['provider']}\n")
    
    # Initialize client
    embeddings = OllamaEmbeddings()
    
    # Test single embedding
    print("📝 Testing single query embedding...")
    test_text = "What is Solana DeFi?"
    
    try:
        embedding = await embeddings.embed_query(test_text)
        print(f"✅ Success! Generated embedding of length: {len(embedding)}")
        print(f"   First 5 values: {embedding[:5]}")
    except Exception as e:
        print(f"❌ Error: {e}")
        print("\n💡 Troubleshooting:")
        print("   1. Make sure Ollama server is running")
        print("   2. Check if the model is pulled: ollama pull bge-m3")
        print("   3. Verify the base_url in config.yml is correct")
        return
    
    # Test batch embeddings
    print("\n📚 Testing batch document embeddings...")
    test_docs = [
        "Jupiter is a DEX aggregator on Solana",
        "Raydium provides liquidity for Solana",
        "Marinade offers liquid staking for SOL"
    ]
    
    try:
        embeddings_list = await embeddings.embed_documents(test_docs)
        print(f"✅ Success! Generated {len(embeddings_list)} embeddings")
        for i, emb in enumerate(embeddings_list):
            print(f"   Doc {i+1}: {len(emb)} dimensions")
    except Exception as e:
        print(f"❌ Error: {e}")
        return
    
    print("\n🎉 All tests passed! Ollama connection is working correctly.")


if __name__ == "__main__":
    asyncio.run(main())
