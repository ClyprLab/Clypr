import React from 'react';
import Button from '../components/UI/Button';
import { Card, GlassCard, GradientCard } from '../components/UI/Card';
import ChannelForm from '../components/Channels/ChannelForm';
import { useClypr } from '../hooks/useClypr';
import { 
  Zap, 
  Plus, 
  Edit3, 
  Trash2, 
  Power, 
  PowerOff,
  Mail,
  MessageSquare,
  Globe,
  Smartphone,
  AlertTriangle,
  CheckCircle,
  Clock,
  Settings,
  ArrowRight,
  TestTube,
  Wifi,
  WifiOff
} from 'lucide-react';
import { cn } from '../utils/cn';
import SlideOver from '../components/UI/SlideOver';

const getChannelIcon = (channelType: any) => {
  if (typeof channelType === 'string') {
    switch (channelType) {
      case 'email': return <Mail className="h-5 w-5" />;
      case 'sms': return <Smartphone className="h-5 w-5" />;
      case 'webhook': return <Globe className="h-5 w-5" />;
      case 'push': return <MessageSquare className="h-5 w-5" />;
      default: return <Zap className="h-5 w-5" />;
    }
  } else {
    return <Settings className="h-5 w-5" />;
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

const getChannelColor = (channelType: any): string => {
  if (typeof channelType === 'string') {
    switch (channelType) {
      case 'email': return 'from-blue-400/20 to-blue-400/10';
      case 'sms': return 'from-green-400/20 to-green-400/10';
      case 'webhook': return 'from-purple-400/20 to-purple-400/10';
      case 'push': return 'from-orange-400/20 to-orange-400/10';
      default: return 'from-cyan-400/20 to-cyan-400/10';
    }
  } else {
    return 'from-neutral-400/20 to-neutral-400/10';
  }
};

const ChannelCard = ({ 
  channel, 
  onEdit, 
  onDelete, 
  onToggle, 
  onTest 
}: { 
  channel: any; 
  onEdit: (c: any) => void; 
  onDelete: (id: number) => void; 
  onToggle: (id: number, isActive: boolean) => void; 
  onTest: (id: number) => void;
}) => {
  const iconColor = channel.isActive ? 'text-white' : 'text-neutral-400';
  const bgGradient = getChannelColor(channel.channelType);

  const hasEmailConfig = !!(channel?.config && (channel.config as any).email && (channel.config as any).email.fromAddress);
  const channelTypeIsTelegram = (typeof channel.channelType === 'string' && channel.channelType === 'telegram') || (typeof channel.channelType === 'object' && channel.channelType && Object.keys(channel.channelType)[0] === 'telegram');
  const isUnverified = !channel.isActive && (hasEmailConfig || channelTypeIsTelegram);
   
  return (
    <Card className="group hover:border-neutral-600/50 transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-3">
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center",
              `bg-gradient-to-br ${bgGradient}`
            )}>
              <div className={iconColor}>
                {getChannelIcon(channel.channelType)}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold text-white truncate max-w-full" title={channel.name}>{channel.name}</h3>
                <div className={cn(
                  "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border",
                  isUnverified ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" : (
                    channel.isActive 
                      ? "bg-green-500/20 text-green-400 border-green-500/30" 
                      : "bg-red-500/20 text-red-400 border-red-500/30"
                ))}>
                  <div className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    isUnverified ? "bg-yellow-400" : (channel.isActive ? "bg-green-400" : "bg-red-400")
                  )} />
                  {isUnverified ? 'Unverified' : (channel.isActive ? 'Active' : 'Inactive')}
                </div>
              </div>
              <p className="text-sm text-neutral-400">{getChannelTypeName(channel.channelType)}</p>
            </div>
          </div>

          {channel.description && (
            <p className="text-neutral-300 text-sm mb-3">{channel.description}</p>
          )}

          <div className="flex items-center gap-4 text-xs text-neutral-500 mb-3 flex-wrap md:flex-nowrap">
            <div className="flex items-center gap-1">
              <Settings className="h-3 w-3" />
              {channel.config.length} parameters
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {new Date(Number(channel.createdAt) / 1000000).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-1">
              <span className="font-mono text-xs whitespace-nowrap">ID: {String(channel.id)}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onTest(channel.id)}
            title="Test channel"
          >
            <TestTube className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(channel)}
            title={isUnverified ? 'Verify channel' : 'Edit channel'}
          >
            <Edit3 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggle(channel.id, !channel.isActive)}
            title={channel.isActive ? 'Disable channel' : 'Enable channel'}
          >
            {channel.isActive ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(channel.id)}
            title="Delete channel"
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-neutral-700/50">
        <div className="flex items-center gap-2">
          <div className={cn(
            "flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border",
            isUnverified ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" : (
              channel.isActive 
                ? "bg-green-500/20 text-green-400 border-green-500/30" 
                : "bg-neutral-500/20 text-neutral-400 border-neutral-500/30"
           ))}>
            {isUnverified ? <AlertTriangle className="h-3 w-3 text-yellow-400" /> : (channel.isActive ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />)}
            {isUnverified ? 'Unverified' : (channel.isActive ? 'Connected' : 'Disconnected')}
          </div>
        </div>
        
        <Button
          variant={isUnverified ? 'secondary' : 'outline'}
          size="sm"
          rightIcon={<ArrowRight className="h-3 w-3" />}
          onClick={() => onEdit(channel)}
        >
          {isUnverified ? 'Verify' : 'Configure'}
        </Button>
      </div>
    </Card>
  );
};

