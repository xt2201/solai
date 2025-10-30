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
      prompt: "Phân tích rủi ro danh mục đầu tư hiện tại của tôi và đưa ra các khuyến nghị cụ thể",
      category: "Risk Analysis",
      variant: "danger" as const,
    },
    {
      icon: TrendingUp,
      title: "Optimize Yield Opportunities",
      prompt: "Đề xuất các chiến lược tối ưu hóa lợi nhuận (yield) từ tài sản SOL và stablecoin trong ví của tôi",
      category: "Yield Optimization",
      variant: "primary" as const,
    },
    {
      icon: RefreshCw,
      title: "Explain Solana Gas Fees",
      prompt: "Giải thích chi tiết về cơ chế phí giao dịch (gas fees) trên Solana và các thay đổi gần đây",
      category: "Education",
      variant: "primary" as const,
    },
    {
      icon: Route,
      title: "Find Best Swap Routes",
      prompt: "Tìm các đường dẫn swap tốt nhất cho tôi để trao đổi token với phí thấp nhất",
      category: "Trading",
      variant: "primary" as const,
    },
    {
      icon: BarChart3,
      title: "DeFi Protocol Comparison",
      prompt: "So sánh các lending protocol trên Solana (Kamino, Solend, MarginFi) về APY, rủi ro và thanh khoản",
      category: "Research",
      variant: "secondary" as const,
    },
    {
      icon: ShieldCheck,
      title: "Security Best Practices",
      prompt: "Hướng dẫn các biện pháp bảo mật tốt nhất khi sử dụng DeFi trên Solana",
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
