import Head from "next/head";
import { useState, useEffect } from "react";
import { ShellLayout } from "@solai/app/components/layout";
import { RagSearch } from "@solai/app/components/RAG/RagSearch";
import { ChatWidget } from "@solai/app/components/ChatWidget";

const DocsPage = () => {
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
        <title>Documentation — SolAI</title>
        <meta
          name="description"
          content="Search DeFi protocol documentation with AI-powered RAG"
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
              Documentation
            </h1>
            <p className="text-[var(--text-secondary)]">
              Search through Solana DeFi protocol docs with AI-powered semantic search
            </p>
          </div>

          {/* RAG Search */}
          <div className="animate-slide-in-up">
            <RagSearch />
          </div>
        </ShellLayout>
      </div>

      <ChatWidget onOpenChange={setIsChatOpen} />
    </>
  );
};

export default DocsPage;
