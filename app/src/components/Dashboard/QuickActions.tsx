import { Button } from "@solai/app/components/ui";
import { Target, TrendingUp, RefreshCw, BarChart3, ShieldCheck, Route } from "lucide-react";

interface QuickActionsProps {
  onPromptSelect: (prompt: string) => void;
}

export const QuickActions = ({ onPromptSelect }: QuickActionsProps) => {
  const quickPrompts = [
    {
      icon: Target,
      title: "Analyze My Portfolio Risk",
      prompt: "Analyze the current risk of my investment portfolio and provide specific recommendations",
      category: "Risk Analysis",
      variant: "danger" as const,
    },
    {
      icon: TrendingUp,
      title: "Optimize Yield Opportunities",
      prompt: "Suggest strategies to optimize yield from SOL and stablecoin assets in my wallet",
      category: "Yield Optimization",
      variant: "primary" as const,
    },
    {
      icon: RefreshCw,
      title: "Explain Solana Gas Fees",
      prompt: "Explain in detail the mechanism of gas fees on Solana and recent changes",
      category: "Education",
      variant: "primary" as const,
    },
    {
      icon: Route,
      title: "Find Best Swap Routes",
      prompt: "Find the best swap routes for me to exchange tokens with the lowest fees",
      category: "Trading",
      variant: "primary" as const,
    },
    {
      icon: BarChart3,
      title: "DeFi Protocol Comparison",
      prompt: "Compare lending protocols on Solana (Kamino, Solend, MarginFi) in terms of APY, risk, and liquidity",
      category: "Research",
      variant: "secondary" as const,
    },
    {
      icon: ShieldCheck,
      title: "Security Best Practices",
      prompt: "Guide best security practices when using DeFi on Solana",
      category: "Security",
      variant: "secondary" as const,
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-1">✨ Quick Actions</h2>
        <p className="text-sm text-[var(--text-secondary)]">
          Choose a prompt to start your analysis journey
        </p>
      </div>

      <div 
        className="grid grid-cols-1 md:grid-cols-2 gap-3"
        role="group"
        aria-label="Quick action prompts"
      >
        {quickPrompts.map((prompt, index) => {
          const Icon = prompt.icon;
          return (
            <Button
              key={index}
              variant={prompt.variant}
              size="lg"
              leftIcon={<Icon className="w-5 h-5" aria-hidden="true" />}
              onClick={() => onPromptSelect(prompt.prompt)}
              className="justify-start h-auto py-4 px-4 group"
              fullWidth
              aria-label={`${prompt.title} - ${prompt.category}`}
              title={prompt.prompt}
            >
              <div className="flex flex-col items-start gap-1 flex-1">
                <span className="font-semibold text-left">{prompt.title}</span>
                <span className="text-xs opacity-70 text-left">{prompt.category}</span>
              </div>
            </Button>
          );
        })}
      </div>
    </div>
  );
};
