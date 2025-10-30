import Head from "next/head";
import { useState, useEffect } from "react";
import { ShellLayout } from "@solai/app/components/layout";
import { SmartContractWidget } from "@solai/app/components/SmartContract/SmartContractWidget";
import { ChatWidget } from "@solai/app/components/ChatWidget";

const SmartContractPage = () => {
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
        <title>Smart Contract — SolAI</title>
        <meta
          name="description"
          content="Interact with SolAI smart contract on Solana"
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
              Smart Contract
            </h1>
            <p className="text-[var(--text-secondary)]">
              On-chain transparency for AI interactions on Solana blockchain
            </p>
          </div>

          {/* Smart Contract Widget - Centered */}
          <div className="flex justify-center animate-slide-in-up">
            <div className="w-full max-w-4xl">
              <SmartContractWidget />
            </div>
          </div>

          {/* Info Section */}
          <div className="mt-8 max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-[var(--border)]">
                <div className="text-3xl mb-3">🔒</div>
                <h3 className="font-semibold text-[var(--text-primary)] mb-2">
                  Immutable Proof
                </h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  Every AI query is permanently logged on Solana blockchain, ensuring complete transparency.
                </p>
              </div>
              <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-[var(--border)]">
                <div className="text-3xl mb-3">⚡</div>
                <h3 className="font-semibold text-[var(--text-primary)] mb-2">
                  Ultra Low Cost
                </h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  Only 0.0005 SOL (~$0.0001) per query log. Affordable transparency for everyone.
                </p>
              </div>
              <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-[var(--border)]">
                <div className="text-3xl mb-3">🛡️</div>
                <h3 className="font-semibold text-[var(--text-primary)] mb-2">
                  Audit Trail
                </h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  Full audit trail of all AI recommendations with cryptographic hashes.
                </p>
              </div>
            </div>
          </div>
        </ShellLayout>
      </div>

      <ChatWidget onOpenChange={setIsChatOpen} />
    </>
  );
};

export default SmartContractPage;
