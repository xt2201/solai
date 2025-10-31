import express, { Request, Response } from "express";
import cors from "cors";
import chatRouter from "./api/chat";
import accountsRouter from "./api/accounts";
import dashboardRouter from "./api/dashboard";
import walletRouter from "./api/wallet";
import defiRouter from "./api/defi";
import swapRouter from "./api/swap";
import programRouter from "./api/program";
import { config } from "./utils/config";
import { logger } from "./utils/logger";
import { getHeliusClient } from "./services/helius";
import { getCoinGeckoClient } from "./services/coingecko";
import {
  getMockWalletAnalysis,
  getMockMarketOverview,
  getMockDefiOpportunities,
  getMockUserAccount,
  getMockRagSearch,
  getMockSwapQuote,
  getMockPlatformStats,
} from "./services/mockData";

const app = express();
app.use(cors({ origin: config.api_gateway.allowed_origins }));
app.use(express.json({ limit: "2mb" }));

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok" });
});

// Dev wallet endpoint (for testing)
app.get("/dev/wallet", (_req: Request, res: Response) => {
  const devWallet = config.dev_wallet?.public_key;
  if (devWallet) {
    res.status(200).json({ 
      wallet: devWallet,
      available: true 
    });
  } else {
    res.status(200).json({ 
      wallet: null, 
      available: false 
    });
  }
});

// ============================================================================
// WALLET ROUTER - Real blockchain integration
// ============================================================================
app.use('/api/wallet', walletRouter);

// ============================================================================
// DEFI ROUTER - Real DeFi data from DefiLlama
// ============================================================================
app.use('/api/defi', defiRouter);

// ============================================================================
// SWAP ROUTER - Real swap quotes from Jupiter
// ============================================================================
app.use('/api/swap', swapRouter);

// ============================================================================
// PROGRAM ROUTER - Smart contract interaction
// ============================================================================
app.use('/api/program', programRouter);

// ============================================================================
// SHOWCASE ENDPOINTS - Proxy to LLM Processor
// ============================================================================

const LLM_BASE_URL = config.api_gateway.llm_processor.base_url;

// Wallet analysis endpoint - Now with REAL Helius data
app.post("/api/wallet/analyze", async (req: Request, res: Response) => {
  try {
    const payload = (req.body ?? {}) as Record<string, unknown>;
    const walletAddress = typeof payload.wallet_address === "string" ? payload.wallet_address : null;
    
    if (!walletAddress) {
      return res.status(400).json({ error: "wallet_address is required" });
    }
    
    const helius = getHeliusClient();
    const coinGecko = getCoinGeckoClient();
    
    // Fetch real data from Helius
    const [balances, transactions] = await Promise.all([
      helius.getTokenBalances(walletAddress),
      helius.getTransactions(walletAddress, 10),
    ]);
    
    // Calculate portfolio value
    const solBalance = balances.find(b => b.symbol === 'SOL')?.uiAmount || 0;
    const solPrice = await coinGecko.getSimplePrice('SOL');
    const portfolioValueUsd = solBalance * solPrice;
    
    // Format token holdings
    const tokens = balances.slice(0, 10).map(token => ({
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
      fee: tx.fee / 1e9, // Convert lamports to SOL
      status: tx.status,
    }));
    
    res.json({
      wallet_address: walletAddress,
      sol_balance: solBalance,
      portfolio_value_usd: portfolioValueUsd,
      token_count: balances.length,
      tokens,
      recent_transactions: recentTransactions,
      transaction_count: transactions.length,
      source: "helius",
      timestamp: Math.floor(Date.now() / 1000),
    });
  } catch (error: any) {
    logger.error("Wallet analysis failed", { error: error.message });
    const payload = (req.body ?? {}) as Record<string, unknown>;
    const walletAddress = typeof payload.wallet_address === "string" ? payload.wallet_address : "unknown";
    res.status(200).json({
      ...getMockWalletAnalysis(walletAddress),
      meta: {
        mock: true,
        reason: error.message,
      },
    });
  }
});

// Market overview endpoint - Now with REAL CoinGecko data
app.get("/api/market/overview", async (_req: Request, res: Response) => {
  try {
    const coinGecko = getCoinGeckoClient();
    const tokens = ["SOL", "USDC", "BONK", "JUP", "ORCA", "RAY"];
    
    // Fetch real token prices from CoinGecko
    const prices = await coinGecko.getTokenPrices(tokens);
    
    // Calculate aggregate metrics
    const totalMarketCap = Object.values(prices).reduce((sum, token) => sum + token.market_cap, 0);
    const total24hVolume = Object.values(prices).reduce((sum, token) => sum + token.total_volume, 0);
    const avgPriceChange = Object.values(prices).reduce((sum, token) => sum + token.price_change_percentage_24h, 0) / Object.keys(prices).length;
    
    res.json({
      tokens: prices,
      total_market_cap: totalMarketCap,
      total_24h_volume: total24hVolume,
      market_sentiment: avgPriceChange > 0 ? "Bullish" : "Bearish",
      average_price_change_24h: avgPriceChange,
      timestamp: Math.floor(Date.now() / 1000),
      source: "coingecko",
    });
  } catch (error: any) {
    logger.error("Market overview failed", { error: error.message });
    res.status(200).json({
      ...getMockMarketOverview(),
      meta: {
        mock: true,
        reason: error.message,
      },
    });
  }
});

