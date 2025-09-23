import React from 'react';
import styled from 'styled-components';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';
import Text from '../components/UI/Text';
import Input from '../components/UI/Input';

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

const MessageActions = styled.div`
  display: flex;
  gap: var(--space-2);
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  margin-top: var(--space-6);
  gap: var(--space-2);
`;

interface Message {
  id: string;
  title: string;
  content: string;
  timestamp: string;
  channel: string;
  processed: boolean;
  tags: string[];
}

const Messages: React.FC = () => {
  const mockMessages: Message[] = [
    {
      id: '1',
      title: 'Email Message: Job Application',
      content: 'Your job application has been received and is being reviewed by our team...',
      timestamp: '2025-07-25 14:32',
      channel: 'Email',
      processed: true,
      tags: ['Job', 'Email', 'Processed']
    },
    {
      id: '2',
      title: 'SMS Alert: Login Attempt',
      content: 'There was a login attempt to your account from a new device. If this was not you...',
      timestamp: '2025-07-24 09:15',
      channel: 'SMS',
      processed: true,
      tags: ['Security', 'Alert', 'SMS']
    },
    {
      id: '3',
      title: 'Twitter DM: Conference Invitation',
      content: 'We would like to invite you as a speaker to our upcoming tech conference...',
      timestamp: '2025-07-23 16:45',
      channel: 'Twitter',
      processed: false,
      tags: ['Social', 'Invitation']
    },
    {
      id: '4',
      title: 'Signal Message: Project Update',
      content: 'The latest project updates include the following changes and additions...',
      timestamp: '2025-07-22 11:20',
      channel: 'Signal',
      processed: true,
      tags: ['Project', 'Signal']
    }
  ];
  
  return (
    <MessagesContainer>
      <Header>
        <Text as="h1">Message History</Text>
        <SearchContainer>
          <Input placeholder="Search messages..." />
          <Button>Search</Button>
        </SearchContainer>
      </Header>
      
      <FilterContainer>
        <FilterGroup>
          <Button variant="secondary" size="sm">All</Button>
          <Button variant="ghost" size="sm">Processed</Button>
          <Button variant="ghost" size="sm">Pending</Button>
          <Button variant="ghost" size="sm">Filtered</Button>
        </FilterGroup>
        
        <FilterGroup>
          <Button variant="ghost" size="sm">Sort: Newest</Button>
        </FilterGroup>
      </FilterContainer>
      
      <MessageList>
        {mockMessages.map(message => (
          <MessageCard key={message.id}>
            <MessageHeader>
              <MessageInfo>
                <MessageTitle>{message.title}</MessageTitle>
                <MessageTimestamp>
                  {message.timestamp} • {message.channel}
                </MessageTimestamp>
              </MessageInfo>
              <div>
                {message.processed ? (
                  <Tag style={{ backgroundColor: '#E8F5E9', color: '#388E3C' }}>Processed</Tag>
                ) : (
                  <Tag style={{ backgroundColor: '#FFF8E1', color: '#FFA000' }}>Pending</Tag>
                )}
              </div>
            </MessageHeader>
            
            <MessageContent>{message.content}</MessageContent>
            
            <MessageMeta>
              <MessageTags>
                {message.tags.map((tag, index) => (
                  <Tag key={index}>{tag}</Tag>
                ))}
              </MessageTags>
              
              <MessageActions>
                <Button variant="ghost" size="sm">Details</Button>
                <Button variant="ghost" size="sm">Archive</Button>
              </MessageActions>
            </MessageMeta>
          </MessageCard>
        ))}
      </MessageList>
      
      <Pagination>
        <Button variant="ghost" size="sm">Previous</Button>
        <Button variant="secondary" size="sm">1</Button>
        <Button variant="ghost" size="sm">2</Button>
        <Button variant="ghost" size="sm">3</Button>
        <Button variant="ghost" size="sm">Next</Button>
      </Pagination>
    </MessagesContainer>
  );
};

export default Messages;
