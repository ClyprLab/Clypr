# Clypr Technical Architecture

## System Overview

Clypr is built on a distributed architecture leveraging the Internet Computer Protocol (ICP) for decentralized, secure message processing. The system consists of several key components that work together to provide a privacy-first messaging relay.

```
+------------------------+      +-------------------------+      +------------------------+      +--------------------+
|                        |      |                         |      |                        |      |                    |
|  Decentralized Apps    +----->+  User Privacy Canister  +----->+  Webhook Bridge       +----->+  Email/SMS         |
|  (dApps)               |      |  (Rule Evaluation)      |      |  Service              |      |  Providers         |
|                        |      |                         |      |                        |      |                    |
+------------------------+      +------------+------------+      +------------------------+      +--------------------+
                                             |
                                             |
                                             v
                                +------------+------------+
                                |                         |
                                |  Admin Frontend         |
                                |  (User Management)      |
                                |                         |
                                +-------------------------+
```

## Components

### 1. dApp Message Interface

The dApp Message Interface defines a standard protocol for decentralized applications to send messages to user canisters.

#### Key Aspects:

- **Interface Definition**: Candid interface for cross-canister communication
- **Message Structure**: Standardized format for all communications
- **Authentication**: Mechanisms to verify message origins
- **Rate Limiting**: Protection against spam or DoS attacks

#### Message Format:

```
{
  sender: Principal,       // Identity of the sending dApp
  messageId: Text,         // Unique message identifier
  recipientId: Principal,  // Target user canister ID
  messageType: Text,       // Type of message (notification, alert, etc)
  content: {
    title: Text,
    body: Text,
    priority: Nat8,        // 0-5 scale
    metadata: [KeyValue],  // Additional context for rule evaluation
  },
  timestamp: Nat64,        // When the message was sent
}
```

### 2. User Privacy Canister

The User Privacy Canister is the core of the system, acting as a personal privacy agent for each user.

#### Key Aspects:

- **Storage Layer**: Efficient storage of user data, rules, and messages
- **Rule Engine**: Evaluation of messages against user-defined rules
- **Webhook Integration**: Secure forwarding of approved messages
- **Authentication**: User identity verification and management

#### Data Models:

**User Profile:**
```
{
  owner: Principal,
  displayName: ?Text,
  contactEndpoints: [ContactEndpoint],
  created: Nat64,
  lastUpdated: Nat64,
}
```

**Privacy Rule:**
```
{
  ruleId: Text,
  name: Text,
  conditions: [Condition],
  action: Action,
  priority: Nat8,
  enabled: Bool,
  created: Nat64,
  lastUpdated: Nat64,
}
```

**Condition:**
```
{
  type: ConditionType,
  field: Text,           // What to evaluate (sender, title, body, etc.)
  operator: Operator,    // equals, contains, greaterThan, etc.
  value: Variant,        // The value to compare against
}
```

**Action:**
```
{
  allow: Bool,                  // Whether to forward the message
  destinations: [Destination],  // Where to forward if allowed
  transformations: [Transformation],  // Optional modifications
}
```

**Message:**
```
{
  messageId: Text,
  sender: Principal,
  received: Nat64,
  processed: ?Nat64,
  content: MessageContent,
  ruleApplied: ?Text,
  action: ?ActionTaken,
  deliveryStatus: ?DeliveryStatus,
}
```

### 3. Rule Engine

The Rule Engine evaluates incoming messages against user-defined rules to determine appropriate actions.

#### Evaluation Process:

1. **Rule Sorting**: Rules are ordered by priority
2. **Sequential Evaluation**: Each rule is evaluated in order
3. **Condition Checking**: All conditions within a rule are evaluated
4. **Action Application**: First matching rule's action is applied
5. **Default Fallback**: If no rules match, default action is applied

#### Rule Types:

- **Sender Rules**: Filter based on message origin
- **Content Rules**: Filter based on message content
- **Temporal Rules**: Filter based on time constraints
- **Frequency Rules**: Filter based on message frequency
- **Metadata Rules**: Filter based on message attributes

### 4. Webhook Bridge Service

The Webhook Bridge Service acts as a secure relay between the ICP canisters and external communication providers.

#### Key Aspects:

- **Security**: Authentication and encryption for canister communication
- **Provider Integration**: Adapters for email and SMS services
- **Delivery Management**: Status tracking and retry logic
- **Transformation**: Message formatting appropriate for each channel

#### Components:

- **API Layer**: REST endpoints for canister communication
- **Authentication Service**: Verification of canister calls
- **Provider Adapters**: Integrations with Twilio and SendGrid
- **Monitoring Service**: Tracking delivery status and performance

### 5. Admin Frontend

The Admin Frontend provides a user interface for managing privacy rules and preferences.

#### Key Aspects:

- **Authentication**: Integration with Internet Identity
- **Dashboard**: Overview of message activity
- **Rule Management**: Intuitive interface for creating rules
- **Message History**: Browsing and searching past messages

## Data Flow

### Message Sending Flow

1. dApp calls user canister's `sendMessage` function with message payload
2. User canister validates message structure and sender authentication
3. User canister stores message in inbox
4. User canister triggers asynchronous rule evaluation
5. Rule engine evaluates message against all active rules
6. If message is approved for forwarding:
   a. User canister calls webhook service with encrypted payload
   b. Webhook service verifies call signature
   c. Webhook service transforms message for delivery channel
   d. Webhook service calls appropriate provider API (Twilio/SendGrid)
   e. Webhook service returns delivery status to user canister
7. User canister updates message record with processing results

### Rule Creation Flow

1. User authenticates to admin frontend via Internet Identity
2. User navigates to rule management interface
3. User creates new rule with conditions and actions
4. Frontend sends rule definition to user canister
5. User canister validates and stores new rule
6. Rule is immediately active for future message processing

## Security Considerations

### Privacy Protection

- **Contact Encryption**: User contact details stored encrypted at rest
- **No Direct Access**: dApps never see actual contact information
- **Data Minimization**: Only necessary metadata stored with messages

### Authentication & Authorization

- **Internet Identity**: User authentication via decentralized identity
- **Canister Principals**: Message source verification
- **Webhook Signatures**: HMAC-based verification of canister calls

### Secure Communication

- **Encryption**: All external communications encrypted
- **Signature Verification**: Message integrity checks
- **HTTPS**: TLS for all webhook communications

## Scalability Considerations

### Canister Scaling

- **Per-User Canisters**: Natural horizontal scaling as users increase
- **Message Batching**: Efficient processing of multiple messages
- **Storage Optimization**: Compressed message storage

### Webhook Scaling

- **Stateless Design**: Easily scalable webhook servers
- **Queue Processing**: Asynchronous message handling
- **Regional Deployment**: Global distribution for latency reduction

## Technology Stack

### Internet Computer

- **Runtime**: Motoko or Rust (primary implementation in Motoko)
- **Interface**: Candid for type definitions
- **Identity**: Internet Identity integration

### Webhook Service

- **Server**: Node.js with Express
- **Providers**: Twilio and SendGrid SDKs
- **Security**: JSON Web Tokens, HMAC signatures

### Frontend

- **Framework**: React with TypeScript
- **State Management**: Redux or Context API
- **UI Components**: Custom design system or Material UI

## Deployment Architecture

### Local Development

- Local ICP replica
- Local webhook service
- Development frontend

### Staging Environment

- IC mainnet canisters (development subnet)
- Hosted webhook service (staging instance)
- Staging frontend deployment

### Production Environment

- IC mainnet canisters (production subnet)
- Distributed webhook service (multiple regions)
- Production frontend deployment with CDN
