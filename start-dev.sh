#!/bin/bash

# SolAI Development Startup Script
# This script helps start all services in separate terminal windows

echo "🚀 Starting SolAI Development Environment..."
echo ""
echo "⚠️  Make sure you have configured API keys in config.yml"
echo ""

# Check if tmux is installed
if ! command -v tmux &> /dev/null; then
    echo "❌ tmux is not installed. Please install it first:"
    echo "   sudo apt-get install tmux"
    exit 1
fi

# Create a new tmux session
SESSION="solai-dev"

# Kill existing session if it exists
tmux kill-session -t $SESSION 2>/dev/null

# Create new session and windows
tmux new-session -d -s $SESSION -n "api-gateway"

# Window 0: API Gateway
tmux send-keys -t $SESSION:0 "cd /home/thanhnx/solai/api-gateway && npm run dev" C-m

# Window 1: LLM Processor
tmux new-window -t $SESSION:1 -n "llm-processor"
tmux send-keys -t $SESSION:1 "cd /home/thanhnx/solai/llm-processor && uvicorn src.main:app --reload --port 8001" C-m

# Window 2: Next.js App
tmux new-window -t $SESSION:2 -n "nextjs-app"
tmux send-keys -t $SESSION:2 "cd /home/thanhnx/solai/app && npm run dev" C-m

# Window 3: Ollama (optional)
tmux new-window -t $SESSION:3 -n "ollama"
tmux send-keys -t $SESSION:3 "echo 'Start Ollama manually: ollama serve && ollama pull bge-m3'" C-m

echo "✅ Development environment started in tmux session: $SESSION"
echo ""
echo "To attach to the session: tmux attach -t $SESSION"
echo "To switch between windows: Ctrl+b then number (0-3)"
echo "To detach from session: Ctrl+b then d"
echo "To kill all services: tmux kill-session -t $SESSION"
echo ""
echo "📝 Windows:"
echo "  0: API Gateway (port 3001)"
echo "  1: LLM Processor (port 8001)"
echo "  2: Next.js App (port 3000)"
echo "  3: Ollama commands"
echo ""
echo "Attaching to session..."
sleep 2
tmux attach -t $SESSION
