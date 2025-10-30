import { useState, useEffect } from "react";

export interface WalletData {
  address: string;
  portfolio: {
    totalValueUsd: number;
    totalValueSol: number;
    lastUpdated: number;
    breakdown: Array<{
      token: string;
      symbol: string;
      amount: number;
      valueUsd: number;
      percentage: number;
      change24h: string;
    }>;
  };
  riskScore: {
    score: number;
    level: "CONSERVATIVE" | "MODERATE" | "AGGRESSIVE";
    factors: {
      diversification: number;
      volatilityExposure: number;
      liquidityRisk: number;
      protocolRisk: number;
      concentrationRisk: number;
    };
    breakdown: {
      staked: { percentage: number; protocols: string[]; risk: string };
      lending: { percentage: number; protocols: string[]; risk: string };
      liquidity: { percentage: number; protocols: string[]; risk: string };
      spot: { percentage: number; risk: string };
    };
  };
  recentActivity: {
    transactions24h: number;
    lastTransaction: number;
    topProtocols: string[];
  };
  recommendations: Array<{
    type: string;
    priority: "LOW" | "MEDIUM" | "HIGH";
    message: string;
  }>;
}

export const useWalletData = (apiBaseUrl: string, walletAddress: string | null) => {
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!walletAddress) {
      setWalletData(null);
      setLoading(false);
      return;
    }

    const fetchWalletData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${apiBaseUrl}/dashboard/wallet/${walletAddress}`);
        if (!response.ok) {
          throw new Error("Failed to fetch wallet data");
        }
        const data = await response.json();
        setWalletData(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchWalletData();
    const interval = setInterval(fetchWalletData, 30000); // Refresh every 30s

    return () => clearInterval(interval);
  }, [apiBaseUrl, walletAddress]);

  return { walletData, loading, error };
};
