# Clypr API Reference

## 📋 Document Information

- **API Version**: 1.0.0
- **Base URL**: `https://[CANISTER_ID].icp0.io/`
- **Protocol**: HTTPS
- **Authentication**: Internet Identity
- **Last Updated**: December 2024

## 🎯 Overview

The Clypr API provides a comprehensive interface for managing privacy rules, communication channels, and message processing. This API is built on the Internet Computer Protocol using Candid interfaces for type safety and cross-canister communication.

## 🔐 Authentication

### Internet Identity Integration

All API calls require authentication via Internet Identity. The authentication flow follows the standard ICP pattern:

```typescript
import { AuthClient } from '@dfinity/auth-client';
import { InternetIdentity } from '@dfinity/internet-identity';

// Initialize auth client
const authClient = await AuthClient.create();

// Authenticate with Internet Identity
await authClient.login({
  identityProvider: 'https://identity.ic0.app',
  onSuccess: () => {
    // User is now authenticated
  }
});
```

### Principal-based Authorization

All operations are authorized based on the user's principal ID. Users can only access their own data and canisters.

## 📡 Core API Endpoints

### User Management

#### Get User Profile

Retrieves the current user's profile information.

```candid
getUserProfile : () -> (opt<UserProfile>) query;
```

**Response:**
```json
{
  "owner": "principal",
  "displayName": "John Doe",
  "contactEndpoints": [
    {
      "id": "email-1",
      "type": "email",
      "address": "user@example.com",
      "verified": true,
      "enabled": true,
      "priority": 5
    }
  ],
  "preferences": {
    "defaultChannel": "email",
    "notificationFrequency": "immediate",
    "privacyLevel": "high"
  },
  "created": 1640995200000000000,
  "lastUpdated": 1640995200000000000,
  "status": "active"
}
```

#### Update User Profile

Updates the user's profile information.

```candid
updateUserProfile : (UserProfile) -> (Result<(), Error>);
```

**Request:**
```json
{
  "displayName": "John Doe",
  "preferences": {
    "defaultChannel": "email",
    "notificationFrequency": "immediate",
    "privacyLevel": "high"
  }
}
```

### Privacy Rules Management

#### Create Rule

Creates a new privacy rule for message filtering.

```candid
createRule : (CreateRuleRequest) -> (Result<Text, Error>);
```

**Request:**
```json
{
  "name": "Block Spam",
  "description": "Block messages containing spam keywords",
  "conditions": [
    {
      "type": "content",
      "field": "body",
      "operator": "contains",
      "value": "buy now",
      "metadata": "spam detection"
    }
  ],
  "actions": [
    {
      "type": "block",
      "target": "message",
      "parameters": []
    }
  ],
  "priority": 10,
  "enabled": true
}
```

**Response:**
```json
{
  "Ok": "rule-12345"
}
```

#### Get Rules

Retrieves all privacy rules for the current user.

```candid
getRules : () -> (vec<PrivacyRule>) query;
```

**Response:**
```json
[
  {
    "ruleId": "rule-12345",
    "name": "Block Spam",
    "description": "Block messages containing spam keywords",
    "conditions": [...],
    "actions": [...],
    "priority": 10,
    "enabled": true,
    "created": 1640995200000000000,
    "lastUpdated": 1640995200000000000,
    "statistics": {
      "messagesProcessed": 150,
      "messagesBlocked": 25,
      "effectiveness": 0.83
    }
  }
]
```

#### Update Rule

Updates an existing privacy rule.

```candid
updateRule : (Text, UpdateRuleRequest) -> (Result<(), Error>);
```

#### Delete Rule

Deletes a privacy rule.

```candid
deleteRule : (Text) -> (Result<(), Error>);
```

#### Test Rule

Tests a rule against sample messages.

```candid
testRule : (PrivacyRule, vec<Message>) -> (vec<TestResult>) query;
```

### Channel Management

#### Create Channel

Creates a new communication channel.

```candid
createChannel : (CreateChannelRequest) -> (Result<Text, Error>);
```

**Request:**
```json
{
  "type": "email",
  "address": "user@example.com",
  "name": "Primary Email",
  "priority": 5,
  "settings": {
    "format": "html",
    "timezone": "UTC",
    "quietHours": {
      "enabled": true,
      "start": "22:00",
      "end": "08:00"
    }
  }
}
```

#### Get Channels

Retrieves all communication channels for the current user.

