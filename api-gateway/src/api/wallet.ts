import { Router, Request, Response } from 'express';
import { getSolanaService } from '../services/solana';
import { getHeliusClient } from '../services/helius';
import { getCoinGeckoClient } from '../services/coingecko';
import { logger } from '../utils/logger';

const router = Router();

/**
 * GET /api/wallet/balance/:address
 * Get SOL balance for any wallet address
 */
router.get('/balance/:address', async (req: Request, res: Response) => {
  try {
    const address = (req as any).params.address;
    const solana = getSolanaService();
    
    const balanceResult = await solana.getBalance(address);
    const balance = typeof balanceResult === 'number' ? balanceResult : 0;
    
    res.json({
      wallet_address: address,
      balance_sol: balance,
      balance_lamports: Math.floor(balance * 1e9),
      source: 'solana-rpc',
      timestamp: Math.floor(Date.now() / 1000),
    });
  } catch (error: any) {
    logger.error('Get balance failed', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/wallet/dev
 * Get dev wallet info and balance
 */
router.get('/dev', async (req: Request, res: Response) => {
  try {
    const solana = getSolanaService();
    const devWallet = solana.getDevWallet();
    
    if (!devWallet) {
      return res.status(404).json({ error: 'Dev wallet not configured' });
    }
    
    const balanceResult = await solana.getBalance(devWallet.publicKey);
    const balance = typeof balanceResult === 'number' ? balanceResult : 0;
    
    res.json({
      wallet_address: devWallet.publicKey,
      balance_sol: balance,
      balance_lamports: Math.floor(balance * 1e9),
      is_dev_wallet: true,
      source: 'solana-rpc',
      timestamp: Math.floor(Date.now() / 1000),
    });
  } catch (error: any) {
    logger.error('Get dev wallet failed', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/wallet/analyze
 * Comprehensive wallet analysis with Helius + CoinGecko data
 */
router.post('/analyze', async (req: Request, res: Response) => {
  try {
    const payload = req.body as any;
    const wallet_address = payload?.wallet_address;
    
    if (!wallet_address || typeof wallet_address !== 'string') {
      return res.status(400).json({ error: 'wallet_address is required' });
    }
    
    const helius = getHeliusClient();
    const coinGecko = getCoinGeckoClient();
    const solana = getSolanaService();
    
    // Fetch data in parallel
    const [rpcBalanceResult, helBalances, transactions, solPrice] = await Promise.all([
      solana.getBalance(wallet_address),
      helius.getTokenBalances(wallet_address),
      helius.getTransactions(wallet_address, 10),
      coinGecko.getSimplePrice('SOL').catch(() => 0),
    ]);
    
    const rpcBalance = typeof rpcBalanceResult === 'number' ? rpcBalanceResult : 0;
    
    // Calculate portfolio value
    const portfolioValueUsd = rpcBalance * (solPrice || 0);
    
    // Format token holdings
    const tokens = helBalances.slice(0, 10).map(token => ({
      symbol: token.symbol || 'UNKNOWN',
      name: token.name || 'Unknown Token',
      balance: token.uiAmount,
      mint: token.mint,
      decimals: token.decimals,
    }));
    
    // Format recent transactions
    const recentTransactions = transactions.map(tx => ({
      signature: tx.signature,
      timestamp: tx.timestamp,
      type: tx.type,
      description: tx.description,
      fee_sol: tx.fee / 1e9,
      status: tx.status,
    }));
    
    res.json({
      wallet_address,
      sol_balance: rpcBalance,
      portfolio_value_usd: portfolioValueUsd,
      sol_price_usd: solPrice,
      token_count: helBalances.length,
      tokens,
      recent_transactions: recentTransactions,
      transaction_count: transactions.length,
      sources: {
        balance: 'solana-rpc',
        tokens: 'helius',
        transactions: 'helius',
        price: 'coingecko',
      },
      timestamp: Math.floor(Date.now() / 1000),
    });
  } catch (error: any) {
    logger.error('Wallet analysis failed', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/wallet/transactions/:address
 * Get transaction history for a wallet
 */
router.get('/transactions/:address', async (req: Request, res: Response) => {
  try {
    const address = (req as any).params.address;
    const limit = parseInt((req as any).query?.limit) || 10;
    
    const helius = getHeliusClient();
    const transactions = await helius.getTransactions(address, limit);
    
    res.json({
      wallet_address: address,
      transactions: transactions.map(tx => ({
        signature: tx.signature,
        timestamp: tx.timestamp,
        type: tx.type,
        description: tx.description,
        fee_sol: tx.fee / 1e9,
        status: tx.status,
      })),
      count: transactions.length,
      source: 'helius',
      timestamp: Math.floor(Date.now() / 1000),
    });
  } catch (error: any) {
    logger.error('Get transactions failed', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

export default router;
