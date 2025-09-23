# Clypr API Reference

This document provides a comprehensive reference for all APIs in the Clypr system.

## dApp Message Interface

### `sendMessage`

Sends a message to a user's privacy canister.

#### Request

```
sendMessage : (message : Message) -> async Result<MessageReceipt, SendError>
```

#### Parameters

| Field | Type | Description |
|-------|------|-------------|
| message | Message | The message payload (see Message format below) |

#### Message Format

```
{
  messageId: Text,              // Unique ID for the message
  recipientId: Principal,       // The recipient's canister ID
  messageType: Text,            // Type identifier (e.g., "notification", "alert")
  content: {
    title: Text,                // Message title/subject
    body: Text,                 // Message body/content
    priority: Nat8,             // Priority level (0-5)
    metadata: [KeyValue],       // Additional attributes as key-value pairs
  },
  timestamp: Nat64,             // Unix timestamp in nanoseconds
}
```

#### Response

```
MessageReceipt {
  messageId: Text,              // The message ID (same as input)
  received: Bool,               // Whether the message was accepted
  timestamp: Nat64,             // When the message was received
}
```

#### Error Codes

| Code | Description |
|------|-------------|
| 1 | Invalid recipient |
| 2 | Invalid message format |
| 3 | Rate limit exceeded |
| 4 | Unauthorized sender |

### `checkMessageStatus`

Checks the status of a previously sent message.

#### Request

```
checkMessageStatus : (messageId : Text, recipientId : Principal) -> async Result<MessageStatus, StatusError>
```

#### Parameters

| Field | Type | Description |
|-------|------|-------------|
| messageId | Text | The ID of the message to check |
| recipientId | Principal | The recipient's canister ID |

#### Response

```
MessageStatus {
  messageId: Text,              // The message ID
  status: StatusType,           // Current status (received, processing, delivered, blocked, failed)
  timestamp: Nat64,             // When the status was last updated
}
```

#### Error Codes

| Code | Description |
|------|-------------|
| 1 | Message not found |
| 2 | Unauthorized requester |

## User Canister Interface

### Privacy Rule Management

#### `createRule`

Creates a new privacy rule.

```
createRule : (rule : RuleDefinition) -> async Result<RuleId, RuleError>
```

##### Parameters

| Field | Type | Description |
|-------|------|-------------|
| rule | RuleDefinition | The rule definition (see format below) |

##### Rule Definition Format

```
{
  name: Text,                   // Human-readable name
  conditions: [Condition],      // Array of conditions (all must match)
  action: Action,               // Action to take when conditions match
  priority: ?Nat8,              // Rule priority (lower runs first, optional)
  enabled: ?Bool,               // Whether rule is active (defaults to true)
}
```

##### Condition Format

```
{
  type: ConditionType,          // Condition type identifier
  field: Text,                  // Field to evaluate
  operator: Operator,           // Comparison operator
  value: Variant,               // Value to compare against
}
```

##### Action Format

```
{
  allow: Bool,                  // Whether to allow forwarding
  destinations: ?[Text],        // Destination endpoints (if allow is true)
  transformations: ?[Transformation], // Optional message transformations
}
```

##### Response

```
RuleId : Text                   // Unique identifier for the created rule
```

##### Error Codes

| Code | Description |
|------|-------------|
| 1 | Invalid rule format |
| 2 | Maximum rules exceeded |
| 3 | Invalid condition |
| 4 | Unauthorized requester |

#### `getRules`

Retrieves all privacy rules for the user.

```
getRules : () -> async [Rule]
```

##### Response

Array of Rule objects:

```
[
  {
    ruleId: Text,               // Rule identifier
    name: Text,                 // Rule name
    conditions: [Condition],    // Rule conditions
    action: Action,             // Rule action
    priority: Nat8,             // Rule priority
    enabled: Bool,              // Whether rule is active
    created: Nat64,             // Creation timestamp
    lastUpdated: Nat64,         // Last update timestamp
  },
  // ...more rules
]
```

#### `updateRule`

Updates an existing privacy rule.

```
updateRule : (ruleId : Text, update : RuleUpdate) -> async Result<(), RuleError>
```

##### Parameters

| Field | Type | Description |
|-------|------|-------------|
| ruleId | Text | Identifier of rule to update |
| update | RuleUpdate | Fields to update (partial Rule object) |

##### Response

Empty success or RuleError

##### Error Codes

| Code | Description |
|------|-------------|
| 1 | Rule not found |
| 2 | Invalid update format |
| 3 | Unauthorized requester |

#### `deleteRule`

Deletes an existing privacy rule.

```
deleteRule : (ruleId : Text) -> async Result<(), RuleError>
```

##### Parameters

| Field | Type | Description |
|-------|------|-------------|
| ruleId | Text | Identifier of rule to delete |