```candid
getChannels : () -> (vec<ContactEndpoint>) query;
```

#### Update Channel

Updates a communication channel.

```candid
updateChannel : (Text, UpdateChannelRequest) -> (Result<(), Error>);
```

#### Delete Channel

Deletes a communication channel.

```candid
deleteChannel : (Text) -> (Result<(), Error>);
```

#### Verify Channel

Sends a verification message to a channel.

```candid
verifyChannel : (Text) -> (Result<(), Error>);
```

### Message Management

#### Get Messages

Retrieves message history with filtering and pagination.

```candid
getMessages : (GetMessagesRequest) -> (GetMessagesResponse) query;
```

**Request:**
```json
{
  "page": 1,
  "limit": 20,
  "filters": {
    "status": ["delivered", "failed"],
    "dateRange": {
      "start": "2024-01-01T00:00:00Z",
      "end": "2024-12-31T23:59:59Z"
    },
    "sender": "principal",
    "ruleApplied": "rule-12345"
  },
  "sortBy": "timestamp",
  "sortOrder": "desc"
}
```

**Response:**
```json
{
  "messages": [
    {
      "messageId": "msg-12345",
      "sender": "principal",
      "received": 1640995200000000000,
      "processed": 1640995201000000000,
      "content": {
        "title": "Welcome to Clypr",
        "body": "Thank you for joining our platform!",
        "priority": 3
      },
      "ruleApplied": "rule-12345",
      "action": "forwarded",
      "deliveryStatus": "delivered",
      "channels": ["email-1"]
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 20,
  "hasMore": true
}
```

#### Get Message Details

Retrieves detailed information about a specific message.

```candid
getMessage : (Text) -> (opt<MessageDetails>) query;
```

#### Delete Message

Deletes a message from history.

```candid
deleteMessage : (Text) -> (Result<(), Error>);
```

### Analytics and Statistics

#### Get Dashboard Stats

Retrieves dashboard statistics and metrics.

```candid
getDashboardStats : () -> (DashboardStats) query;
```

**Response:**
```json
{
  "messageStats": {
    "total": 1250,
    "delivered": 1180,
    "blocked": 45,
    "failed": 25,
    "pending": 0
  },
  "ruleStats": {
    "total": 8,
    "active": 7,
    "effectiveness": 0.89
  },
  "channelStats": {
    "total": 3,
    "verified": 3,
    "active": 2
  },
  "activity": {
    "last24Hours": 45,
    "last7Days": 280,
    "last30Days": 1250
  }
}
```

#### Get Rule Analytics

Retrieves detailed analytics for a specific rule.

```candid
getRuleAnalytics : (Text) -> (opt<RuleAnalytics>) query;
```

#### Get Channel Analytics

Retrieves delivery analytics for a specific channel.

```candid
getChannelAnalytics : (Text) -> (opt<ChannelAnalytics>) query;
```

## 🔧 dApp Integration API

### Send Message

Sends a message to a user's privacy canister.

```candid
sendMessage : (Message) -> (Result<Text, Error>);
```

**Request:**
```json
{
  "sender": "principal",
  "messageId": "msg-12345",
  "recipientId": "user-principal",
  "messageType": "notification",
    "content": {
    "title": "Transaction Complete",
    "body": "Your transaction has been successfully processed.",
    "priority": 4,
    "metadata": [
      {"key": "transactionId", "value": "tx-12345"},
      {"key": "amount", "value": "100.00"},
      {"key": "currency", "value": "ICP"}
    ]
  },
  "timestamp": 1640995200000000000,
  "signature": "optional-signature"
}
```

**Response:**
```json
{
  "Ok": "msg-12345"
}
```

### Get Message Status

Retrieves the status of a sent message.

```candid
getMessageStatus : (Text) -> (opt<MessageStatus>) query;
```

## 📊 Data Types

### Core Types

```candid
type UserProfile = record {
  owner: principal;
  displayName: opt<text>;
  contactEndpoints: vec<ContactEndpoint>;
  preferences: UserPreferences;
  created: nat64;
  lastUpdated: nat64;
  status: UserStatus;
};

type ContactEndpoint = record {
  id: text;
  type: ChannelType;
  address: text;
  verified: bool;
  enabled: bool;
  priority: nat8;
  settings: opt<ChannelSettings>;
};

type PrivacyRule = record {
  ruleId: text;
  name: text;
  description: opt<text>;
  conditions: vec<Condition>;
  actions: vec<Action>;
  priority: nat8;
  enabled: bool;
  created: nat64;
  lastUpdated: nat64;
  statistics: RuleStatistics;
};

type Message = record {
  messageId: text;
  sender: principal;
  recipientId: principal;
  messageType: text;
  content: MessageContent;
  timestamp: nat64;
  signature: opt<text>;
};

type MessageContent = record {
  title: text;
  body: text;
  priority: nat8;
  metadata: vec<KeyValue>;
};
```

