from __future__ import annotations

import asyncio
from typing import List

import httpx

from ..settings import get_config


class OllamaEmbeddings:
    """Client for fetching embeddings from remote Ollama endpoint."""

    def __init__(self) -> None:
        cfg = get_config()["llm_processor"]["ollama_embedding"]
        self._base_url = cfg["base_url"].rstrip("/")
        self._model = cfg["model"]

    async def embed_query(self, text: str) -> List[float]:
        """Generate embedding for a single query text."""
        payload = {"model": self._model, "input": text}
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(f"{self._base_url}/api/embed", json=payload)
            response.raise_for_status()
            data = response.json()
        # Ollama returns {"embeddings": [[...]]} - take first element
        embeddings = data.get("embeddings", [[]])
        return embeddings[0] if embeddings else []
    
    async def embed_documents(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings for multiple documents in batch."""
        tasks = [self.embed_query(text) for text in texts]
        embeddings = await asyncio.gather(*tasks)
        return embeddings


# Legacy alias for backward compatibility
class OllamaEmbeddingClient(OllamaEmbeddings):
    """Deprecated: Use OllamaEmbeddings instead."""
    
    async def embed(self, text: str) -> List[float]:
        """Deprecated: Use embed_query instead."""
        return await self.embed_query(text)
