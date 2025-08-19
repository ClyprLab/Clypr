import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Bell, HelpCircle, LogOut } from 'lucide-react';

interface TopbarProps {
  toggleSidebar: () => void;
  sidebarCollapsed?: boolean;
}

const Topbar = ({ toggleSidebar, sidebarCollapsed = true }: TopbarProps) => {
  const { logout, principal } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.startsWith('/app/dashboard')) return 'Dashboard';
    if (path.startsWith('/app/rules')) return 'Privacy Rules';
    if (path.startsWith('/app/messages')) return 'Message History';
    if (path.startsWith('/app/channels')) return 'Communication Channels';
    if (path.startsWith('/app/settings')) return 'Settings';
    return 'Clypr';
  };

  const shortPrincipal = (p: any) => {
    try {
      return p?.toString?.().substring(0, 8) + '...';
    } catch (e) {
      return String(p).substring(0, 8) + '...';
    }
  };

  return (
    <header className="h-16 border-b border-neutral-800 flex items-center justify-between px-4 md:px-6 bg-gradient-to-b from-neutral-950 to-neutral-900/40 sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          aria-label={sidebarCollapsed ? 'Open sidebar' : 'Close sidebar'}
          aria-expanded={!sidebarCollapsed}
          className="-ml-2 p-2 w-9 h-9 rounded-md transition hover:bg-neutral-900 active:scale-95 flex items-center justify-center"
        >
          <span className="sr-only">Toggle sidebar</span>
          <div className="w-4 h-4 flex flex-col justify-between">
            <span className="block w-full h-0.5 bg-neutral-100 rounded" />
            <span className="block w-full h-0.5 bg-neutral-100 rounded" />
            <span className="block w-full h-0.5 bg-neutral-100 rounded" />
          </div>
        </button>

        <h2 className="text-lg font-semibold m-0">{getPageTitle()}</h2>
      </div>

      {/* <div className="flex items-center gap-3">
        {principal && (
          <button
            onClick={() => navigate('/app/settings')}
            className="hidden md:inline-flex font-mono text-xs px-3 py-1 border border-neutral-800 rounded-full mr-2 hover:bg-neutral-900"
            title="Account settings"
            aria-label="Account settings"
          >
            {shortPrincipal(principal)}
          </button>
        )} */}

        {/* <button
          aria-label="Notifications"
          title="Notifications"
          onClick={() => alert('Notifications not implemented')}
          className="w-9 h-9 rounded-md hover:bg-neutral-900 flex items-center justify-center"
        >
          <Bell className="h-4 w-4" />
        </button> */}

        {/* <button
          aria-label="Help"
          title="Help & docs"
          onClick={() => window.open('/docs/USER_GUIDE.md', '_blank')}
          className="w-9 h-9 rounded-md hover:bg-neutral-900 flex items-center justify-center"
        >
          <HelpCircle className="h-4 w-4" />
        </button> */}

        <button
          onClick={logout}
          aria-label="Logout"
          title="Logout"
          className="w-9 h-9 rounded-md hover:bg-neutral-900 flex items-center justify-center"
        >
          <LogOut className="h-4 w-4" />
        </button>
    </header>
  );
};

export default Topbar;