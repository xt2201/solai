const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

function loadSolAIConfig() {
  const configPath = path.resolve(__dirname, "../config.yml");
  const raw = fs.readFileSync(configPath, "utf8");
  return yaml.load(raw);
}

const solaiConfig = loadSolAIConfig();

module.exports = {
  reactStrictMode: true,
  transpilePackages: ['client-sdk'],
  experimental: {
    externalDir: true,
  },
  publicRuntimeConfig: {
    apiGateway: {
      baseUrl: solaiConfig.api_gateway.base_url ?? `http://localhost:${solaiConfig.api_gateway.port}`,
    },
    solana: {
      rpcUrl: solaiConfig.solana.rpc_url,
      cluster: solaiConfig.solana.cluster,
      programId: solaiConfig.solana.program.id,
      feeLamports: solaiConfig.solana.tokenomics.fee_sol_for_logging_lamports,
    },
  },
};
