# Clypr Project Structure

The Clypr project is organized into the following structure:

```
clypr/
├── assets/                    # Static assets (images, logos)
├── canister_ids.json         # Canister identifiers for deployment
├── dfx.json                  # ICP project configuration
├── docs/                     # Documentation
│   ├── API.md                # API reference
│   ├── ARCHITECTURE.md       # Technical architecture details
│   ├── CODE_OF_CONDUCT.md    # Community code of conduct
│   ├── CONTRIBUTING.md       # Contribution guidelines
│   ├── DEVELOPER_GUIDE.md    # Guide for developers
│   ├── PRD.md                # Product requirements document
│   ├── USER_GUIDE.md         # End-user guide
│   └── architecture_diagram.txt # Architecture diagram
├── LICENSE                   # MIT license
├── package.json              # Project dependencies
├── README.md                 # Project overview
├── src/                      # Source code
│   ├── declarations/         # Generated type declarations
│   ├── dapp_interface/       # dApp message interface canister
│   │   ├── main.mo           # Main actor implementation
│   │   └── types.mo          # Type definitions
│   ├── frontend/             # Admin frontend application
│   │   ├── assets/           # Frontend static assets
│   │   ├── package.json      # Frontend dependencies
│   │   ├── public/           # Public assets
│   │   ├── src/              # Frontend source code
│   │   │   ├── components/   # Reusable UI components
│   │   │   ├── hooks/        # Custom React hooks
│   │   │   ├── pages/        # Page components
│   │   │   ├── services/     # API service wrappers
│   │   │   ├── utils/        # Utility functions
│   │   │   ├── App.tsx       # Main application component
│   │   │   └── index.tsx     # Application entry point
│   │   └── tsconfig.json     # TypeScript configuration
│   └── user_canister/        # User privacy agent canister
│       ├── main.mo           # Main actor implementation
│       ├── rules.mo          # Rule engine implementation
│       ├── storage.mo        # Data storage module
│       ├── types.mo          # Type definitions
│       └── webhook.mo        # Webhook integration
├── tests/                    # Test suite
│   ├── e2e/                  # End-to-end tests
│   ├── unit/                 # Unit tests
│   │   ├── dapp_interface/   # dApp interface tests
│   │   └── user_canister/    # User canister tests
│   └── integration/          # Integration tests
├── webhook/                  # Webhook bridge service
│   ├── package.json          # Webhook dependencies
│   ├── src/                  # Webhook source code
│   │   ├── config/           # Configuration files
│   │   ├── controllers/      # Request handlers
│   │   ├── models/           # Data models
│   │   ├── routes/           # API routes
│   │   ├── services/         # Business logic
│   │   │   ├── providers/    # Provider integrations
│   │   │   └── verification/ # Message verification
│   │   ├── utils/            # Utility functions
│   │   ├── app.js            # Express application setup
│   │   └── server.js         # Server entry point
│   └── tests/                # Webhook service tests
└── webpack.config.js         # Webpack build configuration
```

This structure organizes the codebase into logical components, separating concerns between the different parts of the system. The main components are:

1. **dApp Interface Canister** - Provides the API for decentralized applications to send messages to users
2. **User Privacy Canister** - Each user's personal privacy agent that processes messages based on rules
3. **Webhook Bridge Service** - Connects the ICP canisters to external email/SMS providers
4. **Admin Frontend** - User interface for managing privacy settings and rules
