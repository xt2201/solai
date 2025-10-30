from __future__ import annotations

import os
from functools import lru_cache
from pathlib import Path
from typing import Any, Dict

import yaml

_ROOT_CONFIG_FALLBACK = Path(__file__).parent.parent.parent / "config.yml"


def _load_raw_config() -> Dict[str, Any]:
    config_path = Path(os.environ.get("SOLAI_CONFIG_PATH", _ROOT_CONFIG_FALLBACK))
    if not config_path.exists():
        raise FileNotFoundError(f"Config file not found at {config_path}")
    with config_path.open("r", encoding="utf-8") as fh:
        data = yaml.safe_load(fh)
    provider = data.get("llm_processor", {}).get("provider")
    if provider not in ("CEREBRAS", "GEMINI"):
        raise ValueError("llm_processor.provider must be either CEREBRAS or GEMINI")
    return data


@lru_cache(maxsize=1)
def get_config() -> Dict[str, Any]:
    return _load_raw_config()
