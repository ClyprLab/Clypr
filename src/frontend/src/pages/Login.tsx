import React from 'react';
import styled from 'styled-components';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const LoginContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: var(--color-background);
`;

const LoginCard = styled(Card)`
  width: 100%;
  max-width: 440px;
  padding: var(--space-8);
`;

const Logo = styled.div`
  text-align: center;
  margin-bottom: var(--space-6);
`;

const LogoIcon = styled.div`
  width: 64px;
  height: 64px;
  background-color: var(--color-text);
  border-radius: var(--radius-sm);
  margin: 0 auto var(--space-4);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-family: var(--font-mono);
  font-size: var(--font-size-xl);
`;

const LogoText = styled.h1`
  font-family: var(--font-mono);
  font-size: var(--font-size-2xl);
  font-weight: 700;
  margin: 0;
`;

const Tagline = styled.p`
  text-align: center;
  color: var(--color-text-secondary);
  margin-bottom: var(--space-6);
`;

const FooterText = styled.p`
  text-align: center;
  margin-top: var(--space-6);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
`;

const Login: React.FC = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/app');
    }
  }, [isAuthenticated, navigate]);
  
  const handleLogin = async () => {
    await login();
  };
  
  return (
    <LoginContainer>
      <LoginCard>
        <Logo>
          <LogoIcon>C</LogoIcon>
          <LogoText>clypr</LogoText>
        </Logo>
        <Tagline>Privacy-first communication relay on the Internet Computer</Tagline>
        
        <Button fullWidth onClick={handleLogin}>
          Login with Internet Identity
        </Button>
        
        <FooterText>
          By logging in, you agree to our Privacy Policy and Terms of Service.
        </FooterText>
      </LoginCard>
    </LoginContainer>
  );
};

export default Login;
