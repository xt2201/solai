import Head from "next/head";
import { useState, useMemo, useEffect } from "react";
import { ShellLayout } from "@solai/app/components/layout";
import { SystemMetrics } from "@solai/app/components/Dashboard/SystemMetrics";
import { MarketSentiment } from "@solai/app/components/Dashboard/MarketSentiment";
import { WalletOverview } from "@solai/app/components/Dashboard/WalletOverview";
import { QuickActions } from "@solai/app/components/Dashboard/QuickActions";
import { RecentLogs } from "@solai/app/components/Dashboard/RecentLogs";
import { DefiOpportunities } from "@solai/app/components/Dashboard/DefiOpportunities";
import { PlatformStats } from "@solai/app/components/Dashboard/PlatformStats";
import { getSolAIRuntimeConfig } from "@solai/config";
import { useWallet } from "@solana/wallet-adapter-react";
import { ChatWidget } from "@solai/app/components/ChatWidget";

const IndexPage = () => {
  const runtime = useMemo(() => getSolAIRuntimeConfig(), []);
  const { publicKey, connected } = useWallet();
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const walletAddress = publicKey ? publicKey.toBase58() : null;

  const handlePromptSelect = (prompt: string) => {
    setSelectedPrompt(prompt);
  };

  return (
    <>
      <Head>
        <title>SolAI — DeFi Dashboard</title>
        <meta
          name="description"
          content="AI-powered DeFi analysis on Solana with immutable on-chain logging"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div 
        className="transition-all duration-300 ease-in-out"
        style={{
          marginRight: isLargeScreen && isChatOpen ? '480px' : '0',
        }}
      >
        <ShellLayout>
        {/* Page Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
            Dashboard
          </h1>
          <p className="text-[var(--text-secondary)]">
            Welcome to your DeFi command center. Real-time insights powered by AI.
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="space-y-6">
          {/* Platform Statistics */}
          <section className="animate-slide-in-up" style={{ animationDelay: '0.1s' }}>
            <PlatformStats />
          </section>

          {/* System Metrics */}
          <section className="animate-slide-in-up" style={{ animationDelay: '0.15s' }}>
            <SystemMetrics
              apiBaseUrl={runtime.apiBaseUrl}
              walletConnected={connected}
              walletAddress={walletAddress}
            />
          </section>

          {/* Market Sentiment */}
          <section className="animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
            <MarketSentiment apiBaseUrl={runtime.apiBaseUrl} />
          </section>

          {/* DeFi Opportunities */}
          <section className="animate-slide-in-up" style={{ animationDelay: '0.25s' }}>
            <DefiOpportunities />
          </section>

          {/* Two Column Layout: Quick Actions + Wallet Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 animate-slide-in-up" style={{ animationDelay: '0.3s' }}>
            {/* Quick Actions (40%) */}
            <div className="lg:col-span-2">
              <QuickActions onPromptSelect={handlePromptSelect} />
            </div>

            {/* Wallet Overview (60%) */}
            <div className="lg:col-span-3">
              <WalletOverview
                apiBaseUrl={runtime.apiBaseUrl}
                walletAddress={walletAddress}
                walletConnected={connected}
              />
            </div>
          </div>

          {/* Recent Logs */}
          <section className="animate-slide-in-up" style={{ animationDelay: '0.35s' }}>
            <RecentLogs apiBaseUrl={runtime.apiBaseUrl} />
          </section>
        </div>
      </ShellLayout>
      </div>

      <ChatWidget 
        initialPrompt={selectedPrompt} 
        onOpenChange={setIsChatOpen}
      />
    </>
  );
};

export default IndexPage;
