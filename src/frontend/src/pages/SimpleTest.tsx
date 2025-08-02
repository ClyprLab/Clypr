import React, { useState } from 'react';
import styled from 'styled-components';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';
import Text from '../components/UI/Text';
import { useClypr } from '../hooks/useClypr';
import { createOperatorVariant } from '../services/ClyprService';

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

const SimpleTest: React.FC = () => {
  const { createRule, getAllRules, isAuthenticated, login } = useClypr();
  const [results, setResults] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addResult = (message: string, success: boolean = true) => {
    setResults(prev => [...prev, `${success ? '✅' : '❌'} ${message}`]);
  };

  const testRuleCreation = async () => {
    setIsRunning(true);
    setResults([]);

    try {
      if (!isAuthenticated) {
        addResult('Not authenticated, attempting login...');
        const loginSuccess = await login();
        if (!loginSuccess) {
          addResult('Login failed', false);
          return;
        }
        addResult('Login successful');
      }

      addResult('Testing rule creation with correct data format...');

      // Create a simple rule with correct format
      const testRule = {
        name: 'Simple Test Rule',
        description: 'A simple test rule',
        conditions: [
          {
            field: 'content.title',
            operator: createOperatorVariant('contains'),
            value: 'test'
          }
        ],
                  actions: [
            {
              actionType: { allow: null },
              channelId: null,
              parameters: []
            }
          ],
        priority: 5
      };

      console.log('Creating rule with data:', testRule);

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
        addResult('Rule creation returned undefined', false);
      }

      // Test rule retrieval
      addResult('Testing rule retrieval...');
      const rules = await getAllRules();
      if (rules && rules.length > 0) {
        addResult(`Retrieved ${rules.length} rules successfully`);
        console.log('Retrieved rules:', rules);
      } else {
        addResult('No rules found or retrieval failed', false);
      }

    } catch (error) {
      console.error('Test failed:', error);
      addResult(`Test failed: ${error}`, false);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <TestContainer>
      <Card>
        <Text as="h1" size="2xl" style={{ marginBottom: 'var(--space-6)' }}>
          Simple Rule Creation Test
        </Text>

        <div style={{ marginBottom: 'var(--space-4)' }}>
          <Text size="sm" color="secondary">
            Authentication: {isAuthenticated ? '✅ Authenticated' : '❌ Not authenticated'}
          </Text>
        </div>

        <Button 
          onClick={testRuleCreation} 
          disabled={isRunning}
          style={{ marginBottom: 'var(--space-4)' }}
        >
          {isRunning ? 'Running Test...' : 'Test Rule Creation'}
        </Button>

        <div>
          <Text as="h2" size="lg" style={{ marginBottom: 'var(--space-4)' }}>
            Test Results
          </Text>
          
          {results.length === 0 ? (
            <Text size="sm" color="secondary">
              No tests run yet. Click "Test Rule Creation" to start.
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

export default SimpleTest; 