const AddChannelCard = ({ onAddNew }: { onAddNew: () => void }) => (
  <Card className="group hover:border-neutral-600/50 transition-all duration-200 cursor-pointer" onClick={onAddNew}>
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="w-16 h-16 bg-gradient-to-br from-cyan-400/20 to-fuchsia-500/20 rounded-full flex items-center justify-center mb-4 group-hover:from-cyan-400/30 group-hover:to-fuchsia-500/30 transition-all duration-200">
        <Plus className="h-8 w-8 text-cyan-400" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">Add New Channel</h3>
      <p className="text-neutral-400 text-sm mb-4 max-w-xs">
        Connect a new communication channel to receive messages
      </p>
      <Button variant="gradient" size="sm">
        Connect Channel
      </Button>
    </div>
  </Card>
);

const Channels = () => {
    const { 
    channels, 
    channelsLoading,
    createChannel,
    updateChannel,
    deleteChannel,
    loadChannels,
    isAuthenticated,
    error,
    isDataReady
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
    if (!window.confirm('Are you sure you want to delete this communication channel? This action cannot be undone.')) return;
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

  const handleTestChannel = (channelId: number) => {
    // TODO: Implement channel testing
    alert(`Testing channel ${channelId}...`);
  };

  const activeChannelsCount = channels.filter((c: any) => c.isActive).length;
  const totalChannelsCount = channels.length;

  // Show loading state if data is not ready yet or if actively loading
  if (!isDataReady() || channelsLoading) {
    return (
      <div className="animate-fade-in">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-white mb-2">Communication Channels</h1>
          <p className="text-neutral-400">Loading your communication channels...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[0, 1, 2].map(i => (
            <Card key={i} className="animate-pulse">
              <div className="h-20 bg-neutral-800 rounded-lg mb-3" />
              <div className="h-4 bg-neutral-800 rounded w-3/4" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-white mb-2">Communication Channels</h1>
            <p className="text-neutral-400">Configure delivery routes for your messages</p>
          </div>
          <Button 
            variant="gradient" 
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => setShowForm(true)}
          >
            Add Channel
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <GlassCard>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-white">{totalChannelsCount}</div>
                <div className="text-sm text-neutral-400">Total Channels</div>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-400/20 to-cyan-400/10 rounded-lg flex items-center justify-center">
                <Zap className="h-5 w-5 text-cyan-400" />
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-white">{activeChannelsCount}</div>
                <div className="text-sm text-neutral-400">Active Channels</div>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-green-400/20 to-green-400/10 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-400" />
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-white">{totalChannelsCount - activeChannelsCount}</div>
                <div className="text-sm text-neutral-400">Inactive Channels</div>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-neutral-400/20 to-neutral-400/10 rounded-lg flex items-center justify-center">
                <PowerOff className="h-5 w-5 text-neutral-400" />
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Card variant="outlined" className="mb-6">
          <div className="flex items-center mb-4">
            <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
            <h3 className="text-white font-medium">Error Loading Channels</h3>
          </div>
          <p className="text-red-300 mb-4">{error}</p>
          <Button 
            variant="outline" 
            onClick={() => loadChannels()}
          >
            Retry Loading
          </Button>
        </Card>
      )}

      {/* Channels Grid */}
      <Card>
        {channelsLoading ? (
          <div className="flex items-center justify-center p-12">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-neutral-400">Loading your communication channels...</p>
            </div>
          </div>
        ) : channels.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-400/20 to-fuchsia-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="h-8 w-8 text-cyan-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No channels configured yet</h3>
            <p className="text-neutral-400 mb-6 max-w-md mx-auto">
              Connect your first communication channel to start receiving messages through Clypr
            </p>
            <Button 
              variant="gradient" 
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => setShowForm(true)}
            >
              Connect Your First Channel
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AddChannelCard onAddNew={() => setShowForm(true)} />
            
            {channels.map((channel: any) => (
              <ChannelCard
                key={channel.id}
                channel={channel}
                onEdit={handleEditChannel}
                onDelete={handleDeleteChannel}
                onToggle={handleToggleChannel}
                onTest={handleTestChannel}
              />
            ))}
          </div>
        )}
      </Card>

      {/* Slide-over overlay: right panel that appears without navigating away from the list */}
      { /* use shared SlideOver primitive for consistent backdrop behavior */ }
      <SlideOver
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditingChannel(null); }}
        title={editingChannel ? 'Edit Channel' : 'Create Channel'}
        width={'w-[480px]'}
      >
        <div className="p-4">
          <ChannelForm
            initialChannel={editingChannel || undefined}
            onSubmit={editingChannel ? handleUpdateChannel : handleCreateChannel}
            onCancel={() => { setShowForm(false); setEditingChannel(null); }}
            onSuccess={(shouldClose?: boolean) => { loadChannels(); if (shouldClose) { setShowForm(false); setEditingChannel(null); } }}
          />
        </div>
      </SlideOver>
    </div>
  );
};

export default Channels;
