import React from 'react';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';
import Text from '../components/UI/Text';
import ChannelForm from '../components/Channels/ChannelForm';
import { useClypr } from '../hooks/useClypr';

const getChannelIcon = (channelType: any): string => {
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

const getChannelTypeName = (channelType: any): string => {
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

const ChannelGrid = ({ channels, onEdit, onDelete, onToggle, onAddNew }: { channels: any[]; onEdit: (c: any) => void; onDelete: (id: number) => void; onToggle: (id: number, isActive: boolean) => void; onAddNew: () => void; }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card className="p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-3xl mb-3">+</div>
          <Text>Connect a new communication channel</Text>
          <div className="mt-4">
            <Button onClick={onAddNew}>Add Channel</Button>
          </div>
        </div>
      </Card>

      {channels.map((channel: any) => (
        <Card key={channel.id} className="flex flex-col">
          <div className="p-4 border-b border-neutral-800">
            <h3 className="m-0 mb-1 text-base flex items-center gap-2">
              <span className="mr-1">{getChannelIcon(channel.channelType)}</span>
              <span className={`inline-block w-2 h-2 rounded-full ${channel.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
              {channel.name}
            </h3>
            <div className="text-xs text-neutral-400">{getChannelTypeName(channel.channelType)}</div>
            <div className="text-xs text-neutral-500 font-mono mt-1">ID: {channel.id}</div>
          </div>

          <div className="p-4 flex-1">
            {channel.description && (
              <div className="mb-3">
                <div className="text-xs text-neutral-400 mb-1">Description</div>
                <div className="font-mono text-sm break-words">{channel.description}</div>
              </div>
            )}

            <div className="mb-3">
              <div className="text-xs text-neutral-400 mb-1">Configuration</div>
              <div className="font-mono text-sm">{channel.config.length} parameters configured</div>
            </div>

            <div>
              <div className="text-xs text-neutral-400 mb-1">Created</div>
              <div className="font-mono text-sm">{new Date(Number(channel.createdAt) / 1000000).toLocaleDateString()}</div>
            </div>
          </div>

          <div className="p-4 border-t border-neutral-800 flex justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={() => onEdit(channel)}>Edit</Button>
            {channel.isActive ? (
              <Button variant="ghost" size="sm" onClick={() => onToggle(channel.id, false)}>Disable</Button>
            ) : (
              <Button size="sm" onClick={() => onToggle(channel.id, true)}>Enable</Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this channel?')) onDelete(channel.id);
              }}
              style={{ color: '#f44336' }}
            >
              Delete
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};

const Channels = () => {
  const { 
     channels, 
     channelsLoading,
     createChannel,
     updateChannel,
     deleteChannel,
     loadChannels,
     isAuthenticated,
     error
   } = useClypr() as any;

  const [showForm, setShowForm] = (React as any).useState(false);
  const [editingChannel, setEditingChannel] = (React as any).useState(null);

  const handleCreateChannel = async (channelData: any) => {
    try {
      const success = await createChannel(channelData);
      if (success) {
        setShowForm(false);
        setEditingChannel(null);
      }
    } catch (err) {
      console.error('Error creating channel:', err);
    }
  };

  const handleEditChannel = (channel: any) => {
    setEditingChannel(channel);
    setShowForm(true);
  };

  const handleUpdateChannel = async (channelData: any) => {
    if (!editingChannel) return;
    try {
      const updatedChannel = {
        ...editingChannel,
        ...channelData,
        updatedAt: BigInt(Date.now() * 1000000)
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
    const channel = channels.find((c: any) => c.id === channelId);
    if (!channel) return;
    try {
      const updatedChannel = { ...channel, isActive, updatedAt: BigInt(Date.now() * 1000000) };
      await updateChannel(channelId, updatedChannel);
    } catch (err) {
      console.error('Error updating channel:', err);
    }
  };

  if (showForm) {
    return (
      <div className="flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <Text as="h1">{editingChannel ? 'Edit Channel' : 'Create New Channel'}</Text>
          <Button variant="secondary" onClick={() => { setShowForm(false); setEditingChannel(null); }}>
            ← Back to Channels
          </Button>
        </div>

        {error && (
          <Card className="mb-4 p-3">
            <Text color="red">{error}</Text>
          </Card>
        )}

        <ChannelForm
          initialChannel={editingChannel || undefined}
          onSubmit={editingChannel ? handleUpdateChannel : handleCreateChannel}
          onCancel={() => { setShowForm(false); setEditingChannel(null); }}
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Text>Please authenticate to manage communication channels.</Text>;
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <Text as="h1">Communication Channels</Text>
        <div className="flex items-center gap-2">
          <Button onClick={() => (setShowForm(true))}>Add New Channel</Button>
        </div>
      </div>

      {error && (
        <Card className="mb-4 p-3">
          <Text color="red">{error}</Text>
        </Card>
      )}

      {channelsLoading ? (
        <div className="flex items-center justify-center p-8">
          <Text>Loading channels...</Text>
        </div>
      ) : (
        <ChannelGrid
          channels={channels}
          onEdit={handleEditChannel}
          onDelete={handleDeleteChannel}
          onToggle={handleToggleChannel}
          onAddNew={() => (setShowForm(true))}
        />
      )}
    </div>
  );
};

export default Channels;
