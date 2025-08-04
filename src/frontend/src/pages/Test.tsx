import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';
import Text from '../components/UI/Text';
import { AuthClient } from '@dfinity/auth-client';
import { ClyprService } from '../services/ClyprService';
import { useClypr } from '../hooks/useClypr';

const TestContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-6);
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-6);
`;

const TestSection = styled(Card)`
  padding: var(--space-4);
`;

const TestResult = styled.div<{ success?: boolean }>`
  padding: var(--space-3);
  border-radius: var(--radius-sm);
  background-color: ${props => props.success ? '#E8F5E9' : '#FFEBEE'};
  color: ${props => props.success ? '#388E3C' : '#D32F2F'};
  margin-top: var(--space-2);
  font-family: var(--font-mono);
  font-size: var(--font-size-sm);
`;

const ResultsList = styled.div`
  max-height: 400px;
  overflow-y: auto;
  margin: var(--space-4) 0;
  font-family: var(--font-mono);
  font-size: var(--font-size-sm);
  background: var(--color-bg-secondary);
  padding: var(--space-3);
  border-radius: var(--radius-sm);
`;

const DebugInfo = styled.pre`
  background: var(--color-bg-secondary);
  padding: var(--space-4);
  border-radius: var(--radius-sm);
  font-family: var(--font-mono);
  font-size: var(--font-size-sm);
  white-space: pre-wrap;
  margin-top: var(--space-2);
  overflow-x: auto;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: var(--space-3);
  margin: var(--space-4) 0;
