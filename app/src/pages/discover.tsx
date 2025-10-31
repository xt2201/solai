import { NextPage } from 'next';
import Head from 'next/head';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

const DiscoverPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Discover - SolAI</title>
        <meta name="description" content="Discover new DeFi opportunities on Solana" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Header */}
        <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-purple-400 bg-clip-text text-transparent">
                SolAI
              </div>
              <div className="text-slate-400">|</div>
              <div className="text-lg text-slate-300">Discover</div>
            </div>
            <WalletMultiButton />
          </div>
        </header>

        {/* Content */}
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-white mb-4">
              🔍 Discover DeFi
            </h1>
            <p className="text-xl text-slate-300 mb-8">
              Coming Soon
            </p>
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8">
              <p className="text-slate-400 mb-6">
                Explore the best DeFi opportunities on Solana:
              </p>
              <ul className="text-left max-w-md mx-auto space-y-3 text-slate-300">
                <li>🌟 Trending protocols and dApps</li>
                <li>💎 High-yield farming opportunities</li>
                <li>🚀 New token launches</li>
                <li>🏆 Top-performing liquidity pools</li>
                <li>🔥 Hot DeFi strategies</li>
              </ul>
              <div className="mt-8">
                <a
                  href="/"
                  className="inline-block px-6 py-3 bg-gradient-to-r from-emerald-500 to-purple-500 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
                >
                  Back to Dashboard
                </a>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default DiscoverPage;
