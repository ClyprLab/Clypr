import React from 'react';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';
import Text from '../components/UI/Text';
import Input from '../components/UI/Input';
import { useClypr } from '../hooks/useClypr';
import ReactModal from 'react-modal';
import { useState } from 'react';

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

const MessageListComponent = ({ messages, searchTerm, statusFilter }: { messages: any[]; searchTerm: string; statusFilter: string; }) => {
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [detailMessage, setDetailMessage] = React.useState<any | null>(null);
  const [detailJobs, setDetailJobs] = React.useState<any[]>([]);
  const { service } = useClypr() as any;

  const openDetails = async (message: any) => {
    setDetailMessage(message);
    setDetailOpen(true);
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
      <div className="text-center p-8 text-neutral-400">
        <Text>No messages found matching your criteria.</Text>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {filteredMessages.map(message => (
        <Card key={message.messageId} className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-base m-0 mb-1">{message.content.title}</h3>
              <div className="text-xs text-neutral-400 font-mono">
                {new Date(Number(message.timestamp) / 1000000).toLocaleString()}
              </div>
            </div>
            <span className={`inline-block px-2 py-1 rounded-full text-xs ${message.isProcessed ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
              {typeof message.status === 'object' ? Object.keys(message.status)[0] : message.status || 'Unknown'}
            </span>
          </div>

          <div className="mb-3 text-sm">
            {message.content.body}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-neutral-800">
            <div className="flex gap-2 flex-wrap">
              {getProcessedTags(message).map((tag, index) => (
                <span key={index} className="inline-block px-2 py-1 rounded-full text-xs bg-neutral-900/60">
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => openDetails(message)}>View Details</Button>
              {!message.isProcessed && (
                <Button size="sm">Process</Button>
              )}
            </div>
          </div>
        </Card>
      ))}

      <ReactModal isOpen={detailOpen} onRequestClose={closeDetails} ariaHideApp={false} style={{ content: { background: '#0b0b0b', color: '#fff', inset: '10% 20%' } }}>
        <div className="p-4">
          <h2 className="text-lg mb-2">Message Details</h2>
          {detailMessage && (
            <div>
              <div className="mb-2">Title: {detailMessage.content.title}</div>
              <div className="mb-2">Body: {detailMessage.content.body}</div>
              <div className="mb-2">Status: {typeof detailMessage.status === 'object' ? Object.keys(detailMessage.status)[0] : detailMessage.status}</div>
            </div>
          )}

          <div className="mt-4">
            <h3 className="text-base mb-2">Dispatch Jobs</h3>
            {detailJobs.length === 0 ? <div className="text-sm text-neutral-400">No dispatch jobs found for this message.</div> : (
              <div className="space-y-2">
                {detailJobs.map(job => (
                  <div key={String(job.id)} className="p-3 bg-neutral-900 rounded">
                    <div className="flex justify-between">
                      <div className="text-sm">Channel: {job.channelName} ({job.channelId})</div>
                      <div className="text-xs text-neutral-400">Status: {typeof job.status === 'object' ? Object.keys(job.status)[0] : job.status}</div>
                    </div>
                    <div className="text-xs mt-1">Attempts: {String(job.attempts)}</div>
                    <div className="text-xs mt-1">Intents: {(job.intents || []).map(i => i.join(': ')).join(', ')}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 flex justify-end">
            <Button onClick={closeDetails}>Close</Button>
          </div>
        </div>
      </ReactModal>
    </div>
  );
};

const Messages = () => {
  const { messages, messagesLoading, loadMessages, isAuthenticated, error } = useClypr();
  const [searchTerm, setSearchTerm] = (React as any).useState('');
  const [statusFilter, setStatusFilter] = (React as any).useState('all');

  if (!isAuthenticated) {
    return (
      <div>
        <Text>Please authenticate to view messages.</Text>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Text as="h1">Messages & Logs</Text>
        <div className="flex gap-2 w-80">
          <Input placeholder="Search messages..." value={searchTerm} onChange={(e: any) => setSearchTerm(e.target.value)} />
          <Button onClick={() => loadMessages()}>Refresh</Button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            title="Filter messages by status"
            className="h-9 px-3 bg-neutral-950 text-neutral-100 border border-neutral-800 rounded-md text-sm"
          >
            <option value="all">All Messages</option>
            <option value="processed">Processed</option>
            <option value="unprocessed">Unprocessed</option>
            <option value="received">Received</option>
            <option value="processing">Processing</option>
            <option value="delivered">Delivered</option>
            <option value="blocked">Blocked</option>
            <option value="failed">Failed</option>
          </select>
        </div>
        <Text variant="body-sm" color="var(--color-text-secondary)">
          {messages.length} total messages
        </Text>
      </div>

      {error && (
        <Card className="mb-4 p-3">
          <Text color="red">{error}</Text>
        </Card>
      )}

      <Card>
        {messagesLoading ? (
          <div className="flex items-center justify-center p-8">
            <Text>Loading messages...</Text>
          </div>
        ) : (
          <MessageListComponent messages={messages} searchTerm={searchTerm} statusFilter={statusFilter} />
        )}
      </Card>
    </div>
  );
};

export default Messages;
