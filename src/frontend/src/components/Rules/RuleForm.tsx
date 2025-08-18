import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Button from '../UI/Button';
import Card from '../UI/Card';
import Text from '../UI/Text';
import Input from '../UI/Input';
import { Rule, Condition, Action } from '../../services/ClyprService';
import { Principal } from '@dfinity/principal';

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

type FormErrors = {
  name?: string;
  dappPrincipal?: string;
  priority?: string;
  conditions?: (string | null)[];
  actions?: (string | null)[];
  general?: string;
};

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
  const [priority, setPriority] = useState<number>(initialRule?.priority ?? 5);
  const [isActive, setIsActive] = useState<boolean>(initialRule?.isActive ?? true);
  const [conditions, setConditions] = useState<Condition[]>(
    initialRule?.conditions || [{ field: 'content.title', operator: 'contains', value: '' }]
  );
  const [actions, setActions] = useState<Action[]>(
    initialRule?.actions || [{ actionType: 'allow', channelId: undefined, parameters: [] as [string, string][] }]
  );

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // validate on mount/when initial data changes
    validateAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isOperatorValueRequired = (op: string) => {
    return ['contains', 'notContains', 'equals', 'notEquals'].includes(op);
  };

  const validateAll = (): boolean => {
    const next: FormErrors = {};

    if (!name || !name.trim()) next.name = 'Name is required';

    if (dappPrincipal && dappPrincipal.trim()) {
      try {
        Principal.fromText(dappPrincipal.trim());
      } catch (e) {
        next.dappPrincipal = 'Invalid principal format';
      }
    }

    if (!Number.isFinite(priority) || priority < 1 || priority > 10) {
      next.priority = 'Priority must be a number between 1 and 10';
    }

    // conditions
    const condErrors: (string | null)[] = [];
    conditions.forEach((c, idx) => {
      if (isOperatorValueRequired(c.operator) && (!c.value || !String(c.value).trim())) {
        condErrors[idx] = 'Value is required for this operator';
      } else {
        condErrors[idx] = null;
      }
    });
    if (condErrors.some(e => e)) next.conditions = condErrors;

    // actions
    const actionErrors: (string | null)[] = [];
    actions.forEach((a, idx) => {
      if (a.actionType === 'route') {
        if (a.channelId === undefined || a.channelId === null || Number.isNaN(Number(a.channelId)) || Number(a.channelId) <= 0) {
          actionErrors[idx] = 'Channel ID is required and must be a positive number for route actions';
        } else {
          actionErrors[idx] = null;
        }
      } else {
        actionErrors[idx] = null;
      }
    });
    if (actionErrors.some(e => e)) next.actions = actionErrors;

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || isLoading) return;

    const ok = validateAll();
    if (!ok) return;

    setIsSubmitting(true);
    try {
      const normalized = {
        name: name.trim(),
        description: description && description.trim() !== '' ? description.trim() : undefined,
        dappPrincipal: dappPrincipal && dappPrincipal.trim() !== '' ? dappPrincipal.trim() : undefined,
        conditions: conditions.map(c => ({ field: c.field, operator: c.operator, value: c.value })),
        actions: actions.map(a => ({ actionType: a.actionType, channelId: a.channelId, parameters: a.parameters || [] })),
        priority: Number(priority),
        isActive: !!isActive
      } as Omit<Rule, 'id' | 'createdAt' | 'updatedAt'>;

      onSubmit(normalized);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addCondition = () => {
    setConditions([...conditions, { field: 'content.title', operator: 'contains', value: '' }]);
    setErrors(prev => ({ ...prev, conditions: prev.conditions ? [...prev.conditions, null] : undefined }));
  };

  const removeCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
    setErrors(prev => ({ ...prev, conditions: prev.conditions ? prev.conditions.filter((_, i) => i !== index) : undefined }));
  };

  const updateCondition = (index: number, fieldKey: keyof Condition, value: any) => {
    const updated = [...conditions];
    updated[index] = { ...updated[index], [fieldKey]: value };
    setConditions(updated);

    // Re-validate this condition
    setErrors(prev => {
      const next = { ...prev };
      if (next.conditions) {
        const conds = [...next.conditions];
        conds[index] = isOperatorValueRequired(updated[index].operator) && (!updated[index].value || !String(updated[index].value).trim())
          ? 'Value is required for this operator'
          : null;
        next.conditions = conds;
        if (!next.conditions.some(x => x)) delete next.conditions;
      }
      return next;
    });
  };

  const addAction = () => {
    setActions([...actions, { actionType: 'allow', channelId: undefined, parameters: [] as [string, string][] }]);
    setErrors(prev => ({ ...prev, actions: prev.actions ? [...prev.actions, null] : undefined }));
  };

  const removeAction = (index: number) => {
    setActions(actions.filter((_, i) => i !== index));
    setErrors(prev => ({ ...prev, actions: prev.actions ? prev.actions.filter((_, i) => i !== index) : undefined }));
  };

  const updateAction = (index: number, fieldKey: keyof Action, value: any) => {
    const updated = [...actions];
    const currentAction = { ...updated[index] };

    if (fieldKey === 'actionType') {
      const newActionType = value as Action['actionType'];
      currentAction.actionType = newActionType;
      if (newActionType !== 'route') {
        currentAction.channelId = undefined;
      }
    } else {
      (currentAction as any)[fieldKey] = value;
    }

    updated[index] = currentAction;
    setActions(updated);

    // Re-validate this action
    setErrors(prev => {
      const next = { ...prev };
      if (next.actions) {
        const acts = [...next.actions];
        if (currentAction.actionType === 'route') {
          acts[index] = currentAction.channelId === undefined || currentAction.channelId === null || Number.isNaN(Number(currentAction.channelId)) || Number(currentAction.channelId) <= 0
            ? 'Channel ID is required and must be a positive number for route actions'
            : null;
        } else {
          acts[index] = null;
        }
        next.actions = acts;
        if (!next.actions.some(x => x)) delete next.actions;
      }
      return next;
    });
  };

  const canSubmit = (): boolean => {
    // disabled if loading, submitting, or validation errors exist
    if (isLoading || isSubmitting) return false;
    // quick checks
    if (!name || !name.trim()) return false;
    if (!Number.isFinite(priority) || priority < 1 || priority > 10) return false;
    if (errors && (errors.name || errors.dappPrincipal || errors.priority || errors.conditions || errors.actions || errors.general)) return false;
    return true;
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
              {errors.name && <div className="text-xs text-red-400 mt-1">{errors.name}</div>}
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
              {errors.dappPrincipal && <div className="text-xs text-red-400 mt-1">{errors.dappPrincipal}</div>}
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
                {errors.priority && <div className="text-xs text-red-400 mt-1">{errors.priority}</div>}
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
                    {errors.conditions && errors.conditions[index] && <div className="text-xs text-red-400 mt-1">{errors.conditions[index]}</div>}
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
                      {errors.actions && errors.actions[index] && <div className="text-xs text-red-400 mt-1">{errors.actions[index]}</div>}
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
