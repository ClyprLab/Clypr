# Technical Implementation Plan for Demo

This document outlines the specific technical implementations needed to create a minimal but impressive demo of the Clypr project for the hackathon submission.

## 1. Frontend Demo Components

### Rule Creation Interface

```tsx
// src/frontend/src/components/RuleEditor/RuleEditor.tsx
import React, { useState } from 'react';
import styled from 'styled-components';
import { Button, Card, Input, Text } from '@/components/UI';

interface Rule {
  id: string;
  name: string;
  conditions: Condition[];
  actions: Action[];
  active: boolean;
}

interface Condition {
  type: 'sender' | 'content' | 'time' | 'priority';
  operator: 'equals' | 'contains' | 'starts_with' | 'ends_with' | 'greater_than' | 'less_than';
  value: string;
}

interface Action {
  type: 'deliver' | 'discard' | 'forward';
  destination?: string;
  priority?: string;
}

const RuleEditor: React.FC = () => {
  const [rule, setRule] = useState<Rule>({
    id: crypto.randomUUID(),
    name: '',
    conditions: [{ type: 'sender', operator: 'equals', value: '' }],
    actions: [{ type: 'deliver', destination: 'email' }],
    active: true
  });

  const addCondition = () => {
    setRule(prev => ({
      ...prev,
      conditions: [...prev.conditions, { type: 'content', operator: 'contains', value: '' }]
    }));
  };

  const addAction = () => {
    setRule(prev => ({
      ...prev,
      actions: [...prev.actions, { type: 'forward', destination: 'sms' }]
    }));
  };

  const updateCondition = (index: number, field: keyof Condition, value: string) => {
    setRule(prev => {
      const newConditions = [...prev.conditions];
      newConditions[index] = { ...newConditions[index], [field]: value };
      return { ...prev, conditions: newConditions };
    });
  };

  const updateAction = (index: number, field: keyof Action, value: string) => {
    setRule(prev => {
      const newActions = [...prev.actions];
      newActions[index] = { ...newActions[index], [field]: value };
      return { ...prev, actions: newActions };
    });
  };

  const saveRule = () => {
    // Save to localStorage for demo
    const existingRules = JSON.parse(localStorage.getItem('clypr_rules') || '[]');
    localStorage.setItem('clypr_rules', JSON.stringify([...existingRules, rule]));
    alert('Rule saved successfully!');
    // Reset form or navigate away
  };

  return (
    <EditorContainer>
      <Text variant="h2">Create Privacy Rule</Text>
      
      <FormSection>
        <Text variant="h3">Basic Information</Text>
        <Input 
          label="Rule Name" 
          value={rule.name} 
          onChange={e => setRule(prev => ({ ...prev, name: e.target.value }))} 
          placeholder="E.g., Filter Promotional Messages"
        />
      </FormSection>

      <FormSection>
        <Text variant="h3">Conditions</Text>
        <Text>When a message meets these conditions:</Text>
        
        {rule.conditions.map((condition, index) => (
          <ConditionRow key={index}>
            <Select 
              value={condition.type} 
              onChange={e => updateCondition(index, 'type', e.target.value)}
            >
              <option value="sender">Sender</option>
              <option value="content">Content</option>
              <option value="time">Time</option>
              <option value="priority">Priority</option>
            </Select>
            
            <Select 
              value={condition.operator} 
              onChange={e => updateCondition(index, 'operator', e.target.value)}
            >
              <option value="equals">equals</option>
              <option value="contains">contains</option>
              <option value="starts_with">starts with</option>
              <option value="ends_with">ends with</option>
            </Select>
            
            <Input 
              value={condition.value} 
              onChange={e => updateCondition(index, 'value', e.target.value)} 
              placeholder="Value"
            />
          </ConditionRow>
        ))}
        
        <Button onClick={addCondition}>+ Add Condition</Button>
      </FormSection>

      <FormSection>
        <Text variant="h3">Actions</Text>
        <Text>Perform these actions:</Text>
        
        {rule.actions.map((action, index) => (
          <ActionRow key={index}>
            <Select 
              value={action.type} 
              onChange={e => updateAction(index, 'type', e.target.value)}
            >
              <option value="deliver">Deliver to</option>
              <option value="discard">Discard</option>
              <option value="forward">Forward to</option>
            </Select>
            
            {action.type !== 'discard' && (
              <Select 
                value={action.destination} 
                onChange={e => updateAction(index, 'destination', e.target.value)}
              >
                <option value="email">Email</option>
                <option value="sms">SMS</option>
                <option value="push">Push Notification</option>
              </Select>
            )}
          </ActionRow>
        ))}
        
        <Button onClick={addAction}>+ Add Action</Button>
      </FormSection>

      <ButtonRow>
        <Button>Cancel</Button>
        <Button onClick={saveRule}>Save Rule</Button>
      </ButtonRow>
    </EditorContainer>
  );
};

const EditorContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const FormSection = styled.div`
  margin: 24px 0;
