import axios from 'axios';
import { config } from '../utils/config';

export interface TokenBalance {
  mint: string;
  amount: number;
  decimals: number;
  uiAmount: number;
  symbol?: string;
  name?: string;
  logoURI?: string;
}

export interface Transaction {
  signature: string;
  timestamp: number;
  type: string;
  description: string;
  fee: number;
  feePayer: string;
  status: 'success' | 'failed';
}

export interface EnhancedTransaction {
  signature: string;
  timestamp: number;
  fee: number;
  feePayer: string;
  type: string;
  description: string;
  nativeTransfers?: Array<{
    fromUserAccount: string;
    toUserAccount: string;
    amount: number;
  }>;
  tokenTransfers?: Array<{
    fromUserAccount: string;
    toUserAccount: string;
    mint: string;
    tokenAmount: number;
  }>;
}

export class HeliusClient {
  private client: ReturnType<typeof axios.create>;
  private apiKey: string;

  constructor() {
    this.apiKey = config.helius.api_key;
    
    this.client = axios.create({
      baseURL: 'https://api.helius.xyz',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Get token balances for a wallet address
   */
  async getTokenBalances(address: string): Promise<TokenBalance[]> {
    try {
      const response = await this.client.get(`/v0/addresses/${address}/balances`, {
        params: { 'api-key': this.apiKey },
      });

      const tokens: TokenBalance[] = response.data.tokens || [];
      
      // Add SOL native balance
      const nativeBalance = response.data.nativeBalance || 0;
      tokens.unshift({
        mint: 'So11111111111111111111111111111111111111112', // SOL mint
        amount: nativeBalance,
        decimals: 9,
        uiAmount: nativeBalance / 1e9,
        symbol: 'SOL',
        name: 'Solana',
      });

      return tokens;
    } catch (error: any) {
      console.error('Helius getTokenBalances error:', error.message);
      throw new Error(`Failed to fetch token balances: ${error.message}`);
    }
  }

  /**
   * Get transaction history for a wallet
   */
  async getTransactions(address: string, limit: number = 10): Promise<Transaction[]> {
    try {
      const response = await this.client.get(`/v0/addresses/${address}/transactions`, {
        params: {
          'api-key': this.apiKey,
          limit,
        },
      });

      const transactions: Transaction[] = (response.data || []).map((tx: any) => ({
        signature: tx.signature || '',
        timestamp: tx.timestamp || Date.now() / 1000,
        type: tx.type || 'UNKNOWN',
        description: tx.description || 'Transaction',
        fee: tx.fee || 0,
        feePayer: tx.feePayer || address,
        status: tx.status || 'success',
      }));

      return transactions;
    } catch (error: any) {
      console.error('Helius getTransactions error:', error.message);
      throw new Error(`Failed to fetch transactions: ${error.message}`);
    }
  }

  /**
   * Get enhanced transaction details
   */
  async getEnhancedTransactions(signatures: string[]): Promise<EnhancedTransaction[]> {
    if (signatures.length === 0) return [];

    try {
      const response = await this.client.post(
        '/v1/enhanced-transactions',
        { transactions: signatures },
        { params: { 'api-key': this.apiKey } }
      );

      return response.data || [];
    } catch (error: any) {
      console.error('Helius getEnhancedTransactions error:', error.message);
      return [];
    }
  }

  /**
   * Get SOL balance for an address
   */
  async getBalance(address: string): Promise<number> {
    try {
      const balances = await this.getTokenBalances(address);
      const solToken = balances.find(t => t.symbol === 'SOL');
      return solToken?.uiAmount || 0;
    } catch (error: any) {
      console.error('Helius getBalance error:', error.message);
      return 0;
    }
  }
}

// Singleton instance
let heliusClient: HeliusClient | null = null;

export function getHeliusClient(): HeliusClient {
  if (!heliusClient) {
    heliusClient = new HeliusClient();
  }
  return heliusClient;
}
