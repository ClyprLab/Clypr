import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';
import Text from '../components/UI/Text';
import Input from '../components/UI/Input';
import RuleForm from '../components/Rules/RuleForm';
import { useClypr } from '../hooks/useClypr';
import { Rule, createOperatorVariant } from '../services/ClyprService';

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
  background-color: ${props => props.active ? '#E8F5E9' : '#FFEBEE'};
  color: ${props => props.active ? '#388E3C' : '#D32F2F'};
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

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: var(--space-8);
`;

const EmptyState = styled.div`
  text-align: center;
  padding: var(--space-8);
  color: var(--color-text-secondary);
`;

interface RuleTableProps {
  rules: Rule[];
  onEdit: (rule: Rule) => void;
  onDelete: (ruleId: number) => void;
  onToggle: (ruleId: number, isActive: boolean) => void;
}

const RuleTable: React.FC<RuleTableProps> = ({ rules, onEdit, onDelete, onToggle }) => {
  if (rules.length === 0) {
    return (
      <EmptyState>
        <Text>No rules created yet. Create your first privacy rule to get started.</Text>
      </EmptyState>
    );
  }

  return (
    <RulesTable>
      <RulesTableHeader>
        <tr>
          <th>Name</th>
          <th>Description</th>
          <th>Conditions</th>
          <th>Actions</th>
          <th>Priority</th>
          <th>Status</th>
          <th>Created</th>
        </tr>
      </RulesTableHeader>
      <RulesTableBody>
        {rules.map(rule => (
          <tr key={rule.id}>
            <td>{rule.name}</td>
            <td>{rule.description || '-'}</td>
            <td>{rule.conditions.length}</td>
            <td>{rule.actions.length}</td>
            <td>{rule.priority}</td>
            <td>
              <StatusBadge active={rule.isActive}>
                {rule.isActive ? 'Active' : 'Inactive'}
              </StatusBadge>
            </td>
            <td>{new Date(Number(rule.createdAt) / 1000000).toLocaleDateString()}</td>
            <td>
              <ActionButton title="Edit" onClick={() => onEdit(rule)}>✎</ActionButton>
              <ActionButton title="Delete" onClick={() => onDelete(rule.id)}>⨯</ActionButton>
              <ActionButton 
                title={rule.isActive ? 'Disable' : 'Enable'}
                onClick={() => onToggle(rule.id, !rule.isActive)}
              >
                {rule.isActive ? '⏻' : '⏼'}
              </ActionButton>
            </td>
          </tr>
        ))}
      </RulesTableBody>
    </RulesTable>
  );
};

const Rules: React.FC = () => {
  const { 
    rules, 
    rulesLoading,
    loadRules,
    createRule,
    updateRule,
    deleteRule,
    isAuthenticated,
    error
  } = useClypr();
  
  const [showForm, setShowForm] = useState(false);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleCreateRule = async (ruleData: Omit<Rule, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const motokoConditions = ruleData.conditions.map(cond => ({
        ...cond,
        operator: createOperatorVariant(
          ((cond.operator as any)?.contains
            ? 'contains'
            : (typeof cond.operator === 'string'
                ? cond.operator
                : Object.keys(cond.operator)[0])) as
            | 'equals'
            | 'notEquals'
            | 'contains'
            | 'notContains'
            | 'greaterThan'
            | 'lessThan'
            | 'exists'
            | 'notExists'
        )
      }));
      const motokoActions = ruleData.actions.map(action => ({
        ...action,
        channelId: typeof action.channelId === 'number' ? action.channelId : null
      }));
      const success = await createRule(
        ruleData.name,
        ruleData.description,
        motokoConditions,
        motokoActions,
        ruleData.priority
      );
      
      if (success) {
        setShowForm(false);
        setEditingRule(null);
      }
    } catch (err) {
      console.error('Error creating rule:', err);
    }
  };

  const handleEditRule = (rule: Rule) => {
    setEditingRule(rule);
    setShowForm(true);
  };

  const handleUpdateRule = async (ruleData: Omit<Rule, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingRule) return;
    
    try {
      const updatedRule: Rule = {
        ...editingRule,
        ...ruleData,
        updatedAt: BigInt(Date.now() * 1000000) // Convert to nanoseconds
      };
      
      const success = await updateRule(editingRule.id, updatedRule);
      
      if (success) {
        setShowForm(false);
        setEditingRule(null);
      }
    } catch (err) {
      console.error('Error updating rule:', err);
    }
  };

  const handleDeleteRule = async (ruleId: number) => {
    if (!window.confirm('Are you sure you want to delete this rule?')) return;
    
    try {
      await deleteRule(ruleId);
    } catch (err) {
      console.error('Error deleting rule:', err);
    }
  };

  const handleToggleRule = async (ruleId: number, isActive: boolean) => {
    const rule = rules.find(r => r.id === ruleId);
    if (!rule) return;
    
    try {
      const updatedRule: Rule = {
        ...rule,
        isActive,
        updatedAt: BigInt(Date.now() * 1000000)
      };
      
      await updateRule(ruleId, updatedRule);
    } catch (err) {
      console.error('Error updating rule:', err);
    }
  };

  const filteredRules = rules.filter(rule =>
    rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (rule.description && rule.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (showForm) {
    return (
      <RulesContainer>
        <Header>
          <Text as="h1">{editingRule ? 'Edit Rule' : 'Create New Rule'}</Text>
          <Button variant="secondary" onClick={() => {
            setShowForm(false);
            setEditingRule(null);
          }}>
            ← Back to Rules
          </Button>
        </Header>
        
        {error && (
          <Card style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-3)', backgroundColor: '#ffebee' }}>
            <Text color="error">{error}</Text>
          </Card>
        )}
        
        <RuleForm
          initialRule={editingRule || undefined}
          onSubmit={editingRule ? handleUpdateRule : handleCreateRule}
          onCancel={() => {
            setShowForm(false);
            setEditingRule(null);
          }}
        />
      </RulesContainer>
    );
  }

  if (!isAuthenticated) {
    return (
      <RulesContainer>
        <Text>Please authenticate to manage privacy rules.</Text>
      </RulesContainer>
    );
  }
  
  return (
    <RulesContainer>
      <Header>
        <Text as="h1">Privacy Rules</Text>
        <SearchContainer>
          <Input 
            placeholder="Search rules..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button onClick={() => setShowForm(true)}>Create New Rule</Button>
        </SearchContainer>
      </Header>
      
      {error && (
        <Card style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-3)', backgroundColor: '#ffebee' }}>
          <Text color="error">{error}</Text>
        </Card>
      )}

      <Card>
        {rulesLoading ? (
          <LoadingContainer>
            <Text>Loading rules...</Text>
          </LoadingContainer>
        ) : (
          <RuleTable
            rules={filteredRules}
            onEdit={handleEditRule}
            onDelete={handleDeleteRule}
            onToggle={handleToggleRule}
          />
        )}
      </Card>
    </RulesContainer>
  );
};

export default Rules;
