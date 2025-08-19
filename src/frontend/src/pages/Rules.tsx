import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/UI/Button';
import { Card, GlassCard } from '../components/UI/Card';
import Input from '../components/UI/Input';
import CreateRuleSlideOver from '../components/Rules/CreateRuleSlideOver';
import { useClypr } from '../hooks/useClypr';
import { Rule } from '../services/ClyprService';
import { 
  Shield, 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Power, 
  PowerOff,
  AlertTriangle,
  CheckCircle,
  Clock,
  Settings,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { cn } from '../utils/cn';

const StatusBadge = ({ active }: { active?: boolean }) => (
  <div className={cn(
    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
    active 
      ? "bg-green-500/20 text-green-400 border border-green-500/30" 
      : "bg-red-500/20 text-red-400 border border-red-500/30"
  )}>
    {active ? (
      <>
        <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
        Active
      </>
    ) : (
      <>
        <div className="w-1.5 h-1.5 bg-red-400 rounded-full" />
        Inactive
      </>
    )}
  </div>
);

const PriorityBadge = ({ priority }: { priority: number }) => {
  const getPriorityColor = (priority: number) => {
    if (priority >= 8) return "bg-red-500/20 text-red-400 border-red-500/30";
    if (priority >= 5) return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    return "bg-blue-500/20 text-blue-400 border-blue-500/30";
  };

  const getPriorityLabel = (priority: number) => {
    if (priority >= 8) return "Critical";
    if (priority >= 5) return "High";
    return "Normal";
  };

  return (
    <div className={cn(
      "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border",
      getPriorityColor(priority)
    )}>
      {getPriorityLabel(priority)}
    </div>
  );
};

const Rules = () => {
  const navigate = useNavigate();
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

  const [showForm, setShowForm] = (React as any).useState(false);
  const [editingRule, setEditingRule] = (React as any).useState<Rule | null>(null);
  const [searchTerm, setSearchTerm] = (React as any).useState('');
  const [statusFilter, setStatusFilter] = (React as any).useState<'all' | 'active' | 'inactive'>('all');

  (React as any).useEffect(() => {
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
    if (!window.confirm('Are you sure you want to delete this privacy rule? This action cannot be undone.')) return;
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

  const filteredRules = rules.filter(rule => {
    const matchesSearch = rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (rule.description && rule.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && rule.isActive) ||
      (statusFilter === 'inactive' && !rule.isActive);

    return matchesSearch && matchesStatus;
  });

  const activeRulesCount = rules.filter(rule => rule.isActive).length;
  const totalRulesCount = rules.length;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-white mb-2">Privacy Rules</h1>
            <p className="text-neutral-400">Control how your messages are filtered and routed</p>
          </div>
          <Button 
            variant="gradient" 
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => setShowForm(true)}
          >
            Create Rule
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <GlassCard>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-white">{totalRulesCount}</div>
                <div className="text-sm text-neutral-400">Total Rules</div>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-400/20 to-cyan-400/10 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-cyan-400" />
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-white">{activeRulesCount}</div>
                <div className="text-sm text-neutral-400">Active Rules</div>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-green-400/20 to-green-400/10 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-400" />
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-white">{totalRulesCount - activeRulesCount}</div>
                <div className="text-sm text-neutral-400">Inactive Rules</div>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-neutral-400/20 to-neutral-400/10 rounded-lg flex items-center justify-center">
                <PowerOff className="h-5 w-5 text-neutral-400" />
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Search rules by name or description..."
              value={searchTerm}
              onChange={(e: any) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
              fullWidth
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={statusFilter === 'all' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setStatusFilter('all')}
            >
              All ({totalRulesCount})
            </Button>
            <Button
              variant={statusFilter === 'active' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setStatusFilter('active')}
            >
              Active ({activeRulesCount})
            </Button>
            <Button
              variant={statusFilter === 'inactive' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setStatusFilter('inactive')}
            >
              Inactive ({totalRulesCount - activeRulesCount})
            </Button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Card variant="danger" className="mb-6">
          <div className="flex items-center mb-4">
            <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
            <h3 className="text-white font-medium">Error Loading Rules</h3>
          </div>
          <p className="text-red-300 mb-4">{error}</p>
          <Button 
            variant="outline" 
            onClick={() => loadRules()}
          >
            Retry Loading
          </Button>
        </Card>
      )}

      {/* Rules List */}
      <Card>
        {rulesLoading ? (
          <div className="flex items-center justify-center p-12">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-neutral-400">Loading your privacy rules...</p>
            </div>
          </div>
        ) : filteredRules.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-400/20 to-fuchsia-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-cyan-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">
              {searchTerm || statusFilter !== 'all' ? 'No rules found' : 'No rules created yet'}
            </h3>
            <p className="text-neutral-400 mb-6 max-w-md mx-auto">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Create your first privacy rule to start controlling how messages reach you'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <Button 
                variant="gradient" 
                leftIcon={<Plus className="h-4 w-4" />}
                onClick={() => setShowForm(true)}
              >
                Create Your First Rule
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-hidden">
            <div className="grid gap-4">
              {/* Add a small demo/test tool for rules on the page */}
              <div className="p-4 rounded-md border border-neutral-700/40 bg-neutral-900/20 mb-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-neutral-300">Try a quick test message against your rules</div>
                  <Button variant="ghost" size="sm" onClick={() => navigate('/app/test')}>Run Test</Button>
                </div>
              </div>
               {filteredRules.map(rule => (
                 <div 
                   key={rule.id} 
                   className="group p-4 rounded-lg border border-neutral-700/50 bg-neutral-800/30 hover:bg-neutral-800/50 hover:border-neutral-600/50 transition-all duration-200"
                 >
                   <div className="flex items-start justify-between mb-3">
                     <div className="flex-1 min-w-0">
                       <div className="flex items-center gap-3 mb-2">
                         <h3 className="text-lg font-semibold text-white truncate">{rule.name}</h3>
                         <StatusBadge active={rule.isActive} />
                         <PriorityBadge priority={rule.priority} />
                       </div>
                       {rule.description && (
                         <p className="text-neutral-400 text-sm mb-3">{rule.description}</p>
                       )}
                       <div className="flex items-center gap-4 text-xs text-neutral-500">
                         <div className="flex items-center gap-1">
                           <Filter className="h-3 w-3" />
                           {rule.conditions.length} conditions
                         </div>
                         <div className="flex items-center gap-1">
                           <Settings className="h-3 w-3" />
                           {rule.actions.length} actions
                         </div>
                         <div className="flex items-center gap-1">
                           <Clock className="h-3 w-3" />
                           {new Date(Number(rule.createdAt) / 1000000).toLocaleDateString()}
                         </div>
                       </div>
                     </div>
                     
                     <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                       <Button
                         variant="ghost"
                         size="sm"
                         onClick={() => handleEditRule(rule)}
                         title="Edit rule"
                       >
                         <Edit3 className="h-4 w-4" />
                       </Button>
                       <Button
                         variant="ghost"
                         size="sm"
                         onClick={() => handleToggleRule(rule.id, !rule.isActive)}
                         title={rule.isActive ? 'Disable rule' : 'Enable rule'}
                       >
                         {rule.isActive ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                       </Button>
                       <Button
                         variant="ghost"
                         size="sm"
                         onClick={() => handleDeleteRule(rule.id)}
                         title="Delete rule"
                         className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                       >
                         <Trash2 className="h-4 w-4" />
                       </Button>
                     </div>
                   </div>
                 </div>
               ))}
             </div>
           </div>
        )}
      </Card>

      {/* SlideOver for create/edit */}
      <CreateRuleSlideOver 
        isOpen={showForm} 
        onClose={() => { 
          setShowForm(false); 
          setEditingRule(null); 
        }} 
      />
    </div>
  );
};

export default Rules;
