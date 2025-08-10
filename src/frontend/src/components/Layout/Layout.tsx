import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useAuth } from '@/hooks/useAuth';
import { useClypr } from '@/hooks/useClypr';

const Layout = () => {
  const isMobile = () => window.innerWidth <= 768;
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile());
  const { isAuthenticated } = useAuth();
  const { aliasChecked, hasAlias, checkMyAlias } = useClypr();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    // Once authenticated, ensure alias is checked
    checkMyAlias();
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (!aliasChecked) return;
    // Prevent redirect loop if already on claim page
    if (!hasAlias && location.pathname !== '/claim-alias') {
      navigate('/claim-alias');
    }
  }, [aliasChecked, hasAlias, isAuthenticated, location.pathname, navigate]);

  useEffect(() => {
    const handleResize = () => {
      if (!isMobile()) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    if (isMobile()) {
      setSidebarOpen(false);
    }
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [location.pathname]);

  useEffect(() => {
    if (sidebarOpen && isMobile()) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-neutral-950 text-neutral-100">
      <Sidebar collapsed={!sidebarOpen} />

      {/* Mobile overlay */}
      <div
        onClick={toggleSidebar}
        aria-hidden="true"
        className={`${sidebarOpen && isMobile() ? 'fixed inset-0 z-40 block bg-black/40 md:hidden' : 'hidden'}`}
      />

      <main className="flex-1 flex flex-col w-full h-full">
        <Topbar toggleSidebar={toggleSidebar} sidebarCollapsed={!sidebarOpen} />
        <div className="flex-1 overflow-auto p-6 md:p-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
