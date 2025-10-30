from __future__ import annotations

from typing import Dict

import httpx
from langchain_google_genai import ChatGoogleGenerativeAI

from ..settings import get_config


class GeminiClient:
    """Fallback client for Google Gemini models."""

    def __init__(self) -> None:
        cfg = get_config()["llm_processor"]["gemini"]
        self._api_key = cfg["api_key"]
        self._model = cfg["model_name"]
        self._temperature = cfg["temperature"]
        self._max_tokens = cfg["max_output_tokens"]

    async def generate(self, prompt: str, context: str) -> Dict[str, str]:
        payload = {
            "contents": [
                {
                    "role": "user",
                    "parts": [
                        {"text": f"Context:\n{context}\n\nUser Prompt:\n{prompt}"}
                    ],
                }
            ],
            "generationConfig": {
                "temperature": self._temperature,
                "maxOutputTokens": self._max_tokens,
            },
        }
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"https://generativelanguage.googleapis.com/v1/models/{self._model}:generateContent",
                params={"key": self._api_key},
                json=payload,
            )
            response.raise_for_status()
            data = response.json()
        text = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
        return {
            "completion": text,
            "id": data.get("id", ""),
        }


class GeminiHandler:
    """Handler for Google Gemini LLM with LangChain support"""
    
    def __init__(self) -> None:
        cfg = get_config()["llm_processor"]["gemini"]
        self._api_key = cfg["api_key"]
        self._model = cfg["model_name"]
        self._temperature = cfg["temperature"]
        self._max_tokens = cfg["max_output_tokens"]
    
    def get_langchain_llm(self) -> ChatGoogleGenerativeAI:
        """
        Get LangChain LLM instance for Google Gemini
        """
        return ChatGoogleGenerativeAI(
            model=self._model,
            google_api_key=self._api_key,
            temperature=self._temperature,
            max_output_tokens=self._max_tokens,
        )
