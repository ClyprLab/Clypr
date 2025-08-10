import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/UI/Card';
import Text from '../components/UI/Text';
import Button from '../components/UI/Button';
import { useClypr } from '../hooks/useClypr';

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
    messagesLoading
  } = useClypr();

  React.useEffect(() => {
    if (isAuthenticated) {
      if (!statsLoading && !stats) {
        loadStats();
      }
      if (!rulesLoading && rules.length === 0) {
        loadRules();
      }
    }
  }, [isAuthenticated]);

  const activeRulesCount = rules.filter(rule => rule.isActive).length;

  const getSystemStatus = () => {
    if (!isAuthenticated) return 'Not Connected';
    if (rulesLoading || statsLoading) return 'Loading...';
    if (error) return 'Error';
    return 'Operational';
  };

  const handleCreateRule = () => navigate('/app/rules');
  const handleConnectChannel = () => navigate('/app/channels');
  const handleViewAllRules = () => navigate('/app/rules');
  const handleSystemDiagnostics = () => {
    alert(`System Status: ${getSystemStatus()}\n\nRules: ${rules.length} total, ${activeRulesCount} active\nAuthenticated: ${isAuthenticated ? 'Yes' : 'No'}\nError: ${error || 'None'}`);
  };

  if (!isAuthenticated) {
    return (
      <div>
        <Text as="h1">Dashboard</Text>
        <Card>
          <Text>Please log in to view your dashboard.</Text>
        </Card>
      </div>
    );
  }

  if (statsLoading || rulesLoading) {
    return (
      <div>
        <Text as="h1">Dashboard</Text>
        {/* Alias card placeholder while loading */}
        {myUsername && (
          <div className="mt-2 mb-4">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-neutral-400">Your Clypr alias</div>
                  <div className="text-xl font-mono font-semibold">@{myUsername}</div>
                </div>
              </div>
            </Card>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[0,1,2].map(i => (
            <Card key={i}>
              <div className="text-3xl font-bold font-mono mb-2">-</div>
              <div className="text-sm text-neutral-400">Loading...</div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Text as="h1">Dashboard</Text>
        {myUsername && (
          <div className="mt-2 mb-4">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-neutral-400">Your Clypr alias</div>
                  <div className="text-xl font-mono font-semibold">@{myUsername}</div>
                </div>
                <Button variant="secondary" size="sm" onClick={() => navigator.clipboard.writeText(myUsername)}>Copy</Button>
              </div>
            </Card>
          </div>
        )}
        <Card>
          <Text color="red">{error}</Text>
          <div className="mt-4">
            <Button onClick={() => { clearError(); loadStats(); loadRules(); }}>Retry</Button>
          </div>
        </Card>
      </div>
    );
  }

  const topRules = rules
    .sort((a, b) => {
      if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;
      if (a.priority !== b.priority) return b.priority - a.priority;
      return Number(b.createdAt - a.createdAt);
    })
    .slice(0, 4);

  // Simple 7-day delivered vs blocked chart data from messages
  const nsToMs = (ns: bigint) => Number(ns / 1_000_000n);
  const startOfDay = (ms: number) => new Date(new Date(ms).setHours(0, 0, 0, 0)).getTime();
  const dayMs = 24 * 60 * 60 * 1000;
  const todayStart = startOfDay(Date.now());
  const buckets = Array.from({ length: 7 }, (_, i) => todayStart - (6 - i) * dayMs);
  type DayPoint = { day: number; delivered: number; blocked: number };
  const series: DayPoint[] = buckets.map(day => ({ day, delivered: 0, blocked: 0 }));
  (messages || []).forEach(msg => {
    const t = nsToMs(msg.timestamp);
    const d = startOfDay(t);
    const idx = buckets.indexOf(d);
    if (idx >= 0) {
      if (msg.status === 'delivered') series[idx].delivered += 1;
      if (msg.status === 'blocked') series[idx].blocked += 1;
    }
  });
  const maxVal = Math.max(1, ...series.map(p => p.delivered + p.blocked));

  // Chart dimensions
  const chartH = 160;
  const barW = 16;
  const gap = 12;
  const pad = 10;
  const chartW = pad * 2 + series.length * barW + (series.length - 1) * gap;

  return (
    <div>
      <Text as="h1">Dashboard</Text>

      {/* Alias banner */}
      {myUsername && (
        <div className="mt-2 mb-6">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-neutral-400">Your Clypr alias</div>
                <div className="text-xl font-mono font-semibold">@{myUsername}</div>
              </div>
              <Button variant="secondary" size="sm" onClick={() => navigator.clipboard.writeText(myUsername)}>Copy</Button>
            </div>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <Card>
          <div className="text-3xl font-bold font-mono mb-2">{stats?.messagesCount || 0}</div>
          <div className="text-sm text-neutral-400">Messages Processed</div>
        </Card>
        <Card>
          <div className="text-3xl font-bold font-mono mb-2">{activeRulesCount}</div>
          <div className="text-sm text-neutral-400">Active Rules</div>
        </Card>
        <Card>
          <div className="text-3xl font-bold font-mono mb-2">{channels?.length || 0}</div>
          <div className="text-sm text-neutral-400">Connected Channels</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 min-h-[320px]">
          <h3 className="mb-4 font-mono">Message Activity</h3>
          {(messagesLoading) ? (
            <div>
              <p className="text-sm text-neutral-400">Loading messages...</p>
            </div>
          ) : (messages && messages.length > 0) ? (
            <div>
              <svg className="w-full h-40" viewBox={`0 0 ${chartW} ${chartH}`} preserveAspectRatio="none">
                {series.map((p, i) => {
                  const total = p.delivered + p.blocked;
                  const hTotal = Math.max(2, Math.round((total / maxVal) * (chartH - 20)));
                  const hDelivered = total > 0 ? Math.round((p.delivered / total) * hTotal) : 0;
                  const hBlocked = hTotal - hDelivered;
                  const x = pad + i * (barW + gap);
                  const yTop = chartH - hTotal;
                  const yBlocked = chartH - hBlocked;
                  return (
                    <g key={i}>
                      {/* delivered (top segment) */}
                      {hDelivered > 0 && (
                        <rect x={x} y={yTop} width={barW} height={hDelivered} rx={2} fill="#22c55e" />
                      )}
                      {/* blocked (bottom segment) */}
                      {hBlocked > 0 && (
                        <rect x={x} y={yBlocked} width={barW} height={hBlocked} rx={2} fill="#ef4444" />
                      )}
                    </g>
                  );
                })}
              </svg>
              <div className="mt-2 grid grid-cols-7 gap-2 text-xs text-neutral-500">
                {series.map((p, i) => (
                  <div key={i} className="text-center">
                    {new Date(p.day).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </div>
                ))}
              </div>
              <div className="mt-4 text-sm">
                <span className="inline-flex items-center mr-4"><span className="inline-block w-3 h-3 bg-green-500 rounded-sm mr-2" />Delivered</span>
                <span className="inline-flex items-center"><span className="inline-block w-3 h-3 bg-red-500 rounded-sm mr-2" />Blocked</span>
              </div>
            </div>
          ) : (
            <div>
              <p>
                <strong>Delivered:</strong> {stats?.deliveredCount || 0} |{' '}
                <strong>Blocked:</strong> {stats?.blockedCount || 0}
              </p>
              <p className="mt-2 text-sm text-neutral-400">
                No message data yet - stats will appear once you start processing messages
              </p>
            </div>
          )}
        </Card>

        <Card>
          <h3 className="mb-4 font-mono">Top Rules</h3>
          <ul className="list-none p-0 m-0">
            {topRules.length > 0 ? (
              topRules.map((rule) => (
                <li key={rule.id} className="py-3 border-b border-neutral-800 flex items-center justify-between last:border-b-0">
                  <div className="font-medium">{rule.name}</div>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs ${rule.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {rule.isActive ? 'Active' : 'Inactive'}
                  </span>
                </li>
              ))
            ) : (
              <li className="py-3 border-b border-neutral-800 flex items-center justify-between last:border-b-0">
                <div className="font-medium">No rules created yet</div>
                <span className="inline-block px-2 py-1 rounded-full text-xs bg-red-100 text-red-700">-</span>
              </li>
            )}
          </ul>
          <div className="border-t border-neutral-800 pt-4 mt-4 flex justify-end">
            <Button variant="secondary" size="sm" onClick={handleViewAllRules}>
              View All Rules
            </Button>
          </div>
        </Card>

        <Card>
          <h3 className="mb-4 font-mono">Quick Actions</h3>
          <div>
            <div className="mb-3">
              <Button fullWidth onClick={handleCreateRule}>Create New Rule</Button>
            </div>
            <div className="mb-3">
              <Button variant="secondary" fullWidth onClick={handleConnectChannel}>Connect Channel</Button>
            </div>
            <Button variant="ghost" fullWidth onClick={handleSystemDiagnostics}>System Diagnostics</Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
