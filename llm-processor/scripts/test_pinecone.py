"""
Test script to verify Pinecone vector database connectivity.

Usage:
    python -m scripts.test_pinecone
"""

from __future__ import annotations

import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.rag.vector_store import PineconeVectorStore
from src.settings import get_config


def main():
    print("🔍 Testing Pinecone Vector Database Connection...\n")
    
    # Load config
    config = get_config()
    pinecone_cfg = config["llm_processor"]["rag"]["vector_db"]
    
    print(f"Configuration:")
    print(f"  Provider: {pinecone_cfg['provider']}")
    print(f"  Environment: {pinecone_cfg['environment']}")
    print(f"  Index Name: {pinecone_cfg['index_name']}")
    print(f"  Top K: {pinecone_cfg['top_k_results']}\n")
    
    # Initialize vector store
    try:
        vector_store = PineconeVectorStore()
        print("✅ Successfully initialized Pinecone client")
    except Exception as e:
        print(f"❌ Error initializing Pinecone: {e}")
        print("\n💡 Troubleshooting:")
        print("   1. Check if API key is correct in config.yml")
        print("   2. Verify the environment name matches your Pinecone dashboard")
        print("   3. Make sure the index exists in Pinecone")
        return
    
    # Test query with dummy embedding
    print("\n🔍 Testing vector search with dummy embedding...")
    dummy_embedding = [0.1] * 1024  # BGE-M3 uses 1024 dimensions
    
    try:
        results = vector_store.similarity_search(dummy_embedding)
        print(f"✅ Search successful! Retrieved {len(results)} documents")
        
        if results:
            print("\n📄 Sample result:")
            sample = results[0]
            print(f"   Score: {sample.get('score', 'N/A')}")
            print(f"   Protocol: {sample.get('protocol', 'N/A')}")
            print(f"   Category: {sample.get('category', 'N/A')}")
            print(f"   Text preview: {sample.get('text', '')[:150]}...")
        else:
            print("\n⚠️  No documents found in index. Run seed_pinecone.py to populate.")
        
    except Exception as e:
        print(f"❌ Error querying Pinecone: {e}")
        return
    
    print("\n🎉 Pinecone connection is working correctly!")
    
    if not results:
        print("\n📝 Next step: Run 'python -m scripts.seed_pinecone' to populate the index")


if __name__ == "__main__":
    main()
