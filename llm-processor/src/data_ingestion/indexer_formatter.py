from __future__ import annotations

from typing import Any, Dict, List


def format_transactions(records: List[Dict[str, Any]]) -> str:
    """Format raw indexer records into readable text paragraphs."""
    lines = []
    for record in records:
        signature = record.get("signature", "unknown")
        amount = record.get("amount", 0)
        lines.append(f"Signature {signature} amount {amount}")
    return "\n".join(lines)