##### Response

Empty success or RuleError

##### Error Codes

| Code | Description |
|------|-------------|
| 1 | Rule not found |
| 2 | Unauthorized requester |

### Message Management

#### `getMessages`

Retrieves message history with optional filtering.

```
getMessages : (filter : ?MessageFilter, limit : ?Nat, offset : ?Nat) -> async [Message]
```

##### Parameters

| Field | Type | Description |
|-------|------|-------------|
| filter | ?MessageFilter | Optional filter criteria |
| limit | ?Nat | Maximum messages to return (default 50) |
| offset | ?Nat | Pagination offset (default 0) |

##### MessageFilter Format

```
{
  startTime: ?Nat64,            // Filter by start time
  endTime: ?Nat64,              // Filter by end time
  sender: ?Principal,           // Filter by sender
  messageType: ?Text,           // Filter by message type
  status: ?StatusType,          // Filter by status
}
```

##### Response

Array of Message objects:

```
[
  {
    messageId: Text,            // Message identifier
    sender: Principal,          // Sender principal
    received: Nat64,            // Timestamp received
    processed: ?Nat64,          // Timestamp processed (if done)
    content: MessageContent,    // Message content
    ruleApplied: ?Text,         // ID of rule that matched
    action: ?ActionTaken,       // Action applied
    deliveryStatus: ?DeliveryStatus, // Delivery status if forwarded
  },
  // ...more messages
]
```

### User Management

#### `updateUserProfile`

Updates the user's profile information.

```
updateUserProfile : (profile : UserProfileUpdate) -> async Result<(), ProfileError>
```

##### Parameters

| Field | Type | Description |
|-------|------|-------------|
| profile | UserProfileUpdate | Profile fields to update |

##### UserProfileUpdate Format

```
{
  displayName: ?Text,           // Optional display name
  contactEndpoints: ?[ContactEndpoint], // Optional contact endpoints
}
```

##### ContactEndpoint Format

```
{
  type: EndpointType,           // "email" or "sms"
  value: Text,                  // Address or phone number
  label: ?Text,                 // Optional label
  verified: Bool,               // Whether endpoint is verified
  primary: Bool,                // Whether this is the primary endpoint
}
```

##### Response

Empty success or ProfileError

##### Error Codes

| Code | Description |
|------|-------------|
| 1 | Invalid profile format |
| 2 | Contact verification failed |
| 3 | Unauthorized requester |

#### `getUserProfile`

Retrieves the user's profile information.

```
getUserProfile : () -> async UserProfile
```

##### Response

```
{
  owner: Principal,             // Owner's principal ID
  displayName: ?Text,           // User's display name
  contactEndpoints: [ContactEndpoint], // Contact endpoints
  created: Nat64,               // Creation timestamp
  lastUpdated: Nat64,           // Last update timestamp
}
```

## Webhook Bridge API

### `deliverMessage`

Receives a message from a user canister and delivers it to external channels.

#### Request

```
POST /api/deliver
```

#### Headers

| Header | Value | Description |
|--------|-------|-------------|
| Authorization | Bearer [token] | Authentication token |
| X-Canister-ID | [canister-id] | Source canister ID |
| X-Message-ID | [message-id] | Message identifier |
| X-Signature | [hmac-signature] | HMAC signature of payload |

#### Request Body

```json
{
  "message": {
    "id": "msg-123456",
    "content": {
      "title": "Message Title",
      "body": "Message body text..."
    }
  },
  "destinations": [
    {
      "type": "email",
      "address": "encrypted-email-data",
      "metadata": {
        "format": "html"
      }
    }
  ],
  "transformations": [
    {
      "type": "prefix",
      "value": "[Clypr] "
    }
  ]
}
```

#### Response

```json
{
  "success": true,
  "deliveryId": "dlv-789012",
  "status": "queued",
  "timestamp": 1627483210000
}
```

#### Error Codes

| HTTP Status | Description |
|-------------|-------------|
| 400 | Invalid request format |
| 401 | Authentication failed |
| 403 | Unauthorized canister |
| 429 | Rate limit exceeded |
| 500 | Delivery service error |

### `getDeliveryStatus`

Checks the status of a message delivery.

#### Request

```
GET /api/status/{deliveryId}
```

#### Headers

| Header | Value | Description |
|--------|-------|-------------|
| Authorization | Bearer [token] | Authentication token |
| X-Canister-ID | [canister-id] | Source canister ID |

#### Response

```json
{
  "deliveryId": "dlv-789012",
  "status": "delivered",
  "timestamp": 1627483215000,
  "details": {
    "providerReference": "provider-ref-12345",
    "attempts": 1
  }
}
```

## Frontend API

The Frontend communicates with the User Canister via the Candid interface and agent-js library. All methods described in the User Canister Interface are available through the frontend application.
