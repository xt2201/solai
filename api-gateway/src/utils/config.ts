import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import { SolAIConfig } from "../types/config";

const DEFAULT_CONFIG_PATH = path.resolve(__dirname, "../../../config.yml");

function loadConfig(): SolAIConfig {
  const configPath = process.env.SOLAI_CONFIG_PATH
    ? path.resolve(process.env.SOLAI_CONFIG_PATH)
    : DEFAULT_CONFIG_PATH;
  if (!fs.existsSync(configPath)) {
    throw new Error(`Config file not found at ${configPath}`);
  }
  const raw = fs.readFileSync(configPath, "utf8");
  const parsed = yaml.load(raw) as SolAIConfig;
  const provider = parsed.llm_processor?.provider;
  if (!provider || !["CEREBRAS", "GEMINI"].includes(provider)) {
    throw new Error("llm_processor.provider must be either CEREBRAS or GEMINI in config.yml");
  }
  return parsed;
}

export const config = loadConfig();
