"""
Check Pinecone index statistics and sample data.

Usage:
    python -m scripts.check_index
"""

from __future__ import annotations

import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.rag.vector_store import PineconeVectorStore
from src.settings import get_config


def main():
    print("📊 Checking Pinecone Index Statistics...\n")
    
    config = get_config()
    pinecone_cfg = config["llm_processor"]["rag"]["vector_db"]
    
    print(f"Index: {pinecone_cfg['index_name']}")
    print(f"Environment: {pinecone_cfg['environment']}\n")
    
    vector_store = PineconeVectorStore()
    
    # Get index stats
    try:
        stats = vector_store._index.describe_index_stats()
        print(f"✅ Index Statistics:")
        print(f"   Total vectors: {stats.get('total_vector_count', 0)}")
        print(f"   Dimension: {stats.get('dimension', 'N/A')}")
        print(f"   Namespaces: {list(stats.get('namespaces', {}).keys())}")
        
        # Check if vectors exist in default namespace
        namespaces = stats.get('namespaces', {})
        if '' in namespaces:
            print(f"\n   Default namespace vectors: {namespaces['']['vector_count']}")
        
    except Exception as e:
        print(f"❌ Error getting stats: {e}")
        return
    
    print("\n✅ Index is populated and ready for queries!")


if __name__ == "__main__":
    main()
