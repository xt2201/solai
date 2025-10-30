import { useState, useEffect } from "react";

export interface MarketData {
  sentiment: {
    overall: "BULLISH" | "NEUTRAL" | "BEARISH";
    score: number;
    indicator: string;
    description: string;
    lastUpdated: number;
  };
  volatility: {
    risk: "LOW" | "MODERATE" | "HIGH";
    score: number;
    prediction24h: string;
    vix: number;
  };
  hotTopics: Array<{
    category: string;
    count: number;
    trend: "up" | "down" | "stable";
    change: string;
    protocols: string[];
  }>;
  ecosystem: {
    totalTvl: string;
    tvlChange24h: string;
    activeWallets24h: string;
    transactions24h: string;
  };
}

export const useMarketData = (apiBaseUrl: string) => {
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${apiBaseUrl}/dashboard/market`);
        if (!response.ok) {
          throw new Error("Failed to fetch market data");
        }
        const data = await response.json();
        setMarketData(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchMarketData();
    const interval = setInterval(fetchMarketData, 60000); // Refresh every 60s

    return () => clearInterval(interval);
  }, [apiBaseUrl]);

  return { marketData, loading, error };
};
