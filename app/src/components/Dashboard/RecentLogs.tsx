import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, Badge } from "@solai/app/components/ui";
import { ExternalLink, Clock, User, DollarSign } from "lucide-react";

interface RecentLog {
  timestamp: number;
  txHash: string;
  explorerUrl: string;
  userWallet: string;
  summary: string;
  promptHash: string;
  responseHash: string;
  feePaid: number;
}

interface RecentLogsProps {
  apiBaseUrl: string;
}

export const RecentLogs = ({ apiBaseUrl }: RecentLogsProps) => {
  const [logs, setLogs] = useState<RecentLog[]>([]);
  const [stats, setStats] = useState({ total: 0, last24h: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${apiBaseUrl}/api/dashboard/recent-logs`);
        if (!response.ok) {
          throw new Error("Failed to fetch logs");
        }
        const data = await response.json();
        setLogs(data.logs);
        setStats({ total: data.total, last24h: data.last24h });
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
    const interval = setInterval(fetchLogs, 15000);

    return () => clearInterval(interval);
  }, [apiBaseUrl]);

  const formatTimestamp = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `\${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `\${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `\${hours}h ago`;
  };

  const formatAddress = (addr: string) => {
    if (addr.length < 8) return addr;
    return `\${addr.slice(0, 4)}...\${addr.slice(-4)}`;
  };

  if (loading && logs.length === 0) {
    return (
      <Card padding="lg" variant="elevated">
        <CardHeader>
          <CardTitle>🔐 Immutable Proof - Recent Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-pulse text-[var(--text-secondary)]">Loading recent transactions...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card padding="lg" variant="elevated">
        <CardHeader>
          <CardTitle>🔐 Immutable Proof - Recent Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-[var(--color-danger-500)] py-4">Error: {error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card padding="lg" variant="elevated">
      <CardHeader bordered>
        <div className="flex items-center justify-between">
          <CardTitle>🔐 Immutable Proof - Recent Logs</CardTitle>
          <div className="flex gap-4">
            <div className="text-right">
              <div className="text-xs text-[var(--text-tertiary)]">Total Logged</div>
              <div className="text-lg font-bold text-[var(--text-primary)]">{stats.total.toLocaleString()}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-[var(--text-tertiary)]">Last 24h</div>
              <div className="text-lg font-bold text-[var(--color-primary-500)]">{stats.last24h.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {logs.map((log, index) => (
            <div 
              key={index} 
              className="bg-[var(--bg-secondary)] rounded-lg p-4 border border-[var(--border-default)] hover:border-[var(--border-focus)] transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex items-center gap-2 text-sm text-[var(--text-tertiary)]">
                    <Clock className="w-4 h-4" />
                    {formatTimestamp(log.timestamp)}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-[var(--text-tertiary)]" />
                    <Badge variant="default" size="sm">{formatAddress(log.userWallet)}</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-[var(--color-warning-400)]" />
                  <Badge variant="warning" size="sm">{log.feePaid} SOLAI</Badge>
                </div>
              </div>

              <p className="text-sm text-[var(--text-primary)] mb-3">{log.summary}</p>

              <div className="flex flex-wrap gap-2 mb-3">
                <div className="text-xs">
                  <span className="text-[var(--text-tertiary)]">Prompt: </span>
                  <code className="bg-[var(--bg-tertiary)] px-2 py-1 rounded text-[var(--color-accent-400)]">
                    {log.promptHash}
                  </code>
                </div>
                <div className="text-xs">
                  <span className="text-[var(--text-tertiary)]">Response: </span>
                  <code className="bg-[var(--bg-tertiary)] px-2 py-1 rounded text-[var(--color-accent-400)]">
                    {log.responseHash}
                  </code>
                </div>
              </div>

              <a
                href={log.explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-[var(--color-primary-400)] hover:text-[var(--color-primary-300)] transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                View on Solana Explorer
              </a>
            </div>
          ))}
        </div>

        {logs.length === 0 && !loading && (
          <div className="text-center py-12 text-[var(--text-secondary)]">
            No recent logs available
          </div>
        )}
      </CardContent>
    </Card>
  );
};
