import { Connection, PublicKey, Keypair, Transaction, SystemProgram } from '@solana/web3.js';
import bs58 from 'bs58';
import { config } from '../utils/config';

const LAMPORTS_PER_SOL = 1_000_000_000;

export interface WalletBalance {
  address: string;
  lamports: number;
  sol: number;
}

export interface TransactionResult {
  signature: string;
  success: boolean;
  error?: string;
}

export class SolanaService {
  private connection: typeof Connection.prototype;
  private devKeypair: typeof Keypair.prototype | null = null;

  constructor() {
    const rpcUrl = config.solana.rpc_url;
    this.connection = new Connection(rpcUrl, 'confirmed');
    
    // Load dev wallet keypair if available
    if (config.dev_wallet?.solana_key) {
      try {
        const secretKey = bs58.decode(config.dev_wallet.solana_key);
        this.devKeypair = Keypair.fromSecretKey(secretKey);
        console.log('[Solana] Dev wallet loaded:', this.devKeypair.publicKey.toString());
      } catch (error: any) {
        console.error('[Solana] Failed to load dev wallet keypair:', error.message);
      }
    }
  }

  /**
   * Get SOL balance for an address
   */
  async getBalance(address: string): Promise<WalletBalance> {
    try {
      const publicKey = new PublicKey(address);
      const lamports = await this.connection.getBalance(publicKey);
      
      return {
        address,
        lamports,
        sol: lamports / LAMPORTS_PER_SOL,
      };
    } catch (error: any) {
      console.error('[Solana] getBalance error:', error.message);
      throw new Error(`Failed to get balance: ${error.message}`);
    }
  }

  /**
   * Get recent transactions for an address
   */
  async getTransactionSignatures(address: string, limit: number = 10) {
    try {
      const publicKey = new PublicKey(address);
      const signatures = await this.connection.getSignaturesForAddress(publicKey, { limit });
      
      return signatures.map((sig: any) => ({
        signature: sig.signature,
        slot: sig.slot,
        timestamp: sig.blockTime,
        err: sig.err,
        memo: sig.memo,
      }));
    } catch (error: any) {
      console.error('[Solana] getTransactionSignatures error:', error.message);
      return [];
    }
  }

  /**
   * Get transaction details
   */
  async getTransaction(signature: string) {
    try {
      const tx = await this.connection.getTransaction(signature, {
        maxSupportedTransactionVersion: 0,
      });
      return tx;
    } catch (error: any) {
      console.error('[Solana] getTransaction error:', error.message);
      return null;
    }
  }

  /**
   * Request airdrop (devnet only)
   */
  async requestAirdrop(address: string, amountSol: number = 1): Promise<TransactionResult> {
    try {
      if (config.solana.cluster !== 'devnet') {
        throw new Error('Airdrop only available on devnet');
      }

      const publicKey = new PublicKey(address);
      const signature = await this.connection.requestAirdrop(
        publicKey,
        amountSol * LAMPORTS_PER_SOL
      );

      // Wait for confirmation
      await this.connection.confirmTransaction(signature);

      return {
        signature,
        success: true,
      };
    } catch (error: any) {
      console.error('[Solana] requestAirdrop error:', error.message);
      return {
        signature: '',
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get dev wallet info
   */
  getDevWallet(): { publicKey: string; hasKeypair: boolean } | null {
    if (!this.devKeypair) {
      return null;
    }
    return {
      publicKey: this.devKeypair.publicKey.toString(),
      hasKeypair: true,
    };
  }

  /**
   * Send SOL from dev wallet to another address
   */
  async sendSol(toAddress: string, amountSol: number): Promise<TransactionResult> {
    if (!this.devKeypair) {
      return {
        signature: '',
        success: false,
        error: 'Dev wallet keypair not loaded',
      };
    }

    try {
      const toPublicKey = new PublicKey(toAddress);
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: this.devKeypair.publicKey,
          toPubkey: toPublicKey,
          lamports: amountSol * LAMPORTS_PER_SOL,
        })
      );

      const signature = await this.connection.sendTransaction(transaction, [this.devKeypair]);
      await this.connection.confirmTransaction(signature);

      return {
        signature,
        success: true,
      };
    } catch (error: any) {
      console.error('[Solana] sendSol error:', error.message);
      return {
        signature: '',
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get network info
   */
  async getNetworkInfo() {
    try {
      const [epochInfo, version, supply] = await Promise.all([
        this.connection.getEpochInfo(),
        this.connection.getVersion(),
        this.connection.getSupply(),
      ]);

      return {
        cluster: config.solana.cluster,
        epoch: epochInfo.epoch,
        slot: epochInfo.absoluteSlot,
        version: version['solana-core'],
        totalSupply: supply.value.total / LAMPORTS_PER_SOL,
        circulatingSupply: supply.value.circulating / LAMPORTS_PER_SOL,
      };
    } catch (error: any) {
      console.error('[Solana] getNetworkInfo error:', error.message);
      return null;
    }
  }
}

// Singleton instance
let solanaService: SolanaService | null = null;

export function getSolanaService(): SolanaService {
  if (!solanaService) {
    solanaService = new SolanaService();
  }
  return solanaService;
}
