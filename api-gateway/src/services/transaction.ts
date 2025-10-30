import { 
  Connection, 
  Keypair, 
  PublicKey, 
  Transaction, 
  sendAndConfirmTransaction,
  SystemProgram,
} from '@solana/web3.js';
import { config } from '../utils/config';
import { logger } from '../utils/logger';
import { JupiterClient } from './jupiter';

const LAMPORTS_PER_SOL = 1000000000;

export interface SwapResult {
  signature: string;
  success: boolean;
  error?: string;
}

export interface TransferResult {
  signature: string;
  from: string;
  to: string;
  amount: number;
  success: boolean;
}

export class TransactionService {
  private connection: any;
  private devWallet: any | null;
  private jupiterClient: JupiterClient;

  constructor() {
    // Use Helius RPC for better performance
    const rpcUrl = config.solana.rpc_url || 'https://api.devnet.solana.com';
    this.connection = new Connection(rpcUrl, 'confirmed');
    
    // Load dev wallet
    this.devWallet = null;
    const privateKeyPath = (config.dev_wallet as any)?.private_key_path;
    if (privateKeyPath) {
      try {
        const fs = require('fs');
        const keypairData = JSON.parse(fs.readFileSync(privateKeyPath, 'utf-8'));
        this.devWallet = Keypair.fromSecretKey(new Uint8Array(keypairData));
        logger.info('[TransactionService] Dev wallet loaded', {
          publicKey: this.devWallet.publicKey.toBase58(),
        });
      } catch (error: any) {
        logger.error('[TransactionService] Failed to load dev wallet', { error: error.message });
      }
    }
    
    this.jupiterClient = new JupiterClient();
  }

  /**
   * Get dev wallet public key
   */
  getDevWalletPublicKey(): string | null {
    return this.devWallet?.publicKey.toBase58() || null;
  }

  /**
   * Execute a swap transaction
   */
  async executeSwap(
    inputToken: string,
    outputToken: string,
    amount: number,
    slippageBps: number = 50
  ): Promise<SwapResult> {
    if (!this.devWallet) {
      throw new Error('Dev wallet not configured');
    }

    try {
      logger.info('[TransactionService] Starting swap', {
        inputToken,
        outputToken,
        amount,
        slippageBps,
      });

      // Get token info and convert amount
      const inputTokenInfo = await this.jupiterClient.findToken(inputToken);
      if (inputTokenInfo.length === 0) {
        throw new Error(`Token not found: ${inputToken}`);
      }
      
      const inputMint = inputTokenInfo[0].address;
      const inputDecimals = inputTokenInfo[0].decimals;
      const outputTokenInfo = await this.jupiterClient.findToken(outputToken);
      if (outputTokenInfo.length === 0) {
        throw new Error(`Token not found: ${outputToken}`);
      }
      
      const outputMint = outputTokenInfo[0].address;
      const amountInSmallestUnit = this.jupiterClient.toSmallestUnit(amount, inputDecimals);

      // Get quote
      const quote = await this.jupiterClient.getQuote(
        inputMint,
        outputMint,
        amountInSmallestUnit,
        slippageBps
      );

      logger.info('[TransactionService] Got quote', {
        inAmount: quote.inAmount,
        outAmount: quote.outAmount,
        priceImpact: quote.priceImpactPct,
      });

      // Get swap transaction
      const swapTxData = await this.jupiterClient.getSwapTransaction(
        quote,
        this.devWallet.publicKey.toBase58(),
        true, // wrap/unwrap SOL
        undefined // no priority fee
      );

      // Deserialize the base64 transaction
      const txBuffer = Buffer.from(swapTxData.swapTransaction, 'base64');
      const tx = Transaction.from(txBuffer);

      // Sign and send transaction
      tx.feePayer = this.devWallet.publicKey;
      const { blockhash } = await this.connection.getLatestBlockhash();
      tx.recentBlockhash = blockhash;
      
      tx.sign(this.devWallet);

      const signature = await this.connection.sendRawTransaction(tx.serialize(), {
        skipPreflight: false,
        maxRetries: 3,
      });

      logger.info('[TransactionService] Swap transaction sent', { signature });

      // Wait for confirmation
      const confirmation = await this.connection.confirmTransaction(signature, 'confirmed');

      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
      }

      logger.info('[TransactionService] Swap confirmed', { signature });

      return {
        signature,
        success: true,
        error: undefined,
      };
    } catch (error: any) {
      logger.error('[TransactionService] Swap failed', {
        error: error.message,
        stack: error.stack,
      });
      
      return {
        signature: '',
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Transfer SOL from dev wallet to another address
   */
  async transferSOL(
    toAddress: string,
    amountSOL: number
  ): Promise<TransferResult> {
    if (!this.devWallet) {
      throw new Error('Dev wallet not configured');
    }

    try {
      logger.info('[TransactionService] Transferring SOL', {
        from: this.devWallet.publicKey.toBase58(),
        to: toAddress,
        amount: amountSOL,
      });

      const toPubkey = new PublicKey(toAddress);
      const lamports = Math.floor(amountSOL * LAMPORTS_PER_SOL);

      // Create transfer instruction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: this.devWallet.publicKey,
          toPubkey,
          lamports,
        })
      );

      // Send and confirm
      const signature = await sendAndConfirmTransaction(
        this.connection,
        transaction,
        [this.devWallet],
        {
          commitment: 'confirmed',
        }
      );

      logger.info('[TransactionService] Transfer completed', { signature });

      return {
        signature,
        from: this.devWallet.publicKey.toBase58(),
        to: toAddress,
        amount: amountSOL,
        success: true,
      };
    } catch (error: any) {
      logger.error('[TransactionService] Transfer failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Request airdrop for testing
   */
  async requestAirdrop(address: string, amountSOL: number = 1): Promise<string> {
    try {
      logger.info('[TransactionService] Requesting airdrop', { address, amount: amountSOL });
      
      const pubkey = new PublicKey(address);
      const signature = await this.connection.requestAirdrop(
        pubkey,
        amountSOL * LAMPORTS_PER_SOL
      );

      // Confirm airdrop
      const latestBlockhash = await this.connection.getLatestBlockhash();
      await this.connection.confirmTransaction({
        signature,
        ...latestBlockhash,
      });

      logger.info('[TransactionService] Airdrop completed', { signature });
      return signature;
    } catch (error: any) {
      logger.error('[TransactionService] Airdrop failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Get transaction details
   */
  async getTransaction(signature: string): Promise<any> {
    try {
      const tx = await this.connection.getTransaction(signature, {
        maxSupportedTransactionVersion: 0,
      });
      return tx;
    } catch (error: any) {
      logger.error('[TransactionService] Failed to get transaction', { signature, error: error.message });
      throw error;
    }
  }
}
