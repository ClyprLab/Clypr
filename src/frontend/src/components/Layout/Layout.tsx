import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useAuth } from '@/hooks/useAuth';

const LayoutContainer = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  position: relative;
  overflow: hidden;
`;

const MainContent = styled.main`
  flex: 1;
  overflow: auto;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
`;

const ContentWrapper = styled.div`
  flex: 1;
  padding: var(--space-6);
  overflow: auto;
  
  @media (max-width: 768px) {
    padding: var(--space-4);
  }
`;

const Layout = () => {
  const isMobile = () => window.innerWidth <= 768;

  const [sidebarOpen, setSidebarOpen] = useState(!isMobile());
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Effect for auth redirect
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Effect for managing sidebar state based on screen size and route changes
  useEffect(() => {
    const handleResize = () => {
      if (!isMobile()) {
        setSidebarOpen(true); // Open sidebar on desktop
      } else {
        setSidebarOpen(false); // Close sidebar on mobile
      }
    };

    // Close sidebar on route change on mobile
    if (isMobile()) {
      setSidebarOpen(false);
    }

    window.addEventListener('resize', handleResize);
    // Initial check
    handleResize();
    
    return () => window.removeEventListener('resize', handleResize);
  }, [location.pathname]); // Reruns on route change

  // Effect for body scroll lock
  useEffect(() => {
    if (sidebarOpen && isMobile()) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    // Cleanup function to ensure scroll is restored on component unmount
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <LayoutContainer>
      <Sidebar collapsed={!sidebarOpen} />
      {/* Overlay for mobile view when sidebar is open */}
      <div
        className={`sidebar-overlay ${sidebarOpen && isMobile() ? 'active' : ''}`}
        onClick={toggleSidebar}
        aria-hidden="true"
      />
      <MainContent>
        <Topbar toggleSidebar={toggleSidebar} sidebarCollapsed={!sidebarOpen} />
        <ContentWrapper>
          <Outlet />
        </ContentWrapper>
      </MainContent>
    </LayoutContainer>
  );
};

export default Layout;
