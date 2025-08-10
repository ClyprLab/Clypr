import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useClypr } from '@/hooks/useClypr';

interface SidebarProps {
  collapsed: boolean;
}

const Sidebar = ({ collapsed }: SidebarProps) => {
  const { principal } = useAuth();
  const clypr = useClypr();
  // Access possible internal actor leniently to avoid TS issues; guard at runtime
  const actor = (clypr as any)?.actor;
  const location = useLocation();
  const path = location.pathname;

  const [username, setUsername] = React.useState<string | null>(null);
  const [loadingUsername, setLoadingUsername] = React.useState(true);

  React.useEffect(() => {
    const fetchUsername = async () => {
      if (actor && principal && typeof actor.getMyUsername === 'function') {
        setLoadingUsername(true);
        try {
          const result = await actor.getMyUsername();
          if ('ok' in result) {
            setUsername(result.ok);
          } else {
            setUsername(null);
          }
        } catch (error) {
          console.error('Failed to fetch username:', error);
          setUsername(null);
        } finally {
          setLoadingUsername(false);
        }
      } else {
        setLoadingUsername(false);
      }
    };
    fetchUsername();
  }, [actor, principal]);

  const isDashboard = path.startsWith('/app/dashboard');
  const isRules = path.startsWith('/app/rules');
  const isMessages = path.startsWith('/app/messages');
  const isChannels = path.startsWith('/app/channels');
  const isSettings = path.startsWith('/app/settings');

  const getProfileName = () => {
    if (loadingUsername) return 'Loading...';
    if (username) return username;
    if (principal) return `${principal.toString().substring(0, 6)}...`;
    return 'Guest User';
  };

  const getProfileSubtext = () => {
    if (loadingUsername) return 'Fetching details...';
    if (username) return `Clypr_${username}`;
    return 'Privacy Agent';
  };

  return (
    <aside
      className={
        `h-full border-r border-neutral-800 py-4 flex flex-col overflow-hidden z-50 md:static md:translate-x-0 md:shadow-none md:bg-neutral-950 ` +
        (collapsed
          ? 'fixed top-0 left-0 bottom-0 w-[280px] -translate-x-full shadow-none backdrop-blur md:w-[240px] md:translate-x-0'
          : 'fixed top-0 left-0 bottom-0 w-[280px] translate-x-0 shadow-lg backdrop-blur bg-neutral-950/95 md:w-[240px] md:translate-x-0')
      }
    >
      <div className={`flex items-center ${collapsed ? 'justify-center px-2' : 'justify-start px-6'} pb-6`}>
        <div className="w-8 h-8 bg-neutral-100 text-neutral-900 rounded-md flex items-center justify-center font-mono font-bold mr-3">C</div>
        <h1 className={`font-mono font-bold transition-all ${collapsed ? 'text-[0]' : 'text-xl'}`}>clypr</h1>
      </div>

      <nav className="flex-1">
        <ul className="list-none p-0 m-0">
          <li className="mb-1">
            <NavLink to="/app/dashboard" className={({ isActive }) => 
              `flex items-center ${collapsed ? 'px-2 py-3' : 'px-6 py-3'} text-neutral-400 hover:text-neutral-100 hover:bg-neutral-900 border-l-4 border-transparent ` +
              ((isActive || isDashboard) ? 'bg-neutral-900 text-neutral-100 border-l-neutral-400 font-medium' : '')
            }>
              <span className={`${collapsed ? 'mr-0' : 'mr-3'} w-5 h-5 flex items-center justify-center`}>□</span>
              <span className={`${collapsed ? 'opacity-0' : 'opacity-100'} text-sm`}>Dashboard</span>
            </NavLink>
          </li>
          <li className="mb-1">
            <NavLink to="/app/rules" className={({ isActive }) => 
              `flex items-center ${collapsed ? 'px-2 py-3' : 'px-6 py-3'} text-neutral-400 hover:text-neutral-100 hover:bg-neutral-900 border-l-4 border-transparent ` +
              ((isActive || isRules) ? 'bg-neutral-900 text-neutral-100 border-l-neutral-400 font-medium' : '')
            }>
              <span className={`${collapsed ? 'mr-0' : 'mr-3'} w-5 h-5 flex items-center justify-center`}>⚙</span>
              <span className={`${collapsed ? 'opacity-0' : 'opacity-100'} text-sm`}>Rules</span>
            </NavLink>
          </li>
          <li className="mb-1">
            <NavLink to="/app/messages" className={({ isActive }) => 
              `flex items-center ${collapsed ? 'px-2 py-3' : 'px-6 py-3'} text-neutral-400 hover:text-neutral-100 hover:bg-neutral-900 border-l-4 border-transparent ` +
              ((isActive || isMessages) ? 'bg-neutral-900 text-neutral-100 border-l-neutral-400 font-medium' : '')
            }>
              <span className={`${collapsed ? 'mr-0' : 'mr-3'} w-5 h-5 flex items-center justify-center`}>✉</span>
              <span className={`${collapsed ? 'opacity-0' : 'opacity-100'} text-sm`}>Messages</span>
            </NavLink>
          </li>
          <li className="mb-1">
            <NavLink to="/app/channels" className={({ isActive }) => 
              `flex items-center ${collapsed ? 'px-2 py-3' : 'px-6 py-3'} text-neutral-400 hover:text-neutral-100 hover:bg-neutral-900 border-l-4 border-transparent ` +
              ((isActive || isChannels) ? 'bg-neutral-900 text-neutral-100 border-l-neutral-400 font-medium' : '')
            }>
              <span className={`${collapsed ? 'mr-0' : 'mr-3'} w-5 h-5 flex items-center justify-center`}>⟿</span>
              <span className={`${collapsed ? 'opacity-0' : 'opacity-100'} text-sm`}>Channels</span>
            </NavLink>
          </li>
          <li className="mb-1">
            <NavLink to="/app/settings" className={({ isActive }) => 
              `flex items-center ${collapsed ? 'px-2 py-3' : 'px-6 py-3'} text-neutral-400 hover:text-neutral-100 hover:bg-neutral-900 border-l-4 border-transparent ` +
              ((isActive || isSettings) ? 'bg-neutral-900 text-neutral-100 border-l-neutral-400 font-medium' : '')
            }>
              <span className={`${collapsed ? 'mr-0' : 'mr-3'} w-5 h-5 flex items-center justify-center`}>⚙</span>
              <span className={`${collapsed ? 'opacity-0' : 'opacity-100'} text-sm`}>Settings</span>
            </NavLink>
          </li>
        </ul>
      </nav>

      <div className={`${collapsed ? 'px-2' : 'px-6'} border-t border-neutral-800 flex items-center py-3`}>
        <div className="w-8 h-8 rounded-full bg-neutral-100 text-neutral-900 flex items-center justify-center font-semibold mr-3">
          {principal ? principal.toString().substring(0, 1).toUpperCase() : 'G'}
        </div>
        <div className={`${collapsed ? 'opacity-0' : 'opacity-100'} overflow-hidden`}>
          <div className="text-sm font-medium truncate">{getProfileName()}</div>
          <div className="text-xs text-neutral-400">{getProfileSubtext()}</div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
