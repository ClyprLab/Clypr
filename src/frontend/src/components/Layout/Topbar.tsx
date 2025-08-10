import React from 'react';
import { useAuth } from '@/hooks/useAuth';

interface TopbarProps {
  toggleSidebar: () => void;
  sidebarCollapsed?: boolean;
}

const Topbar = ({ toggleSidebar, sidebarCollapsed = true }: TopbarProps) => {
  const { logout, principal } = useAuth();

  const getPageTitle = () => {
    const path = window.location.pathname;
    if (path === '/app/dashboard') return 'Dashboard';
    if (path === '/app/rules') return 'Privacy Rules';
    if (path === '/app/messages') return 'Message History';
    if (path === '/app/channels') return 'Communication Channels';
    if (path === '/app/settings') return 'Settings';
    return 'Clypr';
  };

  return (
    <header className="h-16 border-b border-neutral-800 flex items-center justify-between px-6 md:px-4 bg-neutral-950 sticky top-0 z-50">
      <div className="flex items-center">
        <button
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
          className={`relative -ml-2 p-2 w-9 h-9 rounded-md transition ${!sidebarCollapsed ? 'active' : ''} hover:bg-neutral-900 active:scale-95`}
        >
          <span className="relative w-4 h-4 flex flex-col justify-between">
            <span className="block w-full h-0.5 bg-neutral-100 rounded"></span>
            <span className="block w-full h-0.5 bg-neutral-100 rounded"></span>
            <span className="block w-full h-0.5 bg-neutral-100 rounded"></span>
          </span>
        </button>
        <h2 className="text-lg font-medium m-0 ml-2">{getPageTitle()}</h2>
      </div>

      <div className="flex items-center">
        {principal && (
          <div className="hidden md:block font-mono text-xs px-3 py-1 border border-neutral-800 rounded-full mr-3">
            {`${principal.toString().substring(0, 8)}...`}
          </div>
        )}
        <button className="hidden md:inline-flex border border-neutral-800 rounded-md px-4 py-2 text-sm hover:bg-neutral-900">New Rule</button>
        <button className="hidden md:inline-flex ml-3 bg-neutral-100 text-neutral-900 rounded-md px-4 py-2 text-sm hover:bg-neutral-200">Test Rule</button>
        <button aria-label="Notifications" className="hidden md:inline-flex ml-2 w-9 h-9 rounded-md hover:bg-neutral-900 items-center justify-center">□</button>
        <button aria-label="Help" className="hidden md:inline-flex ml-2 w-9 h-9 rounded-md hover:bg-neutral-900 items-center justify-center">?</button>
        <button onClick={logout} aria-label="Logout" className="ml-2 w-9 h-9 rounded-md hover:bg-neutral-900 items-center justify-center inline-flex">⍇</button>
      </div>
    </header>
  );
};

export default Topbar;