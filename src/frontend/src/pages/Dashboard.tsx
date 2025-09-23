import React from 'react';
import styled from 'styled-components';
import Card from '../components/UI/Card';
import Text from '../components/UI/Text';
import Button from '../components/UI/Button';

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

const StatusBadge = styled.span<{ active?: boolean }>`
  display: inline-block;
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  background-color: ${props => props.active ? '#E8F5E9' : '#FFEBEE'};
  color: ${props => props.active ? '#388E3C' : '#D32F2F'};
`;

const CardFooter = styled.div`
  border-top: 1px solid var(--color-border);
  padding-top: var(--space-4);
  margin-top: var(--space-4);
  display: flex;
  justify-content: flex-end;
`;

const Dashboard: React.FC = () => {
  return (
    <div>
      <Text as="h1">Dashboard</Text>
      
      <StatsSection>
        <StatCard>
          <StatValue>143</StatValue>
          <StatLabel>Messages Processed</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>12</StatValue>
          <StatLabel>Active Rules</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>3</StatValue>
          <StatLabel>Connected Channels</StatLabel>
        </StatCard>
      </StatsSection>
      
      <DashboardContainer>
        <ActivityCard>
          <SectionTitle>Message Activity</SectionTitle>
          <Text>Chart visualization will be displayed here</Text>
        </ActivityCard>
        
        <RulesCard>
          <SectionTitle>Top Rules</SectionTitle>
          <RulesList>
            <RuleItem>
              <RuleName>Email Privacy Filter</RuleName>
              <StatusBadge active>Active</StatusBadge>
            </RuleItem>
            <RuleItem>
              <RuleName>Social Media Anonymizer</RuleName>
              <StatusBadge active>Active</StatusBadge>
            </RuleItem>
            <RuleItem>
              <RuleName>Location Data Blocker</RuleName>
              <StatusBadge active>Active</StatusBadge>
            </RuleItem>
            <RuleItem>
              <RuleName>Browser Fingerprint Masker</RuleName>
              <StatusBadge>Inactive</StatusBadge>
            </RuleItem>
          </RulesList>
          <CardFooter>
            <Button variant="secondary" size="sm">View All Rules</Button>
          </CardFooter>
        </RulesCard>
        
        <Card>
          <SectionTitle>Quick Actions</SectionTitle>
          <div>
            <Button fullWidth style={{ marginBottom: 'var(--space-3)' }}>Create New Rule</Button>
            <Button variant="secondary" fullWidth style={{ marginBottom: 'var(--space-3)' }}>Connect Channel</Button>
            <Button variant="ghost" fullWidth>System Diagnostics</Button>
          </div>
        </Card>
      </DashboardContainer>
    </div>
  );
};

export default Dashboard;
