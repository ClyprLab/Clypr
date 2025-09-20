import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import Button from '../components/UI/Button';

const NotFoundContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: var(--space-6);
`;

const Content = styled.div`
  text-align: center;
  max-width: 600px;
`;

const ErrorCode = styled.div`
  font-size: 120px;
  font-weight: 700;
  line-height: 1;
  margin-bottom: var(--space-4);
  font-family: var(--font-mono);
`;

const Title = styled.h1`
  font-size: var(--font-size-2xl);
  margin-bottom: var(--space-4);
`;

const Description = styled.p`
  margin-bottom: var(--space-6);
  color: var(--color-text-secondary);
`;

const ButtonsContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: var(--space-4);
`;

const NotFound: React.FC = () => {
  return (
    <NotFoundContainer>
      <Content>
        <ErrorCode>404</ErrorCode>
        <Title>Page Not Found</Title>
        <Description>
          The page you are looking for might have been removed, had its name changed,
          or is temporarily unavailable.
        </Description>
        <ButtonsContainer>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <Button>Go to Dashboard</Button>
          </Link>
          <Link to="/messages" style={{ textDecoration: 'none' }}>
            <Button variant="secondary">View Messages</Button>
          </Link>
        </ButtonsContainer>
      </Content>
    </NotFoundContainer>
  );
};

export default NotFound;