`;

const ConditionRow = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
`;

const ActionRow = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
`;

const Select = styled.select`
  padding: 8px 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background-color: var(--color-background);
  font-family: var(--font-sans);
  font-size: var(--font-size-md);
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 32px;
`;

export default RuleEditor;
```

### Message List Component

```tsx
// src/frontend/src/components/MessageList/MessageList.tsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Text, Card, Button } from '@/components/UI';

interface Message {
  id: string;
  sender: string;
  subject: string;
  content: string;
  timestamp: number;
  status: 'delivered' | 'blocked' | 'pending';
  channel?: string;
}

const MessageList: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [filter, setFilter] = useState('all');

  // Load sample messages for demo
  useEffect(() => {
    // In a real app, this would come from the backend
    const sampleMessages: Message[] = [
      {
        id: '1',
        sender: 'app.example',
        subject: 'Welcome to Example App',
        content: 'Thank you for signing up! We hope you enjoy our service.',
        timestamp: Date.now() - 3600000,
        status: 'delivered',
        channel: 'email'
      },
      {
        id: '2',
        sender: 'marketing.example',
        subject: 'Special Offer Inside!',
        content: 'Limited time offer: 50% off our premium services!',
        timestamp: Date.now() - 7200000,
        status: 'blocked'
      },
      {
        id: '3',
        sender: 'support.example',
        subject: 'Your support ticket has been resolved',
        content: 'We have resolved your recent support request.',
        timestamp: Date.now() - 86400000,
        status: 'delivered',
        channel: 'sms'
      }
    ];
    
    setMessages(sampleMessages);
  }, []);

  // Apply rules to incoming message (for demo)
  const processMessage = () => {
    const rules = JSON.parse(localStorage.getItem('clypr_rules') || '[]');
    const newMessage: Message = {
      id: crypto.randomUUID(),
      sender: 'notifications.dapp',
      subject: 'New notification from DApp',
      content: 'Your transaction has been processed successfully.',
      timestamp: Date.now(),
      status: 'pending'
    };
    
    // Apply first matching rule
    let processed = { ...newMessage };
    
    for (const rule of rules) {
      // Check if conditions match
      const matches = rule.conditions.every(condition => {
        if (condition.type === 'sender' && condition.operator === 'equals') {
          return newMessage.sender === condition.value;
        }
        if (condition.type === 'content' && condition.operator === 'contains') {
          return newMessage.content.includes(condition.value);
        }
        return false;
      });
      
      // Apply actions if conditions match
      if (matches) {
        const action = rule.actions[0]; // Just use first action for demo
        if (action.type === 'deliver') {
          processed.status = 'delivered';
          processed.channel = action.destination;
        } else if (action.type === 'discard') {
          processed.status = 'blocked';
        }
        break;
      }
    }
    
    // If no rule matched, default to delivered
    if (processed.status === 'pending') {
      processed.status = 'delivered';
      processed.channel = 'email';
    }
    
    setMessages([processed, ...messages]);
  };

  const filteredMessages = messages.filter(message => {
    if (filter === 'all') return true;
    if (filter === 'delivered') return message.status === 'delivered';
    if (filter === 'blocked') return message.status === 'blocked';
    return true;
  });

  return (
    <Container>
      <Header>
        <Text variant="h2">Message History</Text>
        <Button onClick={processMessage}>Simulate New Message</Button>
      </Header>
      
      <FilterBar>
        <FilterButton 
          active={filter === 'all'} 
          onClick={() => setFilter('all')}
        >
          All
        </FilterButton>
        <FilterButton 
          active={filter === 'delivered'} 
          onClick={() => setFilter('delivered')}
        >
          Delivered
        </FilterButton>
        <FilterButton 
          active={filter === 'blocked'} 
          onClick={() => setFilter('blocked')}
        >
          Blocked
        </FilterButton>
      </FilterBar>
      
      <MessageGrid>
        {filteredMessages.map(message => (
          <MessageCard key={message.id}>
            <MessageHeader>
              <Text variant="h4">{message.subject}</Text>
              <StatusBadge status={message.status}>
                {message.status}
              </StatusBadge>
            </MessageHeader>
            
            <MessageMeta>
              <Text>From: {message.sender}</Text>
              <Text>{new Date(message.timestamp).toLocaleString()}</Text>
            </MessageMeta>
            
            <MessageContent>
              {message.content}
            </MessageContent>
            
            {message.channel && (
              <ChannelInfo>
                <Text>Delivered to: {message.channel}</Text>
              </ChannelInfo>
            )}
          </MessageCard>
        ))}
      </MessageGrid>
    </Container>
  );
};

const Container = styled.div`
  padding: var(--space-4);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-4);
