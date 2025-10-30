declare const __dirname: string;

declare const process: {
  env: Record<string, string | undefined>;
  cwd(): string;
};

declare function require(name: string): any;

declare const Buffer: any;

declare module "fs" {
  export function readFileSync(path: string, encoding: string): string;
  export function existsSync(path: string): boolean;
}

declare module "path" {
  export function resolve(...segments: string[]): string;
  export function dirname(p: string): string;
  export function join(...segments: string[]): string;
}

declare module "js-yaml" {
  const anything: any;
  export = anything;
}

declare module "axios" {
  const anything: any;
  export = anything;
}

declare module "cors" {
  const anything: any;
  export = anything;
}

declare module "express" {
  export interface Request {
    body: unknown;
  }
  export interface Response {
    status(code: number): Response;
    json(body: unknown): Response;
  }
  export function Router(): any;
  export function json(options?: unknown): any;
  const express: any;
  export default express;
}

declare module "@solana/web3.js" {
  export const PublicKey: any;
  export const SystemProgram: any;
  export const TransactionInstruction: any;
  export const Transaction: any;
  export const sendAndConfirmTransaction: any;
  export const Connection: any;
  export const Keypair: any;
}

declare module "@coral-xyz/anchor" {
  const anything: any;
  export = anything;
}

declare module "crypto" {
  export function createHash(algo: string): {
    update(data: string): any;
    digest(encoding: "hex"): string;
  };
}
