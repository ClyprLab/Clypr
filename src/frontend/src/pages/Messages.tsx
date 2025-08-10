import React from 'react';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';
import Text from '../components/UI/Text';
import Input from '../components/UI/Input';
import { useClypr } from '../hooks/useClypr';

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
              <Button variant="secondary" size="sm">View Details</Button>
              {!message.isProcessed && (
                <Button size="sm">Process</Button>
              )}
            </div>
          </div>
        </Card>
      ))}
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
