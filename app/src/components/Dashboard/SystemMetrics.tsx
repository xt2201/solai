import { useDashboardMetrics } from "@solai/app/hooks/useDashboardMetrics";
import { Card, CardHeader, CardTitle, CardContent, Badge } from "@solai/app/components/ui";
import { Activity, Cpu, DollarSign, Database, Users, Zap } from "lucide-react";

interface SystemMetricsProps {
  apiBaseUrl: string;
  walletConnected: boolean;
  walletAddress: string | null;
}

export const SystemMetrics = ({ apiBaseUrl, walletConnected, walletAddress }: SystemMetricsProps) => {
  const { metrics, loading, error } = useDashboardMetrics(apiBaseUrl);

  if (loading && !metrics) {
    return (
      <Card padding="lg">
        <CardHeader>
          <CardTitle>📊 System & On-Chain Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-pulse text-[var(--text-secondary)]">Loading metrics...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card padding="lg">
        <CardHeader>
          <CardTitle>📊 System & On-Chain Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-[var(--color-danger-500)] py-4">Error: {error}</div>
        </CardContent>
      </Card>
    );
  }

  if (!metrics) return null;

  const formatAddress = (addr: string) => {
    if (addr.length < 8) return addr;
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  };

  return (
    <Card padding="lg" variant="elevated">
      <CardHeader bordered>
        <CardTitle>📊 System & On-Chain Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-[var(--bg-secondary)] rounded-lg p-4 border border-[var(--border-default)] hover:border-[var(--border-focus)] transition-all duration-[var(--duration-normal)]">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-[var(--color-primary-400)]" />
              <div className="text-sm text-[var(--text-secondary)]">Wallet Status</div>
            </div>
            <div className="flex flex-col gap-1">
              {walletConnected ? (
                <>
                  <Badge variant="success" size="sm">● Connected</Badge>
                  <div className="text-xs text-[var(--text-tertiary)] mt-1">{walletAddress && formatAddress(walletAddress)}</div>
                </>
              ) : (
                <Badge variant="default" size="sm">○ Disconnected</Badge>
              )}
            </div>
          </div>

          <div className="bg-[var(--bg-secondary)] rounded-lg p-4 border border-[var(--border-default)] hover:border-[var(--border-focus)] transition-all duration-[var(--duration-normal)]">
            <div className="flex items-center gap-2 mb-2">
              <Cpu className="w-4 h-4 text-[var(--color-accent-400)]" />
              <div className="text-sm text-[var(--text-secondary)]">LLM Model</div>
            </div>
            <div className="text-base font-semibold text-[var(--text-primary)]">{metrics.system.llmModel.model}</div>
            <div className="text-xs text-[var(--text-tertiary)]">{metrics.system.llmModel.provider}</div>
          </div>

          <div className="bg-[var(--bg-secondary)] rounded-lg p-4 border border-[var(--border-default)] hover:border-[var(--border-focus)] transition-all duration-[var(--duration-normal)]">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-[var(--color-success-400)]" />
              <div className="text-sm text-[var(--text-secondary)]">Avg Query Cost</div>
            </div>
            <div className="text-base font-semibold text-[var(--text-primary)]">{metrics.onChain.averageQueryCostSol.toFixed(6)} SOL</div>
            <div className="text-xs text-[var(--text-tertiary)]">≈ \${metrics.onChain.averageQueryCostUsd.toFixed(6)}</div>
            <Badge variant="info" size="sm" className="mt-2">🚀 Ultra-low</Badge>
          </div>

          <div className="bg-[var(--bg-secondary)] rounded-lg p-4 border border-[var(--border-default)] hover:border-[var(--border-focus)] transition-all duration-[var(--duration-normal)]">
            <div className="flex items-center gap-2 mb-2">
              <Database className="w-4 h-4 text-[var(--color-warning-400)]" />
              <div className="text-sm text-[var(--text-secondary)]">Total Logs</div>
            </div>
            <div className="text-2xl font-bold text-[var(--text-primary)]">{metrics.system.totalImmutableLogs.toLocaleString()}</div>
            <div className="text-xs text-[var(--text-tertiary)]">Auditable on-chain</div>
          </div>

          <div className="bg-[var(--bg-secondary)] rounded-lg p-4 border border-[var(--border-default)] hover:border-[var(--border-focus)] transition-all duration-[var(--duration-normal)]">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-[var(--color-primary-400)]" />
              <div className="text-sm text-[var(--text-secondary)]">Active Users (24h)</div>
            </div>
            <div className="text-2xl font-bold text-[var(--text-primary)]">{metrics.system.activeUsersToday.toLocaleString()}</div>
          </div>

          <div className="bg-[var(--bg-secondary)] rounded-lg p-4 border border-[var(--border-default)] hover:border-[var(--border-focus)] transition-all duration-[var(--duration-normal)]">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-[var(--color-accent-400)]" />
              <div className="text-sm text-[var(--text-secondary)]">Solana TPS</div>
            </div>
            <div className="text-2xl font-bold text-[var(--text-primary)]">{metrics.onChain.networkTps.toLocaleString()}</div>
            <div className="text-xs text-[var(--text-tertiary)]">transactions/second</div>
          </div>

          <div className="bg-[var(--bg-secondary)] rounded-lg p-4 border border-[var(--border-default)] hover:border-[var(--border-focus)] transition-all duration-[var(--duration-normal)]">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-[var(--color-success-400)]" />
              <div className="text-sm text-[var(--text-secondary)]">Avg Response</div>
            </div>
            <div className="text-2xl font-bold text-[var(--text-primary)]">{metrics.system.averageResponseTimeMs}ms</div>
          </div>

          <div className="bg-[var(--bg-secondary)] rounded-lg p-4 border border-[var(--border-default)] hover:border-[var(--border-focus)] transition-all duration-[var(--duration-normal)]">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-[var(--color-success-400)]" />
              <div className="text-sm text-[var(--text-secondary)]">System Uptime</div>
            </div>
            <div className="text-2xl font-bold text-[var(--color-success-500)]">{metrics.system.uptime}%</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 justify-center p-4 bg-[var(--bg-tertiary)] rounded-lg border border-[var(--border-subtle)]">
          <div className="flex items-center gap-2">
            <span className="text-sm text-[var(--text-secondary)]">Query Fee:</span>
            <Badge variant="info" size="md">{metrics.tokenomics.queryFeeSolAI} SOLAI</Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-[var(--text-secondary)]">Log Fee:</span>
            <Badge variant="info" size="md">{metrics.tokenomics.logFeeLamports} lamports</Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-[var(--text-secondary)]">SOL Price:</span>
            <Badge variant="success" size="md">\${metrics.tokenomics.solPrice.toFixed(2)}</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
