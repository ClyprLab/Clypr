import React from 'react';
import styled from 'styled-components';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';
import Text from '../components/UI/Text';

const ChannelsContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-6);
`;

const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-4);
`;

const ChannelCard = styled(Card)`
  display: flex;
  flex-direction: column;
`;

const ChannelHeader = styled.div`
  padding: var(--space-4);
  border-bottom: 1px solid var(--color-border);
`;

const ChannelTitle = styled.h3`
  font-size: var(--font-size-md);
  margin: 0;
  margin-bottom: var(--space-1);
  display: flex;
  align-items: center;
`;

const ChannelIcon = styled.span`
  margin-right: var(--space-2);
`;

const ChannelType = styled.div`
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
`;

const ChannelContent = styled.div`
  padding: var(--space-4);
  flex: 1;
`;

const ChannelProperty = styled.div`
  margin-bottom: var(--space-3);
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const PropertyLabel = styled.div`
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-1);
`;

const PropertyValue = styled.div`
  font-family: var(--font-mono);
  font-size: var(--font-size-sm);
  word-break: break-all;
`;

const ChannelStatus = styled.span<{ active?: boolean }>`
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${(props: { active?: boolean }) => props.active ? '#4CAF50' : '#F44336'};
  margin-right: var(--space-2);
`;

const ChannelFooter = styled.div`
  padding: var(--space-4);
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
`;

const EmptyState = styled.div`
  padding: var(--space-6);
  text-align: center;
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-md);
`;

const EmptyStateIcon = styled.div`
  font-size: var(--font-size-3xl);
  margin-bottom: var(--space-4);
`;

const ButtonContainer = styled.div`
  margin-top: var(--space-4);
`;

interface Channel {
  id: string;
  name: string;
  type: string;
  icon: string;
  active: boolean;
  endpoint: string;
  lastSync: string;
  messageCount: number;
}

const Channels: React.FC = () => {
  const mockChannels: Channel[] = [
    {
      id: '1',
      name: 'Email Relay',
      type: 'SMTP',
      icon: '✉',
      active: true,
      endpoint: 'smtp://mail.clypr.ic.app',
      lastSync: '2025-07-25 14:32',
      messageCount: 243
    },
    {
      id: '2',
      name: 'SMS Gateway',
      type: 'Twilio API',
      icon: '✆',
      active: true,
      endpoint: 'api.twilio.com/v1/messages',
      lastSync: '2025-07-25 09:15',
      messageCount: 56
    },
    {
      id: '3',
      name: 'Twitter Integration',
      type: 'OAuth2',
      icon: '⟿',
      active: false,
      endpoint: 'api.twitter.com/v2/direct_messages',
      lastSync: '2025-07-23 16:45',
      messageCount: 128
    },
    {
      id: '4',
      name: 'Signal Relay',
      type: 'Signal Protocol',
      icon: '⟡',
      active: true,
      endpoint: 'signal.clypr.ic.app',
      lastSync: '2025-07-25 11:20',
      messageCount: 95
    },
    {
      id: '5',
      name: 'Add New Channel',
      type: '',
      icon: '+',
      active: false,
      endpoint: '',
      lastSync: '',
      messageCount: 0
    }
  ];
  
  return (
    <ChannelsContainer>
      <Header>
        <Text as="h1">Communication Channels</Text>
        <Button>Add New Channel</Button>
      </Header>
      
      <CardsGrid>
        {mockChannels.map(channel => (
          channel.id === '5' ? (
            // Empty card for adding new channel
            <Card key={channel.id}>
              <EmptyState>
                <EmptyStateIcon>+</EmptyStateIcon>
                <Text>Connect a new communication channel</Text>
                <ButtonContainer>
                  <Button>Add Channel</Button>
                </ButtonContainer>
              </EmptyState>
            </Card>
          ) : (
            <ChannelCard key={channel.id}>
              <ChannelHeader>
                <ChannelTitle>
                  <ChannelIcon>{channel.icon}</ChannelIcon>
                  <ChannelStatus active={channel.active} />
                  {channel.name}
                </ChannelTitle>
                <ChannelType>{channel.type}</ChannelType>
              </ChannelHeader>
              
              <ChannelContent>
                <ChannelProperty>
                  <PropertyLabel>Endpoint</PropertyLabel>
                  <PropertyValue>{channel.endpoint}</PropertyValue>
                </ChannelProperty>
                
                <ChannelProperty>
                  <PropertyLabel>Last Sync</PropertyLabel>
                  <PropertyValue>{channel.lastSync}</PropertyValue>
                </ChannelProperty>
                
                <ChannelProperty>
                  <PropertyLabel>Messages</PropertyLabel>
                  <PropertyValue>{channel.messageCount}</PropertyValue>
                </ChannelProperty>
              </ChannelContent>
              
              <ChannelFooter>
                {channel.active ? (
                  <>
                    <Button variant="secondary" size="sm">Edit</Button>
                    <Button variant="ghost" size="sm">Disable</Button>
                  </>
                ) : (
                  <>
                    <Button variant="secondary" size="sm">Edit</Button>
                    <Button size="sm">Enable</Button>
                  </>
                )}
              </ChannelFooter>
            </ChannelCard>
          )
        ))}
      </CardsGrid>
    </ChannelsContainer>
  );
};

export default Channels;
