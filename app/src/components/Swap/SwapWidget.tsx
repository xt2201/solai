import { useState, useEffect } from 'react';
import { Card } from '@solai/app/components/ui/Card';
import { Button } from '@solai/app/components/ui/Button';
import { getSwapQuote, SwapQuoteResponse } from '@solai/app/lib/api-client';
import { ArrowDownUp, Info, TrendingDown, Loader2, CheckCircle } from 'lucide-react';
import { getSolAIRuntimeConfig } from '@solai/config';

interface SwapWidgetProps {
  className?: string;
}

const POPULAR_TOKENS = [
  { symbol: 'SOL', name: 'Solana', decimals: 9 },
  { symbol: 'USDC', name: 'USD Coin', decimals: 6 },
  { symbol: 'USDT', name: 'Tether', decimals: 6 },
  { symbol: 'mSOL', name: 'Marinade SOL', decimals: 9 },
  { symbol: 'BONK', name: 'Bonk', decimals: 5 },
  { symbol: 'JUP', name: 'Jupiter', decimals: 6 },
];

export const SwapWidget = ({ className }: SwapWidgetProps) => {
  const [inputToken, setInputToken] = useState('SOL');
  const [outputToken, setOutputToken] = useState('USDC');
  const [inputAmount, setInputAmount] = useState('1');
  const [quote, setQuote] = useState<SwapQuoteResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [executing, setExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<{ success: boolean; signature?: string; message?: string } | null>(null);

  const runtime = getSolAIRuntimeConfig();
  const apiBaseUrl = runtime.apiBaseUrl;

  useEffect(() => {
    const fetchQuote = async () => {
      if (!inputAmount || parseFloat(inputAmount) <= 0) {
        setQuote(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await getSwapQuote({
          input_token: inputToken,
          output_token: outputToken,
          amount: parseFloat(inputAmount),
        });
        setQuote(data);
      } catch (err: any) {
        setError(err.message);
        setQuote(null);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchQuote();
    }, 500); // Debounce

    return () => clearTimeout(timer);
  }, [inputToken, outputToken, inputAmount]);

  const handleSwapTokens = () => {
    const temp = inputToken;
    setInputToken(outputToken);
    setOutputToken(temp);
  };

  const handleMaxClick = () => {
    // In a real app, this would fetch the user's balance
    setInputAmount('100');
  };

  return (
    <Card className={className}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">
            Swap Tokens
          </h2>
          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <Info className="w-4 h-4" />
            Best rates
          </div>
        </div>

        {/* Input Token */}
        <div className="mb-3">
          <div className="flex justify-between mb-2">
            <label className="text-sm text-[var(--text-secondary)]">You pay</label>
            <button
              onClick={handleMaxClick}
              className="text-xs text-emerald-400 hover:text-emerald-300"
            >
              MAX
            </button>
          </div>
          <div className="flex gap-3 p-4 rounded-lg bg-slate-800/50 border border-slate-700">
            <input
              type="number"
              value={inputAmount}
              onChange={(e) => setInputAmount(e.target.value)}
              placeholder="0.00"
              className="flex-1 bg-transparent text-white text-xl font-semibold outline-none"
              min="0"
              step="any"
            />
            <select
              value={inputToken}
              onChange={(e) => setInputToken(e.target.value)}
              className="px-3 py-2 rounded-lg bg-slate-700 text-white font-medium outline-none cursor-pointer hover:bg-slate-600 transition-colors"
            >
              {POPULAR_TOKENS.map((token) => (
                <option key={token.symbol} value={token.symbol}>
                  {token.symbol}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center -my-2 relative z-10">
          <button
            onClick={handleSwapTokens}
            className="p-2 rounded-full bg-slate-700 hover:bg-slate-600 transition-colors border-4 border-[var(--card-background)]"
          >
            <ArrowDownUp className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Output Token */}
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <label className="text-sm text-[var(--text-secondary)]">You receive</label>
          </div>
          <div className="flex gap-3 p-4 rounded-lg bg-slate-800/50 border border-slate-700">
            <input
              type="text"
              value={loading ? '...' : quote ? quote.output_amount.toFixed(6) : '0.00'}
              readOnly
              placeholder="0.00"
              className="flex-1 bg-transparent text-white text-xl font-semibold outline-none"
            />
            <select
              value={outputToken}
              onChange={(e) => setOutputToken(e.target.value)}
              className="px-3 py-2 rounded-lg bg-slate-700 text-white font-medium outline-none cursor-pointer hover:bg-slate-600 transition-colors"
            >
              {POPULAR_TOKENS.map((token) => (
                <option key={token.symbol} value={token.symbol}>
                  {token.symbol}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quote Details */}
        {quote && !loading && (
          <div className="mb-6 p-4 rounded-lg bg-slate-800/30 border border-slate-700 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[var(--text-secondary)]">Rate</span>
              <span className="text-white font-medium">
                1 {inputToken} = {(quote.output_amount / quote.input_amount).toFixed(4)} {outputToken}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--text-secondary)]">Price Impact</span>
              <span className={quote.price_impact > 1 ? 'text-yellow-400' : 'text-emerald-400'}>
                <TrendingDown className="w-3 h-3 inline mr-1" />
                {quote.price_impact.toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--text-secondary)]">Minimum Received</span>
              <span className="text-white">
                {quote.minimum_received.toFixed(6)} {outputToken}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--text-secondary)]">Fee</span>
              <span className="text-white">
                {quote.fee.toFixed(4)} {inputToken}
              </span>
            </div>
            {quote.route && quote.route.length > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-secondary)]">Route</span>
                <span className="text-white text-xs">
                  {quote.route.join(' → ')}
                </span>
              </div>
            )}
            {quote.meta?.mock && (
              <div className="pt-2 border-t border-slate-700">
                <span className="text-xs text-yellow-400">
                  ⚠️ Mock data (LLM processor offline)
                </span>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-900/20 border border-red-700 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Execution Result */}
        {executionResult && (
          <div className={`mb-6 p-4 rounded-lg border ${
            executionResult.success 
              ? 'bg-green-900/20 border-green-700' 
              : 'bg-red-900/20 border-red-700'
          }`}>
            <div className="flex items-start gap-3">
              {executionResult.success ? (
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
              ) : (
                <Info className="w-5 h-5 text-red-400 mt-0.5" />
              )}
              <div className="flex-1">
                <div className={`font-semibold mb-1 ${
                  executionResult.success ? 'text-green-300' : 'text-red-300'
                }`}>
                  {executionResult.success ? 'Swap Successful!' : 'Swap Failed'}
                </div>
                {executionResult.message && (
                  <div className="text-sm text-gray-300 mb-2">
                    {executionResult.message}
                  </div>
                )}
                {executionResult.signature && (
                  <a
                    href={`https://explorer.solana.com/tx/${executionResult.signature}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-400 hover:underline"
                  >
                    View on Solana Explorer →
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Swap Button */}
        <Button
          onClick={handleExecuteSwap}
          disabled={!quote || loading || executing || !inputAmount || parseFloat(inputAmount) <= 0}
          className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed"
        >
          {executing ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Executing Swap...
            </>
          ) : loading ? (
            'Getting quote...'
          ) : !quote ? (
            'Enter amount'
          ) : (
            'Execute Swap'
          )}
        </Button>

        <p className="text-xs text-center text-[var(--text-secondary)] mt-4">
          Powered by Jupiter Aggregator • Devnet Only
        </p>
      </div>
    </Card>
  );

  async function handleExecuteSwap() {
    if (!quote || executing) return;

    try {
      setExecuting(true);
      setExecutionResult(null);
      setError(null);

      const response = await fetch(`${apiBaseUrl}/api/swap/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input_token: inputToken,
          output_token: outputToken,
          amount: parseFloat(inputAmount),
          slippage_bps: 50, // 0.5% slippage
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Swap execution failed');
      }

      setExecutionResult({
        success: true,
        signature: data.signature,
        message: data.message,
      });

      // Reset form after successful swap
      setTimeout(() => {
        setInputAmount('');
        setQuote(null);
        setExecutionResult(null);
      }, 10000); // Clear after 10 seconds

    } catch (err: any) {
      console.error('Swap execution error:', err);
      setExecutionResult({
        success: false,
        message: err.message || 'Failed to execute swap',
      });
    } finally {
      setExecuting(false);
    }
  }
};
