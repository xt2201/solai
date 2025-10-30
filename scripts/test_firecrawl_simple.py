#!/usr/bin/env python3
"""
Simple test script for Firecrawl API
"""
import os
import sys
import yaml

# Load config
config_path = os.path.join(os.path.dirname(__file__), '..', 'config.yml')
with open(config_path) as f:
    config = yaml.safe_load(f)

api_key = config['llm_processor']['firecrawl']['api_key']

print(f"Testing Firecrawl with API key: {api_key[:10]}...")

from firecrawl import FirecrawlApp

app = FirecrawlApp(api_key=api_key)

print("\nTesting scrape on https://solana.com...")

try:
    # Test scrape (v2 API)
    result = app.scrape(
        'https://solana.com',
        formats=['markdown', 'html']
    )
    
    print(f"\n✅ Success!")
    print(f"Type: {type(result)}")
    print(f"Keys: {result.keys() if isinstance(result, dict) else 'Not a dict'}")
    
    if isinstance(result, dict):
        content = result.get('markdown', result.get('content', ''))
        print(f"\nContent length: {len(content)} chars")
        print(f"Content preview:\n{content[:300]}...")
    else:
        print(f"Result: {result}")
        
except Exception as e:
    print(f"\n❌ Error: {e}")
    import traceback
    traceback.print_exc()
