declare module "next/config" {
  const getConfig: () => {
    publicRuntimeConfig?: Record<string, any>;
  };
  export default getConfig;
}

declare module "next/app" {
  export interface AppProps {
    Component: any;
    pageProps: Record<string, any>;
  }
}

declare module "next/head" {
  const Head: any;
  export default Head;
}

declare module "next/head" {
  const Head: any;
  export default Head;
}
