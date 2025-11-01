import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Search, Bell, Settings } from 'lucide-react';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';
import { ThemeToggle } from '../ThemeToggle';
import logoMark from '../../../../img/logo.png';
import logoWordmark from '../../../../img/logo.png';

export const TopNavigation: React.FC = () => {
  const { publicKey, connected } = useWallet();
  const [searchValue, setSearchValue] = React.useState('');
  const [devWallet, setDevWallet] = React.useState<string | null>(null);

  // Fetch dev wallet on mount
  React.useEffect(() => {
    fetch('http://localhost:3001/dev/wallet')
      .then((res) => res.json())
      .then((data) => {
        if (data.available && data.wallet) {
          setDevWallet(data.wallet);
        }
      })
      .catch(() => {});
  }, []);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const walletAddress = publicKey ? publicKey.toBase58() : null;
  const effectiveWallet = walletAddress || devWallet;
  const isDevMode = !walletAddress && devWallet;

  return (
    <header className="fixed top-0 left-0 right-0 z-topnav h-16">
      <div className="h-full bg-[var(--bg-secondary)] border-b border-[var(--border-default)] transition-colors duration-300">
        <div className="h-full px-6 flex items-center justify-between gap-6">
          {/* Left Section: Logo + Search */}
          <div className="flex items-center gap-6 flex-1 max-w-[600px]">
            {/* Logo + Brand Name */}
            <Link 
              href="/" 
              className="flex items-center gap-3 hover:opacity-80 transition-opacity focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:outline-none rounded-lg px-2 py-1"
              aria-label="SolAI - Go to homepage"
            >
              <Image
                src={logoMark}
                alt="SolAI Logo"
                width={36}
                height={36}
                className="h-9 w-9"
                priority
              />
              <span className="text-2xl font-bold text-white tracking-tight">
                SolAI
              </span>
            </Link>

            {/* Global Search */}
            <div className="flex-1 max-w-[400px] hidden md:block">
              <Input
                type="text"
                placeholder="Search tokens, protocols, strategies..."
                value={searchValue}
                onChange={(e: any) => setSearchValue(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
                fullWidth
                className="h-10"
                aria-label="Global search"
              />
            </div>
          </div>

          {/* Center Section: Network Indicator */}
          <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-[var(--bg-tertiary)] rounded-lg">
            <div className="w-2 h-2 rounded-full bg-[var(--color-success)] animate-pulse" />
            <span className="text-sm font-medium text-[var(--text-primary)]">
              Solana
            </span>
            <span className="text-xs text-[var(--text-tertiary)]">
              TPS: 3.5K
            </span>
          </div>

          {/* Right Section: Actions + User */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Notifications */}
            <button
              className="relative w-10 h-10 flex items-center justify-center rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:outline-none"
              aria-label="Notifications"
              title="View notifications (3 unread)"
            >
              <Bell className="w-5 h-5 text-[var(--text-secondary)]" aria-hidden="true" />
              <Badge 
                variant="danger" 
                size="sm" 
                className="absolute -top-1 -right-1 min-w-[18px] h-[18px] text-[10px] px-1"
                aria-label="3 unread notifications"
              >
                3
              </Badge>
            </button>

            {/* Wallet */}
            {effectiveWallet ? (
              <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-[var(--bg-tertiary)] rounded-lg">
                <div className="flex flex-col items-end">
                  <span className="text-sm font-medium text-[var(--text-primary)]">
                    {isDevMode ? '🔧 Dev' : '$12.4K'}
                  </span>
                  <span className="text-xs text-[var(--text-tertiary)]">
                    {formatAddress(effectiveWallet)}
                  </span>
                </div>
                <Avatar size="sm" fallback={isDevMode ? 'D' : 'U'} status="online" />
              </div>
            ) : (
              <WalletMultiButton />
            )}

            {/* Settings */}
            <button
              className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:outline-none"
              aria-label="Settings"
              title="Open settings"
            >
              <Settings className="w-5 h-5 text-[var(--text-secondary)]" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
