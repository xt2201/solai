#!/usr/bin/env python3
"""
Check the actual embedding dimension from the configured Ollama model.
This helps verify the correct dimension before creating the Pinecone index.
"""
import sys
import os
import yaml
import requests

def load_config():
    """Load configuration from config.yml"""
    config_path = os.path.join(os.path.dirname(__file__), '..', 'config.yml')
    with open(config_path, 'r') as f:
        return yaml.safe_load(f)

def check_embedding_dimension():
    """Check the embedding dimension from Ollama"""
    print("🔍 Checking embedding model dimension...")
    
    config = load_config()
    ollama_config = config['llm_processor']['ollama_embedding']
    
    base_url = ollama_config['base_url']
    model = ollama_config['model']
    
    print(f"\n📝 Configuration:")
    print(f"   Base URL: {base_url}")
    print(f"   Model: {model}")
    
    # Test embedding endpoint
    print(f"\n🧪 Testing embedding generation...")
    
    try:
        response = requests.post(
            f"{base_url}/api/embeddings",
            json={
                "model": model,
                "prompt": "test"
            },
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            embedding = data.get('embedding', [])
            dimension = len(embedding)
            
            print(f"✅ Embedding generated successfully!")
            print(f"\n📊 Model Information:")
            print(f"   Model: {model}")
            print(f"   Dimension: {dimension}")
            print(f"   First 5 values: {embedding[:5]}")
            
            print(f"\n💡 Use dimension={dimension} when creating Pinecone index")
            return dimension
            
        else:
            print(f"❌ Error: HTTP {response.status_code}")
            print(f"   Response: {response.text}")
            return None
            
    except requests.exceptions.ConnectionError:
        print(f"❌ Connection Error: Cannot connect to {base_url}")
        print(f"   Is Ollama running and accessible?")
        return None
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return None

if __name__ == "__main__":
    dimension = check_embedding_dimension()
    
    if dimension:
        print("\n" + "="*60)
        print(f"✨ Embedding dimension: {dimension}")
        print("="*60)
        sys.exit(0)
    else:
        sys.exit(1)
