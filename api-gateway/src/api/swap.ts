import { Router, Request, Response } from 'express';
import { JupiterClient } from '../services/jupiter';
import { logger } from '../utils/logger';

const router = Router();
const jupiterClient = new JupiterClient();

// Common token addresses on Solana
const COMMON_TOKENS: Record<string, string> = {
  SOL: 'So11111111111111111111111111111111111111112',
  USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  USDT: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
  BONK: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
  JUP: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
  RAY: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
  ORCA: 'orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE',
};

/**
 * GET /api/swap/tokens
 * Get all supported tokens
 */
router.get('/tokens', async (_req: Request, res: Response) => {
  try {
    logger.info('Fetching Jupiter tokens');
    
    const tokens = await jupiterClient.getTokens();
    
    res.json({
      tokens: tokens.slice(0, 100), // Limit to first 100 for performance
      count: tokens.length,
      source: 'jupiter',
      timestamp: Math.floor(Date.now() / 1000),
    });
  } catch (error: any) {
    logger.error('Failed to fetch tokens', { error: error.message });
    res.status(500).json({
      error: 'Failed to fetch tokens',
      message: error.message,
    });
  }
});

/**
 * GET /api/swap/tokens/search
 * Search for tokens
 */
router.get('/tokens/search', async (req: Request, res: Response) => {
  try {
    const query = ((req as any).query?.q as string) || '';
    
    if (!query) {
      return res.status(400).json({ error: 'Missing query parameter: q' });
    }
    
    logger.info('Searching tokens', { query });
    
    const tokens = await jupiterClient.findToken(query);
    
    res.json({
      tokens,
      count: tokens.length,
      query,
      source: 'jupiter',
      timestamp: Math.floor(Date.now() / 1000),
    });
  } catch (error: any) {
    logger.error('Failed to search tokens', { error: error.message });
    res.status(500).json({
      error: 'Failed to search tokens',
      message: error.message,
    });
  }
});

/**
 * POST /api/swap/quote
 * Get swap quote
 * Body: {
 *   input_token: "SOL" or mint address,
 *   output_token: "USDC" or mint address,
 *   amount: 1.5,
 *   slippage_bps?: 50 (default: 50 = 0.5%)
 * }
 */
router.post('/quote', async (req: Request, res: Response) => {
  try {
    const { input_token, output_token, amount, slippage_bps } = (req as any).body;
    
    if (!input_token || !output_token || !amount) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['input_token', 'output_token', 'amount'],
      });
    }
    
    // Resolve token addresses
    const inputMint = COMMON_TOKENS[input_token.toUpperCase()] || input_token;
    const outputMint = COMMON_TOKENS[output_token.toUpperCase()] || output_token;
    
    // Get token info to determine decimals
    const inputTokenInfo = await jupiterClient.findToken(input_token);
    const inputDecimals = inputTokenInfo[0]?.decimals || 9; // Default to SOL decimals
    
    // Convert amount to smallest unit
    const amountInSmallestUnit = jupiterClient.toSmallestUnit(amount, inputDecimals);
    
    logger.info('Getting swap quote', {
      input_token,
      output_token,
      amount,
      inputMint,
      outputMint,
      amountInSmallestUnit,
    });
    
    const quote = await jupiterClient.getQuote(
      inputMint,
      outputMint,
      amountInSmallestUnit,
      slippage_bps || 50
    );
    
    // Get output token info for formatting
    const outputTokenInfo = await jupiterClient.findToken(output_token);
    const outputDecimals = outputTokenInfo[0]?.decimals || 6; // Default to USDC decimals
    
    // Format response
    const formattedQuote = {
      input_token: input_token,
      input_amount: amount,
      input_mint: quote.inputMint,
      output_token: output_token,
      output_amount: jupiterClient.formatAmount(quote.outAmount, outputDecimals),
      output_mint: quote.outputMint,
      price_impact_pct: parseFloat(quote.priceImpactPct),
      slippage_bps: quote.slippageBps,
      route_plan: quote.routePlan.map((route) => ({
        dex: route.swapInfo.label,
        input_mint: route.swapInfo.inputMint,
        output_mint: route.swapInfo.outputMint,
        percent: route.percent,
      })),
      minimum_output: jupiterClient.formatAmount(quote.otherAmountThreshold, outputDecimals),
      exchange_rate: jupiterClient.formatAmount(quote.outAmount, outputDecimals) / amount,
    };
    
    res.json({
      quote: formattedQuote,
      raw_quote: quote, // Include raw quote for transaction creation
      source: 'jupiter',
      timestamp: Math.floor(Date.now() / 1000),
    });
  } catch (error: any) {
    logger.error('Failed to get quote', { error: error.message });
    res.status(500).json({
      error: 'Failed to get quote',
      message: error.message,
    });
  }
});

