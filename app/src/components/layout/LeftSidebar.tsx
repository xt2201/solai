import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  LayoutDashboard,
  Briefcase,
  Search as SearchIcon,
  Repeat,
  Coins,
  TrendingUp,
  Bot,
  Zap,
  Gem,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Activity,
  Menu,
  X,
  BookOpen,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import logoMark from '../../../../img/logo.png';
import logoWordmark from '../../../../img/logo.png';

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
  badge?: string;
  badgeVariant?: 'success' | 'warning' | 'danger' | 'info';
}

interface QuickAction {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
}

interface LeftSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({ collapsed, onToggle }) => {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const primaryNavItems: NavItem[] = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
    { icon: Briefcase, label: 'Portfolio', href: '/portfolio', badge: '+2.3%', badgeVariant: 'success' },
    { icon: SearchIcon, label: 'Discover', href: '/discover' },
    { icon: Repeat, label: 'Swap', href: '/swap', badge: 'Best rate', badgeVariant: 'info' },
    { icon: Coins, label: 'Stake', href: '/stake', badge: '12.5% APY', badgeVariant: 'warning' },
    { icon: TrendingUp, label: 'Analytics', href: '/analytics' },
    { icon: BookOpen, label: 'Docs Search', href: '/docs', badge: 'AI', badgeVariant: 'info' },
    { icon: Activity, label: 'Smart Contract', href: '/smart-contract', badge: 'On-chain', badgeVariant: 'success' },
    { icon: Bot, label: 'AI Advisor', href: '/ai', badge: 'New', badgeVariant: 'danger' },
  ];

  const quickActions: QuickAction[] = [
    { icon: Zap, label: 'Analyze Risk', onClick: () => console.log('Analyze Risk') },
    { icon: Gem, label: 'Find Yield', onClick: () => console.log('Find Yield') },
    { icon: RefreshCw, label: 'Best Routes', onClick: () => console.log('Best Routes') },
  ];

  const statusItems = [
    { label: 'System', value: 'Online', color: 'var(--color-success)' },
    { label: 'API', value: 'Healthy', color: 'var(--color-success)' },
    { label: 'TPS', value: '3.5K', color: 'var(--color-info)' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-overlay lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Toggle Button */}
      <button
        className="fixed top-20 left-4 z-50 lg:hidden w-10 h-10 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg flex items-center justify-center transition-colors duration-300"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label={mobileOpen ? "Close sidebar" : "Open sidebar"}
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <aside
        id="sidebar-nav"
        className={`
          fixed left-0 top-16 bottom-0 z-sidebar
          bg-[var(--bg-secondary)] border-r border-[var(--border-default)]
          transition-all duration-300
          ${collapsed ? 'w-16' : 'w-60'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full overflow-y-auto">
          <div className={`px-4 py-5 border-b border-[var(--border-default)] flex ${collapsed ? 'justify-center' : 'justify-start'}`}>
            <Link
              href="/"
              className="inline-flex items-center focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:outline-none rounded-lg"
              aria-label="Solai - Dashboard"
            >
              {collapsed ? (
                <Image
                  src={logoMark}
                  alt="Solai"
                  width={36}
                  height={36}
                  className="h-9 w-9"
                  priority
                />
              ) : (
                <Image
                  src={logoWordmark}
                  alt="Solai"
                  width={160}
                  height={100}
                  className="h-10 w-auto"
                  priority
                />
              )}
            </Link>
          </div>
          {/* Primary Navigation */}
          <nav className="flex-1 py-4">
            {/* Navigation Section Header */}
            {!collapsed && (
              <div className="px-4 mb-2">
                <h3 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
                  Navigation
                </h3>
              </div>
            )}

            {/* Nav Items */}
            <div className="space-y-1 px-2">
              {primaryNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg
                    text-[var(--text-secondary)] hover:text-[var(--text-primary)]
                    hover:bg-[var(--bg-tertiary)]
                    focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:outline-none
                    transition-all duration-200
                    group relative
                    ${collapsed ? 'justify-center' : ''}
                  `}
                  aria-label={item.label}
                  title={item.label}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                  {!collapsed && (
                    <>
                      <span className="flex-1 font-medium">{item.label}</span>
                      {item.badge && (
                        <Badge variant={item.badgeVariant || 'default'} size="sm">
                          {item.badge}
                        </Badge>
                      )}
                    </>
                  )}
                  {/* Tooltip for collapsed state */}
                  {collapsed && (
                    <div 
                      className="absolute left-full ml-2 px-2 py-1 bg-[var(--bg-elevated)] text-[var(--text-primary)] text-sm rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap"
                      role="tooltip"
                      aria-hidden="true"
                    >
                      {item.label}
                    </div>
                  )}
                </Link>
              ))}
            </div>

            {/* Quick Actions Section */}
            <div className="mt-6">
              {!collapsed && (
                <div className="px-4 mb-2">
                  <h3 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
                    Quick Actions
                  </h3>
                </div>
              )}
              <div className="space-y-1 px-2">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.onClick}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                      text-[var(--text-secondary)] hover:text-[var(--text-primary)]
                      hover:bg-[var(--bg-tertiary)]
                      transition-all duration-200
                      group relative
                      ${collapsed ? 'justify-center' : ''}
                    `}
                  >
                    <action.icon className="w-4 h-4 flex-shrink-0" />
                    {!collapsed && (
                      <span className="flex-1 text-left text-sm font-medium">
                        {action.label}
                      </span>
                    )}
                    {collapsed && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-[var(--bg-elevated)] text-[var(--text-primary)] text-sm rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">
                        {action.label}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Status Panel */}
            <div className="mt-6 px-4">
              {!collapsed && (
                <>
                  <h3 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">
                    Status
                  </h3>
                  <div className="space-y-2 bg-[var(--bg-tertiary)] rounded-lg p-3">
                    {statusItems.map((item, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-[var(--text-tertiary)]">{item.label}:</span>
                        </div>
                        <span className="text-[var(--text-primary)] font-medium">
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </nav>

          {/* Collapse Toggle Button */}
          <div className="hidden lg:block border-t border-[var(--border-default)] p-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              fullWidth
              className="justify-center"
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? (
                <ChevronRight className="w-5 h-5" />
              ) : (
                <>
                  <ChevronLeft className="w-5 h-5" />
                  <span>Collapse</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
};
