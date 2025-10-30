import axios from "axios";
import { config } from "../utils/config";
import { logger } from "../utils/logger";

export interface ProcessPromptPayload {
  prompt: string;
  userWallet: string;
  context?: Record<string, unknown>;
}

export interface ProcessPromptResponse {
  completion: string;
  citations: Array<{ id: string; url: string }>;
  meta: Record<string, unknown>;
}

export async function sendPromptToProcessor(
  payload: ProcessPromptPayload
): Promise<ProcessPromptResponse> {
  const url = `${config.api_gateway.llm_processor.base_url}/process_prompt`;
  try {
    const response = await axios.post(url, payload, {
      timeout: config.api_gateway.llm_processor.timeout_ms
    });
    return response.data as ProcessPromptResponse;
  } catch (error) {
    logger.error("Failed to reach llm-processor", { error: (error as Error).message });
    throw error;
  }
}
