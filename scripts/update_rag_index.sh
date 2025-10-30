#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
PROJECT_ROOT=$(cd "$SCRIPT_DIR/.." && pwd)
PROCESSOR_ROOT="$PROJECT_ROOT/llm-processor"

if [ ! -f "$PROCESSOR_ROOT/requirements.txt" ]; then
  echo "requirements.txt missing in llm-processor" >&2
  exit 1
fi

cd "$PROCESSOR_ROOT"
python3 -m venv .rag-env
source .rag-env/bin/activate
pip install -r requirements.txt
python src/data_ingestion/firecrawl_worker.py