`;

const FilterBar = styled.div`
  display: flex;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
`;

const FilterButton = styled.button<{ active: boolean }>`
  padding: var(--space-2) var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background-color: ${props => props.active ? 'var(--color-text)' : 'var(--color-background)'};
  color: ${props => props.active ? 'var(--color-background)' : 'var(--color-text)'};
  cursor: pointer;
`;

const MessageGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-4);
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const MessageCard = styled(Card)`
  padding: var(--space-4);
`;

const MessageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-2);
`;

const StatusBadge = styled.span<{ status: string }>`
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  text-transform: uppercase;
  font-weight: 600;
  background-color: ${props => {
    switch (props.status) {
      case 'delivered': return '#4CAF50';
      case 'blocked': return '#F44336';
      default: return '#FFC107';
    }
  }};
  color: white;
`;

const MessageMeta = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--space-3);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
`;

const MessageContent = styled.div`
  margin-bottom: var(--space-3);
  padding: var(--space-3);
  background-color: var(--color-hover);
  border-radius: var(--radius-sm);
`;

const ChannelInfo = styled.div`
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
`;

export default MessageList;
```

## 2. Mock Backend Service

```tsx
// src/frontend/src/services/api.ts
import { delay } from '@/utils/helpers';

// Types
export interface Rule {
  id: string;
  name: string;
  conditions: Condition[];
  actions: Action[];
  active: boolean;
}

export interface Condition {
  type: 'sender' | 'content' | 'time' | 'priority';
  operator: 'equals' | 'contains' | 'starts_with' | 'ends_with' | 'greater_than' | 'less_than';
  value: string;
}

export interface Action {
  type: 'deliver' | 'discard' | 'forward';
  destination?: string;
  priority?: string;
}

export interface Message {
  id: string;
  sender: string;
  subject: string;
  content: string;
  timestamp: number;
  status: 'delivered' | 'blocked' | 'pending';
  channel?: string;
}

// Mock API service
export const api = {
  // Rules
  async getRules(): Promise<Rule[]> {
    await delay(500); // Simulate network delay
    return JSON.parse(localStorage.getItem('clypr_rules') || '[]');
  },
  
  async createRule(rule: Omit<Rule, 'id'>): Promise<Rule> {
    await delay(800);
    const newRule = {
      ...rule,
      id: crypto.randomUUID()
    };
    
    const existingRules = await this.getRules();
    localStorage.setItem('clypr_rules', JSON.stringify([...existingRules, newRule]));
    
    return newRule;
  },
  
  async updateRule(rule: Rule): Promise<Rule> {
    await delay(800);
    const existingRules = await this.getRules();
    const updatedRules = existingRules.map(r => r.id === rule.id ? rule : r);
    localStorage.setItem('clypr_rules', JSON.stringify(updatedRules));
    
    return rule;
  },
  
  async deleteRule(id: string): Promise<void> {
    await delay(500);
    const existingRules = await this.getRules();
    const updatedRules = existingRules.filter(r => r.id !== id);
    localStorage.setItem('clypr_rules', JSON.stringify(updatedRules));
  },
  
  // Messages
  async getMessages(): Promise<Message[]> {
    await delay(500);
    return JSON.parse(localStorage.getItem('clypr_messages') || '[]');
  },
  
  async processMessage(message: Omit<Message, 'id' | 'status' | 'timestamp'>): Promise<Message> {
    await delay(1000);
    
    const newMessage = {
      ...message,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      status: 'pending' as const
    };
    
    // Apply rules logic
    const rules = await this.getRules();
    let processedMessage = { ...newMessage };
    
    for (const rule of rules) {
      if (!rule.active) continue;
      
      // Check if conditions match
      const matches = rule.conditions.every(condition => {
        switch(condition.type) {
          case 'sender':
            return evaluateCondition(message.sender, condition.operator, condition.value);
          case 'content':
            return evaluateCondition(message.content, condition.operator, condition.value);
          default:
            return false;
        }
      });
      
      // Apply actions if conditions match
      if (matches) {
        const action = rule.actions[0]; // Just use first action for simplicity
        switch(action.type) {
          case 'deliver':
            processedMessage.status = 'delivered';
            processedMessage.channel = action.destination;
            break;
          case 'discard':
            processedMessage.status = 'blocked';
            break;
          case 'forward':
            processedMessage.status = 'delivered';
            processedMessage.channel = action.destination;
            break;
        }
        break; // Stop after first matching rule
      }
    }
    
    // If no rule matched, default to delivered via email
    if (processedMessage.status === 'pending') {
      processedMessage.status = 'delivered';
      processedMessage.channel = 'email';
    }
    
    // Store message
    const existingMessages = await this.getMessages();
    localStorage.setItem('clypr_messages', JSON.stringify([processedMessage, ...existingMessages]));
    
    return processedMessage;
  }
};

// Helper functions
function evaluateCondition(value: string, operator: string, targetValue: string): boolean {
  switch(operator) {
    case 'equals':
      return value === targetValue;
    case 'contains':
      return value.includes(targetValue);
    case 'starts_with':
      return value.startsWith(targetValue);
    case 'ends_with':
      return value.endsWith(targetValue);
    default:
      return false;
  }
}
```