// DeFi opportunities endpoint
app.get("/api/defi/opportunities", async (_req: Request, res: Response) => {
  try {
    const response = await fetch(`${LLM_BASE_URL}/api/defi/opportunities`);
    if (!response.ok) {
      throw new Error(`LLM gateway responded with ${response.status}`);
    }
    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    logger.error("DeFi opportunities failed", { error: error.message });
    res.status(200).json({
      ...getMockDefiOpportunities(),
      meta: {
        mock: true,
        reason: error.message,
      },
    });
  }
});

// User account endpoint - Now with REAL Helius data
app.get("/api/user/account/:wallet", async (req: Request, res: Response) => {
  try {
    const wallet = (req as any).params.wallet;
    const helius = getHeliusClient();
    const coinGecko = getCoinGeckoClient();
    
    // Fetch real data
    const [balance, balances, transactions] = await Promise.all([
      helius.getBalance(wallet),
      helius.getTokenBalances(wallet),
      helius.getTransactions(wallet, 5),
    ]);
    
    // Get SOL price for portfolio value
    const solPrice = await coinGecko.getSimplePrice('SOL');
    const portfolioValueSol = balance;
    const portfolioValueUsd = balance * solPrice;
    
    // Format recent queries from transactions
    const recentQueries = transactions.map((tx, idx) => ({
      id: tx.signature,
      query: tx.description || `Transaction ${idx + 1}`,
      timestamp: tx.timestamp,
      status: tx.status,
    }));
    
    res.json({
      wallet_address: wallet,
      balance_sol: balance,
      portfolio: {
        totalValueSol: portfolioValueSol,
        totalValueUsd: portfolioValueUsd,
        tokenCount: balances.length,
        assets: balances.slice(0, 5).map(token => ({
          symbol: token.symbol || 'UNKNOWN',
          amount: token.uiAmount,
          percentage: token.symbol === 'SOL' ? 100 : 0, // Simplified
        })),
      },
      total_queries: transactions.length,
      recent_queries: recentQueries,
      source: "helius",
      timestamp: Math.floor(Date.now() / 1000),
    });
  } catch (error: any) {
    logger.error("User account fetch failed", { error: error.message });
    const wallet = (req as any).params.wallet ?? "unknown";
    res.status(200).json({
      ...getMockUserAccount(wallet),
      meta: {
        mock: true,
        reason: error.message,
      },
    });
  }
});

// RAG search endpoint
app.post("/api/rag/search", async (req: Request, res: Response) => {
  try {
    const { query, top_k } = req.body as any;
    const url = new URL(`${LLM_BASE_URL}/api/rag/search`);
    url.searchParams.append("query", query || "DeFi");
    url.searchParams.append("top_k", (top_k || 5).toString());

    const response = await fetch(url.toString(), { method: "POST" });
    if (!response.ok) {
      throw new Error(`LLM gateway responded with ${response.status}`);
    }
    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    logger.error("RAG search failed", { error: error.message });
    const payload = (req.body ?? {}) as Record<string, unknown>;
    const query = typeof payload.query === "string" ? payload.query : "DeFi";
    const topK = Number(payload.top_k ?? 5) || 5;
    res.status(200).json({
      ...getMockRagSearch(query, topK),
      meta: {
        mock: true,
        reason: error.message,
      },
    });
  }
});

// Swap quote endpoint
app.post("/api/swap/quote", async (req: Request, res: Response) => {
  try {
    const response = await fetch(`${LLM_BASE_URL}/api/swap/quote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });
    if (!response.ok) {
      throw new Error(`LLM gateway responded with ${response.status}`);
    }
    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    logger.error("Swap quote failed", { error: error.message });
    const payload = (req.body ?? {}) as Record<string, unknown>;
    const inputToken = typeof payload.input_token === "string" ? payload.input_token : "SOL";
    const outputToken = typeof payload.output_token === "string" ? payload.output_token : "USDC";
    const amount = Number(payload.amount ?? 1) || 1;
    res.status(200).json({
      ...getMockSwapQuote(inputToken, outputToken, amount),
      meta: {
        mock: true,
        reason: error.message,
      },
    });
  }
});

// Platform stats endpoint
app.get("/api/stats/platform", async (_req: Request, res: Response) => {
  try {
    const response = await fetch(`${LLM_BASE_URL}/api/stats/platform`);
    if (!response.ok) {
      throw new Error(`LLM gateway responded with ${response.status}`);
    }
    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    logger.error("Platform stats failed", { error: error.message });
    res.status(200).json({
      ...getMockPlatformStats(),
      meta: {
        mock: true,
        reason: error.message,
      },
    });
  }
});

app.use("/api", accountsRouter);
app.use("/api", chatRouter);
app.use("/api/dashboard", dashboardRouter);

const port = config.api_gateway.port;
app.listen(port, () => {
  logger.info("API Gateway started", { port, environment: config.global.environment });
});