`;

interface TestResult {
  message: string;
  success: boolean;
  details?: string;
  timestamp: number;
}

const Test: React.FC = () => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [service, setService] = useState<ClyprService | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const { isAuthenticated, principal, loading, error } = useClypr();

  const addResult = (message: string, success: boolean = true, details?: string) => {
    setResults(prev => [...prev, {
      message,
      success,
      details,
      timestamp: Date.now()
    }]);
  };

  useEffect(() => {
    updateDebugInfo();
  }, [isAuthenticated, principal, loading, error]);

  const updateDebugInfo = () => {
    const info = {
      environment: {
        window: {
          location: window.location.href,
          hostname: window.location.hostname,
          port: window.location.port,
          canisterIds: (window as any).canisterIds,
        },
        build: {
          CLYPR_CANISTER_ID: process.env.CLYPR_CANISTER_ID,
          DFX_NETWORK: process.env.DFX_NETWORK,
          NODE_ENV: process.env.NODE_ENV,
        }
      },
      authentication: {
        isAuthenticated,
        principal: principal?.toText(),
        loading,
        error
      },
      service: {
        initialized: !!service,
        actor: service?.actor ? 'Initialized' : 'Not initialized'
      }
    };
    setDebugInfo(JSON.stringify(info, null, 2));
  };

  const clearResults = () => {
    setResults([]);
  };

  const runDirectServiceTest = async () => {
    setIsRunning(true);
    addResult('Starting direct service test...');

    try {
      // Test 1: Create service without authentication
      addResult('Creating service without authentication...');
      const testService = await ClyprService.create();
      setService(testService);
      addResult('Service created successfully');

      // Test 2: Test ping without authentication
      addResult('Testing ping without authentication...');
      const pingResult = await testService.ping();
      addResult(`Ping result: ${pingResult}`);

      // Test 3: Authenticate
      addResult('Testing authentication...');
      const authClient = await AuthClient.create();
      const isLoggedIn = await authClient.isAuthenticated();

      if (!isLoggedIn) {
        addResult('User not authenticated, attempting login...');
        await new Promise<void>((resolve) => {
          authClient.login({
            identityProvider: process.env.DFX_NETWORK === 'ic'
              ? 'https://identity.ic0.app'
              : `http://${(window as any).canisterIds.internet_identity}.localhost:4943`,
            onSuccess: async () => {
              const identity = authClient.getIdentity();
              const authenticatedService = await ClyprService.create(identity);
              await authenticatedService.authenticate(identity);
              setService(authenticatedService);
              addResult('Authentication successful');
              await runAuthenticatedTests(authenticatedService);
              resolve();
            },
            onError: (error) => {
              addResult(`Authentication failed: ${error}`, false);
              resolve();
            }
          });
        });
      } else {
        addResult('User already authenticated');
        const identity = authClient.getIdentity();
        const authenticatedService = await ClyprService.create(identity);
        await authenticatedService.authenticate(identity);
        setService(authenticatedService);
        await runAuthenticatedTests(authenticatedService);
      }
    } catch (error) {
      addResult(`Test failed: ${error}`, false);
    } finally {
      setIsRunning(false);
      updateDebugInfo();
    }
  };

  const runAuthenticatedTests = async (service: ClyprService) => {
    // Test 4: Authenticated ping
    addResult('Testing ping with authentication...');
    const pingResult = await service.ping();
    addResult(`Authenticated ping: ${pingResult}`);

    // Test 5: Rule creation
    addResult('Testing rule creation...');
    try {
      const ruleId = await service.createRule({
        name: 'Direct Service Test Rule',
        description: 'A test rule created by direct service test',
        conditions: [{
          field: 'content.title',
          operator: 'contains',
          value: 'test'
        }],
        actions: [{
          actionType: 'allow',
          parameters: []
        }],
        priority: 5
      });
      addResult(`Rule created with ID: ${ruleId}`);
    } catch (error) {
      addResult(`Rule creation failed: ${error}`, false);
    }

    // Test 6: Rule retrieval
    addResult('Testing rule retrieval...');
    try {
      const rules = await service.getAllRules();
      addResult(`Retrieved ${rules?.length || 0} rules`);
    } catch (error) {
      addResult(`Rule retrieval failed: ${error}`, false);
    }

    // Test 7: Message sending
    addResult('Testing message sending...');
    try {
      const receipt = await service.sendMessage('test', {
        title: 'Test Message',
        body: 'This is a test message',
        priority: 5,
        metadata: [['source', 'test']]
      });
      addResult(`Message sent with ID: ${receipt?.messageId}`);
    } catch (error) {
      addResult(`Message sending failed: ${error}`, false);
    }
  };

  const testActorCreation = async () => {
    addResult('Testing actor creation...');
    try {
      const { Actor } = await import('@dfinity/agent');
      const { idlFactory } = await import('../../../declarations/backend/backend.did.js');
      
      const canisterId = process.env.CLYPR_CANISTER_ID || (window as any).canisterIds?.backend;
      addResult(`Using canister ID: ${canisterId}`);
      
      if (!canisterId) {
        throw new Error('No canister ID found');
      }
      
      const { HttpAgent } = await import('@dfinity/agent');
      const agent = new HttpAgent({ host: 'http://localhost:4943' });
      
      if (process.env.DFX_NETWORK !== 'ic') {
        addResult('Local network detected, fetching root key...');
        await agent.fetchRootKey();
      }
      
      const actor = Actor.createActor(idlFactory, {
        agent,
        canisterId,
      });
      
      addResult('Actor created successfully');
      const pingResult = await actor.ping();
      addResult(`Actor ping result: ${pingResult}`);
    } catch (error) {
      addResult(`Actor creation failed: ${error}`, false);
    }
  };

  return (
    <TestContainer>
      <TestSection>
        <Text variant="h2">Clypr Test Dashboard</Text>
        <Text>Run various tests and view debug information</Text>

        <ButtonGroup>
          <Button
            onClick={runDirectServiceTest}
            disabled={isRunning}
            loading={isRunning}
          >
            Run Service Test
          </Button>
          <Button
            onClick={testActorCreation}
            disabled={isRunning}
          >
            Test Actor Creation
          </Button>
          <Button
            onClick={clearResults}
            variant="secondary"
          >
            Clear Results
          </Button>
        </ButtonGroup>

        <ResultsList>
          {results.map((result, index) => (
            <TestResult key={index} success={result.success}>
              [{new Date(result.timestamp).toLocaleTimeString()}] {result.message}
              {result.details && (
                <div style={{ marginTop: '4px', color: 'inherit' }}>
                  {result.details}
                </div>
              )}
            </TestResult>
          ))}
        </ResultsList>
      </TestSection>

      <TestSection>
        <Text variant="h3">Debug Information</Text>
        <DebugInfo>{debugInfo}</DebugInfo>
      </TestSection>
    </TestContainer>
  );
};

export default Test;