## 3. Helper Functions & Context

```tsx
// src/frontend/src/utils/helpers.ts
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// src/frontend/src/context/RuleContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, Rule } from '@/services/api';

interface RuleContextType {
  rules: Rule[];
  loading: boolean;
  error: string | null;
  createRule: (rule: Omit<Rule, 'id'>) => Promise<void>;
  updateRule: (rule: Rule) => Promise<void>;
  deleteRule: (id: string) => Promise<void>;
  refreshRules: () => Promise<void>;
}

const RuleContext = createContext<RuleContextType | undefined>(undefined);

export const RuleProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const refreshRules = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedRules = await api.getRules();
      setRules(fetchedRules);
    } catch (err) {
      setError('Failed to fetch rules');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    refreshRules();
  }, []);
  
  const createRule = async (rule: Omit<Rule, 'id'>) => {
    try {
      setLoading(true);
      await api.createRule(rule);
      await refreshRules();
    } catch (err) {
      setError('Failed to create rule');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const updateRule = async (rule: Rule) => {
    try {
      setLoading(true);
      await api.updateRule(rule);
      await refreshRules();
    } catch (err) {
      setError('Failed to update rule');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const deleteRule = async (id: string) => {
    try {
      setLoading(true);
      await api.deleteRule(id);
      await refreshRules();
    } catch (err) {
      setError('Failed to delete rule');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <RuleContext.Provider value={{
      rules,
      loading,
      error,
      createRule,
      updateRule,
      deleteRule,
      refreshRules
    }}>
      {children}
    </RuleContext.Provider>
  );
};

export const useRules = () => {
  const context = useContext(RuleContext);
  if (context === undefined) {
    throw new Error('useRules must be used within a RuleProvider');
  }
  return context;
};
```

## 4. Updated App.tsx Integration

