import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  StatsCard, 
  GlassCard, 
  GradientCard 
} from '../components/UI/Card';
import Button from '../components/UI/Button';
import { useClypr } from '../hooks/useClypr';
import { 
  TrendingUp, 
  Shield, 
  MessageSquare, 
  Zap, 
  Plus, 
  Activity,
  BarChart3,
  Settings,
  ArrowRight,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Bell
} from 'lucide-react';
import { cn } from '../utils/cn';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const Dashboard = () => {
  const navigate = useNavigate();
  const { 
    isAuthenticated, 
    rules, 
    rulesLoading,
    stats, 
    statsLoading,
    loadStats,
    loadRules,
    error,
    clearError,
    myUsername,
    channels,
    channelsLoading,
    messages,
    messagesLoading,
    messagesAttempted,
    loadMessages,
    isDataReady
  } = useClypr();

  (React as any).useEffect(() => {
    if (!isAuthenticated) return;

    // Load messages for dashboard activity visualization only when we don't already have messages
    // (useClypr.loadMessages is safe to call and will no-op if the service isn't ready)
    if (!messagesLoading && !messagesAttempted && (!messages || messages.length === 0)) {
      loadMessages().catch(() => {});
    }
  // Re-run when auth or relevant loaders/functions change so we catch service initialization timing
  }, [isAuthenticated, messagesLoading, messagesAttempted, messages?.length, loadMessages]);

  const activeRulesCount = rules.filter(rule => rule.isActive).length;
  // Normalize potential BigInt stats values to numbers for safe arithmetic/rendering
  const totalMessages = typeof stats?.messagesCount === 'bigint' ? Number(stats!.messagesCount) : (stats?.messagesCount || 0);
  const deliveredMessages = typeof stats?.deliveredCount === 'bigint' ? Number(stats!.deliveredCount) : (stats?.deliveredCount || 0);
  const blockedMessages = typeof stats?.blockedCount === 'bigint' ? Number(stats!.blockedCount) : (stats?.blockedCount || 0);
  const connectedChannels = channels?.length || 0;

  const getSystemStatus = () => {
    if (!isAuthenticated) return { status: 'disconnected', label: 'Not Connected', color: 'text-red-400' };
    if (rulesLoading || statsLoading) return { status: 'loading', label: 'Loading...', color: 'text-yellow-400' };
    if (error) return { status: 'error', label: 'Error', color: 'text-red-400' };
    return { status: 'operational', label: 'Operational', color: 'text-green-400' };
  };

  const systemStatus = getSystemStatus();

  const handleCreateRule = () => navigate('/app/rules');
  const handleConnectChannel = () => navigate('/app/channels');
  const handleViewAllRules = () => navigate('/app/rules');
  const handleViewMessages = () => navigate('/app/messages');

  if (!isAuthenticated) {
    return (
      <div className="animate-fade-in">
        <div className="mb-6">
          <h1 className="text-3xl font-display font-bold text-white mb-2">Dashboard</h1>
          <p className="text-neutral-400">Welcome to your Clypr Privacy Agent</p>
        </div>
        <GlassCard>
          <div className="text-center py-8">
            <Shield className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">Authentication Required</h3>
            <p className="text-neutral-400 mb-4">Please log in to access your privacy dashboard and manage your communication rules.</p>
            <Button variant="gradient" onClick={() => navigate('/login')}>
              Sign In to Continue
            </Button>
          </div>
        </GlassCard>
      </div>
    );
  }

  // Show loading state if data is not ready yet or if actively loading
  if (!isDataReady() || statsLoading || rulesLoading) {
    return (
      <div className="animate-fade-in">
        <div className="mb-6">
          <h1 className="text-3xl font-display font-bold text-white mb-2">Dashboard</h1>
          <p className="text-neutral-400">Loading your privacy analytics...</p>
        </div>

        {/* Alias card placeholder while loading */}
        {myUsername && (
          <div className="mb-6">
            <GradientCard>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-neutral-400 mb-1">Your Clypr Identity</div>
                  <div className="text-xl font-mono font-semibold text-white">@{myUsername}</div>
                  <div className="text-xs text-cyan-400 mt-1">Active Privacy Agent</div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-400/20 to-fuchsia-500/20 rounded-lg flex items-center justify-center">
                  <Shield className="h-6 w-6 text-cyan-400" />
                </div>
              </div>
            </GradientCard>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[0,1,2,3].map(i => (
            <Card key={i} className="animate-pulse">
              <div className="h-20 bg-neutral-800 rounded-lg mb-3" />
              <div className="h-4 bg-neutral-800 rounded w-3/4" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="animate-fade-in">
        <div className="mb-6">
          <h1 className="text-3xl font-display font-bold text-white mb-2">Dashboard</h1>
          <p className="text-neutral-400">There was an issue loading your data</p>
        </div>
        
        {myUsername && (
          <div className="mb-6">
            <GradientCard>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-neutral-400 mb-1">Your Clypr Identity</div>
                  <div className="text-xl font-mono font-semibold text-white">@{myUsername}</div>
                  <div className="text-sm text-cyan-400">Active Privacy Agent • {connectedChannels} channels connected</div>
                </div>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={() => navigator.clipboard.writeText(myUsername)}
                >
                  Copy Alias
                </Button>
              </div>
            </GradientCard>
          </div>
        )}
        
        <Card variant="outlined">
          <div className="flex items-center mb-4">
            <XCircle className="h-5 w-5 text-red-400 mr-2" />
            <h3 className="text-white font-medium">Connection Error</h3>
          </div>
          <p className="text-red-300 mb-4">{error}</p>
          <Button 
            variant="outline" 
            onClick={() => { clearError(); loadStats(); loadRules(); }}
          >
            Retry Connection
          </Button>
        </Card>
      </div>
    );
  }

  // Enhanced chart data processing
  const nsToMs = (ns: number | bigint) => {
    if (typeof ns === 'bigint') {
      return Number(ns / 1_000_000n);
    }
    // If value is very large, assume it's nanoseconds and convert to ms.
    if (ns > 1e15) {
      return Math.floor(ns / 1e6);
    }
    return Math.floor(ns);
  };
  const startOfDay = (ms: number) => new Date(new Date(ms).setHours(0, 0, 0, 0)).getTime();
  const dayMs = 24 * 60 * 60 * 1000;
  const todayStart = startOfDay(Date.now());
  const buckets = Array.from({ length: 7 }, (_, i) => todayStart - (6 - i) * dayMs);
  
  type DayPoint = { day: number; delivered: number; blocked: number };
  const series: DayPoint[] = buckets.map(day => ({ day, delivered: 0, blocked: 0 }));
  
  // Normalize message timestamps to millisecond numbers to avoid mixing BigInt and Number
  const normalizedMessages = (messages || []).map(msg => {
    const m: any = msg ?? {};

    // Normalize timestamp
    const ts = m.timestamp ?? m.timestampMs;
    let tsMs: number;
    if (typeof ts === 'bigint') {
      tsMs = Number(ts / 1_000_000n);
    } else if (typeof ts === 'number') {
      tsMs = ts > 1e15 ? Math.floor(ts / 1e6) : Math.floor(ts);
    } else {
      tsMs = Date.now();
    }

    // Normalize status: backend may return variant objects like { delivered: null } or strings
    let statusStr = 'received';
    if (typeof m.status === 'string') {
      statusStr = m.status;
    } else if (m.status && typeof m.status === 'object') {
      const keys = Object.keys(m.status);
      if (keys.length > 0) statusStr = keys[0];
    }

    return { ...m, timestampMs: tsMs, status: statusStr };
  });

  normalizedMessages.forEach(msg => {
    const t = nsToMs((msg as any).timestamp ?? (msg as any).timestampMs);
    const d = startOfDay(t);
    const idx = buckets.indexOf(d);
    if (idx >= 0) {
      const status = (msg as any).status;
      if (status === 'delivered') series[idx].delivered += 1;
      if (status === 'blocked') series[idx].blocked += 1;
    }
  });

  const maxVal = Math.max(1, ...series.map(p => p.delivered + p.blocked));

  const topRules = rules
    .sort((a, b) => {
      if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;
      if (a.priority !== b.priority) return b.priority - a.priority;
      // Convert createdAt (likely bigint in nanoseconds) to millisecond numbers for safe subtraction
      const aCreated = typeof a.createdAt === 'bigint' ? Number(a.createdAt / 1_000_000n) : Number(a.createdAt || 0);
      const bCreated = typeof b.createdAt === 'bigint' ? Number(b.createdAt / 1_000_000n) : Number(b.createdAt || 0);
      return bCreated - aCreated;
    })
    .slice(0, 4);

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-white mb-2">Privacy Dashboard</h1>
            <p className="text-neutral-400">Monitor your communication privacy and agent performance</p>
          </div>
          <div className="flex items-center gap-3">
            <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-800/50 border", 
              systemStatus.status === 'operational' && "border-green-500/30",
              systemStatus.status === 'error' && "border-red-500/30",
              systemStatus.status === 'loading' && "border-yellow-500/30"
            )}>
              <div className={cn("w-2 h-2 rounded-full", 
                systemStatus.status === 'operational' && "bg-green-400",
                systemStatus.status === 'error' && "bg-red-400",
                systemStatus.status === 'loading' && "bg-yellow-400 animate-pulse"
              )} />
              <span className={cn("text-sm font-medium", systemStatus.color)}>
                {systemStatus.label}
              </span>
            </div>
          </div>
        </div>

        {/* Identity Card */}
        {myUsername && (
          <GradientCard className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-neutral-400 mb-1">Your Clypr Identity</div>
                <div className="text-2xl font-mono font-semibold text-white mb-1">@{myUsername}</div>
                <div className="text-sm text-cyan-400">Active Privacy Agent • {connectedChannels} channels connected</div>
              </div>
              <div className="flex items-center gap-3">
                <Button 
                  variant="glass" 
                  size="sm" 
                  onClick={() => navigator.clipboard.writeText(myUsername)}
                >
                  Copy Alias
                </Button>
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-400/20 to-fuchsia-500/20 rounded-lg flex items-center justify-center">
                  <Shield className="h-6 w-6 text-cyan-400" />
                </div>
              </div>
            </div>
          </GradientCard>
        )}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard>
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400/20 to-cyan-400/10 rounded-lg flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-cyan-400" />
            </div>
            <TrendingUp className="h-4 w-4 text-green-400" />
          </div>
          <div className="text-2xl font-bold text-white mb-1">{totalMessages.toLocaleString()}</div>
          <div className="text-sm text-neutral-400">Total Messages</div>
          <div className="text-xs text-cyan-400 mt-2">Processed by your agent</div>
        </StatsCard>

        <StatsCard>
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-400/20 to-green-400/10 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-400" />
            </div>
            <div className="text-xs text-green-400 font-medium">
              {totalMessages > 0 ? Math.round((deliveredMessages / totalMessages) * 100) : 0}%
            </div>
          </div>
          <div className="text-2xl font-bold text-white mb-1">{deliveredMessages.toLocaleString()}</div>
          <div className="text-sm text-neutral-400">Delivered</div>
          <div className="text-xs text-green-400 mt-2">Successfully routed</div>
        </StatsCard>

        <StatsCard>
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-400/20 to-red-400/10 rounded-lg flex items-center justify-center">
              <XCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="text-xs text-red-400 font-medium">
              {totalMessages > 0 ? Math.round((blockedMessages / totalMessages) * 100) : 0}%
            </div>
          </div>
          <div className="text-2xl font-bold text-white mb-1">{blockedMessages.toLocaleString()}</div>
          <div className="text-sm text-neutral-400">Blocked</div>
          <div className="text-xs text-red-400 mt-2">Filtered by rules</div>
        </StatsCard>

        <StatsCard>
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-fuchsia-400/20 to-fuchsia-400/10 rounded-lg flex items-center justify-center">
              <Zap className="h-5 w-5 text-fuchsia-400" />
            </div>
            <div className="text-xs text-fuchsia-400 font-medium">
              {activeRulesCount} active
            </div>
          </div>
          <div className="text-2xl font-bold text-white mb-1">{rules.length}</div>
          <div className="text-sm text-neutral-400">Privacy Rules</div>
          <div className="text-xs text-fuchsia-400 mt-2">Protecting your inbox</div>
        </StatsCard>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Chart */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">Message Activity</h3>
              <p className="text-sm text-neutral-400">Last 7 days of communication flow</p>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              rightIcon={<ArrowRight className="h-4 w-4" />}
              onClick={handleViewMessages}
            >
              View All
            </Button>
          </div>

                     {messagesLoading ? (
             <div className="h-64 flex flex-col items-center justify-center">
               <div className="relative mb-4">
                 <div className="w-12 h-12 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
                 <div className="absolute inset-0 w-12 h-12 border-2 border-fuchsia-400/30 border-t-fuchsia-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
               </div>
               <div className="text-neutral-400 text-sm">Loading activity data...</div>
               <div className="mt-2 text-xs text-neutral-500">Preparing your communication insights</div>
             </div>
           ) : (messagesAttempted && messages && messages.length > 0) ? (
              <div>
                <div className="h-64 mb-6">
                  <ResponsiveContainer width="100%" height={256}>
                    <BarChart
                      data={series.map(p => ({
                        day: new Date(p.day).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                        delivered: p.delivered,
                        blocked: p.blocked,
                        total: p.delivered + p.blocked
                      }))}
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                      <defs>
                        <linearGradient id="deliveredGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity={0.8} />
                          <stop offset="100%" stopColor="#059669" stopOpacity={0.6} />
                        </linearGradient>
                        <linearGradient id="blockedGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#ef4444" stopOpacity={0.8} />
                          <stop offset="100%" stopColor="#dc2626" stopOpacity={0.6} />
                        </linearGradient>
                        <filter id="glow">
                          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                          <feMerge> 
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                          </feMerge>
                        </filter>
                      </defs>
                      
                      <XAxis 
                        dataKey="day" 
                        tick={{ fill: '#9ca3af', fontSize: 11, fontWeight: 500 }} 
                        axisLine={{ stroke: '#374151', strokeWidth: 1 }}
                        tickLine={false}
                      />
                      <YAxis 
                        tick={{ fill: '#9ca3af', fontSize: 11, fontWeight: 500 }} 
                        allowDecimals={false}
                        axisLine={{ stroke: '#374151', strokeWidth: 1 }}
                        tickLine={false}
                        grid={{ stroke: '#374151', strokeWidth: 0.5, strokeDasharray: '3 3' }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          background: 'rgba(11, 18, 32, 0.95)', 
                          border: '1px solid #374151',
                          borderRadius: '12px', 
                          color: '#fff',
                          backdropFilter: 'blur(10px)',
                          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)'
                        }}
                        labelStyle={{ color: '#9ca3af', fontWeight: 600 }}
                        formatter={(value, name) => [
                          <span style={{ color: name === 'delivered' ? '#10b981' : '#ef4444', fontWeight: 600 }}>
                            {value}
                          </span>,
                          name === 'delivered' ? 'Delivered' : 'Blocked'
                        ]}
                      />
                      <Bar 
                        dataKey="delivered" 
                        fill="url(#deliveredGradient)" 
                        radius={[8, 8, 0, 0]}
                        stroke="#10b981"
                        strokeWidth={1}
                        filter="url(#glow)"
                      />
                      <Bar 
                        dataKey="blocked" 
                        fill="url(#blockedGradient)" 
                        radius={[8, 8, 0, 0]}
                        stroke="#ef4444"
                        strokeWidth={1}
                        filter="url(#glow)"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
               
               <div className="flex items-center justify-center gap-8 text-sm">
                 <div className="flex items-center gap-3">
                   <div className="relative">
                     <div className="w-4 h-4 bg-gradient-to-br from-green-400 to-green-600 rounded-full shadow-lg shadow-green-500/25" />
                     <div className="absolute inset-0 w-4 h-4 bg-green-400 rounded-full animate-ping opacity-75" />
                   </div>
                   <span className="text-neutral-200 font-medium">Delivered</span>
                 </div>
                 <div className="flex items-center gap-3">
                   <div className="relative">
                     <div className="w-4 h-4 bg-gradient-to-br from-red-400 to-red-600 rounded-full shadow-lg shadow-red-500/25" />
                     <div className="absolute inset-0 w-4 h-4 bg-red-400 rounded-full animate-ping opacity-75" />
                   </div>
                   <span className="text-neutral-200 font-medium">Blocked</span>
                 </div>
               </div>
               
               {/* Activity Summary */}
               <div className="mt-6 p-4 bg-gradient-to-r from-neutral-800/50 to-neutral-700/50 rounded-xl border border-neutral-600/30">
                 <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                     <div className="w-8 h-8 bg-gradient-to-br from-cyan-400/20 to-fuchsia-500/20 rounded-lg flex items-center justify-center">
                       <Activity className="h-4 w-4 text-cyan-400" />
                     </div>
                     <div>
                       <div className="text-sm font-medium text-neutral-300">Activity Summary</div>
                       <div className="text-xs text-neutral-400">Last 7 days</div>
                     </div>
                   </div>
                   <div className="text-right">
                     <div className="text-lg font-bold text-white">
                       {series.reduce((sum, day) => sum + day.delivered + day.blocked, 0)}
                     </div>
                     <div className="text-xs text-neutral-400">Total Messages</div>
                   </div>
                 </div>
               </div>
             </div>
           ) : (
                           <div className="h-64 flex flex-col items-center justify-center text-center">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-cyan-400/10 to-fuchsia-500/10 rounded-full flex items-center justify-center border border-neutral-700/50">
                    <Activity className="h-8 w-8 text-neutral-500" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-cyan-400 to-fuchsia-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  </div>
                </div>
                <h4 className="text-white font-semibold mb-3 text-lg">No Activity Yet</h4>
                <p className="text-neutral-400 text-sm mb-6 max-w-sm">
                  Your message activity chart will appear here once you start receiving communications through your connected channels
                </p>
                <div className="flex items-center gap-4">
                  <Button 
                    variant="gradient" 
                    size="sm" 
                    onClick={handleConnectChannel}
                    className="shadow-lg shadow-cyan-500/25"
                  >
                    Connect Channel
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleCreateRule}
                  >
                    Create Rule
                  </Button>
                </div>
                
                {/* Decorative elements */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-8 left-8 w-2 h-2 bg-cyan-400/20 rounded-full animate-pulse" />
                  <div className="absolute top-16 right-12 w-1 h-1 bg-fuchsia-500/30 rounded-full animate-pulse delay-1000" />
                  <div className="absolute bottom-20 left-16 w-1.5 h-1.5 bg-cyan-400/15 rounded-full animate-pulse delay-500" />
                  <div className="absolute bottom-12 right-8 w-1 h-1 bg-fuchsia-500/25 rounded-full animate-pulse delay-1500" />
                </div>
              </div>
           )}
         </Card>

        {/* Quick Actions & Rules */}
        <div className="space-y-6">
          {/* Top Rules */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Active Rules</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                rightIcon={<ArrowRight className="h-4 w-4" />}
                onClick={handleViewAllRules}
              >
                View All
              </Button>
            </div>
            
            <div className="space-y-3">
              {topRules.length > 0 ? (
                topRules.map((rule) => (
                  <div key={rule.id} className="flex items-center justify-between p-3 rounded-lg bg-neutral-800/50 border border-neutral-700/50">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white truncate">{rule.name}</div>
                      <div className="text-xs text-neutral-400">Priority {rule.priority}</div>
                    </div>
                    <div className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      rule.isActive 
                        ? "bg-green-500/20 text-green-400 border border-green-500/30" 
                        : "bg-red-500/20 text-red-400 border border-red-500/30"
                    )}>
                      {rule.isActive ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <Shield className="h-8 w-8 text-neutral-600 mx-auto mb-3" />
                  <p className="text-neutral-400 text-sm mb-3">No rules created yet</p>
                  <Button variant="outline" size="sm" onClick={handleCreateRule}>
                    Create First Rule
                  </Button>
                </div>
              )}
            </div>
          </Card>

          {/* Quick Actions */}
          <Card>
            <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button 
                variant="gradient" 
                fullWidth 
                leftIcon={<Plus className="h-4 w-4" />}
                onClick={handleCreateRule}
              >
                Create New Rule
              </Button>
              <Button 
                variant="secondary" 
                fullWidth 
                leftIcon={<Zap className="h-4 w-4" />}
                onClick={handleConnectChannel}
              >
                Connect Channel
              </Button>
              <Button 
                variant="ghost" 
                fullWidth 
                leftIcon={<BarChart3 className="h-4 w-4" />}
                onClick={handleViewMessages}
              >
                View Analytics
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
