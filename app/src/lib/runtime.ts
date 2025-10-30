import getConfig from "next/config";

export interface SolAIRuntimeConfig {
  apiBaseUrl: string;
  solanaCluster: string;
  solanaRpcUrl: string;
  solaiProgramId: string;
  feeLamports: number;
}

export function getSolAIRuntimeConfig(): SolAIRuntimeConfig {
  const runtime = getConfig()?.publicRuntimeConfig ?? {};
  const apiGateway = runtime.apiGateway ?? {};
  const solana = runtime.solana ?? {};
  return {
    apiBaseUrl: apiGateway.baseUrl ?? "http://localhost:3001",
    solanaCluster: solana.cluster ?? "devnet",
    solanaRpcUrl: solana.rpcUrl ?? "https://api.devnet.solana.com",
    solaiProgramId: solana.programId ?? "",
    feeLamports: solana.feeLamports ?? 0,
  };
}
