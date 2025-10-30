declare module "next" {
  export type NextPage<P = Record<string, any>, IP = P> = (props: P) => JSX.Element | null;
}
