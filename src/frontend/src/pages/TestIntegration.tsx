import React, { useState } from 'react';
import styled from 'styled-components';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';
import Text from '../components/UI/Text';
import { useClypr } from '../hooks/useClypr';
import { createOperatorVariant } from '../services/ClyprService';

const TestContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: var(--space-6);
`;

const TestSection = styled.div`
  margin-bottom: var(--space-6);
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

const TestIntegration: React.FC = () => {
  const { 
    isAuthenticated, 
    login, 
    ping, 
    createRule, 
    getAllRules, 
    sendMessage,
    loading,
    error,
    service
  } = useClypr();
  
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addResult = (message: string, success: boolean = true) => {
    setTestResults(prev => [...prev, `${success ? '✅' : '❌'} ${message}`]);
  };

  const runTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    try {
      // Test 1: Authentication
      addResult('Starting integration tests...');
      
      if (!isAuthenticated) {
        addResult('User not authenticated, attempting login...');
        const loginSuccess = await login();
        if (!loginSuccess) {
          addResult('Login failed', false);
          return;
        }
        addResult('Login successful');
      } else {
        addResult('User already authenticated');
      }
      
      // Wait a moment for authentication to settle
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Debug: Check service and authentication state
      addResult(`Debug: Service exists: ${!!service}, Authenticated: ${isAuthenticated}`);

      // Test 2: Direct service test
      if (service) {
        addResult('Testing direct service call...');
        try {
          const directPing = await service.ping();
          addResult(`Direct service ping: ${directPing}`);
        } catch (err) {
          addResult(`Direct service ping failed: ${err}`, false);
        }
      } else {
        addResult('Service not available', false);
      }

      // Test 3: Ping backend
      addResult('Testing backend connectivity...');
      try {
        const pingResult = await ping();
        addResult(`Backend ping successful: ${pingResult}`);
      } catch (err) {
        addResult(`Backend ping failed: ${err}`, false);
        return;
      }

      // Test 4: Create a test rule
      addResult('Testing rule creation...');
      try {
        const testRule = {
          name: 'Test Integration Rule',
          description: 'A test rule created by integration test',
          conditions: [
            {
              field: 'content.title',
              operator: createOperatorVariant('contains'),
              value: 'test'
            }
          ],
          actions: [
            {
              actionType: { allow: null }, // Use variant format
              channelId: null, // Use null for no channel
              parameters: []
            }
          ],
          priority: 5
        };

        const ruleId = await createRule(
          testRule.name,
          testRule.description,
          testRule.conditions,
          testRule.actions,
          testRule.priority
        );

        if (ruleId !== undefined) {
          addResult(`Rule created successfully with ID: ${ruleId}`);
        } else {
          addResult('Rule creation failed', false);
        }
      } catch (err) {
        addResult(`Rule creation failed: ${err}`, false);
      }

      // Test 5: Get all rules
      addResult('Testing rule retrieval...');
      try {
        const rules = await getAllRules();
        if (rules && rules.length > 0) {
          addResult(`Retrieved ${rules.length} rules successfully`);
        } else {
          addResult('No rules found (this might be expected)');
        }
      } catch (err) {
        addResult(`Rule retrieval failed: ${err}`, false);
      }

      // Test 6: Send a test message
      addResult('Testing message sending...');
      try {
        const receipt = await sendMessage(
          'test',
          'Test Message',
          'This is a test message for integration testing',
          5,
          [['source', 'integration-test']]
        );

        if (receipt) {
          addResult(`Message sent successfully: ${receipt.messageId}`);
        } else {
          addResult('Message sending failed', false);
        }
      } catch (err) {
        addResult(`Message sending failed: ${err}`, false);
      }

      addResult('All integration tests completed!');

    } catch (err) {
      addResult(`Test suite failed: ${err}`, false);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <TestContainer>
      <Card>
        <Text as="h1" size="2xl" style={{ marginBottom: 'var(--space-6)' }}>
          Clypr Integration Test
        </Text>

        <TestSection>
          <Text as="h2" size="lg" style={{ marginBottom: 'var(--space-4)' }}>
            Test Status
          </Text>
          
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <Text size="sm" color="secondary">
              Authentication: {isAuthenticated ? '✅ Authenticated' : '❌ Not authenticated'}
            </Text>
            {error && (
              <Text size="sm" color="error" style={{ marginTop: 'var(--space-2)' }}>
                Error: {error}
              </Text>
            )}
          </div>

          <Button 
            onClick={runTests} 
            disabled={isRunning || loading}
            style={{ marginBottom: 'var(--space-4)' }}
          >
            {isRunning ? 'Running Tests...' : 'Run Integration Tests'}
          </Button>
        </TestSection>

        <TestSection>
          <Text as="h2" size="lg" style={{ marginBottom: 'var(--space-4)' }}>
            Test Results
          </Text>
          
          {testResults.length === 0 ? (
            <Text size="sm" color="secondary">
              No tests run yet. Click "Run Integration Tests" to start.
            </Text>
          ) : (
            <div>
              {testResults.map((result, index) => (
                <TestResult key={index} success={result.startsWith('✅')}>
                  {result}
                </TestResult>
              ))}
            </div>
          )}
        </TestSection>

        <TestSection>
          <Text as="h2" size="lg" style={{ marginBottom: 'var(--space-4)' }}>
            What This Tests
          </Text>
          
          <ul style={{ paddingLeft: 'var(--space-4)' }}>
            <li>Authentication with Internet Identity</li>
            <li>Backend connectivity (ping)</li>
            <li>Rule creation and retrieval</li>
            <li>Message sending and processing</li>
            <li>Error handling and state management</li>
          </ul>
        </TestSection>
      </Card>
    </TestContainer>
  );
};

export default TestIntegration; 