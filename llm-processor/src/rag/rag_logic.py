from __future__ import annotations

from typing import TYPE_CHECKING, Any, Dict, List, Tuple

if TYPE_CHECKING:
    from langsmith import Client as LangsmithClient

from ..settings import get_config
from .embeddings import OllamaEmbeddings
from .vector_store import PineconeVectorStore


class RagEngine:
    """RAG pipeline orchestrator for SolAI MVP."""

    def __init__(self) -> None:
        cfg = get_config()
        rag_cfg = cfg["llm_processor"]["rag"]
        self._enabled = rag_cfg.get("enabled", False)
        self._embedding_client = OllamaEmbeddings() if self._enabled else None
        self._vector_store = PineconeVectorStore() if self._enabled else None
        langsmith_cfg = cfg["global"]["langsmith"]
        self._langsmith: Any = None
        if langsmith_cfg.get("enabled"):
            try:
                from langsmith import Client as LangsmithClient
                self._langsmith = LangsmithClient(
                    api_key=langsmith_cfg["api_key"],
                    api_url=langsmith_cfg["endpoint"],
                )
                self._project = langsmith_cfg["project_name"]
            except Exception:
                # LangSmith import failed (Pydantic v1/v2 conflict), disable tracing
                self._langsmith = None
                self._project = None
        else:
            self._project = None

    async def retrieve_context(self, prompt: str) -> Tuple[List[str], Dict[str, float]]:
        if not self._enabled or not self._embedding_client or not self._vector_store:
            return [], {}
        embedding = await self._embedding_client.embed_query(prompt)
        documents = self._vector_store.similarity_search(embedding)
        scores = {doc.get("id", f"doc-{idx}"): doc.get("score", 0.0) for idx, doc in enumerate(documents)}
        return [doc.get("text", doc.get("content", "")) for doc in documents], scores

    def trace(self, prompt: str, context: List[str]) -> None:
        if not self._langsmith:
            return
        metadata = {"prompt": prompt, "context_count": len(context)}
        self._langsmith.create_run(
            name="rag-context",
            run_type="tool",
            inputs=metadata,
            project_name=self._project,
        )
