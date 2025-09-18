import React from 'react';
import styled from 'styled-components';
import { useAuth } from '@/hooks/useAuth';

interface TopbarProps {
  toggleSidebar: () => void;
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
  
  &:hover {
    background-color: var(--color-hover);
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

const Topbar: React.FC<TopbarProps> = ({ toggleSidebar }) => {
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
        <MenuButton onClick={toggleSidebar} aria-label="Toggle sidebar">
          ≡
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