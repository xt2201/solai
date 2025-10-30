import { randomUUID } from "crypto";

export function getMockWalletAnalysis(walletAddress: string) {
  const portfolio = [
    {
      token: "SOL",
      symbol: "SOL",
      amount: 45.3,
      usd_value: 7706.33,
      percentage: 61.8,
      "24h_change": "+2.4%",
    },
    {
      token: "USDC",
      symbol: "USDC",
      amount: 2800.5,
      usd_value: 2800.5,
      percentage: 22.5,
      "24h_change": "0%",
    },
    {
      token: "JitoSOL",
      symbol: "JITOSOL",
      amount: 8.2,
      usd_value: 1455.62,
      percentage: 11.7,
      "24h_change": "+3.1%",
    },
    {
      token: "BONK",
      symbol: "BONK",
      amount: 18000000,
      usd_value: 600.74,
      percentage: 3.0,
      "24h_change": "+5.6%",
    },
    {
      token: "JUP",
      symbol: "JUP",
      amount: 3200,
      usd_value: 438.5,
      percentage: 1.0,
      "24h_change": "+1.1%",
    },
  ];

  const recentTransactions = [
    {
      id: randomUUID(),
      type: "swap",
      protocol: "Jupiter",
      direction: "SOL -> USDC",
      amount: 5.2,
      usd_value: 806.15,
      timestamp: Date.now() - 1000 * 60 * 15,
    },
    {
      id: randomUUID(),
      type: "stake",
      protocol: "Marinade",
      direction: "SOL -> mSOL",
      amount: 10,
      usd_value: 1478.5,
      timestamp: Date.now() - 1000 * 60 * 45,
    },
    {
      id: randomUUID(),
      type: "yield",
      protocol: "Kamino",
      direction: "USDC Vault",
      amount: 1500,
      usd_value: 1500,
      timestamp: Date.now() - 1000 * 60 * 60 * 6,
    },
  ];

  const totalValue = portfolio.reduce((sum, item) => sum + item.usd_value, 0);
  const recommendations = [
    "Consider diversifying into stablecoins for reduced volatility",
    "Your portfolio is heavily weighted in SOL - consider rebalancing",
    "High transaction frequency detected - review gas optimization strategies",
    "Explore liquid staking options to earn passive income on SOL holdings",
  ];

  return {
    wallet_address: walletAddress,
    portfolio,
    recent_transactions: recentTransactions,
    total_value_usd: Number(totalValue.toFixed(2)),
    risk_score: 7.8,
    recommendations: recommendations.slice(0, 3),
  };
}

export function getMockMarketOverview() {
  const tokens = {
    SOL: { price: 155.23, "24h_change": 2.34, volume_24h: 980000000 },
    USDC: { price: 1.0, "24h_change": 0, volume_24h: 750000000 },
    BONK: { price: 0.000025, "24h_change": 5.6, volume_24h: 12000000 },
    JUP: { price: 0.92, "24h_change": 1.8, volume_24h: 64000000 },
    ORCA: { price: 3.45, "24h_change": -0.8, volume_24h: 18500000 },
    RAY: { price: 2.18, "24h_change": 0.7, volume_24h: 14500000 },
  } as const;

  const defiProtocols = [
    { name: "Marinade", category: "Liquid Staking", tvl: 1100000000, "24h_volume": 12500000 },
    { name: "Jupiter", category: "Dex Aggregator", tvl: 1250000000, "24h_volume": 285000000 },
    { name: "Raydium", category: "DEX", tvl: 890000000, "24h_volume": 92000000 },
    { name: "Kamino", category: "Lending", tvl: 780000000, "24h_volume": 110000000 },
  ];

  const totalTvl = defiProtocols.reduce((sum, item) => sum + item.tvl, 0);
  const totalVolume = defiProtocols.reduce((sum, item) => sum + item["24h_volume"], 0);
  const sentiment = Object.values(tokens).reduce((acc, item) => acc + item["24h_change"], 0) > 0 ? "Bullish" : "Bearish";

  return {
    tokens,
    defi_protocols: defiProtocols,
    total_tvl: totalTvl,
    total_24h_volume: totalVolume,
    market_sentiment: sentiment,
    timestamp: Math.floor(Date.now() / 1000),
  };
}

