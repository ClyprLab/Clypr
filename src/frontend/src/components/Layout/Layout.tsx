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
  const isMobile = window.innerWidth <= 768;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
    
    // On mobile, sidebar should be collapsed by default
    if (isMobile && !sidebarCollapsed) {
      setSidebarCollapsed(true);
    }
    
    // Add resize event listener to handle mobile view
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      if (mobile && !sidebarCollapsed) {
        setSidebarCollapsed(true);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isAuthenticated, navigate, sidebarCollapsed]);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };
  
  // Close sidebar when clicking overlay (mobile only)
  const handleOverlayClick = () => {
    if (!sidebarCollapsed) {
      setSidebarCollapsed(true);
    }
  };

  return (
    <LayoutContainer>
      <Sidebar collapsed={sidebarCollapsed} />
      {/* Overlay for mobile view when sidebar is open */}
      <div 
        className={`sidebar-overlay ${!sidebarCollapsed ? 'active' : ''}`} 
        onClick={handleOverlayClick}
      />
      <MainContent>
        <Topbar toggleSidebar={toggleSidebar} />
        <ContentWrapper>
          <Outlet />
        </ContentWrapper>
      </MainContent>
    </LayoutContainer>
  );
};

export default Layout;
