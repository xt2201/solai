declare module "@solana/wallet-adapter-react" {
  import { ReactNode } from "react";
  import { Connection } from "@solana/web3.js";
  export interface ConnectionProviderProps {
    endpoint: string;
    config?: Record<string, unknown>;
    children: ReactNode;
  }
  export function ConnectionProvider(props: ConnectionProviderProps): JSX.Element;
  export interface WalletProviderProps {
    wallets: any[];
    autoConnect?: boolean;
    children: ReactNode;
  }
  export function WalletProvider(props: WalletProviderProps): JSX.Element;
  export function useWallet(): any;
  export function useConnection(): { connection: Connection };
}

declare module "@solana/wallet-adapter-react-ui" {
  import { ReactNode } from "react";
  export interface WalletModalProviderProps {
    children: ReactNode;
  }
  export function WalletModalProvider(props: WalletModalProviderProps): JSX.Element;
  export const WalletMultiButton: any;
}

declare module "@solana/wallet-adapter-phantom" {
  export class PhantomWalletAdapter {
    constructor();
  }
}