export function getMockDefiOpportunities() {
  return {
    opportunities: [
      {
        protocol: "Marinade Finance",
        type: "yield_farming",
        apy: 6.8,
        tvl: 1100000000,
        risk_level: "low",
        token_pair: "SOL",
        description: "Stake SOL and receive mSOL liquid staking token",
      },
      {
        protocol: "Kamino",
        type: "lending",
        apy: 12.5,
        tvl: 780000000,
        risk_level: "medium",
        token_pair: "USDC",
        description: "Lend USDC to earn interest",
      },
      {
        protocol: "Raydium",
        type: "liquidity_pool",
        apy: 45.2,
        tvl: 890000000,
        risk_level: "high",
        token_pair: "SOL-USDC",
        description: "Provide liquidity to SOL-USDC pool",
      },
      {
        protocol: "Jupiter",
        type: "staking",
        apy: 8.5,
        tvl: 1250000000,
        risk_level: "low",
        token_pair: "JUP",
        description: "Stake JUP tokens to earn rewards",
      },
    ],
    count: 4,
    categories: ["Liquid Staking", "Lending", "Liquidity Pool", "Limit Orders"],
  };
}

export function getMockUserAccount(wallet: string) {
  const recentQueries = Array.from({ length: 5 }).map((_, idx) => ({
    id: randomUUID(),
    prompt: `Sample query #${idx + 1}`,
    timestamp: Date.now() - idx * 1000 * 60 * 60,
    response_quality: idx % 2 === 0 ? "high" : "medium",
  }));

  return {
    account: {
      wallet_address: wallet,
      solai_balance: 124.5,
      total_queries: 128,
      tier: "Pro",
      last_active: Date.now() - 1000 * 60 * 5,
    },
    recent_queries: recentQueries,
    usage_stats: {
      total_queries: 128,
      total_spent: 64,
      avg_response_time_ms: 1250,
      success_rate: 99.5,
    },
  };
}

export function getMockAccountStatus(wallet: string) {
  const base = wallet && wallet.length >= 8 ? wallet.slice(0, 8) : "SOLAIUSR";
  const userAccountPDA = `MockAccount-${base}`;
  const balance = Number((base.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0) % 50 + 10).toFixed(2));

  return {
    userAccountPDA,
    exists: true,
    balance,
  };
}

export function getMockRagSearch(query: string, topK: number) {
  const documents = Array.from({ length: topK }).map((_, idx) => ({
    id: randomUUID(),
    title: `Solana DeFi Insight #${idx + 1}`,
    excerpt: `Detailed breakdown of strategy ${idx + 1} for query: ${query}`,
    relevance: Number((0.9 - idx * 0.05).toFixed(2)),
    source: idx % 2 === 0 ? "https://docs.jup.ag" : "https://docs.raydium.io",
  }));

  return {
    query,
    results: documents,
    count: documents.length,
    sources: Array.from(new Set(documents.map((doc) => doc.source))),
  };
}

export function getMockSwapQuote(inputToken: string, outputToken: string, amount: number) {
  const basePrices: Record<string, number> = {
    SOL: 155.23,
    USDC: 1.0,
    BONK: 0.000025,
    JUP: 0.92,
    ORCA: 3.45,
    RAY: 2.18,
  };

  const inputPrice = basePrices[inputToken] ?? 1;
  const outputPrice = basePrices[outputToken] ?? 1;

  const baseOutput = (amount * inputPrice) / outputPrice;
  const routes = [
    {
      route_id: 1,
      dexes: ["Raydium", "Orca"],
      output_amount: baseOutput * 0.998,
      price_impact: 0.12,
      fee_pct: 0.3,
    },
    {
      route_id: 2,
      dexes: ["Orca"],
      output_amount: baseOutput * 0.997,
      price_impact: 0.15,
      fee_pct: 0.25,
    },
    {
      route_id: 3,
      dexes: ["Raydium"],
      output_amount: baseOutput * 0.996,
      price_impact: 0.18,
      fee_pct: 0.3,
    },
  ];

  const bestRoute = routes.reduce((best, route) => (route.output_amount > best.output_amount ? route : best), routes[0]);

  return {
    input_token: inputToken,
    output_token: outputToken,
    input_amount: amount,
    output_amount: Number(bestRoute.output_amount.toFixed(6)),
    best_route: bestRoute,
    all_routes: routes,
    estimated_execution_time_ms: 850,
  };
}

export function getMockPlatformStats() {
  return {
    total_users: 1247,
    total_queries: 15832,
    total_transactions: 8956,
    total_volume_usd: 4523789.5,
    avg_response_time_ms: 1150,
    uptime_pct: 99.97,
    last_updated: Math.floor(Date.now() / 1000),
  };
}

export function getMockChatCompletion(prompt: string, wallet: string) {
  return {
    completion: `Demo response for wallet ${wallet}:
- Prompt received: ${prompt}
- Recommendation: Xem xét tái cân bằng danh mục và theo dõi biến động SOL.

Để nhận phân tích thời gian thực, hãy khởi động dịch vụ llm-processor.`,
    citations: [],
    meta: {
      fallback: true,
      reason: "llm_processor_unavailable",
    },
  };
}

export function getMockHealth() {
  return { status: "mock-ok" };
}
