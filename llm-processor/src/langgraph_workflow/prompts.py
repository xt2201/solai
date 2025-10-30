"""
Prompt loaders - Read .md files from prompts directory
"""

import os
from pathlib import Path
from typing import Dict


# Get prompts directory path
PROMPTS_DIR = Path(__file__).parent.parent.parent / "prompts"


def load_prompt(filename: str) -> str:
    """
    Load a prompt template from the prompts directory
    
    Args:
        filename: Name of the .md file (e.g., "intent_detection.md")
        
    Returns:
        The prompt template as a string
    """
    filepath = PROMPTS_DIR / filename
    
    if not filepath.exists():
        raise FileNotFoundError(f"Prompt file not found: {filepath}")
    
    with open(filepath, "r", encoding="utf-8") as f:
        return f.read()


# Cache prompts for performance
_prompt_cache: Dict[str, str] = {}


def get_prompt(name: str) -> str:
    """
    Get a cached prompt template
    
    Args:
        name: Name of the prompt (e.g., "intent_detection")
        
    Returns:
        The prompt template string
    """
    filename = f"{name}.md"
    
    if filename not in _prompt_cache:
        _prompt_cache[filename] = load_prompt(filename)
    
    return _prompt_cache[filename]


# Pre-load all prompts
INTENT_DETECTION_PROMPT = get_prompt("intent_detection")
CHAT_RESPONSE_PROMPT = get_prompt("chat_response")
RAG_SYNTHESIS_PROMPT = get_prompt("rag_synthesis")
WEB_CRAWL_SYNTHESIS_PROMPT = get_prompt("web_crawl_synthesis")
FINAL_OUTPUT_PROMPT = get_prompt("final_output")
