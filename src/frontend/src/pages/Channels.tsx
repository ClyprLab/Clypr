import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';
import Text from '../components/UI/Text';
import ChannelForm from '../components/Channels/ChannelForm';
import { useClypr } from '../hooks/useClypr';
import { Channel } from '../services/ClyprService';

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

const ChannelStatus = styled.span<{ $active?: boolean }>`
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${(props) => props.$active ? '#4CAF50' : '#F44336'};
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

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: var(--space-8);
`;

const ErrorContainer = styled.div`
  padding: var(--space-3);
  background-color: #ffebee;
  border-radius: var(--radius-sm);
  margin-bottom: var(--space-4);
`;

const getChannelIcon = (channelType: Channel['channelType']): string => {
  if (typeof channelType === 'string') {
    switch (channelType) {
      case 'email': return '✉';
      case 'sms': return '✆';
      case 'webhook': return '🔗';
      case 'push': return '📱';
      default: return '📡';
    }
  } else {
    return '⚙'; // Custom channel
  }
};

const getChannelTypeName = (channelType: Channel['channelType']): string => {
  if (typeof channelType === 'string') {
    switch (channelType) {
      case 'email': return 'Email (SMTP)';
      case 'sms': return 'SMS Gateway';
      case 'webhook': return 'Webhook';
      case 'push': return 'Push Notifications';
      default: return channelType;
    }
  } else {
    return channelType.custom;
  }
};

interface ChannelGridProps {
  channels: Channel[];
  onEdit: (channel: Channel) => void;
  onDelete: (channelId: number) => void;
  onToggle: (channelId: number, isActive: boolean) => void;
  onAddNew: () => void;
}

const ChannelGrid: React.FC<ChannelGridProps> = ({ 
  channels, 
  onEdit, 
  onDelete, 
  onToggle, 
  onAddNew 
}) => {
  return (
    <CardsGrid>
      {/* Add New Channel Card */}
      <Card>
        <EmptyState>
          <EmptyStateIcon>+</EmptyStateIcon>
          <Text>Connect a new communication channel</Text>
          <ButtonContainer>
            <Button onClick={onAddNew}>Add Channel</Button>
          </ButtonContainer>
        </EmptyState>
      </Card>

      {/* Existing Channels */}
      {channels.map(channel => (
        <ChannelCard key={channel.id}>
          <ChannelHeader>
            <ChannelTitle>
              <ChannelIcon>{getChannelIcon(channel.channelType)}</ChannelIcon>
              <ChannelStatus $active={channel.isActive} />
              {channel.name}
            </ChannelTitle>
            <ChannelType>{getChannelTypeName(channel.channelType)}</ChannelType>
          </ChannelHeader>
          
          <ChannelContent>
            {channel.description && (
              <ChannelProperty>
                <PropertyLabel>Description</PropertyLabel>
                <PropertyValue>{channel.description}</PropertyValue>
              </ChannelProperty>
            )}
            
            <ChannelProperty>
              <PropertyLabel>Configuration</PropertyLabel>
              <PropertyValue>
                {channel.config.length} parameters configured
              </PropertyValue>
            </ChannelProperty>
            
            <ChannelProperty>
              <PropertyLabel>Created</PropertyLabel>
              <PropertyValue>
                {new Date(Number(channel.createdAt) / 1000000).toLocaleDateString()}
              </PropertyValue>
            </ChannelProperty>
          </ChannelContent>
          
          <ChannelFooter>
            {channel.isActive ? (
              <>
                <Button variant="secondary" size="sm" onClick={() => onEdit(channel)}>
                  Edit
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onToggle(channel.id, false)}
                >
                  Disable
                </Button>
              </>
            ) : (
              <>
                <Button variant="secondary" size="sm" onClick={() => onEdit(channel)}>
                  Edit
                </Button>
                <Button size="sm" onClick={() => onToggle(channel.id, true)}>
                  Enable
                </Button>
              </>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this channel?')) {
                  onDelete(channel.id);
                }
              }}
              style={{ color: '#f44336' }}
            >
              Delete
            </Button>
          </ChannelFooter>
        </ChannelCard>
      ))}
    </CardsGrid>
  );
};

