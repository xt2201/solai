import type { AppProps } from "next/app";
import dynamic from "next/dynamic";
import "../styles/generated-theme.css";
import "../styles/layout.css";
import "../styles/globals.css";
import "@solana/wallet-adapter-react-ui/styles.css";

const SolAIProviders = dynamic(
  () => import("../providers/SolaiProviders").then((mod) => mod.SolAIProviders),
  { ssr: false }
);

function SolAIApp({ Component, pageProps }: AppProps) {
  return (
    <SolAIProviders>
      <Component {...pageProps} />
    </SolAIProviders>
  );
}

export default SolAIApp;
