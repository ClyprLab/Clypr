import styled from 'styled-components';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/UI/Card';
import Text from '../components/UI/Text';
import Button from '../components/UI/Button';
import { useClypr } from '../hooks/useClypr';
import type { Stats, Rule } from '../services/ClyprService';

const DashboardContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: var(--space-6);
  
  @media (max-width: 1200px) {
    grid-template-columns: 1fr 1fr;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const StatsSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
`;

const StatCard = styled(Card)`
  padding: var(--space-4);
`;

const StatValue = styled.div`
  font-size: var(--font-size-3xl);
  font-weight: 600;
  margin-bottom: var(--space-2);
  font-family: var(--font-mono);
`;

const StatLabel = styled.div`
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
`;

const SectionTitle = styled.h3`
  margin-bottom: var(--space-4);
  font-family: var(--font-mono);
`;

const ActivityCard = styled(Card)`
  grid-column: span 2;
  height: 320px;
  
  @media (max-width: 768px) {
    grid-column: span 1;
  }
`;

const RulesCard = styled(Card)`
  display: flex;
  flex-direction: column;
`;

const RulesList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  flex: 1;
`;

const RuleItem = styled.li`
  padding: var(--space-3) 0;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  &:last-child {
    border-bottom: none;
  }
`;

const RuleName = styled.div`
  font-weight: 500;
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  
  &.active {
    background-color: #E8F5E9;
    color: #388E3C;
  }
  
  &.inactive {
    background-color: #FFEBEE;
    color: #D32F2F;
  }
`;

const CardFooter = styled.div`
  border-top: 1px solid var(--color-border);
  padding-top: var(--space-4);
  margin-top: var(--space-4);
  display: flex;
  justify-content: flex-end;
`;

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
    clearError
  } = useClypr();

  // Load data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      if (!statsLoading && !stats) {
        loadStats();
      }
      if (!rulesLoading && rules.length === 0) {
        loadRules();
      }
    }
  }, [isAuthenticated]);

  // Calculate active rules count
  const activeRulesCount = rules.filter(rule => rule.isActive).length;

  // System diagnostics
  const getSystemStatus = () => {
    if (!isAuthenticated) return 'Not Connected';
    if (rulesLoading || statsLoading) return 'Loading...';
    if (error) return 'Error';
    return 'Operational';
  };

  const handleCreateRule = () => {
    navigate('/app/rules');
  };

  const handleConnectChannel = () => {
    navigate('/app/channels');
  };

  const handleViewAllRules = () => {
    navigate('/app/rules');
  };

  const handleSystemDiagnostics = () => {
    // For now, just show current system status
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
        <StatsSection>
          <StatCard>
            <StatValue>-</StatValue>
            <StatLabel>Loading...</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>-</StatValue>
            <StatLabel>Loading...</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>-</StatValue>
            <StatLabel>Loading...</StatLabel>
          </StatCard>
        </StatsSection>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Text as="h1">Dashboard</Text>
        <Card>
          <Text color="error">{error}</Text>
          <Button onClick={() => { clearError(); loadStats(); loadRules(); }}>Retry</Button>
        </Card>
      </div>
    );
  }

  // Show top 4 rules, prioritize active ones
  const topRules = rules
    .sort((a, b) => {
      // Active rules first, then by priority, then by creation date
      if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;
      if (a.priority !== b.priority) return b.priority - a.priority;
      return Number(b.createdAt - a.createdAt);
    })
    .slice(0, 4);
  return (
    <div>
      <Text as="h1">Dashboard</Text>
      
      <StatsSection>
        <StatCard>
          <StatValue>{stats?.messagesCount || 0}</StatValue>
          <StatLabel>Messages Processed</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{activeRulesCount}</StatValue>
          <StatLabel>Active Rules</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats?.channelsCount || 0}</StatValue>
          <StatLabel>Connected Channels</StatLabel>
        </StatCard>
      </StatsSection>
      
      <DashboardContainer>
        <ActivityCard>
          <SectionTitle>Message Activity</SectionTitle>
          {stats ? (
            <div>
              <Text>
                <strong>Delivered:</strong> {stats.deliveredCount || 0} | 
                <strong> Blocked:</strong> {stats.blockedCount || 0}
              </Text>
              <Text style={{ marginTop: 'var(--space-2)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                Chart visualization coming soon
              </Text>
            </div>
          ) : (
            <div>
              <Text>
                <strong>Delivered:</strong> 0 | 
                <strong> Blocked:</strong> 0
              </Text>
              <Text style={{ marginTop: 'var(--space-2)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                No message data yet - stats will appear once you start processing messages
              </Text>
            </div>
          )}
        </ActivityCard>
        
        <RulesCard>
          <SectionTitle>Top Rules</SectionTitle>
          <RulesList>
            {topRules.length > 0 ? (
              topRules.map((rule) => (
                <RuleItem key={rule.id}>
                  <RuleName>{rule.name}</RuleName>
                  <StatusBadge className={rule.isActive ? 'active' : 'inactive'}>
                    {rule.isActive ? 'Active' : 'Inactive'}
                  </StatusBadge>
                </RuleItem>
              ))
            ) : (
              <RuleItem>
                <RuleName>No rules created yet</RuleName>
                <StatusBadge className="inactive">-</StatusBadge>
              </RuleItem>
            )}
          </RulesList>
          <CardFooter>
            <Button variant="secondary" size="sm" onClick={handleViewAllRules}>
              View All Rules
            </Button>
          </CardFooter>
        </RulesCard>
        
        <Card>
          <SectionTitle>Quick Actions</SectionTitle>
          <div>
            <Button fullWidth style={{ marginBottom: 'var(--space-3)' }} onClick={handleCreateRule}>
              Create New Rule
            </Button>
            <Button variant="secondary" fullWidth style={{ marginBottom: 'var(--space-3)' }} onClick={handleConnectChannel}>
              Connect Channel
            </Button>
            <Button variant="ghost" fullWidth onClick={handleSystemDiagnostics}>
              System Diagnostics
            </Button>
          </div>
        </Card>
      </DashboardContainer>
    </div>
  );
};

export default Dashboard;
