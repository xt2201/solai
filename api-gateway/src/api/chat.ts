import { Router, Request, Response } from "express";
const { PublicKey } = require("@solana/web3.js");
import { createHash } from "crypto";
import { SolanaService } from "../services/solanaTx";
import { sendPromptToProcessor } from "../services/llmProxy";
import { config } from "../utils/config";
import { logger } from "../utils/logger";

const router = Router();
const solanaService = new SolanaService();

router.post("/chat", async (req: Request, res: Response) => {
  let promptValue: string | undefined;
  try {
    const { prompt, wallet, userWallet, demo } = req.body as {
      prompt?: string;
      wallet?: string;
      userWallet?: string;
      demo?: boolean;
    };
    const resolvedWallet = wallet ?? userWallet;
    const walletFieldName = wallet ? "wallet" : userWallet ? "userWallet" : "wallet";
    promptValue = prompt;
    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "prompt is required" });
    }
    if (!resolvedWallet || typeof resolvedWallet !== "string") {
      return res.status(400).json({ error: `${walletFieldName} is required` });
    }
    const authority = new PublicKey(resolvedWallet);
    logger.info("Processing chat request", { wallet: resolvedWallet, demo: !!demo });

    const promptHash = createHash("sha256").update(prompt).digest("hex");

    const llmResponse = await sendPromptToProcessor({
      prompt,
  userWallet: resolvedWallet,
      context: {
        fee_per_query_in_tokens: config.solana.tokenomics.fee_per_query_in_tokens,
        max_transaction_history: config.llm_processor.context_generation.max_transaction_history,
        max_portfolio_tokens: config.llm_processor.context_generation.max_portfolio_tokens
      }
    });

    const responseHash = createHash("sha256").update(llmResponse.completion).digest("hex");
    
    // Demo mode: skip on-chain transaction
    if (demo) {
      return res.status(200).json({
        response: llmResponse,
        promptHash,
        responseHash,
        demo: true,
        message: "Demo mode - no on-chain transaction created"
      });
    }
    
    const transactionRequest = await solanaService
      .buildLogInteractionTx({
        authority,
        promptHashHex: promptHash,
        responseHashHex: responseHash
      })
      .catch((err: Error) => {
        if (err.message === "SOLAI_USER_ACCOUNT_NOT_INITIALIZED") {
          // Return demo response instead of error
          res.status(200).json({
            response: llmResponse,
            promptHash,
            responseHash,
            demo: true,
            message: "User account not initialized - returned in demo mode"
          });
          return null;
        }
        throw err;
      });
    if (!transactionRequest) {
      return;
    }

    return res.status(200).json({
      response: llmResponse,
  promptHash,
  responseHash,
      transaction: transactionRequest
    });
  } catch (error) {
    const err = error as Error;
    logger.error("Chat endpoint failed", { error: err.message });

    const fallbackCompletion = `Hiện chưa thể kết nối tới dịch vụ LLM (lỗi: ${err.message}).

Tôi sẽ cung cấp một bản gợi ý nhanh dựa trên dữ liệu mẫu:
• Kiểm tra tỉ trọng SOL, USDC, và các token lợi suất cao
• Đánh giá mức độ rủi ro của từng vị thế so với biến động thị trường gần đây
• Đề xuất phân bổ lại danh mục để giảm thiểu rủi ro và tăng lợi nhuận kỳ vọng

Vui lòng khởi động dịch vụ llm-processor hoặc kiểm tra cấu hình kết nối để nhận được phân tích thời gian thực.`;

  const safePrompt = promptValue ?? "";
  const promptHash = createHash("sha256").update(safePrompt).digest("hex");
    const responseHash = createHash("sha256").update(fallbackCompletion).digest("hex");

    return res.status(200).json({
      response: {
        completion: fallbackCompletion,
        citations: [],
        meta: {
          fallback: true,
          reason: err.message,
        },
      },
      promptHash,
      responseHash,
      demo: true,
      message: "LLM processor chưa khả dụng - trả về phản hồi demo"
    });
  }
});

// LangGraph workflow endpoint
router.post("/chat/langgraph", async (req: Request, res: Response) => {
  try {
    const { query, wallet, demo } = req.body as {
      query?: string;
      wallet?: string;
      demo?: boolean;
    };

    if (!query || typeof query !== "string") {
      return res.status(400).json({ error: "query is required" });
    }
    if (!wallet || typeof wallet !== "string") {
      return res.status(400).json({ error: "wallet is required" });
    }

    logger.info("Processing LangGraph chat request", { wallet, demo: !!demo });

    // Forward to llm-processor
    const llmProcessorUrl = `${config.api_gateway.llm_processor.base_url}/chat/langgraph`;
    const response = await fetch(llmProcessorUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        query,
        user_wallet: wallet,
        include_portfolio_context: true
      })
    });

    if (!response.ok) {
      throw new Error(`LLM processor returned ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    
    // Demo mode: skip on-chain transaction
    if (demo) {
      return res.status(200).json({
        ...data,
        demo: true,
        message: "Demo mode - no on-chain transaction created"
      });
    }

    // In production, you could log this to blockchain here
    // For now, just return the response
    return res.status(200).json(data);

  } catch (error) {
    const err = error as Error;
    logger.error("LangGraph chat endpoint failed", { error: err.message });

    return res.status(200).json({
      response_text: `Hiện chưa thể kết nối tới dịch vụ LangGraph (lỗi: ${err.message}). Vui lòng thử lại sau.`,
      intent_used: "chat",
      sources: [],
      confidence: 0.0,
      workflow_steps: [
        {
          node: "error",
          status: "failed",
          error: err.message
        }
      ],
      demo: true,
      message: "LLM processor chưa khả dụng - trả về phản hồi lỗi"
    });
  }
});

export default router;
