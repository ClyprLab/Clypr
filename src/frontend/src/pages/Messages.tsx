import React from 'react';
import Button from '../components/UI/Button';
import { Card, GlassCard } from '../components/UI/Card';
import Input from '../components/UI/Input';
import { useClypr } from '../hooks/useClypr';
import ReactModal from 'react-modal';
import { useState } from 'react';
import { 
  MessageSquare, 
  Search, 
  Filter, 
  RefreshCw, 
  Eye, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Play,
  Pause,
  MoreHorizontal,
  ArrowRight,
  Calendar,
  Tag,
  User,
  Settings
} from 'lucide-react';
import { cn } from '../utils/cn';

// Note: Avoid strict typing in TSX per project guidance
// to prevent IDE type noise and keep runtime logic intact.

const getProcessedTags = (message: any): string[] => {
  const tags: string[] = [];
  tags.push(message.messageType || 'Unknown');
  if (message.isProcessed) tags.push('Processed');
  message.content.metadata.forEach(([key, value]) => {
    if (key === 'tags') {
      tags.push(...value.split(','));
    }
  });
  return tags;
};

const getStatusIcon = (status: string, isProcessed: boolean) => {
  if (!isProcessed) return <Clock className="h-4 w-4 text-yellow-400" />;
  
  switch (status) {
    case 'delivered':
      return <CheckCircle className="h-4 w-4 text-green-400" />;
    case 'blocked':
      return <XCircle className="h-4 w-4 text-red-400" />;
    case 'failed':
      return <AlertTriangle className="h-4 w-4 text-red-400" />;
    case 'processing':
      return <Play className="h-4 w-4 text-blue-400" />;
    default:
      return <MessageSquare className="h-4 w-4 text-neutral-400" />;
  }
};

const getStatusColor = (status: string, isProcessed: boolean) => {
  if (!isProcessed) return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
  
  switch (status) {
    case 'delivered':
      return "bg-green-500/20 text-green-400 border-green-500/30";
    case 'blocked':
      return "bg-red-500/20 text-red-400 border-red-500/30";
    case 'failed':
      return "bg-red-500/20 text-red-400 border-red-500/30";
    case 'processing':
      return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    default:
      return "bg-neutral-500/20 text-neutral-400 border-neutral-500/30";
  }
};

const MessageCard = ({ message, onViewDetails }: { message: any; onViewDetails: (message: any) => void }) => {
  const messageStatus = typeof message.status === 'object' 
    ? Object.keys(message.status)[0] 
    : message.status || 'unknown';

  const tags = getProcessedTags(message);
  const statusColor = getStatusColor(messageStatus, message.isProcessed);

  return (
    <Card className="group hover:border-neutral-600/50 transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-white truncate">{message.content.title}</h3>
            <div className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
              statusColor
            )}>
              {getStatusIcon(messageStatus, message.isProcessed)}
              {messageStatus.charAt(0).toUpperCase() + messageStatus.slice(1)}
            </div>
          </div>
          
          <p className="text-neutral-300 text-sm mb-3 line-clamp-2">
            {message.content.body}
          </p>
          
          <div className="flex items-center gap-4 text-xs text-neutral-500 mb-3">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(Number(message.timestamp) / 1000000).toLocaleString()}
            </div>
            <div className="flex items-center gap-1">
              <Tag className="h-3 w-3" />
              {message.messageType || 'Unknown Type'}
            </div>
            {message.isProcessed && (
              <div className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Processed
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewDetails(message)}
            title="View details"
          >
            <Eye className="h-4 w-4" />
          </Button>
          {!message.isProcessed && (
            <Button
              variant="ghost"
              size="sm"
              title="Process message"
            >
              <Play className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-neutral-700/50">
        <div className="flex gap-2 flex-wrap">
          {tags.slice(0, 3).map((tag, index) => (
            <span 
              key={index} 
              className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-neutral-800/50 border border-neutral-700/50 text-neutral-300"
            >
              {tag}
            </span>
          ))}
          {tags.length > 3 && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-neutral-800/50 border border-neutral-700/50 text-neutral-400">
              +{tags.length - 3} more
            </span>
          )}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          rightIcon={<ArrowRight className="h-3 w-3" />}
          onClick={() => onViewDetails(message)}
        >
          Details
        </Button>
      </div>
    </Card>
  );
};

