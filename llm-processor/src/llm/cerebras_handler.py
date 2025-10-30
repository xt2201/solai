from __future__ import annotations

from typing import Dict

import httpx
from langchain_openai import ChatOpenAI

from ..settings import get_config


class CerebrasClient:
    """Asynchronous HTTP client for Cerebras inference API."""

    def __init__(self) -> None:
        cfg = get_config()["llm_processor"]["cerebras"]
        self._api_key = cfg["api_key"]
        self._model_name = cfg["model_name"]
        self._endpoint = cfg["endpoint_url"].rstrip("/")

    async def generate(self, prompt: str, context: str) -> Dict[str, str]:
        payload = {
            "model": self._model_name,
            "messages": [
                {
                    "role": "user",
                    "content": f"Context:\n{context}\n\nUser Prompt:\n{prompt}"
                }
            ],
            "max_tokens": 512,
        }
        headers = {
            "Authorization": f"Bearer {self._api_key}",
            "Content-Type": "application/json"
        }
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{self._endpoint}/chat/completions",
                json=payload,
                headers=headers
            )
            response.raise_for_status()
            data = response.json()
        return {
            "completion": data.get("choices", [{}])[0].get("message", {}).get("content", ""),
            "id": data.get("id", ""),
        }


class CerebrasHandler:
    """Handler for Cerebras LLM with LangChain support"""
    
    def __init__(self) -> None:
        cfg = get_config()["llm_processor"]["cerebras"]
        self._api_key = cfg["api_key"]
        self._model_name = cfg["model_name"]
        self._endpoint = cfg["endpoint_url"].rstrip("/")
    
    def get_langchain_llm(self) -> ChatOpenAI:
        """
        Get LangChain LLM instance for Cerebras (OpenAI-compatible)
        """
        return ChatOpenAI(
            model=self._model_name,
            api_key=self._api_key,
            base_url=f"{self._endpoint}",
            temperature=0.2,
            max_tokens=2048,  # Increased from 512 to 2048 for LangGraph structured outputs
        )
