import React, { useEffect, useState, useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useAuth } from '@/hooks/useAuth';
import { useClypr } from '@/hooks/useClypr';

const Layout = () => {
  const isMobile = () => window.innerWidth <= 768;
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile());
  const { isAuthenticated, authReady } = useAuth();
  const { aliasChecked, hasAlias, checkMyAlias } = useClypr();
  const navigate = useNavigate();
  const location = useLocation();

  // Track page-level loading when navigation occurs so we can render a skeleton instead of blank
  const [pageLoading, setPageLoading] = useState(false);
  const prevPathRef = useRef<string>(location.pathname + location.search);

  useEffect(() => {
    if (prevPathRef.current && prevPathRef.current !== location.pathname + location.search) {
      // Trigger a short loading state on route change
      setPageLoading(true);
      const t = setTimeout(() => setPageLoading(false), 350);
      prevPathRef.current = location.pathname + location.search;
      return () => clearTimeout(t);
    }
    // initialize prevPathRef once
    prevPathRef.current = location.pathname + location.search;
  }, [location.pathname, location.search]);

  // Effects must be declared unconditionally to preserve hook order.
  useEffect(() => {
    if (!authReady) return;

    if (!isAuthenticated) {
      try {
        const from = location.pathname + location.search;
        sessionStorage.setItem('clypr.postLoginRedirect', from);
      } catch (e) {
        // ignore sessionStorage failures
      }
      navigate('/login', { state: { from: location.pathname + location.search } });
      return;
    }

    // Once authenticated, ensure alias is checked
    checkMyAlias();
  }, [authReady, isAuthenticated, navigate, location.pathname, location.search, checkMyAlias]);

  // NOTE: Do not auto-redirect users to claim-alias here. Some deployments return NotAuthorized
  // temporarily which causes a redirect loop or a quick UI flip. We surface claim alias as a
  // non-blocking banner or let the Login/ClaimAlias flow handle it explicitly.

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

  // If auth client is still initializing, render a full-screen loader to avoid UI flicker
  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-neutral-100">
        <div className="text-center">
          <div className="h-8 w-8 rounded-full border-4 border-neutral-800 border-t-fuchsia-500 animate-spin mx-auto mb-4" />
          <div className="text-sm text-neutral-400">Preparing your session…</div>
        </div>
      </div>
    );
  }

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Simple skeleton for content area while a page is loading
  const PageSkeleton = () => (
    <div className="animate-pulse">
      <div className="mb-6">
        <div className="h-8 w-1/3 rounded bg-neutral-800 mb-3" />
        <div className="h-4 w-1/4 rounded bg-neutral-800" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-40 rounded-lg bg-neutral-900/40 border border-neutral-800" />
        ))}
      </div>
    </div>
  );

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
          {pageLoading ? <PageSkeleton /> : <Outlet />}
        </div>
      </main>
    </div>
  );
};

export default Layout;
