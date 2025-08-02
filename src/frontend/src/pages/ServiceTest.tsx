import React, { useState } from 'react';
import styled from 'styled-components';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';
import Text from '../components/UI/Text';
import { AuthClient } from '@dfinity/auth-client';
import { ClyprService, createOperatorVariant } from '../services/ClyprService';

const TestContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: var(--space-6);
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

const ServiceTest: React.FC = () => {
  const [results, setResults] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [service, setService] = useState<ClyprService | null>(null);

  const addResult = (message: string, success: boolean = true) => {
    setResults(prev => [...prev, `${success ? '✅' : '❌'} ${message}`]);
  };

  const testService = async () => {
    setIsRunning(true);
    setResults([]);

    try {
      addResult('Starting direct service test...');

      // Test 1: Create service without authentication
      addResult('Creating service without authentication...');
      try {
        const testService = await ClyprService.create();
        setService(testService);
        addResult('Service created successfully');
      } catch (error) {
        addResult(`Service creation failed: ${error}`, false);
        return;
      }

      // Test 2: Test ping without authentication
      addResult('Testing ping without authentication...');
      try {
        const pingResult = await service?.ping();
        addResult(`Ping result: ${pingResult}`);
      } catch (error) {
        addResult(`Ping failed: ${error}`, false);
      }

      // Test 3: Authenticate
      addResult('Testing authentication...');
      try {
        const authClient = await AuthClient.create();
        const isLoggedIn = await authClient.isAuthenticated();
        
        if (!isLoggedIn) {
          addResult('User not authenticated, attempting login...');
          
          return new Promise<void>((resolve) => {
            authClient.login({
              identityProvider: process.env.DFX_NETWORK === 'ic' 
                ? 'https://identity.ic0.app' 
                : `http://uzt4z-lp777-77774-qaabq-cai.localhost:4943`,
              onSuccess: async () => {
                const identity = authClient.getIdentity();
                const authenticatedService = await ClyprService.create(identity);
                await authenticatedService.authenticate(identity);
                setService(authenticatedService);
                addResult('Authentication successful');
                
                // Continue with authenticated tests
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
          
          // Continue with authenticated tests
          await runAuthenticatedTests(authenticatedService);
        }
      } catch (error) {
        addResult(`Authentication error: ${error}`, false);
      }

    } catch (error) {
      console.error('Test failed:', error);
      addResult(`Test failed: ${error}`, false);
    } finally {
      setIsRunning(false);
    }
  };

  const runAuthenticatedTests = async (authService: ClyprService) => {
    // Test 4: Ping with authentication
    addResult('Testing ping with authentication...');
    try {
      const pingResult = await authService.ping();
      addResult(`Authenticated ping: ${pingResult}`);
    } catch (error) {
      addResult(`Authenticated ping failed: ${error}`, false);
    }

    // Test 5: Create rule
    addResult('Testing rule creation...');
    try {
      const testRule = {
        name: 'Direct Service Test Rule',
        description: 'A test rule created by direct service test',
        conditions: [
          {
            field: 'content.title',
            operator: 'contains' as const,
            value: 'test'
          }
        ],
        actions: [
          {
            actionType: 'allow' as const,
            channelId: undefined,
            parameters: []
          }
        ],
        priority: 5
      };

      console.log('Creating rule with data:', testRule);
      const ruleId = await authService.createRule({
        name: testRule.name,
        description: testRule.description,
        conditions: testRule.conditions,
        actions: testRule.actions,
        priority: testRule.priority
      });

      if (ruleId !== undefined) {
        addResult(`Rule created successfully with ID: ${ruleId}`);
      } else {
        addResult('Rule creation returned undefined', false);
      }
    } catch (error) {
      addResult(`Rule creation failed: ${error}`, false);
    }

    // Test 6: Get rules
    addResult('Testing rule retrieval...');
    try {
      const rules = await authService.getAllRules();
      if (rules && rules.length > 0) {
        addResult(`Retrieved ${rules.length} rules successfully`);
        console.log('Retrieved rules:', rules);
      } else {
        addResult('No rules found or retrieval failed', false);
      }
    } catch (error) {
      addResult(`Rule retrieval failed: ${error}`, false);
    }
  };

  return (
    <TestContainer>
      <Card>
        <Text as="h1" size="2xl" style={{ marginBottom: 'var(--space-6)' }}>
          Direct Service Test
        </Text>

        <div style={{ marginBottom: 'var(--space-4)' }}>
          <Text size="sm" color="secondary">
            Service: {service ? '✅ Created' : '❌ Not created'}
          </Text>
        </div>

        <Button 
          onClick={testService} 
          disabled={isRunning}
          style={{ marginBottom: 'var(--space-4)' }}
        >
          {isRunning ? 'Running Test...' : 'Test Direct Service'}
        </Button>

        <div>
          <Text as="h2" size="lg" style={{ marginBottom: 'var(--space-4)' }}>
            Test Results
          </Text>
          
          {results.length === 0 ? (
            <Text size="sm" color="secondary">
              No tests run yet. Click "Test Direct Service" to start.
            </Text>
          ) : (
            <div>
              {results.map((result, index) => (
                <TestResult key={index} success={result.startsWith('✅')}>
                  {result}
                </TestResult>
              ))}
            </div>
          )}
        </div>
      </Card>
    </TestContainer>
  );
};

export default ServiceTest; 