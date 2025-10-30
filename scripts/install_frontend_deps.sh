#!/bin/bash

# SOLAI Frontend Refactoring - Install Dependencies Script
# This script installs all required packages for the new design system

echo "🚀 Installing Frontend Dependencies for SolAI DeFi Copilot..."
echo ""

cd app

echo "📦 Installing UI & Icon Libraries..."
npm install lucide-react

echo "📦 Installing Radix UI Components (Accessible primitives)..."
npm install @radix-ui/react-dropdown-menu @radix-ui/react-tooltip @radix-ui/react-dialog @radix-ui/react-accordion

echo "📦 Installing Utility Libraries..."
npm install clsx class-variance-authority tailwind-merge

echo "✅ All dependencies installed successfully!"
echo ""
echo "🎨 Design System is ready to use!"
echo ""
echo "Next steps:"
echo "1. Run 'npm run dev' to start the development server"
echo "2. Check FRONTEND_REFACTOR_PROGRESS.md for implementation status"
echo "3. Review FRONTEND_DESIGN_PROPOSAL.md for design guidelines"
