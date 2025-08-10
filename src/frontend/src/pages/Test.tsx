import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';
import Text from '../components/UI/Text';
import Input from '../components/UI/Input';
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
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
`;

const TestResult = styled.div<{ success?: boolean }>`
  padding: var(--space-3);
  border-radius: var(--radius-sm);
  background-color: ${props => props.success ? 'var(--color-success-light)' : 'var(--color-error-light)'};
  color: ${props => props.success ? 'var(--color-success-dark)' : 'var(--color-error-dark)'};
  margin-top: var(--space-2);
  font-family: var(--font-mono);
  font-size: var(--font-size-sm);
  white-space: pre-wrap;
  word-break: break-all;
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
  flex-wrap: wrap;
`;

interface TestResultData {
  message: string;
  success: boolean;
  details?: string;
  timestamp: number;
}

const Test: React.FC = () => {
  const [results, setResults] = useState<TestResultData[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const { service, isAuthenticated, principal, loading, error } = useClypr();

  const [username, setUsername] = useState<string>('test-user');
  const [dappPrincipal, setDappPrincipal] = useState<string>('');

  const addResult = (message: string, success: boolean = true, details?: any) => {
    const detailString = details ? (typeof details === 'string' ? details : JSON.stringify(details, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value, 2)) : undefined;

    setResults(prev => [...prev, {
      message,
      success,
      details: detailString,
      timestamp: Date.now()
    }]);
  };

  const updateDebugInfo = () => {
    const info = {
      environment: {
        CLYPR_CANISTER_ID: process.env.CLYPR_CANISTER_ID,
        DFX_NETWORK: process.env.DFX_NETWORK,
      },
      authentication: {
        isAuthenticated,
        principal: principal?.toText(),
        loading,
        error: error?.message,
      },
      service: {
        initialized: !!service,
        actor: service?.actor ? 'Initialized' : 'Not initialized'
      }
    };
    setDebugInfo(JSON.stringify(info, null, 2));
  };

  useEffect(() => {
    if (principal && !dappPrincipal) {
      setDappPrincipal(principal.toText());
    }
    updateDebugInfo();
  }, [isAuthenticated, principal, loading, error, service]);

  const clearResults = () => setResults([]);

  const testRegisterUsername = async () => {
    if (!service) return addResult('Service not ready', false);
    setIsRunning(true);
    addResult(`Registering username: "${username}"...`);
    try {
      const result = await service.registerUsername(username);
      if ('ok' in result) {
        addResult(`Username "${username}" registered successfully.`, true);
      } else {
        const errorKey = Object.keys(result.err)[0];
        const errorDetails = (result.err as any)[errorKey]?.[0] || '';
        addResult(`Failed to register username: ${errorKey}`, false, errorDetails);
      }
    } catch (e: any) {
      addResult(`Error registering username: ${e.message}`, false, e.stack);
    }
    setIsRunning(false);
  };

  const testCreateDappRule = async () => {
    if (!service) return addResult('Service not ready', false);
    if (!dappPrincipal) return addResult('DApp Principal cannot be empty', false);
    setIsRunning(true);
    addResult(`Creating rule for dApp principal: ${dappPrincipal}...`);
    try {
      const result = await service.createRule({
        name: `Test Rule for ${dappPrincipal.substring(0, 10)}...`,
        dappPrincipal: dappPrincipal,
        description: 'Allow messages from this specific dApp',
        conditions: [],
        actions: [{ actionType: { allow: null }, parameters: [] }],
        priority: 1,
      });
      if ('ok' in result) {
        addResult(`Rule created with ID: ${result.ok}`, true);
      } else {
        const errorKey = Object.keys(result.err)[0];
        addResult(`Failed to create rule: ${errorKey}`, false);
      }
    } catch (e: any) {
      addResult(`Error creating rule: ${e.message}`, false, e.stack);
    }
    setIsRunning(false);
  };

  const testProcessMessage = async () => {
    if (!service) return addResult('Service not ready', false);
    if (!username) return addResult('Username cannot be empty', false);
    setIsRunning(true);
    addResult(`Simulating dApp sending message to user "${username}"...`);
    addResult(`(Note: The sender principal is your own: ${principal?.toText()})`);
    try {
      const result = await service.processMessage(username, 'dapp_test', {
        title: 'Hello from Simulated dApp',
        body: 'This message is sent via the processMessage endpoint.',
        priority: 1,
        metadata: [['client', 'clypr-test-page']],
      });

      if ('ok' in result) {
        addResult('processMessage call successful!', true, result.ok);
      } else {
        const errorKey = Object.keys(result.err)[0];
        const errorDetails = (result.err as any)[errorKey]?.[0] || '';
        addResult(`processMessage call failed: ${errorKey}`, false, errorDetails);
      }
    } catch (e: any) {
      addResult(`Error in processMessage call: ${e.message}`, false, e.stack);
    }
    setIsRunning(false);
  };

  const testGetAllRules = async () => {
    if (!service) return addResult('Service not ready', false);
    setIsRunning(true);
    addResult('Fetching all rules...');
    try {
      const result = await service.getAllRules();
      if ('ok' in result) {
        addResult(`Found ${result.ok.length} rules.`, true, result.ok);
      } else {
        addResult('Failed to fetch rules.', false);
      }
    } catch (e: any) {
      addResult(`Error fetching rules: ${e.message}`, false, e.stack);
    }
    setIsRunning(false);
  };

  return (
    <TestContainer>
      <TestSection>
        <Text variant="h2">Clypr Test Dashboard</Text>
        <Text>Use these tests to verify backend functionality end-to-end.</Text>
      </TestSection>

      <TestSection>
        <Text variant="h3">1. User Alias System</Text>
        <Input
          label="Username to Register"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="e.g., your-name"
        />
        <Button onClick={testRegisterUsername} disabled={isRunning || !isAuthenticated} loading={isRunning}>
          Test Register Username
        </Button>
      </TestSection>

      <TestSection>
        <Text variant="h3">2. dApp-Specific Rules</Text>
        <Input
          label="dApp Principal for Rule (defaults to your principal)"
          value={dappPrincipal}
          onChange={(e) => setDappPrincipal(e.target.value)}
          placeholder="Enter a principal ID"
        />
        <ButtonGroup>
          <Button onClick={testCreateDappRule} disabled={isRunning || !isAuthenticated} loading={isRunning}>
            Test Create dApp Rule
          </Button>
          <Button onClick={testGetAllRules} disabled={isRunning || !isAuthenticated} variant="secondary" loading={isRunning}>
            View All Rules
          </Button>
        </ButtonGroup>
      </TestSection>

      <TestSection>
        <Text variant="h3">3. Smart Endpoint</Text>
        <Input
          label="Send Message to Username"
          value={username}
          readOnly
          // onChange={(e) => setUsername(e.target.value)}
          placeholder="The user to receive the message"
        />
        <Button onClick={testProcessMessage} disabled={isRunning || !isAuthenticated} loading={isRunning}>
          Test Process Message
        </Button>
      </TestSection>

      <TestSection>
        <Text variant="h2">Test Results</Text>
        <Button onClick={clearResults} variant="secondary">Clear Results</Button>
        <ResultsList>
          {results.map((result, index) => (
            <TestResult key={index} success={result.success}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{result.message}</span>
                <span style={{ opacity: 0.7 }}>{new Date(result.timestamp).toLocaleTimeString()}</span>
              </div>
              {result.details && (
                <DebugInfo style={{ marginTop: '8px' }}>
                  {result.details}
                </DebugInfo>
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
