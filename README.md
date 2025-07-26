# Clypr - Decentralized Communication Privacy Relay

![Clypr Logo](assets/clypr-logo.png)

## The Privacy Layer for Web3 Communications

Clypr is a programmable privacy gateway for Web3 messaging built on the Internet Computer Protocol (ICP). It enables users to control how dApps communicate with them through customizable privacy rules.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![ICP: Compatible](https://img.shields.io/badge/ICP-Compatible-orange.svg)](https://internetcomputer.org/)

## 🔐 Overview

In the Web3 ecosystem, users need greater control over how applications communicate with them. Clypr creates a privacy layer between decentralized applications and users' real-world communication channels. Instead of dApps sending messages directly to a user's email or phone, they send messages to the user's personal canister (privacy agent), which evaluates the messages against user-defined rules before forwarding approved messages via secure webhooks to the user's preferred channels.

```
dApp → User's Privacy Canister → Privacy Rules Evaluation → Webhook Bridge → Email/SMS delivery
```

## ✨ Key Features

- **Personal Privacy Agent**: Each user gets a dedicated canister that acts as their privacy gateway
- **Programmable Rules**: Define granular conditions for which messages get forwarded
- **Channel Management**: Control which messages go to which communication channels
- **AI-Powered Spam Detection**: Intelligent filtering using machine learning
- **dApp Integration**: Standard messaging protocol for Web3 applications
- **Privacy Preservation**: dApps never see users' actual contact information
- **Message Transformations**: Modify messages before delivery based on custom rules

## 🛠 Architecture

Clypr consists of four main components:

1. **dApp Message Interface**: Standardized protocol for sending messages to user canisters
2. **User Privacy Canister**: Personal agent that evaluates messages against rules
3. **AI Spam Detection System**: Machine learning-based filtering for unwanted communications
4. **Webhook Bridge Service**: Secure relay that delivers approved messages to external channels
5. **Admin Frontend**: User interface for managing privacy rules and preferences

## 🚀 Getting Started

### Prerequisites

- [DFINITY Canister SDK](https://sdk.dfinity.org) (version 0.11.0+)
- Node.js 16+
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/clypr.git
cd clypr
```

2. Install dependencies
```bash
npm install
```

3. Start the local Internet Computer replica
```bash
dfx start --background
```

4. Deploy the canisters locally
```bash
dfx deploy
```

5. Start the webhook bridge service
```bash
cd webhook
npm install
npm start
```

6. Start the frontend
```bash
cd src/frontend
npm install
npm start
```

## 📚 Documentation

- [Product Requirements Document](docs/PRD.md)
- [Technical Architecture](docs/ARCHITECTURE.md)
- [Backend Architecture](docs/BACKEND_ARCHITECTURE.md)
- [AI Spam Detection System](docs/AI_SPAM_DETECTION.md)
- [API Reference](docs/API.md)
- [User Guide](docs/USER_GUIDE.md)
- [Developer Guide](docs/DEVELOPER_GUIDE.md)
- [Contributing Guide](docs/CONTRIBUTING.md)

## 💡 Use Cases

- **Selective Notifications**: Only receive messages from trusted sources or high-priority alerts
- **Communication Consolidation**: Manage all Web3 communications in one place
- **Intelligent Spam Protection**: AI-powered filtering for sophisticated unwanted communications
- **Channel-Specific Routing**: Send urgent messages to SMS, regular updates to email
- **Privacy Protection**: Interact with dApps without exposing personal contact details
- **Adaptive Learning**: System improves filtering based on your preferences over time

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. See our [Contributing Guide](docs/CONTRIBUTING.md) for more details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [Website](https://clypr.io)
- [Documentation](https://docs.clypr.io)
- [GitHub](https://github.com/yourusername/clypr)
- [Discord](https://discord.gg/clypr)
