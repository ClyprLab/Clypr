# Backend Implementation

## Overview

The Clypr backend has been implemented on the Internet Computer Protocol (ICP) using Motoko. The backend consists of several modules:

1. **Main Canister** (`main.mo`): The entry point that handles all API requests.
2. **Types** (`Types.mo`): Defines the data structures used throughout the application.
3. **Rule Engine** (`RuleEngine.mo`): Handles the evaluation of messages against rules.
4. **Message Processor** (`MessageProcessor.mo`): Processes incoming messages and routes them according to rules.

## Core Features

### Authentication and Access Control

The backend uses Internet Identity for authentication and implements a simple ownership model where:

- Each canister has a designated owner
- Only the owner can configure rules, channels, and access message history
- Anyone can send messages to the canister, but they are processed according to the rules

### Rules Management

Rules are the heart of Clypr's privacy functionality:

- Each rule consists of conditions and actions
- Conditions define when a rule should be triggered (e.g., sender matches, content contains specific text)
- Actions specify what to do when conditions match (allow, block, route to specific channels)
- Rules are evaluated in priority order (lower number = higher priority)

### Channel Management

Channels represent destinations for messages:

- Each channel has a type (email, SMS, webhook, push)
- Channel configuration includes endpoint information and credentials
- Channels can be enabled/disabled independently

### Message Processing

The message flow is as follows:

1. A sender calls the `sendMessage` endpoint with message content
2. The message is stored and assigned a unique ID
3. Rules are evaluated against the message
4. Actions from matching rules determine the message's fate
5. The message status is updated (delivered, blocked, etc.)
6. A receipt is returned to the sender
    // Return rule ID
  };
## Data Model

### Rule Structure

```
Rule {
  id: Nat
  name: Text
  description: ?Text
  conditions: [Condition]
  actions: [Action]
  priority: Nat8
  isActive: Bool
  createdAt: Int
  updatedAt: Int
}
```

### Condition Structure

```
Condition {
  field: Text (e.g., "sender", "content.body")
  operator: ConditionOperator (equals, contains, etc.)
  value: Text
}
```

### Action Structure

```
Action {
  actionType: ActionType (allow, block, route, transform)
  channelId: ?ChannelId
  parameters: [(Text, Text)]
}
```

### Channel Structure

```
Channel {
  id: ChannelId
  name: Text
  description: ?Text
  channelType: ChannelType (email, sms, webhook, push)
  config: [(Text, Text)]
  isActive: Bool
  createdAt: Int
  updatedAt: Int
}
```

### Message Structure

```
Message {
  messageId: Text
  senderId: Principal
  recipientId: Principal
  messageType: Text
  content: MessageContent {
    title: Text
    body: Text
    priority: Nat8
    metadata: [(Text, Text)]
  }
  timestamp: Int
  isProcessed: Bool
  status: MessageStatus
}
```

## API Endpoints

The backend exposes the following API endpoints:

### System

- `ping()`: Health check endpoint
- `setOwner(principal)`: Set the owner of the canister
- `getOwner()`: Get the current owner

### Rules

- `createRule(...)`: Create a new rule
- `getRule(id)`: Get a specific rule
- `getAllRules()`: Get all rules
- `updateRule(id, rule)`: Update a rule
- `deleteRule(id)`: Delete a rule

### Channels

- `createChannel(...)`: Create a new channel
- `getChannel(id)`: Get a specific channel
- `getAllChannels()`: Get all channels
- `updateChannel(id, channel)`: Update a channel
- `deleteChannel(id)`: Delete a channel

### Messages

- `sendMessage(messageType, content)`: Send a new message
- `getMessage(id)`: Get a specific message
- `getAllMessages()`: Get all messages

### Stats

- `getStats()`: Get statistics about the canister

## Integration with Frontend

The frontend connects to the backend through:

1. **ClyprService.ts**: A TypeScript service that handles all API calls
2. **useClypr.tsx**: A React hook that provides a convenient interface for components
3. **clypr.did.js**: The Candid interface definition for the backend

## Implementation Details

### Rule Engine

The Rule Engine is responsible for evaluating messages against rules:

1. When a message is received, it's passed to the Rule Engine
2. The engine extracts relevant fields from the message (sender, content, etc.)
3. It evaluates each rule's conditions against the message
4. Rules are processed in priority order (lower number = higher priority)
5. The first matching rule's actions are applied to the message

### Message Processing

The Message Processor handles the lifecycle of messages:

1. Creates new messages with unique IDs
2. Stores messages in the canister's state
3. Uses the Rule Engine to evaluate messages against rules
4. Updates message status based on rule evaluation
5. Creates receipts for message senders

## Future Enhancements

- **Advanced Rule Engine**: Support for more complex condition operators and action types
- **AI Spam Detection**: Integration with AI services for intelligent message filtering
- **Webhook Bridge**: Implementation of secure external message delivery
- **Message Transformations**: Support for modifying messages before delivery
- **Multi-user Support**: Allow multiple users to access the same canister
- **Message Encryption**: End-to-end encryption for sensitive message content
