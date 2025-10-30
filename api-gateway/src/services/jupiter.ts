import axios from 'axios';
import { logger } from '../utils/logger';

export interface JupiterToken {
  address: string;
  chainId: number;
  decimals: number;
  name: string;
  symbol: string;
  logoURI?: string;
  tags?: string[];
}

export interface JupiterQuote {
  inputMint: string;
  inAmount: string;
  outputMint: string;
  outAmount: string;
  otherAmountThreshold: string;
  swapMode: string;
  slippageBps: number;
  platformFee?: {
    amount: string;
    feeBps: number;
  };
  priceImpactPct: string;
  routePlan: Array<{
    swapInfo: {
      ammKey: string;
      label: string;
      inputMint: string;
      outputMint: string;
      inAmount: string;
      outAmount: string;
      feeAmount: string;
      feeMint: string;
    };
    percent: number;
  }>;
  contextSlot?: number;
  timeTaken?: number;
}

export interface SwapTransaction {
  swapTransaction: string;
  lastValidBlockHeight: number;
  prioritizationFeeLamports?: number;
}

export interface JupiterPriceInfo {
  id: string;
  mintSymbol: string;
  vsToken: string;
  vsTokenSymbol: string;
  price: number;
}

export class JupiterClient {
  private client: any;
  private baseUrl: string;
  private priceApiUrl: string;
  private swapApiUrl: string;

  constructor() {
    this.baseUrl = 'https://lite-api.jup.ag';
    this.priceApiUrl = 'https://lite-api.jup.ag/price/v2';
    this.swapApiUrl = 'https://lite-api.jup.ag/swap/v1';
    
    this.client = axios.create({
      timeout: 30000, // Increase to 30 seconds
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.client.interceptors.request.use((config: any) => {
      logger.info('Jupiter API Request', {
        method: config.method?.toUpperCase(),
        url: config.url,
      });
      return config;
    });

    // Response interceptor
    this.client.interceptors.response.use(
      (response: any) => {
        logger.info('Jupiter API Response', {
          status: response.status,
          url: response.config.url,
        });
        return response;
      },
      (error: any) => {
        logger.error('Jupiter API Error', {
          message: error.message,
          url: error.config?.url,
          status: error.response?.status,
          data: error.response?.data,
        });
        throw error;
      }
    );
  }

  /**
   * Get all tokens supported by Jupiter
   * Returns common Solana tokens
   */
  async getTokens(): Promise<JupiterToken[]> {
    // Return common tokens instead of fetching from API
    const commonTokens: JupiterToken[] = [
      {
        address: 'So11111111111111111111111111111111111111112',
        chainId: 101,
        decimals: 9,
        name: 'Wrapped SOL',
        symbol: 'SOL',
        logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
      },
      {
        address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        chainId: 101,
        decimals: 6,
        name: 'USD Coin',
        symbol: 'USDC',
        logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
      },
      {
        address: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
        chainId: 101,
        decimals: 6,
        name: 'USDT',
        symbol: 'USDT',
      },
      {
        address: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
        chainId: 101,
        decimals: 5,
        name: 'Bonk',
        symbol: 'BONK',
      },
      {
        address: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
        chainId: 101,
        decimals: 6,
        name: 'Jupiter',
        symbol: 'JUP',
      },
    ];
    
    return Promise.resolve(commonTokens);
  }

  /**
   * Get quote for a swap
   * @param inputMint - Input token mint address
   * @param outputMint - Output token mint address
   * @param amount - Amount in smallest unit (lamports for SOL)
   * @param slippageBps - Slippage tolerance in basis points (default: 50 = 0.5%)
   */
  async getQuote(
    inputMint: string,
    outputMint: string,
    amount: number,
    slippageBps: number = 50
  ): Promise<JupiterQuote> {
    try {
      const params = {
        inputMint,
        outputMint,
        amount: amount.toString(),
        slippageBps,
        onlyDirectRoutes: false,
        asLegacyTransaction: false,
      };

      logger.info('Getting Jupiter quote', params);

      const response = await this.client.get(`${this.swapApiUrl}/quote`, { params });
      return response.data;
    } catch (error) {
      logger.error('Failed to get Jupiter quote', { error });
      throw error;
    }
  }

  /**
   * Get swap transaction for a quote
   * @param quote - Quote from getQuote
   * @param userPublicKey - User's wallet public key
   * @param wrapUnwrapSOL - Whether to wrap/unwrap SOL (default: true)
   * @param prioritizationFeeLamports - Priority fee in lamports
   */
  async getSwapTransaction(
    quote: JupiterQuote,
    userPublicKey: string,
    wrapUnwrapSOL: boolean = true,
    prioritizationFeeLamports?: number
  ): Promise<SwapTransaction> {
    try {
      const body = {
        quoteResponse: quote,
        userPublicKey,
        wrapAndUnwrapSol: wrapUnwrapSOL,
        dynamicComputeUnitLimit: true,
        prioritizationFeeLamports,
      };

      logger.info('Getting swap transaction', { userPublicKey });

      const response = await this.client.post(`${this.swapApiUrl}/swap`, body);
      return response.data;
    } catch (error) {
      logger.error('Failed to get swap transaction', { error });
      throw error;
    }
  }

  /**
   * Get price for tokens
   * @param ids - Array of token mint addresses
   * @param vsToken - Quote token (default: USDC)
   */
  async getPrices(ids: string[], vsToken: string = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'): Promise<Record<string, JupiterPriceInfo>> {
    try {
      const idsParam = ids.join(',');
      const response = await this.client.get(this.priceApiUrl, {
        params: {
          ids: idsParam,
          vsToken,
        },
      });
      return response.data.data;
    } catch (error) {
      logger.error('Failed to get Jupiter prices', { error });
      throw error;
    }
  }

  /**
   * Get best route for a swap with multiple options
   */
  async getSwapRoutes(
    inputMint: string,
    outputMint: string,
    amount: number,
    slippageBps: number = 50
  ): Promise<JupiterQuote[]> {
    try {
      const params = {
        inputMint,
        outputMint,
        amount: amount.toString(),
        slippageBps,
        onlyDirectRoutes: false,
        asLegacyTransaction: false,
        maxAccounts: 64,
      };

      const response = await this.client.get(`${this.swapApiUrl}/quote`, { params });
      
      // Jupiter v1 returns single best quote, but we can wrap it in array for consistency
      return [response.data];
    } catch (error) {
      logger.error('Failed to get swap routes', { error });
      throw error;
    }
  }

  /**
   * Get token info by symbol or mint address
   */
  async findToken(searchTerm: string): Promise<JupiterToken[]> {
    try {
      const tokens = await this.getTokens();
      const search = searchTerm.toLowerCase();
      
      return tokens.filter(
        (token) =>
          token.symbol.toLowerCase().includes(search) ||
          token.name.toLowerCase().includes(search) ||
          token.address.toLowerCase() === search
      ).slice(0, 10); // Limit to 10 results
    } catch (error) {
      logger.error('Failed to find token', { searchTerm, error });
      throw error;
    }
  }

  /**
   * Calculate price impact for a swap
   */
  calculatePriceImpact(quote: JupiterQuote): number {
    return parseFloat(quote.priceImpactPct);
  }

  /**
   * Format amount from lamports/smallest unit to human readable
   */
  formatAmount(amount: string, decimals: number): number {
    return parseInt(amount) / Math.pow(10, decimals);
  }

  /**
   * Format amount to lamports/smallest unit
   */
  toSmallestUnit(amount: number, decimals: number): number {
    return Math.floor(amount * Math.pow(10, decimals));
  }
}
