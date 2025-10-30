import { Router, Request, Response } from 'express';
import { DefiLlamaClient } from '../services/defillama';
import { logger } from '../utils/logger';

const router = Router();
const defiLlamaClient = new DefiLlamaClient();

/**
 * GET /api/defi/opportunities
 * Get top DeFi opportunities on Solana
 */
router.get('/opportunities', async (_req: Request, res: Response) => {
  try {
    const limit = parseInt(((_req as any).query?.limit as string) || '10', 10);
    
    logger.info('Fetching DeFi opportunities', { limit });
    
    const opportunities = await defiLlamaClient.getTopSolanaOpportunities(limit);
    
    // Format response
    const formatted = opportunities.map((pool) => ({
      protocol: pool.project,
      pool_name: pool.symbol,
      apy: pool.apy,
      apy_base: pool.apyBase || 0,
      apy_reward: pool.apyReward || 0,
      tvl_usd: pool.tvlUsd,
      is_stablecoin: pool.stablecoin,
      risk_level: pool.stablecoin ? 'low' : (pool.tvlUsd > 1000000 ? 'medium' : 'high'),
      chain: pool.chain,
      pool_id: pool.pool,
      exposure: pool.exposure || 'single',
      il_risk: pool.ilRisk || 'none',
      apy_change_1d: pool.apyPct1D,
      apy_change_7d: pool.apyPct7D,
      apy_change_30d: pool.apyPct30D,
    }));
    
    res.json({
      opportunities: formatted,
      count: formatted.length,
      source: 'defillama',
      timestamp: Math.floor(Date.now() / 1000),
    });
  } catch (error: any) {
    logger.error('Failed to fetch DeFi opportunities', { error: error.message });
    
    // Fallback to mock data on error
    res.json({
      opportunities: [
        {
          protocol: 'Marinade Finance',
          pool_name: 'mSOL',
          apy: 7.2,
          apy_base: 7.2,
          apy_reward: 0,
          tvl_usd: 450000000,
          is_stablecoin: false,
          risk_level: 'low',
          chain: 'Solana',
          exposure: 'single',
          il_risk: 'none',
        },
        {
          protocol: 'Kamino Finance',
          pool_name: 'USDC',
          apy: 12.5,
          apy_base: 8.5,
          apy_reward: 4.0,
          tvl_usd: 120000000,
          is_stablecoin: true,
          risk_level: 'low',
          chain: 'Solana',
          exposure: 'single',
          il_risk: 'none',
        },
      ],
      count: 2,
      source: 'mock-fallback',
      timestamp: Math.floor(Date.now() / 1000),
      error: 'Using fallback data due to API error',
    });
  }
});

/**
 * GET /api/defi/protocols
 * Get all Solana DeFi protocols
 */
router.get('/protocols', async (_req: Request, res: Response) => {
  try {
    logger.info('Fetching Solana protocols');
    
    const protocols = await defiLlamaClient.getSolanaProtocols();
    
    // Sort by TVL descending
    protocols.sort((a, b) => b.tvl - a.tvl);
    
    // Format response
    const formatted = protocols.slice(0, 20).map((protocol) => ({
      id: protocol.id,
      name: protocol.name,
      symbol: protocol.symbol,
      tvl_usd: protocol.tvl,
      category: protocol.category || 'defi',
      url: protocol.url,
    }));
    
    res.json({
      protocols: formatted,
      count: formatted.length,
      total_tvl: protocols.reduce((sum, p) => sum + p.tvl, 0),
      source: 'defillama',
      timestamp: Math.floor(Date.now() / 1000),
    });
  } catch (error: any) {
    logger.error('Failed to fetch protocols', { error: error.message });
    
    res.status(500).json({
      error: 'Failed to fetch protocols',
      message: error.message,
    });
  }
});

/**
 * GET /api/defi/tvl
 * Get Solana total value locked
 */
router.get('/tvl', async (_req: Request, res: Response) => {
  try {
    logger.info('Fetching Solana TVL');
    
    const tvl = await defiLlamaClient.getSolanaTVL();
    
    res.json({
      chain: 'Solana',
      tvl_usd: tvl,
      source: 'defillama',
      timestamp: Math.floor(Date.now() / 1000),
    });
  } catch (error: any) {
    logger.error('Failed to fetch Solana TVL', { error: error.message });
    
    res.status(500).json({
      error: 'Failed to fetch TVL',
      message: error.message,
    });
  }
});

/**
 * GET /api/defi/yields
 * Get all Solana yield pools
 */
router.get('/yields', async (_req: Request, res: Response) => {
  try {
    const minApy = parseFloat(((_req as any).query?.min_apy as string) || '5');
    
    logger.info('Fetching Solana yield pools', { minApy });
    
    const pools = await defiLlamaClient.getSolanaYieldPools(minApy);
    
    res.json({
      pools: pools.slice(0, 50), // Limit to 50 results
      count: pools.length,
      source: 'defillama',
      timestamp: Math.floor(Date.now() / 1000),
    });
  } catch (error: any) {
    logger.error('Failed to fetch yield pools', { error: error.message });
    
    res.status(500).json({
      error: 'Failed to fetch yield pools',
      message: error.message,
    });
  }
});

export default router;
