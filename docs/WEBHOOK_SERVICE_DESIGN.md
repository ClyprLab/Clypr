# Webhook Bridge Service Design

This document details the technical design of the Webhook Bridge Service, which connects user privacy canisters on the Internet Computer to external communication providers.

## Overview

The Webhook Bridge Service acts as a secure relay between ICP canisters and external email/SMS providers like SendGrid and Twilio. It receives authenticated messages from user canisters, processes them according to delivery requirements, and forwards them to the appropriate external services.

```
User Canister → Webhook Bridge → Email/SMS Providers → User's Devices
```

## Architecture

The Webhook Bridge Service is built as a Node.js application using Express.js for the API layer. It follows a layered architecture:

```
                   +----------------------------------+
                   |                                  |
                   |      API Routes & Controllers    |
                   |                                  |
                   +----------------+----------------+
                                    |
                                    v
                   +----------------+----------------+
                   |                                  |
                   |      Authentication & Security   |
                   |                                  |
                   +----------------+----------------+
                                    |
                                    v
                   +----------------+----------------+
                   |                                  |
                   |      Message Processing          |
                   |                                  |
                   +----------------+----------------+
                                    |
                                    v
                   +----------------+----------------+
                   |                                  |
                   |      Provider Adapters           |
                   |                                  |
                   +----------------------------------+
                         |                   |
                         v                   v
                +-------------+       +-------------+
                |             |       |             |
                |  SendGrid   |       |   Twilio    |
                |             |       |             |
                +-------------+       +-------------+
```

## Components

### 1. API Routes & Controllers

Handles incoming HTTP requests from user canisters and provides endpoints for status checking and administration.

#### Key Endpoints

- **POST /api/deliver**: Main endpoint for receiving messages to deliver
- **GET /api/status/:deliveryId**: Check status of a delivery
- **GET /api/health**: Service health check
- **POST /api/admin/configure**: Admin-only endpoint for service configuration

### 2. Authentication & Security

Ensures that only authorized canisters can send messages and verifies the integrity of requests.

#### Authentication Methods

1. **HMAC Signature Verification**:
   - Each request includes a signature created using the canister's private key
   - The service verifies this signature against the canister's known public key

2. **Challenge-Response Authentication**:
   - For initial setup, a challenge-response protocol establishes trusted communication

3. **Rate Limiting**:
   - Per-canister rate limits prevent abuse
   - Graduated throttling for excessive usage

### 3. Message Processing

Handles the core logic of processing incoming messages, applying transformations, and preparing them for delivery.

#### Processing Steps

1. **Message Validation**:
   - Verify message structure and content
   - Check for required fields

2. **Content Preparation**:
   - Format message according to destination channel requirements
   - Apply any message transformations

3. **Queue Management**:
   - Prioritize messages based on urgency
   - Handle retry logic and failure cases

4. **Delivery Tracking**:
   - Generate unique delivery IDs
   - Record delivery attempts and status

### 4. Provider Adapters

Interfaces with external communication services like SendGrid and Twilio.

#### Supported Providers

1. **SendGrid Email Adapter**:
   - Template-based email formatting
   - HTML and plain text support
   - Attachment handling
   - Delivery tracking integration

2. **Twilio SMS Adapter**:
   - SMS message formatting
   - Unicode support for international messages
   - Delivery receipt handling
   - Number validation

## Data Flow

### Message Delivery Flow

1. **User canister calls webhook with encrypted message**:
   ```json
   {
     "messageId": "msg-123456",
     "sender": "rrkah-fqaaa-aaaaa-aaaaq-cai",
     "encryptedContact": "AES256-encrypted-contact-data",
     "content": {
       "title": "Message Title",
       "body": "Message content text",
       "priority": 3,
       "metadata": {
         "category": "notification",
         "appName": "ExampleApp"
       }
     },
     "deliveryOptions": {
       "channel": "email",
       "format": "html",
       "transformations": [
         {
           "type": "prefix",
           "field": "title",
           "value": "[Clypr] "
         }
       ]
     },
     "signature": "ed25519-signature"
   }
   ```

