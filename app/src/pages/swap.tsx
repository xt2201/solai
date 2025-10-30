import Head from "next/head";
import { useState, useMemo, useEffect } from "react";
import { ShellLayout } from "@solai/app/components/layout";
import { SwapWidget } from "@solai/app/components/Swap/SwapWidget";
import { ChatWidget } from "@solai/app/components/ChatWidget";

const SwapPage = () => {
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

  return (
    <>
      <Head>
        <title>Swap — SolAI</title>
        <meta
          name="description"
          content="Swap tokens on Solana with the best rates"
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
              Token Swap
            </h1>
            <p className="text-[var(--text-secondary)]">
              Exchange tokens at the best rates with Jupiter aggregator
            </p>
          </div>

          {/* Swap Widget - Centered */}
          <div className="flex justify-center animate-slide-in-up">
            <div className="w-full max-w-md">
              <SwapWidget />
            </div>
          </div>
        </ShellLayout>
      </div>

      <ChatWidget onOpenChange={setIsChatOpen} />
    </>
  );
};

export default SwapPage;
