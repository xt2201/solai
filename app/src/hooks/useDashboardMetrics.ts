import { useState, useEffect } from "react";

export interface SystemMetrics {
  system: {
    totalImmutableLogs: number;
    activeUsersToday: number;
    averageResponseTimeMs: number;
    uptime: number;
    llmModel: {
      provider: string;
      model: string;
      version: string;
    };
  };
  onChain: {
    averageQueryCostSol: number;
    averageQueryCostUsd: number;
    totalTransactionsLogged: number;
    lastBlockTime: number;
    networkTps: number;
  };
  tokenomics: {
    queryFeeSolAI: number;
    logFeeLamports: number;
    solPrice: number;
  };
}

export const useDashboardMetrics = (apiBaseUrl: string) => {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${apiBaseUrl}/dashboard/metrics`);
        if (!response.ok) {
          throw new Error("Failed to fetch metrics");
        }
        const data = await response.json();
        setMetrics(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 10000); // Refresh every 10s

    return () => clearInterval(interval);
  }, [apiBaseUrl]);

  return { metrics, loading, error };
};