2. **Service authenticates request**:
   - Verifies message signature
   - Checks canister authorization
   - Validates message format

3. **Service decrypts contact information**:
   - Uses service's private key to decrypt the contact information
   - Validates the decrypted contact information

4. **Service processes message**:
   - Applies any transformations
   - Formats for the target channel
   - Adds tracking information

5. **Service calls provider API**:
   - SendGrid for email
   - Twilio for SMS

6. **Service records delivery status**:
   - Stores delivery attempt
   - Records provider reference IDs
   - Updates status based on webhooks from providers

7. **Service returns confirmation to user canister**:
   ```json
   {
     "success": true,
     "deliveryId": "dlv-789012",
     "status": "queued",
     "timestamp": 1627483210000
   }
   ```

## Security Model

### Data Protection

1. **Contact Information Encryption**:
   - User canister encrypts contact info with webhook service's public key
   - Only webhook service can decrypt using its private key
   - Contact info is never stored persistently, only used for immediate delivery

2. **Message Content Security**:
   - Messages are transmitted over TLS
   - Sensitive message data can be encrypted end-to-end
   - No persistent storage of message content after delivery

3. **Authentication Chain**:
   - IC identity verification for canister calls
   - Ed25519 signatures for message integrity
   - API keys for provider authentication

### Threat Mitigations

1. **Replay Attacks**:
   - Include timestamps in signed messages
   - Implement nonce checking
   - Reject messages older than a configurable threshold

2. **Denial of Service**:
   - Per-canister rate limiting
   - Request throttling
   - IP-based protections

3. **Unauthorized Access**:
   - Strong authentication requirements
   - Principle of least privilege for all components
   - Regular rotation of API keys

## Scalability & Performance

### Horizontal Scaling

The service is designed for horizontal scaling:

1. **Stateless Design**:
   - No session state between requests
   - All necessary context included in requests

2. **Load Balancing**:
   - Round-robin distribution
   - Health-check based routing

3. **Regional Deployment**:
   - Deploy in multiple regions for lower latency
   - Region-specific provider configurations

### Performance Optimizations

1. **Connection Pooling**:
   - Maintain persistent connections to providers
   - Reuse HTTP connections

2. **Batched Processing**:
   - Combine similar messages when possible
   - Batch API calls to providers

3. **Asynchronous Processing**:
   - Non-blocking I/O throughout
   - Parallel processing of independent operations

## Reliability & Resilience

### Failure Handling

1. **Retry Logic**:
   - Exponential backoff for failed deliveries
   - Configurable retry limits per channel
   - Different strategies based on failure type

2. **Circuit Breaking**:
   - Detect failing providers
   - Temporarily disable problematic endpoints
   - Automatic recovery testing

3. **Fallback Mechanisms**:
   - Alternative provider options
   - Degraded service modes

### Monitoring & Alerting

1. **Health Metrics**:
   - Success/failure rates
   - Response times
   - Queue depths
   - Resource utilization

2. **Logging**:
   - Structured logs for all operations
   - Error tracing with correlation IDs
   - Audit logs for security events

3. **Alerting**:
   - Real-time alerts for critical failures
   - Trend-based alerts for degradation
   - On-call rotation for incident response

## Deployment Model

### Infrastructure Requirements

1. **Computing**:
   - Node.js compatible environment
   - Minimum 2 vCPUs per instance
   - 4GB RAM per instance

2. **Networking**:
   - Outbound internet access
   - Fixed IP for provider allowlisting
   - Low-latency connection to ICP network

3. **Scaling**:
   - Minimum 2 instances for reliability
   - Auto-scaling based on load

### Deployment Options

1. **Containerized Deployment**:
   - Docker containerization
   - Kubernetes orchestration
   - Helm charts for configuration

2. **Serverless Option**:
   - AWS Lambda implementation
   - API Gateway integration
   - SQS for message queuing

3. **Traditional Hosting**:
   - VM-based deployment
   - Process manager (PM2)
   - Nginx for TLS termination

## Configuration

### Service Configuration

