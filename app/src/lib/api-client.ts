/**
 * API Client for SolAI endpoints
 * Centralized API calls with error handling and type safety
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// ============================================================================
// Types
// ============================================================================

export interface WalletAnalysisRequest {
  wallet_address: string;
  analysis_type?: 'comprehensive' | 'quick';
}

export interface TokenHolding {
  token: string;
  amount: number;
  usd_value: number;
  percentage: number;
}

export interface Transaction {
  signature: string;
  timestamp: string;
  type: string;
  amount?: number;
  token?: string;
}

export interface WalletAnalysisResponse {
  wallet_address: string;
  portfolio: TokenHolding[];
  total_value_usd: number;
  recent_transactions: Transaction[];
  risk_score?: number;
  recommendations?: string[];
  meta?: {
    mock: boolean;
    reason?: string;
  };
}

export interface MarketToken {
  symbol: string;
  name: string;
  price_usd: number;
  price_change_24h: number;
  volume_24h: number;
  market_cap: number;
}

export interface MarketProtocol {
  name: string;
  tvl: number;
  tvl_change_24h: number;
  apy?: number;
}

export interface MarketOverviewResponse {
  timestamp: string;
  top_tokens: MarketToken[];
  top_protocols: MarketProtocol[];
  total_tvl: number;
  meta?: {
    mock: boolean;
    reason?: string;
  };
}

export interface DefiOpportunity {
  protocol: string;
  type: 'yield_farming' | 'lending' | 'staking' | 'liquidity_pool';
  apy: number;
  tvl: number;
  token_pair?: string;
  risk_level: 'low' | 'medium' | 'high';
  description: string;
}

export interface DefiOpportunitiesResponse {
  opportunities: DefiOpportunity[];
  timestamp: string;
  meta?: {
    mock: boolean;
    reason?: string;
  };
}

export interface UserAccountResponse {
  wallet_address: string;
  pda_address?: string;
  balance_sol: number;
  transaction_count: number;
  created_at?: string;
  meta?: {
    mock: boolean;
    reason?: string;
  };
}

export interface RagSearchRequest {
  query: string;
  top_k?: number;
}

export interface RagDocument {
  content: string;
  metadata: {
    source?: string;
    title?: string;
    url?: string;
  };
  score: number;
}

export interface RagSearchResponse {
  query: string;
  results: RagDocument[];
  timestamp: string;
  meta?: {
    mock: boolean;
    reason?: string;
  };
}

export interface SwapQuoteRequest {
  input_token: string;
  output_token: string;
  amount: number;
}

export interface SwapQuoteResponse {
  input_token: string;
  output_token: string;
  input_amount: number;
  output_amount: number;
  input_mint: string;
  output_mint: string;
  price_impact_pct: number;
  slippage_bps: number;
  minimum_output: number;
  exchange_rate: number;
  route_plan?: Array<{
    dex: string;
    input_mint: string;
    output_mint: string;
    percent: number;
  }>;
  meta?: {
    mock: boolean;
    reason?: string;
  };
}

export interface PlatformStatsResponse {
  total_users: number;
  total_transactions: number;
  total_volume_usd: number;
  active_users_24h: number;
  timestamp: string;
  meta?: {
    mock: boolean;
    reason?: string;
  };
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Analyze wallet portfolio and get insights
 */
export async function analyzeWallet(
  request: WalletAnalysisRequest
): Promise<WalletAnalysisResponse> {
  const response = await fetch(`${API_BASE_URL}/api/wallet/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Wallet analysis failed: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get market overview with top tokens and protocols
 */
export async function getMarketOverview(): Promise<MarketOverviewResponse> {
  const response = await fetch(`${API_BASE_URL}/api/market/overview`);

  if (!response.ok) {
    throw new Error(`Market overview failed: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get DeFi opportunities (yield farming, lending, etc.)
 */
export async function getDefiOpportunities(): Promise<DefiOpportunitiesResponse> {
  const response = await fetch(`${API_BASE_URL}/api/defi/opportunities`);

  if (!response.ok) {
    throw new Error(`DeFi opportunities failed: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get user account information
 */
export async function getUserAccount(wallet: string): Promise<UserAccountResponse> {
  const response = await fetch(`${API_BASE_URL}/api/user/account/${wallet}`);

  if (!response.ok) {
    throw new Error(`User account fetch failed: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Search RAG documentation
 */
export async function searchRagDocuments(
  request: RagSearchRequest
): Promise<RagSearchResponse> {
  const response = await fetch(`${API_BASE_URL}/api/rag/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`RAG search failed: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get swap quote for token exchange
 */
export async function getSwapQuote(
  request: SwapQuoteRequest
): Promise<SwapQuoteResponse> {
  const response = await fetch(`${API_BASE_URL}/api/swap/quote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Swap quote failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data.quote; // Extract the quote object from the response
}

/**
 * Get platform statistics
 */
export async function getPlatformStats(): Promise<PlatformStatsResponse> {
  const response = await fetch(`${API_BASE_URL}/api/stats/platform`);

  if (!response.ok) {
    throw new Error(`Platform stats failed: ${response.statusText}`);
  }

  return response.json();
}
