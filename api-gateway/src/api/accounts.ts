import { Router, Request, Response } from "express";
const { PublicKey } = require("@solana/web3.js");
import { SolanaService } from "../services/solanaTx";
import { logger } from "../utils/logger";
import { getMockAccountStatus } from "../services/mockData";

const router = Router();
const solanaService = new SolanaService();

router.post("/accounts/init", async (req: Request, res: Response) => {
  try {
    const { wallet } = req.body as { wallet?: string };
    if (!wallet || typeof wallet !== "string") {
      return res.status(400).json({ error: "wallet is required" });
    }

    const authority = new PublicKey(wallet);
    const initTx = await solanaService
      .buildInitializeUserTx({ authority })
      .catch((err: Error) => {
        if (err.message === "SOLAI_USER_ALREADY_INITIALIZED") {
          return null;
        }
        throw err;
      });

    if (!initTx) {
      return res.status(200).json({ initialized: true });
    }

    return res.status(200).json({ initialized: false, transaction: initTx });
  } catch (error) {
    logger.error("Init user endpoint failed", { error: (error as Error).message });
    return res.status(500).json({ error: "internal_error" });
  }
});

router.post("/accounts", async (req: Request, res: Response) => {
  const { wallet, userWallet } = req.body as { wallet?: string; userWallet?: string };
  const resolvedWallet = wallet ?? userWallet;
  const walletFieldName = wallet ? "wallet" : userWallet ? "userWallet" : "wallet";

  if (!resolvedWallet || typeof resolvedWallet !== "string") {
    return res.status(400).json({ error: `${walletFieldName} is required` });
  }

  try {
    const authority = new PublicKey(resolvedWallet);
    const status = await solanaService.getUserAccountStatus(authority);
    return res.status(200).json(status);
  } catch (error) {
    const err = error as Error;
    logger.error("Fetch account status failed", { error: err.message });
    return res.status(200).json({
      ...getMockAccountStatus(resolvedWallet),
      meta: {
        mock: true,
        reason: err.message,
      },
    });
  }
});

export default router;
