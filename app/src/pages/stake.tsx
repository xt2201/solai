import { NextPage } from 'next';
import Head from 'next/head';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { ThemeToggle } from '../components/ThemeToggle';

const StakePage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Stake - SolAI</title>
        <meta name="description" content="Stake your tokens and earn rewards" />
      </Head>

      <div className="min-h-screen bg-[var(--bg-primary)] transition-colors duration-300">
        {/* Header */}
        <header className="border-b border-[var(--border-default)] bg-[var(--bg-secondary)] backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-purple-400 bg-clip-text text-transparent">
                SolAI
              </div>
              <div className="text-[var(--text-tertiary)]">|</div>
              <div className="text-lg text-[var(--text-primary)]">Staking</div>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <WalletMultiButton />
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-4">
              ⚡ Staking Platform
            </h1>
            <p className="text-xl text-[var(--text-secondary)] mb-8">
              Coming Soon
            </p>
            <div className="bg-[var(--bg-secondary)] backdrop-blur-sm border border-[var(--border-default)] rounded-xl p-8">
              <p className="text-[var(--text-secondary)] mb-6">
                Stake your tokens and earn competitive rewards:
              </p>
              <ul className="text-left max-w-md mx-auto space-y-3 text-[var(--text-primary)]">
                <li>💰 Competitive APY rates</li>
                <li>🔒 Secure smart contract staking</li>
                <li>⚡ Instant rewards claiming</li>
                <li>📊 Real-time earnings tracking</li>
                <li>🎁 Bonus multipliers for long-term stakers</li>
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

export default StakePage;
