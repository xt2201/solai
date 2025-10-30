#!/usr/bin/env python3
"""
Script to create and configure Pinecone index for SolAI RAG system.
This will create the 'solana-defi-docs' index with proper dimensions and metadata.
"""
import sys
import os
import yaml
from pinecone import Pinecone, ServerlessSpec

def load_config():
    """Load configuration from config.yml"""
    config_path = os.path.join(os.path.dirname(__file__), '..', 'config.yml')
    with open(config_path, 'r') as f:
        return yaml.safe_load(f)

def create_index():
    """Create Pinecone index with proper configuration"""
    print("🚀 Starting Pinecone index creation...")
    
    # Load config
    config = load_config()
    rag_config = config['llm_processor']['rag']
    
    api_key = rag_config['vector_db']['api_key']
    index_name = rag_config['vector_db']['index_name']
    environment = rag_config['vector_db']['environment']
    
    print(f"\n📝 Configuration:")
    print(f"   Index name: {index_name}")
    print(f"   Environment: {environment}")
    
    # Initialize Pinecone
    print("\n🔌 Connecting to Pinecone...")
    pc = Pinecone(api_key=api_key)
    
    # Check if index already exists
    existing_indexes = pc.list_indexes()
    index_names = [idx.name for idx in existing_indexes.indexes]
    
    if index_name in index_names:
        print(f"\n⚠️  Index '{index_name}' already exists!")
        response = input("Do you want to delete and recreate it? (yes/no): ")
        if response.lower() == 'yes':
            print(f"🗑️  Deleting existing index...")
            pc.delete_index(index_name)
            print("✅ Index deleted")
        else:
            print("❌ Aborting...")
            return False
    
    # Create index
    # bge-m3 model produces 1024-dimensional embeddings
    print(f"\n🔨 Creating index '{index_name}'...")
    print("   Dimension: 1024 (bge-m3 embedding model)")
    print("   Metric: cosine similarity")
    print("   Cloud: AWS (serverless - free tier)")
    
    pc.create_index(
        name=index_name,
        dimension=1024,  # bge-m3 embedding dimension
        metric='cosine',
        spec=ServerlessSpec(
            cloud='aws',
            region='us-east-1'  # AWS free tier region
        )
    )
    
    print("\n⏳ Waiting for index to be ready...")
    # Wait for index to be ready
    import time
    while not pc.describe_index(index_name).status['ready']:
        time.sleep(1)
    
    print(f"\n✅ Index '{index_name}' created successfully!")
    
    # Get index stats
    index = pc.Index(index_name)
    stats = index.describe_index_stats()
    
    print(f"\n📊 Index Statistics:")
    print(f"   Total vectors: {stats['total_vector_count']}")
    print(f"   Dimension: {stats['dimension']}")
    print(f"   Index fullness: {stats.get('index_fullness', 0)}")
    
    print("\n🎉 Setup complete! You can now enable RAG in config.yml")
    print("   Set 'llm_processor.rag.enabled: true'")
    
    return True

def test_index():
    """Test the index with a sample vector"""
    print("\n🧪 Testing index with sample vector...")
    
    config = load_config()
    rag_config = config['llm_processor']['rag']
    
    api_key = rag_config['vector_db']['api_key']
    index_name = rag_config['vector_db']['index_name']
    
    pc = Pinecone(api_key=api_key)
    index = pc.Index(index_name)
    
    # Create a test vector (1024 dimensions with random values)
    import numpy as np
    np.random.seed(42)
    test_vector = np.random.randn(1024).tolist()
    
    # Upsert test vector
    print("   Upserting test vector...")
    index.upsert(
        vectors=[
            {
                "id": "test-vector-1",
                "values": test_vector,
                "metadata": {
                    "source": "test",
                    "text": "This is a test document",
                    "url": "https://test.com"
                }
            }
        ]
    )
    
    # Query to verify
    print("   Querying test vector...")
    results = index.query(
        vector=test_vector,
        top_k=1,
        include_metadata=True
    )
    
    if results['matches']:
        print("   ✅ Test successful!")
        print(f"   Found: {results['matches'][0]['metadata']}")
        
        # Clean up test vector
        print("   Cleaning up test vector...")
        index.delete(ids=["test-vector-1"])
        print("   ✅ Test vector removed")
        return True
    else:
        print("   ❌ Test failed - no results returned")
        return False

if __name__ == "__main__":
    try:
        success = create_index()
        if success:
            test_index()
            print("\n" + "="*60)
            print("✨ Pinecone index is ready for RAG operations!")
            print("="*60)
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
