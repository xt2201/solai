from __future__ import annotations

import hashlib
from typing import Any, Dict, List, Sequence

from pinecone import Pinecone

from ..settings import get_config


class PineconeVectorStore:
    """Thin wrapper around Pinecone similarity search."""

    def __init__(self) -> None:
        cfg = get_config()["llm_processor"]["rag"]["vector_db"]
        self._index_name = cfg["index_name"]
        self._top_k = cfg["top_k_results"]
        self._client = Pinecone(api_key=cfg["api_key"], environment=cfg["environment"])
        self._index = self._client.Index(self._index_name)

    def similarity_search(self, embedding: Sequence[float]) -> List[dict]:
        """Retrieve top documents by vector similarity."""
        results = self._index.query(vector=embedding, top_k=self._top_k, include_metadata=True)
        payload: List[dict] = []
        for match in results.matches:
            metadata = match.metadata or {}
            metadata["score"] = getattr(match, "score", 0.0)
            payload.append(metadata)
        return payload

    async def upsert_documents(
        self,
        documents: List[Dict[str, Any]],
        embeddings: List[List[float]]
    ) -> Dict[str, int]:
        """
        Upsert documents with their embeddings into Pinecone.
        
        Args:
            documents: List of dicts with 'id', 'text', and 'metadata'
            embeddings: List of embedding vectors (same order as documents)
            
        Returns:
            Dict with upsert statistics
        """
        if len(documents) != len(embeddings):
            raise ValueError(f"Mismatch: {len(documents)} docs vs {len(embeddings)} embeddings")
        
        vectors = []
        for doc, embedding in zip(documents, embeddings):
            # Generate stable ID from content if not provided
            doc_id = doc.get('id') or hashlib.md5(doc['text'].encode()).hexdigest()
            
            vectors.append({
                'id': doc_id,
                'values': embedding,
                'metadata': {
                    'text': doc['text'][:1000],  # Pinecone metadata size limit
                    **doc.get('metadata', {})
                }
            })
        
        # Batch upsert (Pinecone supports up to 100 vectors per request)
        batch_size = 100
        upserted_count = 0
        
        for i in range(0, len(vectors), batch_size):
            batch = vectors[i:i + batch_size]
            self._index.upsert(vectors=batch)
            upserted_count += len(batch)
        
        return {
            'upserted': upserted_count,
            'total': len(documents)
        }

    def delete_by_source(self, source_url: str) -> None:
        """Delete all documents from a specific source URL."""
        # Pinecone supports filtering by metadata
        self._index.delete(
            filter={'source_url': {'$eq': source_url}}
        )
