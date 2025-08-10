import React from 'react';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';
import Text from '../components/UI/Text';
import Input from '../components/UI/Input';
import RuleForm from '../components/Rules/RuleForm';
import { useClypr } from '../hooks/useClypr';
import { Rule } from '../services/ClyprService';

const StatusBadge = ({ active }: { active?: boolean }) => (
  <span className={`inline-block px-2 py-1 rounded-full text-xs ${active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
    {active ? 'Active' : 'Inactive'}
  </span>
);

const Rules = () => {
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

  const [showForm, setShowForm] = React.useState(false);
  const [editingRule, setEditingRule] = React.useState<Rule | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');

  React.useEffect(() => {
    if (isAuthenticated && !rulesLoading && rules.length === 0) {
      loadRules();
    }
  }, [isAuthenticated]);

  const handleCreateRule = async (ruleData: Omit<Rule, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const hasInvalidChannelId = ruleData.actions.some(
        action => action.actionType === 'route' && !action.channelId
      );
      if (hasInvalidChannelId) throw new Error('Channel ID is required for route actions');
      const ruleId = await createRule(ruleData);
      if (ruleId !== undefined) {
        setShowForm(false);
        setEditingRule(null);
        await loadRules();
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
      const hasInvalidChannelId = ruleData.actions.some(
        action => action.actionType === 'route' && !action.channelId
      );
      if (hasInvalidChannelId) throw new Error('Channel ID is required for route actions');

      const updatedRule: Rule = {
        ...editingRule,
        name: ruleData.name,
        description: ruleData.description,
        dappPrincipal: (ruleData as any).dappPrincipal,
        conditions: ruleData.conditions,
        actions: ruleData.actions,
        priority: ruleData.priority,
        isActive: ruleData.isActive,
        updatedAt: BigInt(Date.now() * 1000000)
      };
      const success = await updateRule(editingRule.id, updatedRule);
      if (success) {
        setShowForm(false);
        setEditingRule(null);
        await loadRules();
      }
    } catch (err) {
      console.error('Error updating rule:', err);
    }
  };

  const handleDeleteRule = async (ruleId: number) => {
    if (!window.confirm('Are you sure you want to delete this rule?')) return;
    try {
      const success = await deleteRule(ruleId);
      if (success) await loadRules();
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
      const success = await updateRule(ruleId, updatedRule);
      if (success) await loadRules();
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
      <div>
        <div className="flex items-center justify-between mb-6">
          <Text as="h1">{editingRule ? 'Edit Rule' : 'Create New Rule'}</Text>
          <Button variant="secondary" onClick={() => { setShowForm(false); setEditingRule(null); }}>
            ← Back to Rules
          </Button>
        </div>

        {error && (
          <Card className="mb-4">
            <p className="text-red-500">{error}</p>
          </Card>
        )}

        <RuleForm
          initialRule={editingRule || undefined}
          onSubmit={editingRule ? handleUpdateRule : handleCreateRule}
          onCancel={() => { setShowForm(false); setEditingRule(null); }}
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div>
        <Text>Please authenticate to manage privacy rules.</Text>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Text as="h1">Privacy Rules</Text>
        <div className="flex gap-2 w-80">
          <Input placeholder="Search rules..." value={searchTerm} onChange={(e: any) => setSearchTerm(e.target.value)} />
          <Button onClick={() => setShowForm(true)}>Create New Rule</Button>
        </div>
      </div>

      {error && (
        <Card className="mb-4">
          <p className="text-red-500">{error}</p>
        </Card>
      )}

      <Card>
        {rulesLoading ? (
          <div className="flex items-center justify-center p-8">
            <Text>Loading rules...</Text>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-neutral-900/60">
                <tr>
                  <th className="text-left p-3 font-mono font-medium">Name</th>
                  <th className="text-left p-3 font-mono font-medium">Description</th>
                  <th className="text-left p-3 font-mono font-medium">Conditions</th>
                  <th className="text-left p-3 font-mono font-medium">Actions</th>
                  <th className="text-left p-3 font-mono font-medium">Priority</th>
                  <th className="text-left p-3 font-mono font-medium">Status</th>
                  <th className="text-left p-3 font-mono font-medium">Created</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody>
                {filteredRules.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center p-8 text-neutral-400">No rules created yet. Create your first privacy rule to get started.</td>
                  </tr>
                ) : (
                  filteredRules.map(rule => (
                    <tr key={rule.id} className="border-b border-neutral-800 hover:bg-neutral-900">
                      <td className="p-3">{rule.name}</td>
                      <td className="p-3">{rule.description || '-'}</td>
                      <td className="p-3">{rule.conditions.length}</td>
                      <td className="p-3">{rule.actions.length}</td>
                      <td className="p-3">{rule.priority}</td>
                      <td className="p-3"><StatusBadge active={rule.isActive} /></td>
                      <td className="p-3">{new Date(Number(rule.createdAt) / 1000000).toLocaleDateString()}</td>
                      <td className="p-3">
                        <div className="flex gap-2 justify-end">
                          <button title="Edit" onClick={() => handleEditRule(rule)} className="px-2 py-1 rounded hover:bg-neutral-900">✎</button>
                          <button title="Delete" onClick={() => handleDeleteRule(rule.id)} className="px-2 py-1 rounded hover:bg-neutral-900">⨯</button>
                          <button title={rule.isActive ? 'Disable' : 'Enable'} onClick={() => handleToggleRule(rule.id, !rule.isActive)} className="px-2 py-1 rounded hover:bg-neutral-900">
                            {rule.isActive ? '⏻' : '⭘'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Rules;
