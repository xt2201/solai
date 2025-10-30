declare module "axios" {
  export interface AxiosResponse<T = unknown> {
    data: T;
  }
  export function post<T = unknown>(url: string, data?: unknown): Promise<AxiosResponse<T>>;
  const axios: {
    post: typeof post;
  };
  export default axios;
}

declare module "@solana/web3.js" {
  export class PublicKey {
    constructor(address: string | Uint8Array);
    toBase58(): string;
  }
  export class Transaction {
    static from(buffer: any): Transaction;
    serialize(): any;
    partialSign(...signers: Keypair[]): void;
  }
  export class Connection {
    constructor(endpoint: string, commitment?: string);
    sendRawTransaction(raw: any): Promise<string>;
    getBalance(pubkey: PublicKey): Promise<number>;
    confirmTransaction(signature: string, commitment?: string): Promise<void>;
  }
  export class Keypair {
    static generate(): Keypair;
    readonly publicKey: PublicKey;
  }
}

declare const Buffer: {
  from(data: string, encoding: string): any;
};
