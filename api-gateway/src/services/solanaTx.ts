import { readFileSync } from "fs";
import path from "path";
const web3: any = require("@solana/web3.js");
const anchor: any = require("@coral-xyz/anchor");
import { config } from "../utils/config";
import { logger } from "../utils/logger";
const idl: any = require("../idl/solai_program.json");
type Keypair = any;
type PublicKey = any;
type Connection = any;
type Transaction = any;

function loadKeypairFromFile(relativePath: string): Keypair {
  const rootDir = path.resolve(__dirname, "../../../");
  const absolute = path.resolve(rootDir, relativePath);
  const raw = readFileSync(absolute, "utf8");
  const secret = JSON.parse(raw);
  const bs = Uint8Array.from(secret);
  return web3.Keypair.fromSecretKey(bs);
}

function bytes32FromHex(hex: string): number[] {
  const normalized = hex.startsWith("0x") ? hex.slice(2) : hex;
  if (normalized.length !== 64) {
    throw new Error("Hash must be 32 bytes");
  }
  const bytes: number[] = [];
  for (let i = 0; i < normalized.length; i += 2) {
    bytes.push(parseInt(normalized.slice(i, i + 2), 16));
  }
  return bytes;
}

function getTreasuryPda(programId: PublicKey): [PublicKey, number] {
  return web3.PublicKey.findProgramAddressSync([Buffer.from("treasury")], programId);
}

function getUserPda(user: PublicKey, programId: PublicKey): [PublicKey, number] {
  return web3.PublicKey.findProgramAddressSync([Buffer.from("user"), user.toBuffer()], programId);
}

export class SolanaService {
  private readonly connection: Connection;
  private readonly programId: PublicKey;
  private readonly provider: any;
  private readonly program: any;

  constructor() {
    this.connection = new web3.Connection(config.solana.rpc_url, "confirmed");
    const walletKeypair = loadKeypairFromFile(config.solana.program.admin_keypair_path);
    const wallet = new anchor.Wallet(walletKeypair);
    this.provider = new anchor.AnchorProvider(this.connection, wallet, {
      commitment: "confirmed",
      preflightCommitment: "confirmed"
    });
    // Use programId from IDL address field (Anchor 0.32+)
    this.program = new anchor.Program(idl, this.provider);
    this.programId = this.program.programId;
  }

  async assertUserAccountExists(authority: PublicKey): Promise<void> {
    const [userPda] = getUserPda(authority, this.programId);
    const accountInfo = await this.connection.getAccountInfo(userPda);
    if (!accountInfo) {
      throw new Error("SOLAI_USER_ACCOUNT_NOT_INITIALIZED");
    }
  }

  async buildInitializeUserTx(options: { authority: PublicKey }): Promise<{
    serialized: string;
    recentBlockhash: string;
    userAccount: string;
    treasury: string;
  }> {
    const { authority } = options;
    const [userPda] = getUserPda(authority, this.programId);
    const accountInfo = await this.connection.getAccountInfo(userPda);
    if (accountInfo) {
      throw new Error("SOLAI_USER_ALREADY_INITIALIZED");
    }
    const [treasuryPda] = getTreasuryPda(this.programId);
    const tx: Transaction = await this.program.methods
      .initializeUser()
      .accounts({
        authority,
        userAccount: userPda,
        treasury: treasuryPda,
        systemProgram: web3.SystemProgram.programId
      })
      .transaction();
    const { blockhash } = await this.connection.getLatestBlockhash();
    tx.recentBlockhash = blockhash;
    tx.feePayer = authority;
    const serialized = tx.serialize({ requireAllSignatures: false }).toString("base64");
    logger.info("Built initialize user transaction", { authority: authority.toBase58() });
    return {
      serialized,
      recentBlockhash: blockhash,
      userAccount: userPda.toBase58(),
      treasury: treasuryPda.toBase58()
    };
  }

  async buildLogInteractionTx(options: {
    authority: PublicKey;
    promptHashHex: string;
    responseHashHex: string;
  }): Promise<{ serialized: string; recentBlockhash: string; feeLamports: number; userAccount: string; treasury: string }>
  {
    const { authority, promptHashHex, responseHashHex } = options;
    await this.assertUserAccountExists(authority);
    const [userPda] = getUserPda(authority, this.programId);
    const [treasuryPda] = getTreasuryPda(this.programId);
    const feeLamports = config.solana.tokenomics.fee_sol_for_logging_lamports;
    const tx: Transaction = await this.program.methods
      .logInteraction(bytes32FromHex(promptHashHex), bytes32FromHex(responseHashHex), new anchor.BN(feeLamports))
      .accounts({
        authority,
        userAccount: userPda,
        treasury: treasuryPda,
        systemProgram: web3.SystemProgram.programId
      })
      .transaction();
    const { blockhash } = await this.connection.getLatestBlockhash();
    tx.recentBlockhash = blockhash;
    tx.feePayer = authority;
    const serialized = tx.serialize({ requireAllSignatures: false }).toString("base64");
    logger.info("Built log interaction transaction", { authority: authority.toBase58() });
    return {
      serialized,
      recentBlockhash: blockhash,
      feeLamports,
      userAccount: userPda.toBase58(),
      treasury: treasuryPda.toBase58()
    };
  }

  async getUserAccountStatus(authority: PublicKey): Promise<{ userAccountPDA: string; exists: boolean; balance: number }> {
    const [userPda] = getUserPda(authority, this.programId);
    const accountInfo = await this.connection.getAccountInfo(userPda);
    if (!accountInfo) {
      return {
        userAccountPDA: userPda.toBase58(),
        exists: false,
        balance: 0,
      };
    }

    const lamports = accountInfo.lamports ?? 0;
    const balance = Number((lamports / web3.LAMPORTS_PER_SOL).toFixed(6));

    return {
      userAccountPDA: userPda.toBase58(),
      exists: true,
      balance,
    };
  }
}
