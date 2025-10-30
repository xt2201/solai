declare module "react" {
  export type ReactNode = any;
  export type FormEvent<T = any> = any;
  export function useState<S>(initial: S | (() => S)): [S, (value: S | ((prev: S) => S)) => void];
  export function useMemo<T>(factory: () => T, deps: any[]): T;
  export function useCallback<T extends (...args: any[]) => any>(callback: T, deps: any[]): T;
  export function useEffect(effect: () => any, deps?: any[]): void;
  export type FC<P = {}> = (props: P & { children?: ReactNode }) => any;
  export type PropsWithChildren<P = {}> = P & { children?: ReactNode };
}

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}
