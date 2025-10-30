import { useWalletData } from "@solai/app/hooks/useWalletData";
import { Card, CardHeader, CardTitle, CardContent, Badge, Avatar } from "@solai/app/components/ui";
import { Wallet, TrendingUp, AlertTriangle, PieChart } from "lucide-react";

interface WalletOverviewProps {
  apiBaseUrl: string;
  walletAddress: string | null;
  walletConnected: boolean;
}

export const WalletOverview = ({ apiBaseUrl, walletAddress, walletConnected }: WalletOverviewProps) => {
  const { walletData, loading, error } = useWalletData(apiBaseUrl, walletAddress);

  if (!walletConnected) {
    return (
      <Card padding="lg" variant="elevated">
        <CardHeader>
          <CardTitle>✨ Personal Portfolio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Wallet className="w-16 h-16 text-[var(--text-tertiary)] mb-4" />
            <p className="text-[var(--text-secondary)]">🔌 Connect your wallet to view your portfolio and risk analysis</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading && !walletData) {
    return (
      <Card padding="lg" variant="elevated">
        <CardHeader>
          <CardTitle>✨ Personal Portfolio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-pulse text-[var(--text-secondary)]">Analyzing your wallet...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card padding="lg" variant="elevated">
        <CardHeader>
          <CardTitle>✨ Personal Portfolio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-[var(--color-danger-500)] py-4">Error: {error}</div>
        </CardContent>
      </Card>
    );
  }

  if (!walletData) return null;

  const getRiskColor = (score: number) => {
    if (score < 30) return "success";
    if (score < 60) return "warning";
    return "danger";
  };

  return (
    <Card padding="lg" variant="elevated">
      <CardHeader bordered>
        <CardTitle>✨ Personal Portfolio</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Total Value */}
        <div className="bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-accent-500)] rounded-lg p-6 mb-6 text-white">
          <div className="text-sm opacity-90 mb-2">Total Value</div>
          <div className="text-4xl font-bold mb-1">\${walletData.portfolio.totalValueUsd.toLocaleString()}</div>
          <div className="text-lg opacity-80">{walletData.portfolio.totalValueSol.toFixed(2)} SOL</div>
        </div>

        {/* Asset Breakdown */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5" />
            Asset Allocation
          </h3>
          <div className="space-y-3">
            {walletData.portfolio.breakdown.map((asset, index) => (
              <div key={index} className="bg-[var(--bg-secondary)] rounded-lg p-4 border border-[var(--border-default)]">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Avatar size="sm" fallback={asset.symbol.charAt(0)} />
                    <div>
                      <div className="font-semibold text-[var(--text-primary)]">{asset.symbol}</div>
                      <div className="text-xs text-[var(--text-tertiary)]">
                        {asset.amount.toLocaleString(undefined, { maximumFractionDigits: 2 })} {asset.symbol}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-[var(--text-primary)]">\${asset.valueUsd.toLocaleString()}</div>
                    <Badge 
                      variant={asset.change24h.startsWith("+") ? "success" : "danger"} 
                      size="sm"
                    >
                      {asset.change24h}
                    </Badge>
                  </div>
                </div>
                <div className="relative w-full h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                  <div 
                    className="absolute left-0 top-0 h-full bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-accent-500)] transition-all duration-500"
                    style={{ width: `\${asset.percentage}%` }}
                  />
                </div>
                <div className="text-xs text-[var(--text-tertiary)] mt-1 text-right">
                  {asset.percentage.toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Analysis */}
        <div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Risk Analysis
          </h3>
          <div className="bg-[var(--bg-secondary)] rounded-lg p-6 border border-[var(--border-default)] mb-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm text-[var(--text-secondary)] mb-1">Portfolio Risk Score</div>
                <div className="text-3xl font-bold text-[var(--text-primary)]">
                  {walletData.riskScore.score}/100
                </div>
              </div>
              <Badge 
                variant={getRiskColor(walletData.riskScore.score)} 
                size="lg"
              >
                {walletData.riskScore.level}
              </Badge>
            </div>
            
            {/* Risk Factors */}
            <div className="space-y-3">
              {Object.entries(walletData.riskScore.factors).map(([factor, value]) => (
                <div key={factor}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[var(--text-secondary)]">
                      {factor.replace(/([A-Z])/g, ' \$1').trim()}
                    </span>
                    <span className="font-semibold text-[var(--text-primary)]">{value}</span>
                  </div>
                  <div className="relative w-full h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                    <div 
                      className={`absolute left-0 top-0 h-full transition-all duration-500 \${
                        value < 30 ? 'bg-[var(--color-success-500)]' :
                        value < 60 ? 'bg-[var(--color-warning-500)]' :
                        'bg-[var(--color-danger-500)]'
                      }`}
                      style={{ width: `\${value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Exposure Breakdown */}
          {walletData.riskScore.breakdown && (
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(walletData.riskScore.breakdown).map(([key, value]) => (
                <div key={key} className="bg-[var(--bg-tertiary)] rounded-lg p-3 border border-[var(--border-subtle)]">
                  <div className="text-xs text-[var(--text-secondary)] mb-1">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                  <div className="text-lg font-semibold text-[var(--text-primary)]">{typeof value === 'number' ? value : JSON.stringify(value)}%</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
