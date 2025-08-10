import React, { useState } from 'react';
import styled from 'styled-components';
import Button from '../UI/Button';
import Card from '../UI/Card';
import Text from '../UI/Text';
import Input from '../UI/Input';
import { Rule, Condition, Action } from '../../services/ClyprService';

const FormContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
`;

const FormSection = styled.div`
  margin-bottom: var(--space-6);
`;

const SectionTitle = styled.h3`
  font-size: var(--font-size-lg);
  margin-bottom: var(--space-4);
  color: var(--color-text);
`;

const FormRow = styled.div`
  display: flex;
  gap: var(--space-3);
  margin-bottom: var(--space-3);
`;

const FormGroup = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-1);
`;

const Select = styled.select`
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  background: var(--color-bg);
  color: var(--color-text);
  
  &:focus {
    outline: none;
    border-color: var(--color-accent);
  }
`;

const TextArea = styled.textarea`
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  background: var(--color-bg);
  color: var(--color-text);
  min-height: 80px;
  resize: vertical;
  font-family: inherit;
  
  &:focus {
    outline: none;
    border-color: var(--color-accent);
  }
`;

const ConditionsList = styled.div`
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: var(--space-3);
  background: var(--color-bg-secondary);
`;

const ConditionItem = styled.div`
  display: flex;
  gap: var(--space-2);
  align-items: center;
  margin-bottom: var(--space-2);
  padding: var(--space-2);
  background: var(--color-bg);
  border-radius: var(--radius-sm);
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const RemoveButton = styled.button`
  background: #ff4444;
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  padding: var(--space-1);
  cursor: pointer;
  font-size: var(--font-size-xs);
  
  &:hover {
    background: #cc3333;
  }
`;

const AddButton = styled(Button)`
  margin-top: var(--space-2);
`;

const ButtonRow = styled.div`
  display: flex;
  gap: var(--space-3);
  justify-content: flex-end;
  margin-top: var(--space-6);
