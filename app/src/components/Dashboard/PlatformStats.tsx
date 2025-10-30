import { useState, useEffect } from 'react';
import { Card } from '@solai/app/components/ui/Card';
import { getPlatformStats, PlatformStatsResponse } from '@solai/app/lib/api-client';
import { Users, Activity, DollarSign, TrendingUp } from 'lucide-react';

interface PlatformStatsProps {
  className?: string;
}

export const PlatformStats = ({ className }: PlatformStatsProps) => {
  const [stats, setStats] = useState<PlatformStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await getPlatformStats();
        setStats(data);
        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const formatCurrency = (num: number): string => {
    if (num >= 1000000000) {
      return `$${(num / 1000000000).toFixed(2)}B`;
    } else if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(2)}M`;
    } else if (num >= 1000) {
      return `$${(num / 1000).toFixed(2)}K`;
    }
    return `$${num.toFixed(2)}`;
  };

  if (loading) {
    return (
      <Card className={className}>
        <div className="p-6">
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">
            Platform Statistics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-28 bg-slate-800 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <div className="p-6">
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">
            Platform Statistics
          </h2>
          <div className="text-center py-8">
            <p className="text-red-400">Failed to load statistics</p>
            <p className="text-sm text-slate-400 mt-1">{error}</p>
          </div>
        </div>
      </Card>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      label: 'Total Users',
      value: formatNumber(stats.total_users),
      icon: Users,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'Total Transactions',
      value: formatNumber(stats.total_transactions),
      icon: Activity,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
    },
    {
      label: 'Total Volume',
      value: formatCurrency(stats.total_volume_usd),
      icon: DollarSign,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
    },
    {
      label: 'Active Users (24h)',
      value: formatNumber(stats.active_users_24h),
      icon: TrendingUp,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
    },
  ];

  return (
    <Card className={className}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">
              Platform Statistics
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Real-time platform metrics
            </p>
          </div>
          {stats.meta?.mock && (
            <div className="px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/30">
              <span className="text-xs text-yellow-400">Mock Data</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="p-4 rounded-lg bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700 hover:border-slate-600 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </div>
                
                <div className="text-3xl font-bold text-white mb-1">
                  {stat.value}
                </div>
                
                <div className="text-sm text-[var(--text-secondary)]">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 text-xs text-[var(--text-secondary)] text-center">
          Last updated: {new Date(stats.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </Card>
  );
};
