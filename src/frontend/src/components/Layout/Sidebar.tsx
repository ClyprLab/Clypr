import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useClypr } from '@/hooks/useClypr';
import { 
  LayoutDashboard, 
  Shield, 
  MessageSquare, 
  Zap, 
  Settings, 
  User,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { cn } from '../../utils/cn';

interface SidebarProps {
  collapsed: boolean;
}

const Sidebar = ({ collapsed }: SidebarProps) => {
  const { principal } = useAuth();
  const { myUsername, aliasChecked } = useClypr();
  const location = useLocation();
  const path = location.pathname;

  const isDashboard = path.startsWith('/app/dashboard');
  const isRules = path.startsWith('/app/rules');
  const isMessages = path.startsWith('/app/messages');
  const isChannels = path.startsWith('/app/channels');
  const isSettings = path.startsWith('/app/settings');

  const profileTitle = () => {
    if (!aliasChecked) return 'Loading...';
    if (myUsername) return `@${myUsername}`;
    if (principal) return `${principal.toString().substring(0, 6)}...`;
    return 'Guest User';
  };

  const profileSub = () => {
    if (!aliasChecked) return 'Fetching alias…';
    if (myUsername) return 'Clypr Agent';
    return 'Privacy Agent';
  };

  const navigationItems = [
    {
      path: '/app/dashboard',
      icon: LayoutDashboard,
      label: 'Dashboard',
      description: 'Overview & Analytics',
      isActive: isDashboard
    },
    {
      path: '/app/rules',
      icon: Shield,
      label: 'Privacy Rules',
      description: 'Message Filtering',
      isActive: isRules
    },
    {
      path: '/app/messages',
      icon: MessageSquare,
      label: 'Messages',
      description: 'Communication Logs',
      isActive: isMessages
    },
    {
      path: '/app/channels',
      icon: Zap,
      label: 'Channels',
      description: 'Delivery Routes',
      isActive: isChannels
    },
    {
      path: '/app/settings',
      icon: Settings,
      label: 'Settings',
      description: 'Preferences',
      isActive: isSettings
    }
  ];

  return (
    <aside
      className={cn(
        'h-full border-r border-neutral-800/50 py-4 flex flex-col overflow-hidden z-50',
        'bg-gradient-to-b from-neutral-950 to-neutral-900/50 backdrop-blur-sm transition-all duration-200 flex-shrink-0',
        // Fixed on small screens to sit flush at the left edge; relative on larger screens
        'fixed md:relative top-0 left-0 h-screen md:h-full',
        // Width: collapsed -> narrow on desktop; expanded -> full width
        collapsed ? 'w-16 md:w-20' : 'w-[280px] md:w-[240px]',
        // Mobile behavior: when collapsed hide off-canvas, when open show
        collapsed ? '-translate-x-full md:translate-x-0' : 'translate-x-0',
        // Add shadow when expanded on desktop
        !collapsed && 'shadow-xl'
      )}
    >
      {/* Logo Section */}
      <div className={cn(
        // Remove horizontal padding on small screens, keep md padding
        'flex items-center px-2 md:px-6 pb-6 border-b border-neutral-800/50',
        collapsed && 'justify-center px-2'
      )}>
        <div className="relative">
          <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-fuchsia-500 text-neutral-950 rounded-lg flex items-center justify-center font-display font-bold text-lg shadow-lg">
            C
          </div>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-cyan-400 to-fuchsia-500 rounded-full animate-pulse" />
        </div>
        {!collapsed && (
          <div className="ml-3">
            <h1 className="text-xl font-display font-bold gradient-text">
              Clypr
            </h1>
            <p className="text-xs text-neutral-400 font-mono">
              Privacy Agent
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-0 md:px-3 py-4">
        <div className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => cn(
                  'group relative flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200',
                  'hover:bg-neutral-800/50 hover:text-white',
                  collapsed ? 'justify-center' : 'justify-start',
                  (isActive || item.isActive) 
                    ? 'bg-gradient-to-r from-cyan-500/20 to-fuchsia-500/20 text-white border border-cyan-500/30 shadow-lg shadow-cyan-500/10' 
                    : 'text-neutral-400 hover:border-neutral-700'
                )}
              >
                {({ isActive }) => (
                  <>
                    <Icon className={cn(
                      'flex-shrink-0 transition-all duration-200',
                      collapsed ? 'h-5 w-5' : 'h-5 w-5 mr-3',
                      (isActive || item.isActive) && 'text-cyan-400'
                    )} />

                    {!collapsed && (
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="truncate">{item.label}</span>
                          {(isActive || item.isActive) && (
                            <ChevronRight className="h-4 w-4 text-cyan-400" />
                          )}
                        </div>
                        <p className="text-xs text-neutral-500 truncate">
                          {item.description}
                        </p>
                      </div>
                    )}

                    {/* Active indicator */}
                    {(isActive || item.isActive) && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-cyan-400 to-fuchsia-500 rounded-r-full" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Quick Actions */}
        {/* {!collapsed && (
          <div className="mt-6 px-3">
            <div className="rounded-lg bg-gradient-to-r from-cyan-500/10 to-fuchsia-500/10 border border-cyan-500/20 p-3">
              <div className="flex items-center mb-2">
                <Sparkles className="h-4 w-4 text-cyan-400 mr-2" />
                <span className="text-sm font-medium text-white">Quick Actions</span>
              </div>
              <div className="space-y-2">
                <button className="w-full text-left text-xs text-neutral-300 hover:text-white transition-colors">
                  • Create new rule
                </button>
                <button className="w-full text-left text-xs text-neutral-300 hover:text-white transition-colors">
                  • Add channel
                </button>
                <button className="w-full text-left text-xs text-neutral-300 hover:text-white transition-colors">
                  • View analytics
                </button>
              </div>
            </div>
          </div>
        )} */}
      </nav>

      {/* User Profile */}
      <div className={cn(
        // remove horizontal padding on mobile, preserve on md+
        'px-0 md:px-3 border-t border-neutral-800/50',
        collapsed ? 'px-2' : undefined
      )}>
        <div className={cn(
          'flex items-center py-3',
          collapsed ? 'justify-center' : 'justify-start'
        )}>
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-fuchsia-500 flex items-center justify-center font-semibold text-neutral-950 text-sm shadow-lg">
              {(myUsername && myUsername[0]?.toUpperCase()) || (principal ? principal.toString().substring(0, 1).toUpperCase() : 'G')}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-neutral-950" />
          </div>
          
          {!collapsed && (
            <div className="ml-3 flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">
                {profileTitle()}
              </div>
              <div className="text-xs text-neutral-400 truncate">
                {profileSub()}
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
