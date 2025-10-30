import axios from 'axios';
import { config } from '../utils/config';

export interface TokenPrice {
  id: string;
  symbol: string;
  current_price: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  circulating_supply: number;
  last_updated: string;
}

export interface MarketData {
  prices: Array<[number, number]>; // [timestamp, price]
  market_caps: Array<[number, number]>;
  total_volumes: Array<[number, number]>;
}

export class CoinGeckoClient {
  private client: ReturnType<typeof axios.create>;
  private apiKey: string;

  // CoinGecko coin IDs for Solana tokens
  private readonly TOKEN_IDS: Record<string, string> = {
    SOL: 'solana',
    USDC: 'usd-coin',
    USDT: 'tether',
    BONK: 'bonk',
    JUP: 'jupiter-exchange-solana',
    ORCA: 'orca',
    RAY: 'raydium',
    MNDE: 'marinade',
    JTO: 'jito-governance-token',
    WIF: 'dogwifcoin',
  };

  constructor() {
    this.apiKey = config.coingecko.api_key;
    
    this.client = axios.create({
      baseURL: config.coingecko.api_url,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        // Note: Demo API key goes in query param, not header
      },
    });
  }

  /**
   * Get current prices for multiple tokens
   */
  async getTokenPrices(symbols: string[]): Promise<Record<string, TokenPrice>> {
    try {
      // Map symbols to CoinGecko IDs
      const ids = symbols
        .map(s => this.TOKEN_IDS[s.toUpperCase()])
        .filter(Boolean)
        .join(',');

      if (!ids) {
        console.warn('No valid token symbols provided');
        return {};
      }

      // Use simple/price endpoint instead of coins/markets (more reliable)
      console.log('[CoinGecko] Fetching prices for:', ids);
      console.log('[CoinGecko] Base URL:', this.client.defaults.baseURL);
      console.log('[CoinGecko] API Key:', this.apiKey ? 'Present' : 'Missing');
      
      const response = await this.client.get('/simple/price', {
        params: {
          x_cg_demo_api_key: this.apiKey, // Demo API key in query param
          ids,
          vs_currencies: 'usd',
          include_market_cap: true,
          include_24hr_vol: true,
          include_24hr_change: true,
        },
      });

      const result: Record<string, TokenPrice> = {};
      
      for (const [coinId, data] of Object.entries(response.data)) {
        // Find the symbol that matches this coin ID
        const symbol = Object.keys(this.TOKEN_IDS).find(
          k => this.TOKEN_IDS[k] === coinId
        );
        
        if (symbol && typeof data === 'object' && data !== null) {
          const priceData = data as any;
          result[symbol] = {
            id: coinId,
            symbol: symbol,
            current_price: priceData.usd || 0,
            price_change_24h: 0, // Not available in simple/price
            price_change_percentage_24h: priceData.usd_24h_change || 0,
            market_cap: priceData.usd_market_cap || 0,
            total_volume: priceData.usd_24h_vol || 0,
            circulating_supply: 0, // Not available in simple/price
            last_updated: new Date().toISOString(),
          };
        }
      }

      return result;
    } catch (error: any) {
      console.error('[CoinGecko] getTokenPrices error:', error.message);
      if (error.response) {
        console.error('[CoinGecko] Response status:', error.response.status);
        console.error('[CoinGecko] Response data:', error.response.data);
      }
      throw new Error(`Failed to fetch token prices: ${error.message}`);
    }
  }

  /**
   * Get historical price data for a token
   */
  async getMarketChart(symbol: string, days: number = 7): Promise<MarketData> {
    try {
      const coinId = this.TOKEN_IDS[symbol.toUpperCase()];
      if (!coinId) {
        throw new Error(`Unknown token symbol: ${symbol}`);
      }

      const response = await this.client.get(`/coins/${coinId}/market_chart`, {
        params: {
          vs_currency: 'usd',
          days,
        },
      });

      return {
        prices: response.data.prices || [],
        market_caps: response.data.market_caps || [],
        total_volumes: response.data.total_volumes || [],
      };
    } catch (error: any) {
      console.error('CoinGecko getMarketChart error:', error.message);
      throw new Error(`Failed to fetch market chart: ${error.message}`);
    }
  }

  /**
   * Get simple price for a single token (faster, no detailed data)
   */
  async getSimplePrice(symbol: string): Promise<number> {
    try {
      const coinId = this.TOKEN_IDS[symbol.toUpperCase()];
      if (!coinId) {
        throw new Error(`Unknown token symbol: ${symbol}`);
      }

      const response = await this.client.get('/simple/price', {
        params: {
          ids: coinId,
          vs_currencies: 'usd',
        },
      });

      return response.data[coinId]?.usd || 0;
    } catch (error: any) {
      console.error('CoinGecko getSimplePrice error:', error.message);
      return 0;
    }
  }

  /**
   * Get global market data
   */
  async getGlobalData(): Promise<any> {
    try {
      const response = await this.client.get('/global');
      return response.data.data || {};
    } catch (error: any) {
      console.error('CoinGecko getGlobalData error:', error.message);
      return {};
    }
  }
}

// Singleton instance
let coinGeckoClient: CoinGeckoClient | null = null;

export function getCoinGeckoClient(): CoinGeckoClient {
  if (!coinGeckoClient) {
    coinGeckoClient = new CoinGeckoClient();
  }
  return coinGeckoClient;
}