```tsx
// src/frontend/src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { RuleProvider } from '@/context/RuleContext';
import Dashboard from '@/pages/Dashboard';
import Rules from '@/pages/Rules';
import Messages from '@/pages/Messages';
import Channels from '@/pages/Channels';
import Settings from '@/pages/Settings';
import Landing from '@/pages/Landing';
import Login from '@/pages/Login';
import NotFound from '@/pages/NotFound';
import GlobalStyle from '@/utils/GlobalStyle';

const App: React.FC = () => {
  return (
    <>
      <GlobalStyle />
      <RuleProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="rules" element={<Rules />} />
              <Route path="messages" element={<Messages />} />
              <Route path="channels" element={<Channels />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            <Route path="/landing" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </RuleProvider>
    </>
  );
};

export default App;
```

## 5. Rules Page Update

```tsx
// src/frontend/src/pages/Rules.tsx
import React from 'react';
import styled from 'styled-components';
import { Button, Text } from '@/components/UI';
import RuleEditor from '@/components/RuleEditor/RuleEditor';
import { useRules } from '@/context/RuleContext';

const Rules: React.FC = () => {
  const { rules, loading, deleteRule } = useRules();
  const [showEditor, setShowEditor] = React.useState(false);
  
  return (
    <Container>
      <Header>
        <Text variant="h1">Privacy Rules</Text>
        <Button onClick={() => setShowEditor(true)}>Create New Rule</Button>
      </Header>
      
      {showEditor ? (
        <RuleEditor />
      ) : (
        <>
          {loading ? (
            <Text>Loading rules...</Text>
          ) : rules.length === 0 ? (
            <EmptyState>
              <Text>You haven't created any privacy rules yet.</Text>
              <Button onClick={() => setShowEditor(true)}>Create Your First Rule</Button>
            </EmptyState>
          ) : (
            <RuleGrid>
              {rules.map(rule => (
                <RuleCard key={rule.id}>
                  <RuleHeader>
                    <Text variant="h3">{rule.name}</Text>
                    <StatusIndicator active={rule.active} />
                  </RuleHeader>
                  
                  <RuleSection>
                    <Text variant="h4">Conditions</Text>
                    <ul>
                      {rule.conditions.map((condition, i) => (
                        <li key={i}>
                          {condition.type} {condition.operator} "{condition.value}"
                        </li>
                      ))}
                    </ul>
                  </RuleSection>
                  
                  <RuleSection>
                    <Text variant="h4">Actions</Text>
                    <ul>
                      {rule.actions.map((action, i) => (
                        <li key={i}>
                          {action.type === 'deliver' ? `Deliver to ${action.destination}` : 
                           action.type === 'forward' ? `Forward to ${action.destination}` : 
                           'Discard message'}
                        </li>
                      ))}
                    </ul>
                  </RuleSection>
                  
                  <ButtonRow>
                    <Button onClick={() => deleteRule(rule.id)}>Delete</Button>
                    <Button>Edit</Button>
                  </ButtonRow>
                </RuleCard>
              ))}
            </RuleGrid>
          )}
        </>
      )}
    </Container>
  );
};

const Container = styled.div`
  padding: var(--space-4);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-6);
`;

const EmptyState = styled.div`
  text-align: center;
  padding: var(--space-12);
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-md);
  
  button {
    margin-top: var(--space-4);
  }
`;

const RuleGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-4);
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const RuleCard = styled.div`
  padding: var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
`;

const RuleHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-4);
`;

const StatusIndicator = styled.span<{ active: boolean }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: ${props => props.active ? '#4CAF50' : '#9E9E9E'};
`;

const RuleSection = styled.div`
  margin-bottom: var(--space-4);
  
  ul {
    list-style-type: none;
    padding: 0;
    
    li {
      padding: var(--space-2);
      background-color: var(--color-hover);
      border-radius: var(--radius-sm);
      margin-bottom: var(--space-2);
    }
  }
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
`;

export default Rules;
```

## 6. Messages Page Update

```tsx
// src/frontend/src/pages/Messages.tsx
import React from 'react';
import styled from 'styled-components';
import MessageList from '@/components/MessageList/MessageList';

const Messages: React.FC = () => {
  return (
    <Container>
      <MessageList />
    </Container>
  );
};

const Container = styled.div`
  padding: var(--space-4);
`;

export default Messages;
```

## Implementation Order

1. First create the helper functions (`delay` function)
2. Create the mock API service
3. Implement the RuleContext provider
4. Build the RuleEditor component
5. Build the MessageList component
6. Update the Rules page
7. Update the Messages page
8. Integrate everything into App.tsx
9. Test the complete flow