const MessageListComponent = ({ messages, searchTerm, statusFilter }: { messages: any[]; searchTerm: string; statusFilter: string; }) => {
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [detailMessage, setDetailMessage] = React.useState<any | null>(null);
  const [detailJobs, setDetailJobs] = React.useState<any[]>([]);
  const [modalStyle, setModalStyle] = React.useState<any>({
    content: {
      background: '#0A0A0F',
      color: '#fff',
      top: '5%',
      left: '10%',
      right: '10%',
      bottom: '5%',
      border: '1px solid #1C1C25',
      borderRadius: '12px',
      padding: '0'
    },
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(4px)'
    }
  });
  const { service } = useClypr() as any;

  const openDetails = async (message: any) => {
    setDetailMessage(message);
    setDetailOpen(true);
    // compute modal style to avoid being overlapped by sidebar
    try {
      const computeStyle = () => {
        const aside = document.querySelector('aside');
        const sidebarWidth = aside ? Math.round((aside as HTMLElement).getBoundingClientRect().width) : (window.innerWidth >= 768 ? 240 : 0);
        // ensure some gap
        const leftPx = sidebarWidth + 16;
        const rightPx = Math.max(16, Math.round(window.innerWidth * 0.08));
        setModalStyle({
          content: {
            background: '#0A0A0F',
            color: '#fff',
            top: '5%',
            left: `${leftPx}px`,
            right: `${rightPx}px`,
            bottom: '5%',
            border: '1px solid #1C1C25',
            borderRadius: '12px',
            padding: '0'
          },
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(4px)'
          }
        });
      };
      computeStyle();
      const onResize = () => computeStyle();
      window.addEventListener('resize', onResize);
      // remove listener when modal closes
      const cleanup = () => window.removeEventListener('resize', onResize);
      // attach cleanup to close handler via a microtask so it remains available
      (window as any).__messages_modal_cleanup = cleanup;
    } catch (e) {
      // ignore
    }
    try {
        if (service) {
          // Use the service wrapper which tries the canister query and falls back to debug dump
          const jobs = await service.getDispatchJobsForMessage(message.messageId);
          setDetailJobs(jobs || []);
        }
      } catch (e) {
        console.error('Failed to load dispatch jobs for message:', e);
        setDetailJobs([]);
      }
  };

  const closeDetails = () => {
    setDetailOpen(false);
    setDetailMessage(null);
    setDetailJobs([]);
    try {
      const cleanup = (window as any).__messages_modal_cleanup;
      if (typeof cleanup === 'function') cleanup();
      (window as any).__messages_modal_cleanup = undefined;
    } catch (e) { /* ignore */ }
  };

  const filteredMessages = messages.filter(message => {
    const matchesSearch = !searchTerm || 
      message.content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.content.body.toLowerCase().includes(searchTerm.toLowerCase());

    const messageStatus = typeof message.status === 'object' 
      ? Object.keys(message.status)[0] 
      : message.status || 'unknown';

    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'processed' && message.isProcessed) ||
      (statusFilter === 'unprocessed' && !message.isProcessed) ||
      (statusFilter === messageStatus);

    return matchesSearch && matchesStatus;
  });

  if (filteredMessages.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gradient-to-br from-cyan-400/20 to-fuchsia-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <MessageSquare className="h-8 w-8 text-cyan-400" />
        </div>
        <h3 className="text-lg font-medium text-white mb-2">
          {searchTerm || statusFilter !== 'all' ? 'No messages found' : 'No messages yet'}
        </h3>
        <p className="text-neutral-400 mb-6 max-w-md mx-auto">
          {searchTerm || statusFilter !== 'all' 
            ? 'Try adjusting your search or filter criteria'
            : 'Your message history will appear here once you start receiving communications'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filteredMessages.map(message => (
        <MessageCard 
          key={message.messageId} 
          message={message} 
          onViewDetails={openDetails}
        />
      ))}

      <ReactModal
        isOpen={detailOpen}
        onRequestClose={closeDetails}
        ariaHideApp={false}
        style={modalStyle}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Message Details</h2>
            <Button variant="ghost" size="sm" onClick={closeDetails}>
              ✕
            </Button>
          </div>
          
          {detailMessage && (
            <div className="space-y-6">
              <GlassCard>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-neutral-400 mb-1">Title</h3>
                    <p className="text-white">{detailMessage.content.title}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-neutral-400 mb-1">Content</h3>
                    <p className="text-neutral-300">{detailMessage.content.body}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-neutral-400 mb-1">Status</h3>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(
                          typeof detailMessage.status === 'object' ? Object.keys(detailMessage.status)[0] : detailMessage.status,
                          detailMessage.isProcessed
                        )}
                        <span className="text-white">
                          {typeof detailMessage.status === 'object' ? Object.keys(detailMessage.status)[0] : detailMessage.status}
                        </span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-neutral-400 mb-1">Type</h3>
                      <p className="text-white">{detailMessage.messageType || 'Unknown'}</p>
                    </div>
                  </div>
                </div>
              </GlassCard>

              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Dispatch Jobs</h3>
                {detailJobs.length === 0 ? (
                  <div className="text-center py-8">
                    <Settings className="h-8 w-8 text-neutral-600 mx-auto mb-3" />
                    <p className="text-neutral-400">No dispatch jobs found for this message.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {detailJobs.map(job => (
                      <Card key={String(job.id)} className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-white">{job.channelName}</span>
                            <span className="text-xs text-neutral-400">({job.channelId})</span>
                          </div>
                          <div className={cn(
                            "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border",
                            getStatusColor(typeof job.status === 'object' ? Object.keys(job.status)[0] : job.status, true)
                          )}>
                            {getStatusIcon(typeof job.status === 'object' ? Object.keys(job.status)[0] : job.status, true)}
                            {typeof job.status === 'object' ? Object.keys(job.status)[0] : job.status}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-xs text-neutral-400">
                          <div>Attempts: {String(job.attempts)}</div>
                          <div>Intents: {(job.intents || []).map(i => i.join(': ')).join(', ')}</div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <Button onClick={closeDetails}>Close</Button>
          </div>
        </div>
      </ReactModal>
    </div>
  );
};

const Messages = () => {
  const { messages, messagesLoading, messagesAttempted, loadMessages, isAuthenticated, error, isMessagesDataReady } = useClypr();
  const [searchTerm, setSearchTerm] = (React as any).useState('');
  const [statusFilter, setStatusFilter] = (React as any).useState('all');

  // Load messages when component mounts and user is authenticated
  (React as any).useEffect(() => {
    if (isAuthenticated && !messagesLoading && !messagesAttempted) {
      loadMessages().catch(() => {});
    }
  }, [isAuthenticated, messagesLoading, messagesAttempted, loadMessages]);

  if (!isAuthenticated) {
    return (
      <div className="animate-fade-in">
        <div className="mb-6">
          <h1 className="text-3xl font-display font-bold text-white mb-2">Messages & Logs</h1>
          <p className="text-neutral-400">View your communication history and processing logs</p>
        </div>
        <GlassCard>
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">Authentication Required</h3>
            <p className="text-neutral-400 mb-4">Please log in to view your message history and communication logs.</p>
          </div>
        </GlassCard>
      </div>
    );
  }

  const getStatusCount = (status: string) => {
    return messages.filter(message => {
      const messageStatus = typeof message.status === 'object' 
        ? Object.keys(message.status)[0] 
        : message.status || 'unknown';
      return status === 'all' || messageStatus === status;
    }).length;
  };

  // Show loading state if data is not ready yet or if actively loading messages
  if (!isMessagesDataReady() || messagesLoading) {
    return (
      <div className="animate-fade-in">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-white mb-2">Messages & Logs</h1>
          <p className="text-neutral-400">Loading your message history...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map(i => (
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
            <h1 className="text-3xl font-display font-bold text-white mb-2">Messages & Logs</h1>
            <p className="text-neutral-400">Monitor your communication history and processing status</p>
          </div>
          <Button 
            variant="outline" 
            leftIcon={<RefreshCw className="h-4 w-4" />}
            onClick={() => loadMessages()}
            loading={messagesLoading}
          >
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <GlassCard>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-white">{messages.length}</div>
                <div className="text-sm text-neutral-400">Total Messages</div>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-400/20 to-cyan-400/10 rounded-lg flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-cyan-400" />
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-white">{getStatusCount('delivered')}</div>
                <div className="text-sm text-neutral-400">Delivered</div>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-green-400/20 to-green-400/10 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-400" />
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-white">{getStatusCount('blocked')}</div>
                <div className="text-sm text-neutral-400">Blocked</div>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-red-400/20 to-red-400/10 rounded-lg flex items-center justify-center">
                <XCircle className="h-5 w-5 text-red-400" />
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-white">{getStatusCount('failed')}</div>
                <div className="text-sm text-neutral-400">Failed</div>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-red-400/20 to-red-400/10 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Search messages by title or content..."
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
              All ({messages.length})
            </Button>
            <Button
              variant={statusFilter === 'delivered' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setStatusFilter('delivered')}
            >
              Delivered ({getStatusCount('delivered')})
            </Button>
            <Button
              variant={statusFilter === 'blocked' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setStatusFilter('blocked')}
            >
              Blocked ({getStatusCount('blocked')})
            </Button>
            <Button
              variant={statusFilter === 'failed' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setStatusFilter('failed')}
            >
              Failed ({getStatusCount('failed')})
            </Button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Card variant="danger" className="mb-6">
          <div className="flex items-center mb-4">
            <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
            <h3 className="text-white font-medium">Error Loading Messages</h3>
          </div>
          <p className="text-red-300 mb-4">{error}</p>
          <Button 
            variant="outline" 
            onClick={() => loadMessages()}
          >
            Retry Loading
          </Button>
        </Card>
      )}

      {/* Messages List */}
      <Card>
        {messagesLoading ? (
          <div className="flex items-center justify-center p-12">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-neutral-400">Loading your message history...</p>
            </div>
          </div>
        ) : (
          <MessageListComponent 
            messages={messages} 
            searchTerm={searchTerm} 
            statusFilter={statusFilter} 
          />
        )}
      </Card>
    </div>
  );
};

export default Messages;