const Channels = () => {
  const { 
    channels, 
    channelsLoading,
    loadChannels,
    createChannel,
    updateChannel,
    deleteChannel,
    isAuthenticated,
    error
  } = useClypr();
  
  const [showForm, setShowForm] = useState(false);
  const [editingChannel, setEditingChannel] = useState<Channel | null>(null);

  const handleCreateChannel = async (channelData: Omit<Channel, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const success = await createChannel(
        channelData.name,
        channelData.description,
        channelData.channelType,
        channelData.config
      );
      
      if (success) {
        setShowForm(false);
        setEditingChannel(null);
      }
    } catch (err) {
      console.error('Error creating channel:', err);
    }
  };

  const handleEditChannel = (channel: Channel) => {
    setEditingChannel(channel);
    setShowForm(true);
  };

  const handleUpdateChannel = async (channelData: Omit<Channel, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingChannel) return;
    
    try {
      const updatedChannel: Channel = {
        ...editingChannel,
        ...channelData,
        updatedAt: BigInt(Date.now() * 1000000) // Convert to nanoseconds
      };
      
      const success = await updateChannel(editingChannel.id, updatedChannel);
      
      if (success) {
        setShowForm(false);
        setEditingChannel(null);
      }
    } catch (err) {
      console.error('Error updating channel:', err);
    }
  };

  const handleDeleteChannel = async (channelId: number) => {
    try {
      await deleteChannel(channelId);
    } catch (err) {
      console.error('Error deleting channel:', err);
    }
  };

  const handleToggleChannel = async (channelId: number, isActive: boolean) => {
    const channel = channels.find(c => c.id === channelId);
    if (!channel) return;
    
    try {
      const updatedChannel: Channel = {
        ...channel,
        isActive,
        updatedAt: BigInt(Date.now() * 1000000)
      };
      
      await updateChannel(channelId, updatedChannel);
    } catch (err) {
      console.error('Error updating channel:', err);
    }
  };

  if (showForm) {
    return (
      <ChannelsContainer>
        <Header>
          <Text as="h1">{editingChannel ? 'Edit Channel' : 'Create New Channel'}</Text>
          <Button variant="secondary" onClick={() => {
            setShowForm(false);
            setEditingChannel(null);
          }}>
            ← Back to Channels
          </Button>
        </Header>
        
        {error && (
          <ErrorContainer>
            <Text color="error">{error}</Text>
          </ErrorContainer>
        )}
        
        <ChannelForm
          initialChannel={editingChannel || undefined}
          onSubmit={editingChannel ? handleUpdateChannel : handleCreateChannel}
          onCancel={() => {
            setShowForm(false);
            setEditingChannel(null);
          }}
        />
      </ChannelsContainer>
    );
  }

  if (!isAuthenticated) {
    return (
      <ChannelsContainer>
        <Text>Please authenticate to manage communication channels.</Text>
      </ChannelsContainer>
    );
  }
  
  return (
    <ChannelsContainer>
      <Header>
        <Text as="h1">Communication Channels</Text>
        <Button onClick={() => setShowForm(true)}>Add New Channel</Button>
      </Header>
      
      {error && (
        <ErrorContainer>
          <Text color="error">{error}</Text>
        </ErrorContainer>
      )}

      {channelsLoading ? (
        <LoadingContainer>
          <Text>Loading channels...</Text>
        </LoadingContainer>
      ) : (
        <ChannelGrid
          channels={channels}
          onEdit={handleEditChannel}
          onDelete={handleDeleteChannel}
          onToggle={handleToggleChannel}
          onAddNew={() => setShowForm(true)}
        />
      )}
    </ChannelsContainer>
  );
};

export default Channels;