```json
{
  "server": {
    "port": 3000,
    "host": "0.0.0.0",
    "tlsEnabled": true,
    "maxRequestSize": "1mb"
  },
  "security": {
    "rateLimits": {
      "perCanister": {
        "windowMs": 60000,
        "max": 100
      },
      "global": {
        "windowMs": 60000,
        "max": 1000
      }
    },
    "maxMessageAge": 300000,
    "publicKeyTTL": 86400000
  },
  "providers": {
    "email": {
      "provider": "sendgrid",
      "apiKey": "ENV:SENDGRID_API_KEY",
      "fromAddress": "notifications@clypr.io",
      "fromName": "Clypr Notifications"
    },
    "sms": {
      "provider": "twilio",
      "accountSid": "ENV:TWILIO_ACCOUNT_SID",
      "authToken": "ENV:TWILIO_AUTH_TOKEN",
      "fromNumber": "+15551234567"
    }
  },
  "retry": {
    "maxAttempts": 5,
    "backoffFactor": 2,
    "initialDelayMs": 1000,
    "maxDelayMs": 60000
  },
  "monitoring": {
    "enabled": true,
    "logLevel": "info",
    "metricsPort": 9090
  }
}
```

### Provider Configurations

#### SendGrid Configuration

```json
{
  "templates": {
    "default": "d-f3ecde774b7344a29a60d8d46b5d8b67",
    "alert": "d-a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
    "digest": "d-b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7"
  },
  "tracking": {
    "clickTracking": true,
    "openTracking": true,
    "subscriptionTracking": false
  },
  "categories": ["clypr", "user-notifications"],
  "ipPool": "transactional",
  "maxAttachmentSize": 10000000
}
```

#### Twilio Configuration

```json
{
  "messagingServiceSid": "MG1234567890abcdef1234567890abcdef",
  "statusCallback": "https://webhook.clypr.io/api/twilio/status",
  "maxSegments": 3,
  "validityPeriod": 14400,
  "forceDelivery": true
}
```

## Error Handling

### Error Categories

1. **Authentication Errors**:
   - Invalid signature
   - Unknown canister
   - Expired timestamp
   - Rate limit exceeded

2. **Validation Errors**:
   - Invalid message format
   - Missing required fields
   - Invalid contact information
   - Content policy violations

3. **Provider Errors**:
   - API failure
   - Rate limiting by provider
   - Invalid recipient
   - Content rejection

4. **System Errors**:
   - Internal service failure
   - Database connectivity issues
   - Network problems
   - Resource exhaustion

### Error Responses

All error responses follow a standard format:

```json
{
  "success": false,
  "error": {
    "code": "AUTHENTICATION_FAILED",
    "message": "Invalid signature for canister",
    "details": {
      "canisterId": "rrkah-fqaaa-aaaaa-aaaaq-cai",
      "reason": "Signature verification failed"
    },
    "requestId": "req-12345-67890",
    "timestamp": 1627483210000
  }
}
```

## API Reference

### POST /api/deliver

Receives a message from a user canister and delivers it to external channels.

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

### GET /api/status/:deliveryId

Checks the status of a message delivery.

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

## Implementation Plan

### Phase 1: Core Service (Weeks 1-2)

1. Basic Express.js server setup
2. Authentication mechanism implementation
3. Initial provider adapters (SendGrid)
4. Simple message processing

### Phase 2: Enhanced Functionality (Weeks 3-4)

1. Complete Twilio integration
2. Message transformation capabilities
3. Advanced delivery tracking
4. Retry mechanisms

### Phase 3: Scaling & Hardening (Weeks 5-6)

1. Performance optimization
2. Horizontal scaling support
3. Enhanced security measures
4. Comprehensive logging and monitoring

## Future Enhancements

1. **Additional Providers**:
   - Push notification services
   - Messaging platforms (Telegram, Discord)
   - Custom webhook destinations

2. **Advanced Features**:
   - Message scheduling
   - Content adaptation for different channels
   - Rich media support
   - Interactive message capabilities

3. **Integration Enhancements**:
   - Direct provider status webhooks to IC
   - Enhanced cryptographic protocols
   - Zero-knowledge proofs for privacy
