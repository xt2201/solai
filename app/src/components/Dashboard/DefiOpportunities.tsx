import { useState, useEffect } from 'react';
import { Card } from '@solai/app/components/ui/Card';
import { getDefiOpportunities, DefiOpportunity } from '@solai/app/lib/api-client';
import { TrendingUp, Droplet, Coins, Zap } from 'lucide-react';

interface DefiOpportunitiesProps {
  className?: string;
}

export const DefiOpportunities = ({ className }: DefiOpportunitiesProps) => {
  const [opportunities, setOpportunities] = useState<DefiOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        setLoading(true);
        const data = await getDefiOpportunities();
        setOpportunities(data.opportunities);
        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOpportunities();
    const interval = setInterval(fetchOpportunities, 60000); // Refresh every minute

    return () => clearInterval(interval);
  }, []);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'yield_farming':
        return <TrendingUp className="w-5 h-5" />;
      case 'lending':
        return <Coins className="w-5 h-5" />;
      case 'staking':
        return <Zap className="w-5 h-5" />;
      case 'liquidity_pool':
        return <Droplet className="w-5 h-5" />;
      default:
        return <TrendingUp className="w-5 h-5" />;
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'text-green-400';
      case 'medium':
        return 'text-yellow-400';
      case 'high':
        return 'text-red-400';
      default:
        return 'text-slate-400';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'yield_farming':
        return 'Yield Farming';
      case 'lending':
        return 'Lending';
      case 'staking':
        return 'Staking';
      case 'liquidity_pool':
        return 'Liquidity Pool';
      default:
        return type;
    }
  };

  return (
    <Card className={className}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">
              DeFi Opportunities
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Top earning opportunities in Solana DeFi
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live
          </div>
        </div>

        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-24 bg-slate-800 rounded-lg" />
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <p className="text-red-400">Failed to load opportunities</p>
            <p className="text-sm text-slate-400 mt-1">{error}</p>
          </div>
        )}

        {!loading && !error && opportunities.length === 0 && (
          <div className="text-center py-8 text-slate-400">
            No opportunities available at the moment
          </div>
        )}

        {!loading && !error && opportunities.length > 0 && (
          <div className="space-y-3">
            {opportunities.map((opp, index) => (
              <div
                key={index}
                className="p-4 rounded-lg bg-gradient-to-r from-slate-800/50 to-slate-900/50 border border-slate-700 hover:border-emerald-500/50 transition-all duration-200 cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Left: Icon and Info */}
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
                      {getTypeIcon(opp.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-white text-base">
                          {opp.protocol}
                        </h3>
                        <span className="px-2 py-0.5 rounded text-xs bg-slate-800 text-slate-300">
                          {getTypeLabel(opp.type)}
                        </span>
                      </div>
                      
                      {opp.token_pair && (
                        <p className="text-sm text-slate-400 mb-2">
                          {opp.token_pair}
                        </p>
                      )}
                      
                      <p className="text-sm text-slate-300 line-clamp-2">
                        {opp.description}
                      </p>
                    </div>
                  </div>

                  {/* Right: Metrics */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-emerald-400">
                        {typeof opp.apy === 'number' ? opp.apy.toFixed(2) : parseFloat(opp.apy).toFixed(2)}%
                      </div>
                      <div className="text-xs text-slate-400">APY</div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm font-medium text-white">
                        ${(opp.tvl / 1000000).toFixed(1)}M
                      </div>
                      <div className="text-xs text-slate-400">TVL</div>
                    </div>
                    
                    <div className={`text-xs font-medium ${getRiskColor(opp.risk_level)}`}>
                      {opp.risk_level.toUpperCase()} RISK
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};
