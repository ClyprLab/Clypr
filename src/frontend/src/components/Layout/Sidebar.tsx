import React from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '@/hooks/useAuth';

interface SidebarProps {
  collapsed: boolean;
}

const SidebarContainer = styled.aside<SidebarProps>`
  width: ${props => props.collapsed ? '80px' : '240px'};
  height: 100%;
  background-color: var(--color-background);
  border-right: 1px solid var(--color-border);
  padding: var(--space-4) 0;
  display: flex;
  flex-direction: column;
  transition: width var(--transition-base);
  overflow: hidden;
`;

const Logo = styled.div<SidebarProps>`
  padding: ${props => props.collapsed ? 'var(--space-4) var(--space-2)' : 'var(--space-4) var(--space-6)'};
  margin-bottom: var(--space-6);
  display: flex;
  align-items: center;
  justify-content: ${props => props.collapsed ? 'center' : 'flex-start'};
`;

const LogoText = styled.h1<SidebarProps>`
  font-family: var(--font-mono);
  font-size: ${props => props.collapsed ? '0' : 'var(--font-size-xl)'};
  font-weight: 700;
  margin: 0;
  overflow: hidden;
  white-space: nowrap;
  transition: font-size var(--transition-base);
`;

const LogoIcon = styled.div<SidebarProps>`
  width: 32px;
  height: 32px;
  background-color: var(--color-text);
  border-radius: var(--radius-sm);
  margin-right: ${props => props.collapsed ? '0' : 'var(--space-3)'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-family: var(--font-mono);
`;

const Nav = styled.nav`
  flex: 1;
`;

const NavList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const NavItem = styled.li`
  margin-bottom: var(--space-1);
`;

const StyledNavLink = styled(NavLink)<SidebarProps>`
  display: flex;
  align-items: center;
  padding: ${props => props.collapsed ? 'var(--space-3) var(--space-2)' : 'var(--space-3) var(--space-6)'};
  text-decoration: none;
  color: var(--color-text-secondary);
  transition: background-color var(--transition-fast);
  border-left: 3px solid transparent;
  
  &:hover {
    background-color: var(--color-hover);
    color: var(--color-text);
  }
  
  &.active {
    background-color: var(--color-hover);
    color: var(--color-text);
    border-left-color: var(--color-active);
    font-weight: 500;
  }
`;

const NavIcon = styled.div<SidebarProps>`
  width: 20px;
  height: 20px;
  margin-right: ${props => props.collapsed ? '0' : 'var(--space-3)'};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const NavText = styled.span<SidebarProps>`
  font-size: var(--font-size-sm);
  white-space: nowrap;
  opacity: ${props => props.collapsed ? 0 : 1};
  transition: opacity var(--transition-base);
`;

const ProfileSection = styled.div<SidebarProps>`
  padding: ${props => props.collapsed ? 'var(--space-3) var(--space-2)' : 'var(--space-3) var(--space-6)'};
  border-top: 1px solid var(--color-border);
  display: flex;
  align-items: center;
`;

const Avatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  background-color: var(--color-text);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  margin-right: ${props => props.collapsed ? '0' : 'var(--space-3)'};
`;

const ProfileInfo = styled.div<SidebarProps>`
  overflow: hidden;
  opacity: ${props => props.collapsed ? 0 : 1};
  transition: opacity var(--transition-base);
`;

const ProfileName = styled.div`
  font-size: var(--font-size-sm);
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ProfileRole = styled.div`
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
`;

const Sidebar: React.FC<SidebarProps> = ({ collapsed }) => {
  const { principal } = useAuth();
  
  return (
    <SidebarContainer collapsed={collapsed}>
      <Logo collapsed={collapsed}>
        <LogoIcon>C</LogoIcon>
        <LogoText collapsed={collapsed}>clypr</LogoText>
      </Logo>
      
      <Nav>
        <NavList>
          <NavItem>
            <StyledNavLink to="/" collapsed={collapsed}>
              <NavIcon>□</NavIcon>
              <NavText collapsed={collapsed}>Dashboard</NavText>
            </StyledNavLink>
          </NavItem>
          <NavItem>
            <StyledNavLink to="/rules" collapsed={collapsed}>
              <NavIcon>⚙</NavIcon>
              <NavText collapsed={collapsed}>Rules</NavText>
            </StyledNavLink>
          </NavItem>
          <NavItem>
            <StyledNavLink to="/messages" collapsed={collapsed}>
              <NavIcon>✉</NavIcon>
              <NavText collapsed={collapsed}>Messages</NavText>
            </StyledNavLink>
          </NavItem>
          <NavItem>
            <StyledNavLink to="/channels" collapsed={collapsed}>
              <NavIcon>⟿</NavIcon>
              <NavText collapsed={collapsed}>Channels</NavText>
            </StyledNavLink>
          </NavItem>
          <NavItem>
            <StyledNavLink to="/settings" collapsed={collapsed}>
              <NavIcon>⚙</NavIcon>
              <NavText collapsed={collapsed}>Settings</NavText>
            </StyledNavLink>
          </NavItem>
        </NavList>
      </Nav>
      
      <ProfileSection collapsed={collapsed}>
        <Avatar>
          {principal ? principal.toString().substring(0, 1).toUpperCase() : 'G'}
        </Avatar>
        <ProfileInfo collapsed={collapsed}>
          <ProfileName>
            {principal ? `${principal.toString().substring(0, 8)}...` : 'Guest User'}
          </ProfileName>
          <ProfileRole>Privacy Agent</ProfileRole>
        </ProfileInfo>
      </ProfileSection>
    </SidebarContainer>
  );
};

export default Sidebar;
