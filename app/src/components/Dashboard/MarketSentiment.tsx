import { useMarketData } from "@solai/app/hooks/useMarketData";
import { Card, CardHeader, CardTitle, CardContent, Badge } from "@solai/app/components/ui";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";

interface MarketSentimentProps {
  apiBaseUrl: string;
}

export const MarketSentiment = ({ apiBaseUrl }: MarketSentimentProps) => {
  const { marketData, loading, error } = useMarketData(apiBaseUrl);

  if (loading && !marketData) {
    return (
      <Card padding="lg">
        <CardHeader>
          <CardTitle>🔍 Solana Market Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-pulse text-[var(--text-secondary)]">Loading market data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card padding="lg">
        <CardHeader>
          <CardTitle>🔍 Solana Market Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-[var(--color-danger-500)] py-4">Error: {error}</div>
        </CardContent>
      </Card>
    );
  }

  if (!marketData) return null;

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "BULLISH":
        return "var(--color-success-500)";
      case "BEARISH":
        return "var(--color-danger-500)";
      default:
        return "var(--color-warning-500)";
    }
  };

  const getTrendIcon = (trend: string) => {
    if (trend === "up") return <TrendingUp className="w-4 h-4" aria-label="Trending up" />;
    if (trend === "down") return <TrendingDown className="w-4 h-4" aria-label="Trending down" />;
    return <Activity className="w-4 h-4" aria-label="Stable" />;
  };

  return (
    <Card padding="lg" variant="elevated">
      <CardHeader bordered>
        <CardTitle>🔍 Solana Market Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Sentiment Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-[var(--bg-secondary)] rounded-lg p-6 border border-[var(--border-default)]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-4xl">{marketData.sentiment.indicator}</span>
              <Badge 
                variant={marketData.sentiment.overall === "BULLISH" ? "success" : marketData.sentiment.overall === "BEARISH" ? "danger" : "warning"}
                size="lg"
              >
                {marketData.sentiment.overall}
              </Badge>
            </div>
            <div className="text-3xl font-bold text-[var(--text-primary)] mb-2">
              {marketData.sentiment.score}/100
            </div>
            <p className="text-sm text-[var(--text-secondary)]">{marketData.sentiment.description}</p>
          </div>

          <div className="bg-[var(--bg-secondary)] rounded-lg p-6 border border-[var(--border-default)]">
            <div className="mb-3">
              <span className="text-sm text-[var(--text-secondary)]">Volatility Risk:</span>
              <Badge variant="warning" size="md" className="ml-2">{marketData.volatility.risk}</Badge>
            </div>
            <p className="text-sm text-[var(--text-primary)] mb-2">{marketData.volatility.prediction24h}</p>
            <div className="text-xs text-[var(--text-tertiary)]">VIX: {marketData.volatility.vix}</div>
          </div>
        </div>

        {/* Hot Topics */}
        <div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">🔥 Top 3 DeFi Hot Topics (24h)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {marketData.hotTopics.map((topic, index) => (
              <div 
                key={index} 
                className="bg-[var(--bg-secondary)] rounded-lg p-4 border border-[var(--border-default)] hover:border-[var(--border-focus)] transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="info" size="sm">#{index + 1}</Badge>
                  <span className="text-lg font-bold text-[var(--text-primary)]">{topic.category}</span>
                  <div className="flex items-center gap-1 text-[var(--text-secondary)]">
                    {getTrendIcon(topic.trend)}
                    <span className="text-sm">{topic.change}</span>
                  </div>
                </div>
                <div className="text-sm text-[var(--text-secondary)] mb-2">
                  {topic.count.toLocaleString()} queries
                </div>
                <div className="flex flex-wrap gap-1">
                  {topic.protocols.map((protocol, i) => (
                    <Badge key={i} variant="default" size="sm">{protocol}</Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ecosystem Stats */}
        <div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">📈 Ecosystem Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[var(--bg-tertiary)] rounded-lg p-4 border border-[var(--border-subtle)]">
              <div className="text-sm text-[var(--text-secondary)] mb-1">Total TVL</div>
              <div className="text-2xl font-bold text-[var(--text-primary)] mb-1">
                {marketData.ecosystem.totalTvl}
              </div>
              <Badge variant="success" size="sm">{marketData.ecosystem.tvlChange24h}</Badge>
            </div>
            <div className="bg-[var(--bg-tertiary)] rounded-lg p-4 border border-[var(--border-subtle)]">
              <div className="text-sm text-[var(--text-secondary)] mb-1">Active Wallets (24h)</div>
              <div className="text-2xl font-bold text-[var(--text-primary)]">
                {marketData.ecosystem.activeWallets24h}
              </div>
            </div>
            <div className="bg-[var(--bg-tertiary)] rounded-lg p-4 border border-[var(--border-subtle)]">
              <div className="text-sm text-[var(--text-secondary)] mb-1">Transactions (24h)</div>
              <div className="text-2xl font-bold text-[var(--text-primary)]">
                {marketData.ecosystem.transactions24h}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
