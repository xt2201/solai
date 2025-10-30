#!/usr/bin/env python3
"""
Test script to verify Firecrawl integration.
Run from project root: python scripts/test_firecrawl.py
"""

import asyncio
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent / "llm-processor"))

from src.data_ingestion.firecrawl_worker import FirecrawlWorker


async def test_single_url():
    """Test crawling a single URL."""
    print("=== Testing Firecrawl Single URL ===\n")
    
    worker = FirecrawlWorker()
    
    # Test with a simple documentation page
    test_url = "https://solana.com/docs/core/accounts"
    
    print(f"Crawling: {test_url}")
    documents = await worker.crawl_single_url(test_url)
    
    print(f"\n✓ Crawled {len(documents)} documents")
    
    if documents:
        doc = documents[0]
        print(f"\nFirst document preview:")
        print(f"  URL: {doc['url']}")
        print(f"  Content length: {len(doc['content'])} chars")
        print(f"  Content preview: {doc['content'][:200]}...")
        
        # Test chunking
        print(f"\n=== Testing Document Preparation ===\n")
        prepared = worker.prepare_for_indexing(documents)
        print(f"✓ Prepared {len(prepared)} chunks")
        
        if prepared:
            chunk = prepared[0]
            print(f"\nFirst chunk:")
            print(f"  ID: {chunk['id']}")
            print(f"  Text length: {len(chunk['text'])} chars")
            print(f"  Metadata: {chunk['metadata']}")
    else:
        print("⚠ No documents crawled")


async def test_scrape_mode():
    """Test scrape mode (single page)."""
    print("\n\n=== Testing Scrape Mode ===\n")
    
    worker = FirecrawlWorker()
    worker.mode = "scrape"
    
    test_url = "https://solana.com/docs"
    print(f"Scraping: {test_url}")
    
    documents = await worker.crawl_single_url(test_url)
    
    print(f"✓ Scraped {len(documents)} page(s)")
    
    if documents:
        print(f"  Content length: {len(documents[0]['content'])} chars")


async def main():
    """Run all tests."""
    try:
        await test_single_url()
        await test_scrape_mode()
        
        print("\n\n✅ All tests completed successfully!")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(main())
