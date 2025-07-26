import React from 'react';
import styled from 'styled-components';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';
import Text from '../components/UI/Text';
import Input from '../components/UI/Input';

const RulesContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-6);
`;

const SearchContainer = styled.div`
  display: flex;
  gap: var(--space-2);
  width: 320px;
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: var(--space-4);
`;

const RulesTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const RulesTableHeader = styled.thead`
  background-color: var(--color-hover);
  
  th {
    font-weight: 500;
    font-family: var(--font-mono);
    text-align: left;
    padding: var(--space-3) var(--space-4);
  }
`;

const RulesTableBody = styled.tbody`
  tr {
    border-bottom: 1px solid var(--color-border);
    
    &:hover {
      background-color: var(--color-hover);
    }
  }
  
  td {
    padding: var(--space-3) var(--space-4);
  }
`;

const StatusBadge = styled.span<{ active?: boolean }>`
  display: inline-block;
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  background-color: ${(props: { active?: boolean }) => props.active ? '#E8F5E9' : '#FFEBEE'};
  color: ${(props: { active?: boolean }) => props.active ? '#388E3C' : '#D32F2F'};
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  
  &:hover {
    background-color: var(--color-hover);
  }
`;

interface Rule {
  id: string;
  name: string;
  description: string;
  type: string;
  active: boolean;
  createdAt: string;
}

const Rules: React.FC = () => {
  const mockRules: Rule[] = [
    { 
      id: '1', 
      name: 'Email Privacy Filter', 
      description: 'Obscures email addresses in outgoing messages', 
      type: 'Transform',
      active: true,
      createdAt: '2025-06-12'
    },
    { 
      id: '2', 
      name: 'Social Media Anonymizer', 
      description: 'Removes personally identifiable information from social posts', 
      type: 'Transform',
      active: true,
      createdAt: '2025-06-14'
    },
    { 
      id: '3', 
      name: 'Location Data Blocker', 
      description: 'Prevents location data from being shared', 
      type: 'Block',
      active: true,
      createdAt: '2025-06-18'
    },
    { 
      id: '4', 
      name: 'Browser Fingerprint Masker', 
      description: 'Alters browser fingerprint data in requests', 
      type: 'Transform',
      active: false,
      createdAt: '2025-06-20'
    },
    { 
      id: '5', 
      name: 'Cookie Consent Manager', 
      description: 'Automatically manages cookie consent preferences', 
      type: 'Block',
      active: true,
      createdAt: '2025-06-22'
    },
    { 
      id: '6', 
      name: 'Ad Tracker Blocker', 
      description: 'Blocks known ad trackers', 
      type: 'Block',
      active: true,
      createdAt: '2025-07-01'
    },
    { 
      id: '7', 
      name: 'Data Minimizer', 
      description: 'Minimizes personal data shared in forms', 
      type: 'Transform',
      active: false,
      createdAt: '2025-07-05'
    }
  ];
  
  return (
    <RulesContainer>
      <Header>
        <Text as="h1">Privacy Rules</Text>
        <SearchContainer>
          <Input placeholder="Search rules..." />
          <Button>Search</Button>
        </SearchContainer>
      </Header>
      
const CardHeader = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: var(--space-4);
`;

// Rest of the code...

      <Card>
        <CardHeader>
          <Button>Create New Rule</Button>
        </CardHeader>
        
        <RulesTable>
          <RulesTableHeader>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Type</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </RulesTableHeader>
          <RulesTableBody>
            {mockRules.map(rule => (
              <tr key={rule.id}>
                <td>{rule.name}</td>
                <td>{rule.description}</td>
                <td>{rule.type}</td>
                <td>
                  <StatusBadge active={rule.active}>
                    {rule.active ? 'Active' : 'Inactive'}
                  </StatusBadge>
                </td>
                <td>{rule.createdAt}</td>
                <td>
                  <ActionButton title="Edit">✎</ActionButton>
                  <ActionButton title="Delete">⨯</ActionButton>
                  <ActionButton title={rule.active ? 'Disable' : 'Enable'}>
                    {rule.active ? '⏻' : '⏼'}
                  </ActionButton>
                </td>
              </tr>
            ))}
          </RulesTableBody>
        </RulesTable>
      </Card>
    </RulesContainer>
  );
};

export default Rules;
