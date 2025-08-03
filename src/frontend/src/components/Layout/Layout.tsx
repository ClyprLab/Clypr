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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // Detect mobile width
  const isMobile = window.innerWidth <= 768;

  // Redirect to login when unauthenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Collapse sidebar on initial load and on window resize for mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setSidebarCollapsed(true);
      }
    };
    // Initial collapse on mount
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (window.innerWidth <= 768) {
      setSidebarCollapsed(true);
      document.body.style.overflow = '';
    }
  }, [location.pathname]);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
    
    // On mobile, when opening the sidebar, lock the body scroll
    if (sidebarCollapsed && window.innerWidth <= 768) {
      document.body.style.overflow = 'hidden';
    } else if (!sidebarCollapsed) {
      document.body.style.overflow = '';
    }
  };
  
  // Close sidebar when clicking overlay (mobile only)
  const handleOverlayClick = () => {
    if (!sidebarCollapsed) {
      setSidebarCollapsed(true);
      document.body.style.overflow = '';
    }
  };

  return (
    <LayoutContainer>
      <Sidebar collapsed={sidebarCollapsed} />
      {/* Overlay for mobile view when sidebar is open */}
      <div 
        className={`sidebar-overlay ${!sidebarCollapsed ? 'active' : ''}`} 
        onClick={handleOverlayClick}
        aria-hidden="true"
      />
      <MainContent>
        <Topbar toggleSidebar={toggleSidebar} sidebarCollapsed={sidebarCollapsed} />
        <ContentWrapper>
          <Outlet />
        </ContentWrapper>
      </MainContent>
    </LayoutContainer>
  );
};

export default Layout;
