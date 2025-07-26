import React from 'react';
import styled from 'styled-components';
import { useAuth } from '@/hooks/useAuth';

interface TopbarProps {
  toggleSidebar: () => void;
  sidebarCollapsed?: boolean;
}

const TopbarContainer = styled.header`
  height: 64px;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-6);
  background-color: var(--color-background);
  z-index: 50;
  
  @media (max-width: 768px) {
    padding: 0 var(--space-4);
  }
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
`;

const MenuButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  margin-right: var(--space-4);
  transition: all var(--transition-fast);
  position: relative;
  padding: 10px;
  margin-left: -10px;
  -webkit-tap-highlight-color: transparent; /* Removes tap highlight on mobile */
  
  &:hover {
    background-color: var(--color-hover);
  }
  
  &:active {
    transform: scale(0.95);
  }
  
  /* Make the touch target larger on mobile without affecting layout */
  @media (max-width: 768px) {
    &::before {
      content: '';
      position: absolute;
      top: -10px;
      left: -10px;
      right: -10px;
      bottom: -10px;
    }
  }
  
  .hamburger-icon {
    position: relative;
    width: 16px;
    height: 16px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .hamburger-line {
    display: block;
    width: 100%;
    height: 2px;
    background-color: var(--color-text);
    border-radius: 1px;
    transition: transform 0.3s ease, opacity 0.2s ease;
  }
  
  &.active {
    .hamburger-line:nth-child(1) {
      transform: translateY(7px) rotate(45deg);
    }
    
    .hamburger-line:nth-child(2) {
      opacity: 0;
    }
    
    .hamburger-line:nth-child(3) {
      transform: translateY(-7px) rotate(-45deg);
    }
  }
`;

const PageTitle = styled.h2`
  font-size: var(--font-size-lg);
  font-weight: 500;
  margin: 0;
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
`;

const Button = styled.button`
  background: none;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: var(--space-2) var(--space-4);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-family: var(--font-mono);
  
  &:hover {
    background-color: var(--color-hover);
  }
`;

const ActionButton = styled(Button)`
  background-color: var(--color-text);
  color: var(--color-background);
  border: none;
  margin-left: var(--space-3);
  
  &:hover {
    background-color: #333;
  }
`;

const IconButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  margin-left: var(--space-2);
  
  &:hover {
    background-color: var(--color-hover);
  }
`;

const CanisterIdDisplay = styled.div`
  font-family: var(--font-mono);
  font-size: var(--font-size-xs);
  padding: var(--space-1) var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  margin-right: var(--space-3);
`;

const Topbar = ({ toggleSidebar, sidebarCollapsed = true }: TopbarProps) => {
  const { logout, principal } = useAuth();
  
  // Get page title based on current route
  const getPageTitle = () => {
    const path = window.location.pathname;
    
    if (path === '/') return 'Dashboard';
    if (path === '/rules') return 'Privacy Rules';
    if (path === '/messages') return 'Message History';
    if (path === '/channels') return 'Communication Channels';
    if (path === '/settings') return 'Settings';
    
    return 'Clypr';
  };
  
  return (
    <TopbarContainer>
      <LeftSection>
        <MenuButton 
          onClick={toggleSidebar} 
          aria-label="Toggle sidebar"
          className={!sidebarCollapsed ? 'active' : ''}
        >
          <span className="hamburger-icon">
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </span>
        </MenuButton>
        <PageTitle>{getPageTitle()}</PageTitle>
      </LeftSection>
      
      <RightSection>
        {principal && (
          <CanisterIdDisplay className="hide-on-mobile">
            {`${principal.toString().substring(0, 8)}...`}
          </CanisterIdDisplay>
        )}
        
        <Button className="hide-on-mobile">New Rule</Button>
        <ActionButton className="hide-on-mobile">Test Rule</ActionButton>
        
        <IconButton aria-label="Notifications" className="hide-on-mobile">
          ⊡
        </IconButton>
        <IconButton aria-label="Help" className="hide-on-mobile">
          ?
        </IconButton>
        <IconButton onClick={logout} aria-label="Logout">
          ⍇
        </IconButton>
      </RightSection>
    </TopbarContainer>
  );
};

export default Topbar;