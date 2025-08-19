import React from 'react';
import Button from '../UI/Button';
import Card from '../UI/Card';
import Text from '../UI/Text';
import Input from '../UI/Input';
import { Rule, Condition, Action } from '../../services/ClyprService';
import { Principal } from '@dfinity/principal';

const OperatorOptions = [
  { value: 'contains', label: 'Contains' },
  { value: 'notContains', label: 'Does not contain' },
  { value: 'equals', label: 'Equals' },
  { value: 'notEquals', label: 'Does not equal' },
  { value: 'exists', label: 'Exists' },
  { value: 'notExists', label: 'Does not exist' },
];

const FieldOptions = [
  { value: 'content.title', label: 'Message Title' },
  { value: 'content.body', label: 'Message Body' },
  { value: 'messageType', label: 'Message Type' },
  { value: 'senderId', label: 'Sender ID' },
];

const ActionTypeOptions = [
  { value: 'allow', label: 'Allow' },
  { value: 'block', label: 'Block' },
  { value: 'route', label: 'Route to Channel' },
  { value: 'transform', label: 'Transform' },
  { value: 'prioritize', label: 'Prioritize' },
];

export default function RuleForm({ initialRule, onSubmit, onCancel, isLoading = false }: any) {
  const [name, setName] = (React as any).useState(initialRule?.name || '');
  const [description, setDescription] = (React as any).useState(initialRule?.description || '');
  const [dappPrincipal, setDappPrincipal] = (React as any).useState(initialRule?.dappPrincipal ? initialRule.dappPrincipal.toText() : '');
  const [priority, setPriority] = (React as any).useState(initialRule?.priority ?? 5);
  const [isActive, setIsActive] = (React as any).useState(initialRule?.isActive ?? true);
  const [conditions, setConditions] = (React as any).useState(initialRule?.conditions || [{ field: 'content.title', operator: 'contains', value: '' }]);
  const [actions, setActions] = (React as any).useState(initialRule?.actions || [{ actionType: 'allow', channelId: undefined, parameters: [] }]);

  const [errors, setErrors] = (React as any).useState({});
  const [isSubmitting, setIsSubmitting] = (React as any).useState(false);
  const [submitMessage, setSubmitMessage] = (React as any).useState(null);
  const [submitError, setSubmitError] = (React as any).useState(null);

  (React as any).useEffect(() => {
    validateAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isOperatorValueRequired = (op: string) => ['contains', 'notContains', 'equals', 'notEquals'].includes(op);

  const validateAll = (): boolean => {
    const next: any = {};

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

    const condErrors: (string | null)[] = [];
    (conditions || []).forEach((c: any, idx: number) => {
      if (isOperatorValueRequired(c.operator) && (!c.value || !String(c.value).trim())) {
        condErrors[idx] = 'Value is required for this operator';
      } else {
        condErrors[idx] = null;
      }
    });
    if (condErrors.some(e => e)) next.conditions = condErrors;

    const actionErrors: (string | null)[] = [];
    (actions || []).forEach((a: any, idx: number) => {
      if (a.actionType === 'route') {
        if (a.channelId === undefined || a.channelId === null || Number.isNaN(Number(a.channelId)) || Number(a.channelId) <= 0) {
          actionErrors[idx] = 'Channel ID must be a positive number for route actions';
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

  const handleSubmit = async (e: any) => {
    e?.preventDefault?.();
    if (isSubmitting || isLoading) return;
    setSubmitMessage(null);
    setSubmitError(null);

    const ok = validateAll();
    if (!ok) return;

    const normalized = {
      name: name.trim(),
      description: description && description.trim() !== '' ? description.trim() : undefined,
      dappPrincipal: dappPrincipal && dappPrincipal.trim() !== '' ? dappPrincipal.trim() : undefined,
      conditions: (conditions || []).map((c: any) => ({ field: c.field, operator: c.operator, value: c.value })),
      actions: (actions || []).map((a: any) => ({ actionType: a.actionType, channelId: a.channelId, parameters: a.parameters || [] })),
      priority: Number(priority),
      isActive: !!isActive,
    } as any;

    setIsSubmitting(true);
    try {
      // Allow parent to return a promise/result indicating success or failure
      const result = await onSubmit(normalized);
      // If parent returns truthy, treat as success. Otherwise, show a subtle message.
      if (result === undefined || result === true || (result && result.success)) {
        setSubmitMessage('Rule saved');
      } else {
        setSubmitError(typeof result === 'string' ? result : 'Failed to save rule');
      }
    } catch (err: any) {
      console.error('Rule save error', err);
      setSubmitError(err?.message || 'Failed to save rule');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addCondition = () => {
    setConditions([...(conditions || []), { field: 'content.title', operator: 'contains', value: '' }]);
    setErrors((prev: any) => ({ ...prev, conditions: prev?.conditions ? [...prev.conditions, null] : undefined }));
  };

  const removeCondition = (index: number) => {
    setConditions((conditions || []).filter((_: any, i: number) => i !== index));
    setErrors((prev: any) => ({ ...prev, conditions: prev?.conditions ? prev.conditions.filter((_: any, i: number) => i !== index) : undefined }));
  };

  const updateCondition = (index: number, fieldKey: keyof Condition, value: any) => {
    const updated = [...(conditions || [])];
    (updated as any)[index] = { ...(updated as any)[index], [fieldKey]: value };
    setConditions(updated as any);

    setErrors((prev: any) => {
      const next = { ...prev };
      if (next.conditions) {
        const conds = [...next.conditions];
        conds[index] = isOperatorValueRequired((updated as any)[index].operator) && (!(updated as any)[index].value || !String((updated as any)[index].value).trim())
          ? 'Value is required for this operator' : null;
        next.conditions = conds;
        if (!next.conditions.some((x: any) => x)) delete next.conditions;
      }
      return next;
    });
  };

  const addAction = () => {
    setActions([...(actions || []), { actionType: 'allow', channelId: undefined, parameters: [] }]);
    setErrors((prev: any) => ({ ...prev, actions: prev?.actions ? [...prev.actions, null] : undefined }));
  };

  const removeAction = (index: number) => {
    setActions((actions || []).filter((_: any, i: number) => i !== index));
    setErrors((prev: any) => ({ ...prev, actions: prev?.actions ? prev.actions.filter((_: any, i: number) => i !== index) : undefined }));
  };

  const updateAction = (index: number, fieldKey: keyof Action, value: any) => {
    const updated = [...(actions || [])];
    const currentAction = { ...(updated as any)[index] } as any;

    if (fieldKey === 'actionType') {
      const newActionType = value as Action['actionType'];
      currentAction.actionType = newActionType;
      if (newActionType !== 'route') currentAction.channelId = undefined;
    } else {
      (currentAction as any)[fieldKey] = value;
    }

    updated[index] = currentAction as any;
    setActions(updated as any);

    setErrors((prev: any) => {
      const next = { ...prev };
      if (next.actions) {
        const acts = [...next.actions];
        if (currentAction.actionType === 'route') {
          acts[index] = currentAction.channelId === undefined || currentAction.channelId === null || Number.isNaN(Number(currentAction.channelId)) || Number(currentAction.channelId) <= 0
            ? 'Channel ID must be a positive number for route actions' : null;
        } else {
          acts[index] = null;
        }
        next.actions = acts;
        if (!next.actions.some((x: any) => x)) delete next.actions;
      }
      return next;
    });
  };

  const canSubmit = () => {
    if (isLoading || isSubmitting) return false;
    if (!name || !name.trim()) return false;
    if (!Number.isFinite(priority) || priority < 1 || priority > 10) return false;
    if (errors && (errors.name || errors.dappPrincipal || errors.priority || errors.conditions || errors.actions || errors.general)) return false;
    return true;
  };

  return (
    <div className="p-2">
      <Card className="w-full p-4 md:p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Rule Name *</label>
                <Input disabled={isSubmitting} value={name} onChange={(e: any) => setName(e.target.value)} placeholder="e.g., Email Privacy Filter" required aria-label="Rule name" />
                {errors.name && <div className="text-xs text-red-400 mt-1">{errors.name}</div>}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Description</label>
                <textarea
                  className="w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-100"
                  rows={3}
                  value={description}
                  onChange={(e: any) => setDescription(e.target.value)}
                  placeholder="Describe what this rule does..."
                  aria-label="Rule description"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">dApp Principal (Optional)</label>
                <Input disabled={isSubmitting} value={dappPrincipal} onChange={(e: any) => setDappPrincipal(e.target.value)} placeholder="Principal (e.g. axxxxx-...)" aria-label="dapp principal" />
                {errors.dappPrincipal && <div className="text-xs text-red-400 mt-1">{errors.dappPrincipal}</div>}
              </div>

              <div>
                <h4 className="text-sm font-semibold text-neutral-200 mb-2">Conditions</h4>
                <p className="text-xs text-neutral-400 mb-3">All conditions must be met for the rule to trigger.</p>

                <div className="space-y-2">
                  {(conditions || []).map((condition: any, idx: number) => (
                    <div key={idx} className="flex gap-2 items-start bg-neutral-900/20 p-3 rounded-md">
                      <select aria-label={`condition-field-${idx}`} className="bg-neutral-950 border border-neutral-800 rounded p-2 text-sm w-40" value={condition.field} onChange={(e: any) => updateCondition(idx, 'field', e.target.value)} disabled={isSubmitting}>
                        {FieldOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>

                      <select aria-label={`condition-operator-${idx}`} className="bg-neutral-950 border border-neutral-800 rounded p-2 text-sm w-44" value={condition.operator} onChange={(e: any) => updateCondition(idx, 'operator', e.target.value)} disabled={isSubmitting}>
                        {OperatorOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>

                      <Input disabled={isSubmitting} aria-label={`condition-value-${idx}`} value={condition.value || ''} onChange={(e: any) => updateCondition(idx, 'value', e.target.value)} className="flex-1" placeholder="Value" />

                      {(conditions || []).length > 1 && <button type="button" onClick={() => removeCondition(idx)} className="text-red-400 px-2" aria-label={`remove-condition-${idx}`}>×</button>}

                      {errors.conditions && errors.conditions[idx] && <div className="text-xs text-red-400 w-full">{errors.conditions[idx]}</div>}
                    </div>
                  ))}

                  <div>
                    <Button type="button" variant="secondary" onClick={addCondition} size="sm" disabled={isSubmitting}>Add Condition</Button>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-neutral-200 mb-2">Actions</h4>
                <p className="text-xs text-neutral-400 mb-3">What happens when conditions match.</p>

                <div className="space-y-2">
                  {(actions || []).map((action: any, idx: number) => (
                    <div key={idx} className="flex gap-2 items-start bg-neutral-900/20 p-3 rounded-md">
                      <select aria-label={`action-type-${idx}`} className="bg-neutral-950 border border-neutral-800 rounded p-2 text-sm w-48" value={action.actionType} onChange={(e: any) => updateAction(idx, 'actionType', e.target.value)} disabled={isSubmitting}>
                        {ActionTypeOptions.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                      </select>

                      {action.actionType === 'route' && (
                        <Input disabled={isSubmitting} aria-label={`action-channel-${idx}`} type="number" value={action.channelId || ''} onChange={(e: any) => updateAction(idx, 'channelId', e.target.value ? Number(e.target.value) : undefined)} placeholder="Channel ID" />
                      )}

                      <div className="flex-1 text-xs text-neutral-400">{action.actionType === 'route' ? 'Route to a communication channel by ID' : 'Standard action'}</div>

                      {(actions || []).length > 1 && <button type="button" onClick={() => removeAction(idx)} className="text-red-400 px-2" aria-label={`remove-action-${idx}`} disabled={isSubmitting}>×</button>}

                      {errors.actions && errors.actions[idx] && <div className="text-xs text-red-400 w-full">{errors.actions[idx]}</div>}
                    </div>
                  ))}

                  <div>
                    <Button type="button" variant="secondary" onClick={addAction} size="sm" disabled={isSubmitting}>Add Action</Button>
                  </div>
                </div>
              </div>
            </div>

            <aside className="lg:col-span-1 space-y-4">
              <div className="bg-neutral-900/20 p-4 rounded-md">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-xs text-neutral-400">Priority</div>
                    <div className="text-lg font-semibold">{priority}</div>
                  </div>
                  <input aria-label="Priority" type="range" min={1} max={10} value={priority} onChange={(e: any) => setPriority(Number(e.target.value))} className="w-32" disabled={isSubmitting} />
                </div>

                <div className="mt-2">
                  <div className="text-xs text-neutral-400 mb-1">Status</div>
                  <select aria-label="Rule status" className="w-full h-10 rounded-md border border-neutral-800 bg-neutral-950 px-3 text-sm" value={isActive ? 'active' : 'inactive'} onChange={(e: any) => setIsActive(e.target.value === 'active')} disabled={isSubmitting}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="mt-4">
                  <Button type="button" variant="ghost" onClick={onCancel} className="w-full mb-2" disabled={isSubmitting}>Cancel</Button>
                  <Button type="submit" variant="gradient" className="w-full" onClick={() => {}} disabled={!canSubmit()}>{(isSubmitting || isLoading) ? 'Saving...' : 'Save Rule'}</Button>
                  {submitMessage && <div className="text-xs text-green-400 mt-2">{submitMessage}</div>}
                  {submitError && <div className="text-xs text-red-400 mt-2">{submitError}</div>}
                </div>
              </div>

              <div className="text-xs text-neutral-400 bg-neutral-900/10 p-3 rounded-md">
                Rules are evaluated top → bottom by priority. Lower numbers run first. Use priority to control ordering.
              </div>
            </aside>
          </div>
        </form>
      </Card>
    </div>
  );
}
