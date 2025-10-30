import axios from 'axios';
import { logger } from '../utils/logger';

export interface DeFiProtocol {
  id: string;
  name: string;
  symbol: string;
  chain: string;
  tvl: number;
  apy?: number;
  apyBase?: number;
  apyReward?: number;
  category?: string;
  url?: string;
}

export interface YieldPool {
  chain: string;
  project: string;
  symbol: string;
  tvlUsd: number;
  apy: number;
  apyBase?: number;
  apyReward?: number;
  apyPct1D?: number;
  apyPct7D?: number;
  apyPct30D?: number;
  stablecoin: boolean;
  ilRisk?: string;
  exposure?: string;
  predictions?: {
    predictedClass?: string;
    predictedProbability?: number;
    binnedConfidence?: number;
  };
  pool: string;
  poolMeta?: string;
}

export interface ProtocolTVL {
  date: string;
  totalLiquidityUSD: number;
}

export class DefiLlamaClient {
  private client: any;
  private baseUrl: string;

  constructor() {
    this.baseUrl = 'https://api.llama.fi';
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 15000,
      headers: {
        'Accept': 'application/json',
      },
    });

    // Request interceptor for logging
    this.client.interceptors.request.use((config: any) => {
      logger.info('DefiLlama API Request', {
        method: config.method?.toUpperCase(),
        url: config.url,
        baseURL: config.baseURL,
      });
      return config;
    });

    // Response interceptor for logging
    this.client.interceptors.response.use(
      (response: any) => {
        logger.info('DefiLlama API Response', {
          status: response.status,
          url: response.config.url,
        });
        return response;
      },
      (error: any) => {
        logger.error('DefiLlama API Error', {
          message: error.message,
          url: error.config?.url,
          status: error.response?.status,
        });
        throw error;
      }
    );
  }

  /**
   * Get all protocols with TVL data
   */
  async getProtocols(): Promise<DeFiProtocol[]> {
    try {
      const response = await this.client.get('/protocols');
      return response.data;
    } catch (error) {
      logger.error('Failed to fetch protocols from DefiLlama', { error });
      throw error;
    }
  }

  /**
   * Get Solana-specific protocols
   */
  async getSolanaProtocols(): Promise<DeFiProtocol[]> {
    try {
      const protocols = await this.getProtocols();
      const solanaProtocols = protocols.filter(
        (p) => p.chain === 'Solana' || (p.chain && p.chain.toLowerCase().includes('solana'))
      );
      return solanaProtocols;
    } catch (error) {
      logger.error('Failed to fetch Solana protocols', { error });
      throw error;
    }
  }

  /**
   * Get current TVL for a specific protocol
   */
  async getProtocolTVL(protocol: string): Promise<number> {
    try {
      const response = await this.client.get(`/tvl/${protocol}`);
      return response.data;
    } catch (error) {
      logger.error('Failed to fetch protocol TVL', { protocol, error });
      throw error;
    }
  }

  /**
   * Get yield pools (APY data)
   */
  async getYieldPools(): Promise<YieldPool[]> {
    try {
      const response = await this.client.get('https://yields.llama.fi/pools');
      return response.data.data || [];
    } catch (error) {
      logger.error('Failed to fetch yield pools', { error });
      throw error;
    }
  }

  /**
   * Get Solana yield pools with high APY
   */
  async getSolanaYieldPools(minApy: number = 5): Promise<YieldPool[]> {
    try {
      const pools = await this.getYieldPools();
      const solanaPools = pools.filter(
        (pool) =>
          pool.chain === 'Solana' &&
          pool.apy >= minApy &&
          pool.tvlUsd > 10000 // At least $10k TVL for safety
      );
      
      // Sort by APY descending
      solanaPools.sort((a, b) => b.apy - a.apy);
      
      return solanaPools;
    } catch (error) {
      logger.error('Failed to fetch Solana yield pools', { error });
      throw error;
    }
  }

  /**
   * Get top DeFi opportunities on Solana
   */
  async getTopSolanaOpportunities(limit: number = 10): Promise<YieldPool[]> {
    try {
      const pools = await this.getSolanaYieldPools(5);
      
      // Filter for safer opportunities
      const safeOpportunities = pools.filter((pool) => {
        // Prefer stablecoins or well-known tokens
        const isStablecoin = pool.stablecoin;
        const hasGoodTVL = pool.tvlUsd > 100000; // At least $100k TVL
        const hasReasonableAPY = pool.apy < 200; // Filter out suspiciously high APY (> 200%)
        const isKnownProject = ['marinade', 'kamino', 'raydium', 'orca', 'drift', 'marginfi', 'solend', 'jupiter'].some(
          p => pool.project.toLowerCase().includes(p)
        );
        
        return (isStablecoin && hasReasonableAPY) || (hasGoodTVL && hasReasonableAPY && isKnownProject);
      });
      
      return safeOpportunities.slice(0, limit);
    } catch (error) {
      logger.error('Failed to fetch top Solana opportunities', { error });
      throw error;
    }
  }

  /**
   * Get protocol details by slug
   */
  async getProtocolDetails(slug: string): Promise<any> {
    try {
      const response = await this.client.get(`/protocol/${slug}`);
      return response.data;
    } catch (error) {
      logger.error('Failed to fetch protocol details', { slug, error });
      throw error;
    }
  }

  /**
   * Get historical TVL for a protocol
   */
  async getProtocolHistoricalTVL(slug: string): Promise<ProtocolTVL[]> {
    try {
      const response = await this.client.get(`/protocol/${slug}`);
      return response.data.tvl || [];
    } catch (error) {
      logger.error('Failed to fetch historical TVL', { slug, error });
      throw error;
    }
  }

  /**
   * Get chains with TVL data
   */
  async getChains(): Promise<any[]> {
    try {
      const response = await this.client.get('/chains');
      return response.data;
    } catch (error) {
      logger.error('Failed to fetch chains', { error });
      throw error;
    }
  }

  /**
   * Get Solana chain TVL
   */
  async getSolanaTVL(): Promise<number> {
    try {
      const chains = await this.getChains();
      const solana = chains.find(
        (chain) => chain.name === 'Solana' || chain.gecko_id === 'solana'
      );
      return solana?.tvl || 0;
    } catch (error) {
      logger.error('Failed to fetch Solana TVL', { error });
      throw error;
    }
  }
}
