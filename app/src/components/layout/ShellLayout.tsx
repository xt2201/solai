import * as React from 'react';
import { TopNavigation } from './TopNavigation';
import { LeftSidebar } from './LeftSidebar';

export interface ShellLayoutProps {
  children: React.ReactNode;
}

export const ShellLayout: React.FC<ShellLayoutProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebar-collapsed', (!sidebarCollapsed).toString());
    }
  };

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebar-collapsed');
      if (saved !== null) {
        setSidebarCollapsed(saved === 'true');
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Top Navigation - Fixed */}
      <TopNavigation />

      {/* Content wrapper - add padding for fixed nav */}
      <div className="pt-16">
        {/* Left Sidebar - Fixed */}
        <LeftSidebar 
          collapsed={sidebarCollapsed} 
          onToggle={toggleSidebar}
        />

        {/* Main Content - with left margin for sidebar */}
        <main
          className="min-h-[calc(100vh-4rem)] transition-all duration-300"
          style={{
            marginLeft: sidebarCollapsed ? '64px' : '240px',
          }}
        >
          <div className="max-w-7xl mx-auto px-6 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
