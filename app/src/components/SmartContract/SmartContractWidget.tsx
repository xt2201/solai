import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Card } from '@solai/app/components/ui/Card';
import { Button } from '@solai/app/components/ui/Button';
import { Badge } from '@solai/app/components/ui/Badge';
import { Connection, Transaction, PublicKey } from '@solana/web3.js';
import { CheckCircle, XCircle, Loader2, Shield, FileText, Coins } from 'lucide-react';
import { getSolAIRuntimeConfig } from '@solai/config';

interface SmartContractWidgetProps {
  className?: string;
}

interface UserAccountInfo {
  address: string;
  initialized: boolean;
  authority?: string;
  totalQueries?: number;
  totalFeesPaid?: number;
  lastQuerySlot?: number;
}

interface ProgramInfo {
  program_id: string;
  network: string;
  status: string;
  statistics: {
    total_users: number;
    total_queries: number;
    total_fees_collected_sol: number;
    treasury_balance_sol: number;
  };
}

export const SmartContractWidget = ({ className }: SmartContractWidgetProps) => {
  const { publicKey, signTransaction } = useWallet();
  const [userAccount, setUserAccount] = useState<UserAccountInfo | null>(null);
  const [programInfo, setProgramInfo] = useState<ProgramInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [txLoading, setTxLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txSuccess, setTxSuccess] = useState<string | null>(null);

  const runtime = getSolAIRuntimeConfig();
  const apiBaseUrl = runtime.apiBaseUrl;

  // Fetch program info
  useEffect(() => {
    const fetchProgramInfo = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/api/program/info`);
        if (!response.ok) throw new Error('Failed to fetch program info');
        const data = await response.json();
        setProgramInfo(data);
      } catch (err: any) {
        console.error('Failed to fetch program info:', err);
      }
    };

    fetchProgramInfo();
    const interval = setInterval(fetchProgramInfo, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [apiBaseUrl]);

  // Fetch user account info when wallet connects
  useEffect(() => {
    if (!publicKey) {
      setUserAccount(null);
      return;
    }

    const fetchUserAccount = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(
          `${apiBaseUrl}/api/program/user/${publicKey.toBase58()}`
        );
        if (!response.ok) throw new Error('Failed to fetch user account');
        const data = await response.json();
        setUserAccount(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAccount();
  }, [publicKey, apiBaseUrl]);

  // Initialize user account
  const handleInitialize = async () => {
    if (!publicKey || !signTransaction) {
      setError('Please connect your wallet first');
      return;
    }

    try {
      setTxLoading(true);
      setError(null);
      setTxSuccess(null);

      // Get unsigned transaction from API
      const response = await fetch(`${apiBaseUrl}/api/program/initialize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_address: publicKey.toBase58() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to build transaction');
      }

      const data = await response.json();
      
      // Deserialize transaction
      const txBuffer = Buffer.from(data.transaction, 'base64');
      const transaction = Transaction.from(txBuffer);

      // Sign transaction
      const signedTx = await signTransaction(transaction);

      // Send transaction
      const connection = new Connection(
        runtime.solanaRpcUrl || 'https://api.devnet.solana.com',
        'confirmed'
      );
      const signature = await connection.sendRawTransaction(signedTx.serialize());
      
      // Wait for confirmation
      await connection.confirmTransaction(signature, 'confirmed');

      setTxSuccess(signature);
      setError(null);

      // Refresh user account info
      setTimeout(async () => {
        const userResponse = await fetch(
          `${apiBaseUrl}/api/program/user/${publicKey.toBase58()}`
        );
        const userData = await userResponse.json();
        setUserAccount(userData);
      }, 2000);

    } catch (err: any) {
      console.error('Initialize error:', err);
      setError(err.message || 'Failed to initialize account');
      setTxSuccess(null);
    } finally {
      setTxLoading(false);
    }
  };

  // Log AI interaction
  const handleLogInteraction = async () => {
    if (!publicKey || !signTransaction) {
      setError('Please connect your wallet first');
      return;
    }

    if (!userAccount?.initialized) {
      setError('Please initialize your account first');
      return;
    }

    try {
      setTxLoading(true);
      setError(null);
      setTxSuccess(null);

      // Generate sample hashes (in production, these come from actual AI queries)
      const encoder = new TextEncoder();
      const promptBytes = encoder.encode('Sample prompt hash').slice(0, 32);
      const responseBytes = encoder.encode('Sample response hash').slice(0, 32);
      const promptHash = '0x' + Array.from(promptBytes).map(b => b.toString(16).padStart(2, '0')).join('').padEnd(64, '0');
      const responseHash = '0x' + Array.from(responseBytes).map(b => b.toString(16).padStart(2, '0')).join('').padEnd(64, '0');

      // Get unsigned transaction from API
      const response = await fetch(`${apiBaseUrl}/api/program/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_address: publicKey.toBase58(),
          prompt_hash: promptHash,
          response_hash: responseHash,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to build transaction');
      }

      const data = await response.json();
      
      // Deserialize transaction
      const txBuffer = Buffer.from(data.transaction, 'base64');
      const transaction = Transaction.from(txBuffer);

      // Sign transaction
      const signedTx = await signTransaction(transaction);

      // Send transaction
      const connection = new Connection(
        runtime.solanaRpcUrl || 'https://api.devnet.solana.com',
        'confirmed'
      );
      const signature = await connection.sendRawTransaction(signedTx.serialize());
      
      // Wait for confirmation
      await connection.confirmTransaction(signature, 'confirmed');

      setTxSuccess(signature);
      setError(null);

      // Refresh user account info
      setTimeout(async () => {
        const userResponse = await fetch(
          `${apiBaseUrl}/api/program/user/${publicKey.toBase58()}`
        );
        const userData = await userResponse.json();
        setUserAccount(userData);
      }, 2000);

    } catch (err: any) {
      console.error('Log interaction error:', err);
      setError(err.message || 'Failed to log interaction');
      setTxSuccess(null);
    } finally {
      setTxLoading(false);
    }
  };

  return (
    <div className={className}>
      <Card className="overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-6 h-6" />
            <h2 className="text-2xl font-bold">On-Chain Smart Contract</h2>
          </div>
          <p className="text-purple-100">
            Transparent AI query logging on Solana blockchain
          </p>
        </div>

        {/* Program Info */}
        {programInfo && (
          <div className="p-6 border-b border-[var(--border)]">
            <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-3">
              PROGRAM STATISTICS
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-xs text-[var(--text-secondary)] mb-1">Total Users</div>
                <div className="text-xl font-bold text-[var(--text-primary)]">
                  {programInfo.statistics.total_users}
                </div>
              </div>
              <div>
                <div className="text-xs text-[var(--text-secondary)] mb-1">Total Queries</div>
                <div className="text-xl font-bold text-[var(--text-primary)]">
                  {programInfo.statistics.total_queries}
                </div>
              </div>
              <div>
                <div className="text-xs text-[var(--text-secondary)] mb-1">Fees Collected</div>
                <div className="text-xl font-bold text-[var(--text-primary)]">
                  {programInfo.statistics.total_fees_collected_sol.toFixed(4)} SOL
                </div>
              </div>
              <div>
                <div className="text-xs text-[var(--text-secondary)] mb-1">Treasury Balance</div>
                <div className="text-xl font-bold text-[var(--text-primary)]">
                  {programInfo.statistics.treasury_balance_sol.toFixed(4)} SOL
                </div>
              </div>
            </div>
            <div className="mt-4 text-xs text-[var(--text-secondary)]">
              Program: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                {programInfo.program_id}
              </code>
            </div>
          </div>
        )}

        {/* Wallet Status */}
        <div className="p-6">
          {!publicKey ? (
            <div className="text-center py-8">
              <Shield className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-[var(--text-secondary)] mb-4">
                Connect your wallet to interact with the smart contract
              </p>
            </div>
          ) : (
            <>
              {/* Loading State */}
              {loading && (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-blue-500" />
                  <p className="text-[var(--text-secondary)]">Loading account info...</p>
                </div>
              )}

              {/* User Account Info */}
              {!loading && userAccount && (
                <div className="space-y-6">
                  {/* Account Status */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      {userAccount.initialized ? (
                        <>
                          <CheckCircle className="w-6 h-6 text-green-500" />
                          <div>
                            <div className="font-semibold text-[var(--text-primary)]">
                              Account Initialized
                            </div>
                            <div className="text-sm text-[var(--text-secondary)]">
                              PDA: {userAccount.address.slice(0, 8)}...{userAccount.address.slice(-8)}
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-6 h-6 text-yellow-500" />
                          <div>
                            <div className="font-semibold text-[var(--text-primary)]">
                              Not Initialized
                            </div>
                            <div className="text-sm text-[var(--text-secondary)]">
                              Initialize your account to start logging
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                    <Badge variant={userAccount.initialized ? 'success' : 'warning'}>
                      {userAccount.initialized ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>

                  {/* User Stats (if initialized) */}
                  {userAccount.initialized && (
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="w-4 h-4 text-blue-500" />
                          <div className="text-xs text-[var(--text-secondary)]">
                            Total Queries
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {userAccount.totalQueries || 0}
                        </div>
                      </div>
                      <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Coins className="w-4 h-4 text-purple-500" />
                          <div className="text-xs text-[var(--text-secondary)]">
                            Fees Paid
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                          {((userAccount.totalFeesPaid || 0) / 1e9).toFixed(4)}
                        </div>
                      </div>
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <div className="text-xs text-[var(--text-secondary)]">
                            Last Query
                          </div>
                        </div>
                        <div className="text-lg font-bold text-green-600 dark:text-green-400">
                          #{userAccount.lastQuerySlot || 0}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="space-y-3">
                    {!userAccount.initialized ? (
                      <Button
                        onClick={handleInitialize}
                        disabled={txLoading}
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                      >
                        {txLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Initializing...
                          </>
                        ) : (
                          <>
                            <Shield className="w-4 h-4 mr-2" />
                            Initialize Account (Free)
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button
                        onClick={handleLogInteraction}
                        disabled={txLoading}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      >
                        {txLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Logging...
                          </>
                        ) : (
                          <>
                            <FileText className="w-4 h-4 mr-2" />
                            Log Test Interaction (0.0005 SOL)
                          </>
                        )}
                      </Button>
                    )}

                    {/* Info Note */}
                    <div className="text-xs text-[var(--text-secondary)] p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                      <strong>Note:</strong> This is on Solana Devnet. All transactions are for testing only.
                      Each log interaction costs 0.0005 SOL (~$0.0001).
                    </div>
                  </div>

                  {/* Success/Error Messages */}
                  {txSuccess && (
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                        <div className="flex-1">
                          <div className="font-semibold text-green-700 dark:text-green-300 mb-1">
                            Transaction Successful!
                          </div>
                          <a
                            href={`https://explorer.solana.com/tx/${txSuccess}?cluster=devnet`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline"
                          >
                            View on Solana Explorer →
                          </a>
                        </div>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <div className="flex items-start gap-3">
                        <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                        <div className="flex-1">
                          <div className="font-semibold text-red-700 dark:text-red-300 mb-1">
                            Transaction Failed
                          </div>
                          <div className="text-sm text-red-600 dark:text-red-400">
                            {error}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </Card>
    </div>
  );
};
