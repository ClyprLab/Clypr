import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';
import Text from '../components/UI/Text';
import { useClypr } from '../hooks/useClypr';

const DebugContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: var(--space-6);
`;

const DebugSection = styled.div`
  margin-bottom: var(--space-6);
`;

const DebugInfo = styled.div`
  background: var(--color-bg-secondary);
  padding: var(--space-4);
  border-radius: var(--radius-sm);
  font-family: var(--font-mono);
  font-size: var(--font-size-sm);
  white-space: pre-wrap;
  margin-top: var(--space-2);
`;

const Debug: React.FC = () => {
  const { 
    isAuthenticated, 
    principal, 
    isOwner, 
    login, 
    loading,
    error 
  } = useClypr();
  
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [canisterIds, setCanisterIds] = useState<any>(null);

  useEffect(() => {
    // Collect debug information
    const info = {
      window: {
        location: window.location.href,
        hostname: window.location.hostname,
        port: window.location.port,
        canisterIds: (window as any).canisterIds,
      },
      environment: {
        CLYPR_CANISTER_ID: process.env.CLYPR_CANISTER_ID,
        DFX_NETWORK: process.env.DFX_NETWORK,
        NODE_ENV: process.env.NODE_ENV,
      },
      authentication: {
        isAuthenticated,
        principal: principal?.toText(),
        isOwner,
        loading,
        error,
      }
    };
    
    setDebugInfo(JSON.stringify(info, null, 2));
    setCanisterIds((window as any).canisterIds);
  }, [isAuthenticated, principal, isOwner, loading, error]);

  const testServiceCreation = async () => {
    try {
      const { ClyprService } = await import('../services/ClyprService');
      const service = new ClyprService();
      console.log('Service created successfully:', service);
      alert('Service created successfully! Check console for details.');
    } catch (error) {
      console.error('Service creation failed:', error);
      alert(`Service creation failed: ${error}`);
    }
  };

  const testActorCreation = async () => {
    try {
      const { Actor } = await import('@dfinity/agent');
      const { idlFactory } = await import('../../../declarations/backend/backend.did.js');
      
      const canisterId = process.env.CLYPR_CANISTER_ID || (window as any).canisterIds?.backend;
      console.log('Attempting to create actor with canister ID:', canisterId);
      
      if (!canisterId) {
        throw new Error('No canister ID found');
      }
      
      // Create a simple agent
      const { HttpAgent } = await import('@dfinity/agent');
      const agent = new HttpAgent({ host: 'http://localhost:4943' });
      
      const actor = Actor.createActor(idlFactory, {
        agent,
        canisterId,
      });
      
      console.log('Actor created successfully:', actor);
      alert('Actor created successfully! Check console for details.');
    } catch (error) {
      console.error('Actor creation failed:', error);
      alert(`Actor creation failed: ${error}`);
    }
  };

  return (
    <DebugContainer>
      <Card>
        <Text as="h1" size="2xl" style={{ marginBottom: 'var(--space-6)' }}>
          Clypr Debug Information
        </Text>

        <DebugSection>
          <Text as="h2" size="lg" style={{ marginBottom: 'var(--space-4)' }}>
            Environment Information
          </Text>
          <DebugInfo>{debugInfo}</DebugInfo>
        </DebugSection>

        <DebugSection>
          <Text as="h2" size="lg" style={{ marginBottom: 'var(--space-4)' }}>
            Canister IDs
          </Text>
          <DebugInfo>
            {canisterIds ? JSON.stringify(canisterIds, null, 2) : 'No canister IDs found'}
          </DebugInfo>
        </DebugSection>

        <DebugSection>
          <Text as="h2" size="lg" style={{ marginBottom: 'var(--space-4)' }}>
            Test Actions
          </Text>
          
          <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
            <Button onClick={testServiceCreation}>
              Test Service Creation
            </Button>
            <Button onClick={testActorCreation}>
              Test Actor Creation
            </Button>
            <Button onClick={() => login()}>
              Test Login
            </Button>
          </div>
        </DebugSection>

        <DebugSection>
          <Text as="h2" size="lg" style={{ marginBottom: 'var(--space-4)' }}>
            Instructions
          </Text>
          <div style={{ padding: 'var(--space-4)', background: '#f5f5f5', borderRadius: 'var(--radius-sm)' }}>
            <ol style={{ margin: 0, paddingLeft: 'var(--space-4)' }}>
              <li>Check the environment information above</li>
              <li>Verify canister IDs are present</li>
              <li>Test service creation</li>
              <li>Test actor creation</li>
              <li>Check browser console for detailed error messages</li>
              <li>Ensure dfx is running: <code>dfx start --background</code></li>
              <li>Ensure canisters are deployed: <code>dfx deploy</code></li>
            </ol>
          </div>
        </DebugSection>
      </Card>
    </DebugContainer>
  );
};

export default Debug; 