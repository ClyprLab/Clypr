# Clypr Developer Guide

This guide provides instructions for developers who want to build and extend the Clypr privacy relay system.

## Development Environment Setup

### Prerequisites

- [DFINITY Canister SDK](https://sdk.dfinity.org) (version 0.11.0 or higher)
- Node.js (version 16.x or higher)
- npm or yarn
- Git
- Text editor or IDE (VS Code recommended)

### Initial Setup

1. Clone the repository:

```bash
git clone https://github.com/yourusername/clypr.git
cd clypr
```

2. Install dependencies:

```bash
npm install
```

3. Start a local Internet Computer replica:

```bash
dfx start --background
```

4. Deploy the canisters to your local replica:

```bash
dfx deploy
```

## Project Structure

The Clypr project is organized into several main components:

```
/
├── dfx.json                  # ICP project configuration
├── canister_ids.json         # Canister identifiers
├── webpack.config.js         # Frontend build configuration
├── package.json              # Node dependencies
├── src/
│   ├── declarations/         # Generated interface bindings
│   ├── dapp_interface/       # dApp message interface canister
│   │   ├── main.mo           # Interface definitions
│   │   └── types.mo          # Shared type definitions
│   ├── user_canister/        # User privacy agent canister
│   │   ├── main.mo           # Entry points and core logic
│   │   ├── rules.mo          # Rule engine implementation
│   │   ├── storage.mo        # Data persistence
│   │   └── webhook.mo        # Outbound calls logic
│   └── frontend/             # Admin UI React app
│       ├── src/              # React source files
│       │   ├── components/   # UI components
│       │   ├── pages/        # Page definitions
│       │   ├── hooks/        # React hooks
│       │   └── App.tsx       # Main application
│       └── assets/           # Static assets
├── webhook/                  # Webhook bridge service
│   ├── src/
│   │   ├── server.js         # Express server
│   │   ├── routes/           # API endpoints
│   │   ├── services/         # Business logic
│   │   └── util/             # Helpers
│   └── package.json          # Node dependencies
└── tests/                    # Test suite
    ├── user_canister/        # Canister tests
    └── webhook/              # Webhook service tests
```

## Core Development Tasks

### Modifying the dApp Interface

The dApp interface defines how external applications can send messages to user privacy agents.

1. Edit the interface definition in `src/dapp_interface/main.mo`
2. Update type definitions in `src/dapp_interface/types.mo` if necessary
3. Deploy the updated interface:

```bash
dfx deploy dapp_interface
```

### Working with the User Canister

The user canister is the core privacy agent that processes messages according to user rules.

1. Navigate to `src/user_canister/`
2. Modify the relevant modules:
   - `main.mo` for entry points and actor definition
   - `rules.mo` for rule engine logic
   - `storage.mo` for data persistence
   - `webhook.mo` for outbound webhook calls

3. Deploy the updated canister:

```bash
dfx deploy user_canister
```

### Developing the Webhook Bridge

The webhook bridge service connects the ICP canisters to external communication providers.

1. Navigate to `webhook/`
2. Start the service in development mode:

```bash
cd webhook
npm install
npm run dev
```

3. Modify the service components:
   - `src/server.js` for the main Express application
   - `src/routes/` for API endpoints
   - `src/services/` for business logic
   - `src/util/` for helper functions

### Frontend Development

The admin frontend provides users with an interface to manage their privacy agents.

1. Navigate to `src/frontend/`
2. Start the development server:

```bash
cd src/frontend
npm install
npm start
```

3. Modify the frontend components:
   - `src/components/` for reusable UI components
   - `src/pages/` for page definitions
   - `src/hooks/` for custom React hooks
   - `src/App.tsx` for the main application structure

## Testing

### Unit Testing

1. Navigate to the project root
2. Run unit tests:

```bash
npm test
```

### Canister Testing

1. Start a local replica (if not already running):

```bash
dfx start --background
```

2. Run canister tests:

```bash
npm run test:canisters
```

### Webhook Service Testing

1. Navigate to the webhook directory:

```bash
cd webhook
```

2. Run webhook tests:

```bash
npm test
```

### End-to-End Testing

1. Deploy all components to the local replica:

```bash
dfx deploy
```

2. Start the webhook service:

```bash
cd webhook && npm start
```

3. Start the frontend:

```bash
cd src/frontend && npm start
```

4. Run end-to-end tests:

```bash
npm run test:e2e
```

## Deployment

### Local Deployment

1. Start a local replica:

```bash
dfx start --background
```

2. Deploy all canisters:

```bash
dfx deploy
```

3. Start the webhook service:

```bash
cd webhook && npm start
```

4. Start the frontend:

```bash
cd src/frontend && npm start
```

### IC Mainnet Deployment

1. Configure your identity:

```bash
dfx identity use <your-identity>
```

2. Ensure you have sufficient cycles:

```bash
dfx wallet balance
```

3. Deploy to the IC mainnet:

```bash
dfx deploy --network ic
```

4. Deploy the webhook service to your hosting provider (AWS, GCP, etc.)

5. Deploy the frontend to your hosting provider or IPFS

## Extending Clypr

### Adding New Channel Types

To add support for a new communication channel (e.g., Telegram):

1. Update the webhook service:
   - Add a new provider adapter in `webhook/src/services/providers/`
   - Implement the channel-specific delivery logic
   - Add routes to handle the new channel type

2. Update the user canister:
   - Add the new channel type to the `EndpointType` variant in `src/user_canister/types.mo`
   - Update the webhook call format to support the new channel

3. Update the frontend:
   - Add UI components for managing the new channel type
   - Update forms to support the new channel configuration

### Creating New Rule Types

To add a new type of privacy rule:

1. Update the user canister:
   - Add the new condition type to `ConditionType` in `src/user_canister/types.mo`
   - Implement the condition evaluation logic in `src/user_canister/rules.mo`

2. Update the frontend:
   - Add UI components for creating and editing the new rule type
   - Update the rule wizard to include the new condition type

### Implementing dApp Integration

For dApp developers who want to integrate with Clypr:

1. Import the Clypr client library:

```typescript
import { ClyprClient } from '@clypr/client';
```

2. Initialize the client:

```typescript
const clypr = new ClyprClient({
  agentOptions: { /* agent-js options */ }
});
```

3. Send a message to a user:

```typescript
await clypr.sendMessage({
  recipientId: 'recipient-principal-id',
  messageType: 'notification',
  content: {
    title: 'Message Title',
    body: 'Message Content',
    priority: 3,
    metadata: [
      { key: 'category', value: 'update' },
      { key: 'action', value: 'view_details' }
    ]
  }
});
```

## Best Practices

### Security Recommendations

- Always verify message sender identity
- Use encryption for sensitive data
- Implement rate limiting to prevent abuse
- Follow the principle of least privilege
- Validate all inputs, especially those from external sources

### Performance Optimization

- Minimize canister storage usage
- Batch operations when possible
- Use efficient data structures
- Cache frequently accessed data
- Optimize rule evaluation logic

### Code Style

- Follow the Motoko style guide
- Use meaningful variable and function names
- Write clear comments and documentation
- Create unit tests for all functions
- Keep functions small and focused

## Troubleshooting

### Common Development Issues

#### Canister Deployment Failures

- Check that your local replica is running
- Ensure you have sufficient cycles
- Verify your dfx.json configuration

#### Webhook Connection Issues

- Confirm that the webhook service is running
- Check network configuration and firewall settings
- Verify that canister calls include proper authentication

#### Frontend Integration Problems

- Check that canister IDs are correctly configured
- Ensure agent-js is properly initialized
- Verify Internet Identity integration

### Getting Help

- Check the [GitHub issues](https://github.com/yourusername/clypr/issues)
- Join the [developer Discord](https://discord.gg/clypr-dev)
- Ask questions on the [DFINITY forum](https://forum.dfinity.org)

## API Reference

For detailed API documentation, see the [API Reference](./API.md).

## Contributing

We welcome contributions to Clypr! Please see our [Contributing Guide](./CONTRIBUTING.md) for details on how to get involved.
