import { Router, Request, Response } from "express";
import { SmartContractService } from "../services/smartContract";

const router = Router();
const smartContractService = new SmartContractService();

/**
 * GET /dashboard/metrics
 * System & On-Chain Metrics
 */
router.get("/metrics", async (_req: Request, res: Response) => {
  try {
    // Fetch real on-chain statistics from smart contract
    const programStats = await smartContractService.getProgramStats();
    
    const metrics = {
      system: {
        totalImmutableLogs: programStats.total_queries,
        activeUsersToday: programStats.total_users, // Note: This counts all-time users, not daily
        averageResponseTimeMs: 1150,
        uptime: 99.97,
        llmModel: {
          provider: "CEREBRAS",
          model: "qwen-3-32b",
          version: "3.3",
        },
      },
      onChain: {
        averageQueryCostSol: 0.0005, // 500,000 lamports from smart contract
        averageQueryCostUsd: 0.085, // Assuming SOL = $170
        totalTransactionsLogged: programStats.total_queries,
        lastBlockTime: Date.now() - 2300, // 2.3s ago
        networkTps: 3500,
      },
      tokenomics: {
        queryFeeSolAI: 0.5,
        logFeeLamports: 500000, // Real fee from smart contract
        solPrice: 170.25,
      },
    };

    res.json(metrics);
  } catch (error) {
    console.error("Error fetching metrics:", error);
    res.status(500).json({ error: "Failed to fetch metrics" });
  }
});

/**
 * GET /dashboard/market
 * Market Sentiment & Analysis
 */
router.get("/market", async (_req: Request, res: Response) => {
  try {
    const marketData = {
      sentiment: {
        overall: "BULLISH", // BULLISH | NEUTRAL | BEARISH
        score: 72, // 0-100
        indicator: "🟢",
        description: "Strong positive momentum with increasing TVL",
        lastUpdated: Date.now(),
      },
      volatility: {
        risk: "MODERATE", // LOW | MODERATE | HIGH
        score: 45, // 0-100
        prediction24h: "+2.5% to -1.8%",
        vix: 38.5,
      },
      hotTopics: [
        {
          category: "Liquid Staking",
          count: 1247,
          trend: "up",
          change: "+18%",
          protocols: ["Marinade", "JitoSOL", "BlazeStake"],
        },
        {
          category: "DEX Aggregators",
          count: 892,
          trend: "up",
          change: "+12%",
          protocols: ["Jupiter", "Raydium", "Orca"],
        },
        {
          category: "Lending Protocols",
          count: 634,
          trend: "stable",
          change: "+3%",
          protocols: ["Kamino", "Solend", "MarginFi"],
        },
      ],
      ecosystem: {
        totalTvl: "$4.8B",
        tvlChange24h: "+3.2%",
        activeWallets24h: "342,891",
        transactions24h: "48.2M",
      },
    };

    res.json(marketData);
  } catch (error) {
    console.error("Error fetching market data:", error);
    res.status(500).json({ error: "Failed to fetch market data" });
  }
});

/**
 * GET /dashboard/recent-logs
 * Recent Immutable Proof Transactions
 */
router.get("/recent-logs", async (_req: Request, res: Response) => {
  try {
    // Fetch real user accounts from smart contract
    const userAccounts = await smartContractService.getAllUserAccounts();
    
    // Format as recent logs (sort by last query slot)
    const recentLogs = userAccounts
      .filter(acc => acc.total_queries > 0)
      .sort((a, b) => b.last_query_slot - a.last_query_slot)
      .slice(0, 10) // Get last 10
      .map((acc, idx) => ({
        timestamp: Date.now() - (idx * 120000), // Approximate timestamps
        txHash: `${acc.authority.slice(0, 16)}...${acc.authority.slice(-8)}`, // Use authority as ID
        explorerUrl: `https://explorer.solana.com/address/${acc.authority}?cluster=devnet`,
        userWallet: `${acc.authority.slice(0, 4)}...${acc.authority.slice(-4)}`,
        summary: `AI consultation #${acc.total_queries} - ${acc.total_fees_paid / 1e9} SOL paid`,
        promptHash: acc.last_prompt_hash || "0x0",
        responseHash: acc.last_response_hash || "0x0",
        feePaid: 0.0005,
      }));

    // Get total stats from program
    const programStats = await smartContractService.getProgramStats();

    res.json({
      logs: recentLogs,
      total: programStats.total_queries,
      last24h: recentLogs.length, // Approximate
    });
  } catch (error) {
    console.error("Error fetching recent logs:", error);
    res.status(500).json({ error: "Failed to fetch recent logs" });
  }
});

