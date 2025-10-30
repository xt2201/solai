export interface LangsmithConfig {
  enabled: boolean;
  api_key: string;
  project_name: string;
  endpoint: string;
  tracing_v2: boolean;
}

export interface GlobalConfig {
  environment: string;
  project_name: string;
  default_log_level: string;
  langsmith: LangsmithConfig;
}

export interface DevWalletConfig {
  public_key: string;
  phantom_account?: string;
  phantom_password?: string;
  solana_key?: string; // Base58 encoded keypair
}

export interface HeliusConfig {
  api_key: string;
}

export interface CoinGeckoConfig {
  api_key: string;
  api_url: string;
}

export interface SolanaProgramConfig {
  id: string;
  admin_keypair_path: string;
}

export interface SolanaTokenomicsConfig {
  fee_token_mint: string;
  fee_per_query_in_tokens: number;
  fee_sol_for_logging_lamports: number;
}

export interface SolanaConfig {
  cluster: string;
  rpc_url: string;
  websocket_url: string;
  program: SolanaProgramConfig;
  tokenomics: SolanaTokenomicsConfig;
}

export interface LlmgatewayConfig {
  base_url: string;
  timeout_ms: number;
}

export interface ApiGatewayIndexerConfig {
  type: string;
  api_key: string | undefined;
}

export interface ApiGatewayConfig {
  port: number;
  allowed_origins: string[];
  llm_processor: LlmgatewayConfig;
  indexer: ApiGatewayIndexerConfig;
}

export interface GeminiConfig {
  api_key: string;
  model_name: string;
  temperature: number;
  max_output_tokens: number;
}

export interface CerebrasConfig {
  api_key: string;
  model_name: string;
  endpoint_url: string;
}

export interface OllamaEmbeddingConfig {
  port: number;
  provider: string;
  base_url: string;
  model: string;
}

export interface RagVectorDbConfig {
  provider: string;
  api_key: string;
  environment: string;
  index_name: string;
  top_k_results: number;
}

export interface RagConfig {
  enabled: boolean;
  vector_db: RagVectorDbConfig;
}

export interface FirecrawlConfig {
  api_key: string;
  mode: string;
  max_crawl_depth: number;
  source_urls: string[];
}

export interface ContextGenerationConfig {
  max_transaction_history: number;
  max_portfolio_tokens: number;
  include_market_data: boolean;
}

export interface LlmProcessorConfig {
  port: number;
  provider: string;
  gemini: GeminiConfig;
  cerebras: CerebrasConfig;
  ollama_embedding: OllamaEmbeddingConfig;
  rag: RagConfig;
  firecrawl: FirecrawlConfig;
  context_generation: ContextGenerationConfig;
}

export interface SolAIConfig {
  global: GlobalConfig;
  dev_wallet?: DevWalletConfig;
  helius: HeliusConfig;
  coingecko: CoinGeckoConfig;
  solana: SolanaConfig;
  api_gateway: ApiGatewayConfig;
  llm_processor: LlmProcessorConfig;
}