`;

interface RuleFormProps {
  initialRule?: Partial<Rule>;
  onSubmit: (rule: Omit<Rule, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const RuleForm: React.FC<RuleFormProps> = ({
  initialRule,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [name, setName] = useState(initialRule?.name || '');
  const [description, setDescription] = useState(initialRule?.description || '');
  const [dappPrincipal, setDappPrincipal] = useState(
    initialRule?.dappPrincipal ? initialRule.dappPrincipal.toText() : ''
  );
  const [priority, setPriority] = useState(initialRule?.priority || 5);
  const [isActive, setIsActive] = useState(initialRule?.isActive ?? true);
  const [conditions, setConditions] = useState<Condition[]>(
    initialRule?.conditions || [{ field: 'content.title', operator: 'contains', value: '' }]
  );
  const [actions, setActions] = useState<Action[]>(
    initialRule?.actions || [{ actionType: 'allow', channelId: undefined, parameters: [] as [string, string][] }]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // The onSubmit prop expects the data in the frontend format.
    // The ClyprService is responsible for converting it to the backend format.
    onSubmit({
      name,
      description: description || undefined,
      dappPrincipal: (dappPrincipal as any) || undefined,
      conditions,
      actions,
      priority,
      isActive
    });
  };

  const addCondition = () => {
    setConditions([...conditions, { field: 'content.title', operator: 'contains', value: '' }]);
  };

  const removeCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const updateCondition = (index: number, field: keyof Condition, value: any) => {
    const updated = [...conditions];
    updated[index] = { ...updated[index], [field]: value };
    setConditions(updated);
  };

  const addAction = () => {
    setActions([...actions, { 
      actionType: 'allow', 
      channelId: undefined, 
      parameters: [] as [string, string][] 
    }]);
  };

  const removeAction = (index: number) => {
    setActions(actions.filter((_, i) => i !== index));
  };

  const updateAction = (index: number, field: keyof Action, value: any) => {
    const updated = [...actions];
    const currentAction = { ...updated[index] };

    if (field === 'actionType') {
      const newActionType = value as Action['actionType'];
      currentAction.actionType = newActionType;
      // When type changes, reset channelId unless the new type is 'route'
      if (newActionType !== 'route') {
        currentAction.channelId = undefined;
      }
    } else {
      (currentAction as any)[field] = value;
    }
    
    updated[index] = currentAction;
    setActions(updated);
  };

  return (
    <FormContainer>
      <Card>
        <form onSubmit={handleSubmit}>
          <FormSection>
            <SectionTitle>Basic Information</SectionTitle>
            
            <FormGroup>
              <Label>Rule Name *</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Email Privacy Filter"
                required
              />
            </FormGroup>
            
            <FormGroup>
              <Label>Description</Label>
              <TextArea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what this rule does..."
              />
            </FormGroup>

            <FormGroup>
              <Label>dApp Principal (Optional)</Label>
              <Input
                value={dappPrincipal}
                onChange={(e) => setDappPrincipal(e.target.value)}
                placeholder="Enter a dApp Principal to make this rule dApp-specific"
              />
            </FormGroup>
            
            <FormRow>
              <FormGroup>
                <Label>Priority (1-10)</Label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={priority}
                  onChange={(e) => setPriority(Number(e.target.value))}
                />
              </FormGroup>
              
              <FormGroup>
                <Label>Status</Label>
                <Select
                  value={isActive ? 'active' : 'inactive'}
                  onChange={(e) => setIsActive(e.target.value === 'active')}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Select>
              </FormGroup>
            </FormRow>
          </FormSection>

          <FormSection>
            <SectionTitle>Conditions</SectionTitle>
            <Text size="sm" color="secondary" style={{ marginBottom: 'var(--space-3)' }}>
              Define when this rule should be triggered. All conditions must be met.
            </Text>
            
            <ConditionsList>
              {conditions.map((condition, index) => (
                <ConditionItem key={index}>
                  <FormGroup>
                    <Select
                      value={condition.field}
                      onChange={(e) => updateCondition(index, 'field', e.target.value)}
                    >
                      <option value="content.title">Message Title</option>
                      <option value="content.body">Message Body</option>
                      <option value="messageType">Message Type</option>
                      <option value="senderId">Sender ID</option>
                    </Select>
                  </FormGroup>
                  
                  <FormGroup>
                    <Select
                      value={condition.operator}
                      onChange={(e) => updateCondition(index, 'operator', e.target.value)}
                    >
                      <option value="contains">Contains</option>
                      <option value="notContains">Does not contain</option>
                      <option value="equals">Equals</option>
                      <option value="notEquals">Does not equal</option>
                      <option value="exists">Exists</option>
                      <option value="notExists">Does not exist</option>
                    </Select>
                  </FormGroup>
                  
                  <FormGroup>
                    <Input
                      value={condition.value}
                      onChange={(e) => updateCondition(index, 'value', e.target.value)}
                      placeholder="Value..."
                    />
                  </FormGroup>
                  
                  {conditions.length > 1 && (
                    <RemoveButton onClick={() => removeCondition(index)} type="button">
                      ×
                    </RemoveButton>
                  )}
                </ConditionItem>
              ))}
              
              <AddButton onClick={addCondition} type="button" variant="secondary" size="sm">
                Add Condition
              </AddButton>
            </ConditionsList>
          </FormSection>

          <FormSection>
            <SectionTitle>Actions</SectionTitle>
            <Text size="sm" color="secondary" style={{ marginBottom: 'var(--space-3)' }}>
              Define what happens when conditions are met.
            </Text>
            
            <ConditionsList>
              {actions.map((action, index) => (
                <ConditionItem key={index}>
                  <FormGroup>
                    <Select
                      value={action.actionType}
                      onChange={(e) => updateAction(index, 'actionType', e.target.value as Action['actionType'])}
                    >
                      <option value="allow">Allow</option>
                      <option value="block">Block</option>
                      <option value="route">Route to Channel</option>
                      <option value="transform">Transform</option>
                      <option value="prioritize">Prioritize</option>
                    </Select>
                  </FormGroup>
                  
                  {action.actionType === 'route' && (
                    <FormGroup>
                      <Input
                        type="number"
                        value={action.channelId || ''}
                        onChange={(e) => {
                          const value = e.target.value ? Number(e.target.value) : undefined;
                          updateAction(index, 'channelId', value);
                        }}
                        placeholder="Channel ID"
                        required
                      />
                    </FormGroup>
                  )}
                  
                  {actions.length > 1 && (
                    <RemoveButton onClick={() => removeAction(index)} type="button">
                      ×
                    </RemoveButton>
                  )}
                </ConditionItem>
              ))}
              
              <AddButton onClick={addAction} type="button" variant="secondary" size="sm">
                Add Action
              </AddButton>
            </ConditionsList>
          </FormSection>

          <ButtonRow>
            <Button type="button" variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !name}>
              {isLoading ? 'Creating...' : 'Create Rule'}
            </Button>
          </ButtonRow>
        </form>
      </Card>
    </FormContainer>
  );
};

export default RuleForm;