/**
 * POST /api/swap/routes
 * Get multiple swap routes
 * Body: {
 *   input_token: "SOL",
 *   output_token: "USDC",
 *   amount: 1.5,
 *   slippage_bps?: 50
 * }
 */
router.post('/routes', async (req: Request, res: Response) => {
  try {
    const { input_token, output_token, amount, slippage_bps } = (req as any).body;
    
    if (!input_token || !output_token || !amount) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['input_token', 'output_token', 'amount'],
      });
    }
    
    const inputMint = COMMON_TOKENS[input_token.toUpperCase()] || input_token;
    const outputMint = COMMON_TOKENS[output_token.toUpperCase()] || output_token;
    
    const inputTokenInfo = await jupiterClient.findToken(input_token);
    const inputDecimals = inputTokenInfo[0]?.decimals || 9;
    const amountInSmallestUnit = jupiterClient.toSmallestUnit(amount, inputDecimals);
    
    logger.info('Getting swap routes', { input_token, output_token, amount });
    
    const routes = await jupiterClient.getSwapRoutes(
      inputMint,
      outputMint,
      amountInSmallestUnit,
      slippage_bps || 50
    );
    
    const outputTokenInfo = await jupiterClient.findToken(output_token);
    const outputDecimals = outputTokenInfo[0]?.decimals || 6;
    
    // Format routes
    const formattedRoutes = routes.map((route) => ({
      output_amount: jupiterClient.formatAmount(route.outAmount, outputDecimals),
      price_impact_pct: parseFloat(route.priceImpactPct),
      dex_labels: route.routePlan.map((r) => r.swapInfo.label),
      route_steps: route.routePlan.length,
    }));
    
    res.json({
      routes: formattedRoutes,
      count: routes.length,
      source: 'jupiter',
      timestamp: Math.floor(Date.now() / 1000),
    });
  } catch (error: any) {
    logger.error('Failed to get routes', { error: error.message });
    res.status(500).json({
      error: 'Failed to get routes',
      message: error.message,
    });
  }
});

/**
 * GET /api/swap/prices
 * Get token prices
 */
router.get('/prices', async (_req: Request, res: Response) => {
  try {
    const tokenAddresses = Object.values(COMMON_TOKENS);
    
    logger.info('Getting token prices', { count: tokenAddresses.length });
    
    const prices = await jupiterClient.getPrices(tokenAddresses);
    
    // Format with token symbols
    const formattedPrices: Record<string, any> = {};
    Object.entries(COMMON_TOKENS).forEach(([symbol, address]) => {
      if (prices[address]) {
        formattedPrices[symbol] = {
          price: prices[address].price,
          mint: address,
        };
      }
    });
    
    res.json({
      prices: formattedPrices,
      source: 'jupiter',
      timestamp: Math.floor(Date.now() / 1000),
    });
  } catch (error: any) {
    logger.error('Failed to get prices', { error: error.message });
    res.status(500).json({
      error: 'Failed to get prices',
      message: error.message,
    });
  }
});

/**
 * POST /api/swap/execute
 * Execute a swap transaction
 */
router.post('/execute', async (req: Request, res: Response) => {
  try {
    const body = req.body as any;
    const { input_token, output_token, amount, slippage_bps } = body;

    if (!input_token || !output_token || !amount) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['input_token', 'output_token', 'amount'],
      });
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({
        error: 'Invalid amount',
      });
    }

    logger.info('Executing swap', {
      input_token,
      output_token,
      amount: parsedAmount,
      slippage_bps: slippage_bps || 50,
    });

    // Import TransactionService
    const { TransactionService } = require('../services/transaction');
    const transactionService = new TransactionService();

    const result = await transactionService.executeSwap(
      input_token,
      output_token,
      parsedAmount,
      slippage_bps || 50
    );

    if (!result.success) {
      return res.status(500).json({
        error: 'Swap failed',
        message: result.error,
        signature: result.signature,
      });
    }

    res.json({
      success: true,
      signature: result.signature,
      explorer_url: `https://explorer.solana.com/tx/${result.signature}?cluster=devnet`,
      message: 'Swap executed successfully',
      timestamp: Math.floor(Date.now() / 1000),
    });
  } catch (error: any) {
    logger.error('Failed to execute swap', { error: error.message });
    res.status(500).json({
      error: 'Failed to execute swap',
      message: error.message,
    });
  }
});

export default router;
