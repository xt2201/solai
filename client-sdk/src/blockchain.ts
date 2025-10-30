import { Connection, Keypair, PublicKey, Transaction } from "@solana/web3.js";

export interface TransactionBundle {
  serialized: string;
  recentBlockhash: string;
  feeLamports: number;
}

export async function submitSerializedTransaction(
  bundle: TransactionBundle,
  signer: Keypair,
  rpcUrl: string
): Promise<string> {
  const connection = new Connection(rpcUrl, "confirmed");
  const transaction = Transaction.from(Buffer.from(bundle.serialized, "base64"));
  transaction.partialSign(signer);
  const signature = await connection.sendRawTransaction(transaction.serialize());
  return signature;
}

export async function ensureUserAccount(
  programId: PublicKey,
  walletKeypair: Keypair,
  rpcUrl: string
): Promise<void> {
  // Placeholder hook for initializing Anchor PDA via instruction builder exposed later.
  const connection = new Connection(rpcUrl, "confirmed");
  const balance = await connection.getBalance(walletKeypair.publicKey);
  if (balance === 0) {
    throw new Error("Wallet balance must be funded before initializing user account");
  }
}
