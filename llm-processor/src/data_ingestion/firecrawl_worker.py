from __future__ import annotations

import asyncio
import logging
from typing import Any, Dict, List

from firecrawl import FirecrawlApp

from ..settings import get_config

logger = logging.getLogger(__name__)


class FirecrawlWorker:
    """Worker to crawl documentation sites and prepare for RAG indexing."""

    def __init__(self) -> None:
        cfg = get_config()["llm_processor"]["firecrawl"]
        self.api_key = cfg["api_key"]
        self.mode = cfg["mode"]
        self.max_depth = cfg["max_crawl_depth"]
        self.source_urls = cfg["source_urls"]
        self.app = FirecrawlApp(api_key=self.api_key)

    async def crawl_single_url(self, url: str) -> List[Dict[str, Any]]:
        """
        Crawl a single URL and return the documents.
        
        Args:
            url: The URL to crawl
            
        Returns:
            List of document dictionaries with 'content' and 'metadata'
        """
        try:
            logger.info(f"Crawling URL: {url}")
            
            # Use scrape for single page or crawl for multi-page
            if self.mode == "scrape":
                # Scrape single page (v2 API returns object, not dict)
                result = self.app.scrape(
                    url,
                    formats=['markdown', 'html']
                )
                
                # Convert result object to dict
                if result:
                    doc = {
                        'markdown': getattr(result, 'markdown', ''),
                        'html': getattr(result, 'html', ''),
                        'content': getattr(result, 'markdown', ''),  # Use markdown as content
                        'metadata': getattr(result, 'metadata', {}),
                        'url': url
                    }
                    documents = [doc]
                else:
                    documents = []
            else:
                # Crawl multiple pages with depth (v2 API)
                from firecrawl.types import ScrapeOptions
                
                crawl_result = self.app.crawl(
                    url,
                    limit=50,  # Max pages to crawl
                    scrape_options=ScrapeOptions(formats=['markdown', 'html'])
                )
                
                # Handle CrawlJob object - wait for completion
                if crawl_result:
                    # If it's a CrawlJob, get the data
                    if hasattr(crawl_result, 'data'):
                        raw_docs = crawl_result.data
                    else:
                        # Fallback: try to get data attribute
                        raw_docs = getattr(crawl_result, 'data', [])
                    
                    # Convert each document object to dict
                    documents = []
                    for doc in raw_docs:
                        documents.append({
                            'markdown': getattr(doc, 'markdown', ''),
                            'html': getattr(doc, 'html', ''),
                            'content': getattr(doc, 'markdown', ''),
                            'metadata': getattr(doc, 'metadata', {}),
                            'url': getattr(doc, 'url', url)
                        })
                else:
                    documents = []
            
            logger.info(f"Successfully crawled {len(documents)} document(s) from {url}")
            return documents
            
        except Exception as e:
            logger.error(f"Error crawling {url}: {e}")
            return []

    async def crawl_all_sources(self) -> List[Dict[str, Any]]:
        """Crawl all configured source URLs."""
        all_documents = []
        
        for url in self.source_urls:
            docs = await self.crawl_single_url(url)
            all_documents.extend(docs)
            # Rate limiting - wait between crawls
            await asyncio.sleep(2)
        
        logger.info(f"Total documents crawled: {len(all_documents)}")
        return all_documents

    def prepare_for_indexing(self, documents: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Prepare documents for vector store indexing.
        
        Chunks large documents and adds metadata.
        """
        prepared_docs = []
        
        for doc in documents:
            content = doc['content']
            
            # Simple chunking by paragraphs (can be improved with langchain text splitter)
            chunks = [p.strip() for p in content.split('\n\n') if len(p.strip()) > 50]
            
            for i, chunk in enumerate(chunks):
                prepared_docs.append({
                    'id': f"{doc['url']}#chunk-{i}",
                    'text': chunk,
                    'metadata': {
                        'source_url': doc['url'],
                        'chunk_index': i,
                        'total_chunks': len(chunks),
                        **doc.get('metadata', {})
                    }
                })
        
        logger.info(f"Prepared {len(prepared_docs)} chunks from {len(documents)} documents")
        return prepared_docs


async def main() -> None:
    """Main entry point for crawling operation."""
    worker = FirecrawlWorker()
    
    # Crawl all sources
    documents = await worker.crawl_all_sources()
    
    if not documents:
        logger.warning("No documents crawled!")
        return
    
    # Prepare for indexing
    prepared = worker.prepare_for_indexing(documents)
    
    logger.info(f"Ready to index {len(prepared)} chunks")
    logger.info("To index these documents, use the RAG vector store upsert method")
    
    # TODO: Integrate with vector_store.py to actually index
    # Example:
    # from ..rag.vector_store import PineconeVectorStore
    # vector_store = PineconeVectorStore()
    # await vector_store.upsert_documents(prepared)


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    asyncio.run(main())
