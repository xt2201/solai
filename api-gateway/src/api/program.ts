import { Router, Request, Response } from 'express';
import { PublicKey } from '@solana/web3.js';
import { logger } from '../utils/logger';
import { smartContractService } from '../services/smartContract';

const router = Router();

// Program ID on devnet
const PROGRAM_ID = '8pMVJamgnZKWmYJQQ8gvPaT7UFVg5BAr3Rg5HY8epYyh';

/**
 * GET /api/program/info
 * Get program information and statistics
 */
router.get('/info', async (_req: Request, res: Response) => {
  try {
    const stats = await smartContractService.getProgramStats();
    const treasuryBalance = await smartContractService.getTreasuryBalance();

    res.json({
      program_id: PROGRAM_ID,
      network: 'devnet',
      status: 'deployed',
      features: [
        'initialize_user - Create user account on-chain',
        'log_interaction - Log AI queries with fees',
      ],
      statistics: {
        total_users: stats.total_users,
        total_queries: stats.total_queries,
        total_fees_collected_sol: stats.total_fees_collected,
        treasury_balance_sol: treasuryBalance,
      },
      explorer_url: `https://explorer.solana.com/address/${PROGRAM_ID}?cluster=devnet`,
      timestamp: Math.floor(Date.now() / 1000),
    });
  } catch (error: any) {
    logger.error('Failed to get program info', { error: error.message });
    res.status(500).json({
      error: 'Failed to get program info',
      message: error.message,
    });
  }
});

/**
 * GET /api/program/user/:address
 * Get user account data from on-chain
 */
router.get('/user/:address', async (req: Request, res: Response) => {
  try {
    const address = ((req as any).params?.address as string);
    
    if (!address) {
      return res.status(400).json({ error: 'Missing address parameter' });
    }

    // Validate address
    let publicKey;
    try {
      publicKey = new PublicKey(address);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid Solana address' });
    }

    logger.info('Fetching user account', { address });

    // Fetch real on-chain data
    const userAccount = await smartContractService.getUserAccount(publicKey);

    res.json({
      ...userAccount,
      program_id: PROGRAM_ID,
      timestamp: Math.floor(Date.now() / 1000),
    });
  } catch (error: any) {
    logger.error('Failed to get user account', { error: error.message });
    res.status(500).json({
      error: 'Failed to get user account',
      message: error.message,
    });
  }
});

/**
 * POST /api/program/initialize
 * Build initialize_user transaction (returns unsigned transaction for wallet to sign)
 */
router.post('/initialize', async (req: Request, res: Response) => {
  try {
    const { user_address } = (req as any).body;

    if (!user_address) {
      return res.status(400).json({ error: 'Missing user_address' });
    }

    // Validate address
    let publicKey;
    try {
      publicKey = new PublicKey(user_address);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid Solana address' });
    }

    logger.info('Initialize user request', { user_address });

    // Build unsigned transaction
    const serializedTx = await smartContractService.buildInitializeUserTx(publicKey);

    res.json({
      success: true,
      message: 'Transaction built successfully. User needs to sign and submit.',
      program_id: PROGRAM_ID,
      user_address,
      transaction: serializedTx,
      instructions: [
        '1. Deserialize the transaction from base64',
        '2. Sign with user wallet',
        '3. Send to Solana network',
        '4. Program will create PDA account for user',
      ],
      timestamp: Math.floor(Date.now() / 1000),
    });
  } catch (error: any) {
    logger.error('Failed to build initialize transaction', { error: error.message });
    
    // Special handling for already initialized
    if (error.message.includes('already initialized')) {
      return res.status(400).json({
        error: 'User account already initialized',
        message: error.message,
      });
    }

    res.status(500).json({
      error: 'Failed to build initialize transaction',
      message: error.message,
    });
  }
});

/**
 * POST /api/program/log
 * Build log_interaction transaction (returns unsigned transaction for wallet to sign)
 */
router.post('/log', async (req: Request, res: Response) => {
  try {
    const { user_address, prompt_hash, response_hash } = (req as any).body;

    if (!user_address || !prompt_hash || !response_hash) {
      return res.status(400).json({ 
        error: 'Missing required fields: user_address, prompt_hash, response_hash' 
      });
    }

    // Validate address
    let publicKey;
    try {
      publicKey = new PublicKey(user_address);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid Solana address' });
    }

    logger.info('Log interaction request', { 
      user_address, 
      prompt_hash: prompt_hash.slice(0, 16) + '...',
      response_hash: response_hash.slice(0, 16) + '...'
    });

    // Build unsigned transaction
    const serializedTx = await smartContractService.buildLogInteractionTx(
      publicKey,
      prompt_hash,
      response_hash
    );

    res.json({
      success: true,
      message: 'Log transaction built successfully. User needs to sign and submit.',
      program_id: PROGRAM_ID,
      user_address,
      transaction: serializedTx,
      fee_lamports: 500000, // 0.0005 SOL
      instructions: [
        '1. Deserialize the transaction from base64',
        '2. Sign with user wallet',
        '3. Send to Solana network',
        '4. Program will log interaction and transfer fee to treasury',
      ],
      timestamp: Math.floor(Date.now() / 1000),
    });
  } catch (error: any) {
    logger.error('Failed to build log transaction', { error: error.message });
    
    // Special handling for not initialized
    if (error.message.includes('not initialized')) {
      return res.status(400).json({
        error: 'User account not initialized',
        message: error.message,
        suggestion: 'Call /api/program/initialize first',
      });
    }

    res.status(500).json({
      error: 'Failed to build log transaction',
      message: error.message,
    });
  }
});

export default router;
