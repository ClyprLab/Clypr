import React, { useState } from 'react';
import styled from 'styled-components';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';
import Text from '../components/UI/Text';
import Input from '../components/UI/Input';
import { useClypr } from '../hooks/useClypr';
import { Message as ClyprMessage } from '../services/ClyprService';

const MessagesContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-6);
`;

const SearchContainer = styled.div`
  display: flex;
  gap: var(--space-2);
  width: 320px;
`;

const FilterContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--space-4);
`;

const FilterGroup = styled.div`
  display: flex;
  gap: var(--space-2);
`;

const Select = styled.select`
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  background: var(--color-bg);
  color: var(--color-text);
  
  &:focus {
    outline: none;
    border-color: var(--color-accent);
  }
`;

const MessageList = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
`;

const MessageCard = styled(Card)`
  padding: var(--space-4);
`;

const MessageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--space-3);
`;

const MessageInfo = styled.div``;

const MessageTimestamp = styled.div`
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  font-family: var(--font-mono);
`;

const MessageTitle = styled.h3`
  font-size: var(--font-size-md);
  margin: 0;
  margin-bottom: var(--space-1);
`;

const MessageContent = styled.div`
  margin-bottom: var(--space-3);
  font-size: var(--font-size-sm);
`;

const MessageMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: var(--space-3);
  border-top: 1px solid var(--color-border);
`;

const MessageTags = styled.div`
  display: flex;
  gap: var(--space-2);
`;

const Tag = styled.span`
  display: inline-block;
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  background-color: var(--color-hover);
`;

const StatusBadge = styled.span<{ $processed?: boolean }>`
  display: inline-block;
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  background-color: ${(props) => props.$processed ? '#E8F5E9' : '#FFF3E0'};
  color: ${(props) => props.$processed ? '#388E3C' : '#F57C00'};
`;

const MessageActions = styled.div`
  display: flex;
  gap: var(--space-2);
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: var(--space-8);
`;

const EmptyState = styled.div`
  text-align: center;
  padding: var(--space-8);
  color: var(--color-text-secondary);
`;

const getProcessedTags = (message: ClyprMessage): string[] => {
  const tags = [];
  tags.push(message.messageType || 'Unknown');
  if (message.isProcessed) tags.push('Processed');
  
  // Add tags from metadata
  message.content.metadata.forEach(([key, value]) => {
    if (key === 'tags') {
      tags.push(...value.split(','));
    }
  });
  
  return tags;
};

interface MessageListProps {
  messages: ClyprMessage[];
  searchTerm: string;
  statusFilter: string;
}

const MessageListComponent = ({ messages, searchTerm, statusFilter }: MessageListProps) => {
  const filteredMessages = messages.filter(message => {
    const matchesSearch = !searchTerm || 
      message.content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.content.body.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'processed' && message.isProcessed) ||
      (statusFilter === 'unprocessed' && !message.isProcessed) ||
      (statusFilter === message.status);
    
    return matchesSearch && matchesStatus;
  });

  if (filteredMessages.length === 0) {
    return (
      <EmptyState>
        <Text>No messages found matching your criteria.</Text>
      </EmptyState>
    );
  }

  return (
    <MessageList>
      {filteredMessages.map(message => (
        <MessageCard key={message.messageId}>
          <MessageHeader>
            <MessageInfo>
              <MessageTitle>{message.content.title}</MessageTitle>
              <MessageTimestamp>
                {new Date(Number(message.timestamp) / 1000000).toLocaleString()}
              </MessageTimestamp>
            </MessageInfo>
            <StatusBadge $processed={message.isProcessed}>
              {message.status}
            </StatusBadge>
          </MessageHeader>
          
          <MessageContent>
            {message.content.body}
          </MessageContent>
          
          <MessageMeta>
            <MessageTags>
              {getProcessedTags(message).map((tag, index) => (
                <Tag key={index}>{tag}</Tag>
              ))}
            </MessageTags>
            
            <MessageActions>
              <Button variant="secondary" size="sm">View Details</Button>
              {!message.isProcessed && (
                <Button size="sm">Process</Button>
              )}
            </MessageActions>
          </MessageMeta>
        </MessageCard>
      ))}
    </MessageList>
  );
};

const Messages = () => {
  const { 
    messages, 
    messagesLoading,
    loadMessages,
    isAuthenticated,
    error
  } = useClypr();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  if (!isAuthenticated) {
    return (
      <MessagesContainer>
        <Text>Please authenticate to view messages.</Text>
      </MessagesContainer>
    );
  }
  
  return (
    <MessagesContainer>
      <Header>
        <Text as="h1">Messages & Logs</Text>
        <SearchContainer>
          <Input 
            placeholder="Search messages..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button onClick={() => loadMessages()}>Refresh</Button>
        </SearchContainer>
      </Header>
      
      <FilterContainer>
        <FilterGroup>
          <Select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            title="Filter messages by status"
          >
            <option value="all">All Messages</option>
            <option value="processed">Processed</option>
            <option value="unprocessed">Unprocessed</option>
            <option value="received">Received</option>
            <option value="processing">Processing</option>
            <option value="delivered">Delivered</option>
            <option value="blocked">Blocked</option>
            <option value="failed">Failed</option>
          </Select>
        </FilterGroup>
        
        <Text size="sm" color="secondary">
          {messages.length} total messages
        </Text>
      </FilterContainer>
      
      {error && (
        <Card style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-3)', backgroundColor: '#ffebee' }}>
          <Text color="error">{error}</Text>
        </Card>
      )}

      <Card>
        {messagesLoading ? (
          <LoadingContainer>
            <Text>Loading messages...</Text>
          </LoadingContainer>
        ) : (
          <MessageListComponent 
            messages={messages}
            searchTerm={searchTerm}
            statusFilter={statusFilter}
          />
        )}
      </Card>
    </MessagesContainer>
  );
};

export default Messages;
