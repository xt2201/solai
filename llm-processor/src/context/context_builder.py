from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict, List

import httpx

from ..settings import get_config


@dataclass
class WalletContext:
    text_blocks: List[str]
    metadata: Dict[str, Any]


class ContextBuilder:
    """Generate contextual knowledge for a wallet using configured data sources."""

    def __init__(self) -> None:
        self._cfg = get_config()
        self._context_limits = self._cfg["llm_processor"]["context_generation"]
        self._indexer_cfg = self._cfg["api_gateway"].get("indexer", {})

    async def build_wallet_context(self, wallet: str) -> WalletContext:
        blocks: List[str] = []
        metadata: Dict[str, Any] = {}
        if self._indexer_cfg.get("type") == "HELIUS":
            helius_blocks, helius_meta = await self._build_helius_context(wallet)
            blocks.extend(helius_blocks)
            metadata.update({"helius": helius_meta})
        return WalletContext(text_blocks=blocks, metadata=metadata)

    async def _build_helius_context(self, wallet: str) -> tuple[List[str], Dict[str, Any]]:
        api_key = self._indexer_cfg.get("api_key")
        if not api_key or api_key.startswith("${"):  # placeholder guard
            return [], {"reason": "missing_api_key"}
        limit = self._context_limits["max_transaction_history"]
        url = (
            f"https://api.helius.xyz/v0/addresses/{wallet}/transactions"
            f"?api-key={api_key}&limit={limit}"
        )
        try:
            async with httpx.AsyncClient(timeout=20.0) as client:
                response = await client.get(url)
                response.raise_for_status()
                data = response.json()
        except httpx.HTTPError as exc:
            return [], {"reason": "helius_error", "detail": str(exc)}
        transactions = data if isinstance(data, list) else data.get("transactions", [])
        blocks: List[str] = []
        for txn in transactions[:limit]:
            signature = txn.get("signature", "unknown")
            lamports = txn.get("lamportTransfers", [])
            aggregate = sum(item.get("amount", 0) for item in lamports)
            blocks.append(
                f"Signature {signature} transferred {aggregate} lamports across {len(lamports)} accounts"
            )
        return blocks, {"count": len(blocks)}