### Condition Types

```candid
type ConditionType = variant {
  sender;
  content;
  metadata;
  temporal;
  frequency;
  ai;
};

type Operator = variant {
  equals;
  notEquals;
  contains;
  notContains;
  startsWith;
  endsWith;
  greaterThan;
  lessThan;
  regex;
  in;
  notIn;
};
```

### Action Types

```candid
type ActionType = variant {
  forward;
  block;
  delay;
  transform;
  route;
  escalate;
};

type Action = record {
  type: ActionType;
  target: text;
  parameters: vec<KeyValue>;
  delay: opt<nat64>;
};
```

## 🚨 Error Handling

### Error Types

```candid
type Error = variant {
  unauthorized;
  notFound;
  validationError;
  rateLimitExceeded;
  internalError;
  insufficientCycles;
  channelNotVerified;
  ruleNotFound;
  messageNotFound;
};
```

### Error Response Format

```json
{
  "Err": {
    "validationError": "Invalid rule configuration"
  }
}
```

## 📈 Rate Limiting

### Limits

- **API Calls**: 1000 requests per minute per user
- **Message Sending**: 100 messages per minute per sender
- **Rule Creation**: 50 rules per user
- **Channel Creation**: 10 channels per user

### Rate Limit Headers

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 950
X-RateLimit-Reset: 1640995260
```

## 🔍 SDK Examples

### JavaScript/TypeScript

```typescript
import { Actor, HttpAgent } from '@dfinity/agent';
import { idlFactory } from './declarations/clypr_backend';

// Initialize agent
const agent = new HttpAgent({
  host: 'https://ic0.app'
});

// Create actor
const actor = Actor.createActor(idlFactory, {
  agent,
  canisterId: 'your-canister-id'
});

// Create a rule
const rule = await actor.createRule({
  name: "Block Spam",
  description: "Block messages containing spam keywords",
  conditions: [{
    type: { content: null },
    field: "body",
    operator: { contains: null },
    value: { text: "buy now" }
  }],
  actions: [{
    type: { block: null },
    target: "message",
    parameters: []
  }],
  priority: 10,
  enabled: true
});
```

### Python

```python
from ic.agent import Agent
from ic.identity import Identity
from ic.candid import encode, decode

# Initialize agent
identity = Identity()
agent = Agent(identity)

# Create canister interface
canister_id = "your-canister-id"
interface = agent.get_canister_interface(canister_id)

# Send message
message = {
    "sender": identity.get_principal(),
    "messageId": "msg-12345",
    "recipientId": "user-principal",
    "messageType": "notification",
    "content": {
        "title": "Hello",
        "body": "This is a test message",
        "priority": 3,
        "metadata": []
    },
    "timestamp": int(time.time() * 1_000_000_000)
}

result = agent.call(canister_id, "sendMessage", encode(message))
```

## 🔗 Webhook Integration

### Webhook Endpoints

For external service integration, Clypr provides webhook endpoints for real-time notifications:

```
POST /webhook/message-delivered
POST /webhook/message-failed
POST /webhook/rule-triggered
POST /webhook/channel-verified
```

### Webhook Payload Example

```json
{
  "event": "message_delivered",
  "timestamp": 1640995200000000000,
  "data": {
    "messageId": "msg-12345",
    "channelId": "email-1",
  "status": "delivered",
    "deliveryTime": 1640995201000000000
  },
  "signature": "webhook-signature"
}
```

## 📚 Additional Resources

- [Candid Interface Definition](https://internetcomputer.org/docs/current/developer-docs/build/candid/candid-intro)
- [Internet Computer Agent](https://internetcomputer.org/docs/current/developer-docs/integrations/agent-js/agent-js)
- [Motoko Language Guide](https://internetcomputer.org/docs/current/developer-docs/build/languages/motoko/)
- [Clypr Developer Guide](docs/DEVELOPER_GUIDE.md)

---

**API Version**: 1.0.0  
**Last Updated**: December 2024  
**Next Review**: March 2025