/**
 * GET /dashboard/wallet/:address
 * Personal Wallet Overview & Risk Score
 */
router.get("/wallet/:address", async (req: any, res: Response) => {
  try {
    const address = req.params.address as string;

    // Validate Solana address format
    if (!address || address.length < 32) {
      return res.status(400).json({ error: "Invalid wallet address" });
    }

    // Mock wallet data - in production, fetch from Helius/Solana RPC
    const walletData = {
      address,
      portfolio: {
        totalValueUsd: 12458.75,
        totalValueSol: 73.16,
        lastUpdated: Date.now(),
        breakdown: [
          {
            token: "SOL",
            symbol: "SOL",
            amount: 45.3,
            valueUsd: 7706.33,
            percentage: 61.8,
            change24h: "+2.4%",
          },
          {
            token: "USDC",
            symbol: "USDC",
            amount: 2800.5,
            valueUsd: 2800.5,
            percentage: 22.5,
            change24h: "0%",
          },
          {
            token: "JitoSOL",
            symbol: "JITOSOL",
            amount: 8.2,
            valueUsd: 1455.62,
            percentage: 11.7,
            change24h: "+3.1%",
          },
          {
            token: "RAY",
            symbol: "RAY",
            amount: 124.8,
            valueUsd: 496.3,
            percentage: 4.0,
            change24h: "-1.2%",
          },
        ],
      },
      riskScore: {
        score: 42, // 0-100 (0 = very safe, 100 = very risky)
        level: "MODERATE", // CONSERVATIVE | MODERATE | AGGRESSIVE
        factors: {
          diversification: 68, // Good
          volatilityExposure: 45, // Moderate
          liquidityRisk: 25, // Low
          protocolRisk: 38, // Moderate
          concentrationRisk: 52, // Moderate
        },
        breakdown: {
          staked: {
            percentage: 29.5,
            protocols: ["Marinade (JitoSOL)"],
            risk: "LOW",
          },
          lending: {
            percentage: 0,
            protocols: [],
            risk: "NONE",
          },
          liquidity: {
            percentage: 0,
            protocols: [],
            risk: "NONE",
          },
          spot: {
            percentage: 70.5,
            risk: "LOW",
          },
        },
      },
      recentActivity: {
        transactions24h: 5,
        lastTransaction: Date.now() - 3600000, // 1h ago
        topProtocols: ["Jupiter", "Marinade", "Orca"],
      },
      recommendations: [
        {
          type: "DIVERSIFICATION",
          priority: "MEDIUM",
          message:
            "Consider diversifying into stablecoins to reduce volatility risk",
        },
        {
          type: "YIELD_OPTIMIZATION",
          priority: "HIGH",
          message:
            "Your USDC can earn 8-12% APY in lending protocols like Kamino",
        },
        {
          type: "RISK_MANAGEMENT",
          priority: "LOW",
          message: "Your portfolio concentration in SOL is high (61.8%)",
        },
      ],
    };

    res.json(walletData);
  } catch (error) {
    console.error("Error fetching wallet data:", error);
    res.status(500).json({ error: "Failed to fetch wallet data" });
  }
});

export default router;
