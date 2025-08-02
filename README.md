# Clypr - Decentralized Communication Privacy Relay

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![ICP: Compatible](https://img.shields.io/badge/ICP-Compatible-orange.svg)](https://internetcomputer.org/)
[![Development Status](https://img.shields.io/badge/Status-In%20Development-yellow.svg)](docs/PROGRESS_REPORT.md)
[![Node.js](https://img.shields.io/badge/Node.js-16+-green.svg)](https://nodejs.org/)
[![Yarn](https://img.shields.io/badge/Yarn-1.22+-blue.svg)](https://yarnpkg.com/)

## 🎯 Project Overview

**Clypr** is a revolutionary programmable privacy gateway for Web3 messaging, built on the Internet Computer Protocol (ICP). It empowers users to take complete control over how decentralized applications (dApps) communicate with them through customizable privacy rules and intelligent filtering.

### 🌟 The Problem We Solve

In the current Web3 ecosystem, users lack control over their communication privacy. dApps often require direct access to personal contact information (email, phone), leading to:
- **Privacy violations** - Personal data exposed to multiple dApps
- **Spam overload** - Unwanted messages from various sources
- **No filtering control** - Users can't customize what messages they receive
- **Fragmented communication** - Messages scattered across different platforms

### 💡 Our Solution

Clypr creates a **personal privacy agent** for each user - a dedicated canister that acts as an intelligent gateway between dApps and real-world communication channels. Instead of dApps sending messages directly to users, they send messages to the user's privacy canister, which:

1. **Evaluates** messages against user-defined privacy rules
2. **Filters** unwanted content using AI-powered spam detection
3. **Routes** approved messages to preferred channels (email, SMS, webhooks)
4. **Preserves** user privacy by never exposing real contact information

```
dApp → User's Privacy Canister → Privacy Rules Evaluation → Webhook Bridge → Email/SMS delivery
```

## 🚀 Quick Start

### Production Application

The Clypr application is fully deployed on the Internet Computer. You can access it directly at:

```
https://5nif7-uaaaa-aaaag-aufha-cai.icp0.io/
```

No installation needed! Just visit the URL and start using Clypr.

### For Developers

If you want to contribute or run the application locally, follow these steps:

#### Prerequisites

- **DFINITY Canister SDK (dfx)** - [Quick Install](https://internetcomputer.org/docs/current/developer-docs/setup/install/):
  ```bash
  sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"
  ```

#### Local Development Setup

1. **Clone the repository**
```bash
git clone https://github.com/abdushakurob/clypr.git
cd clypr
```

2. **Start the local Internet Computer replica**
```bash
dfx start --background
```

3. **Deploy the application locally**
```bash
./deploy-ic.sh
```

4. **Access the application**
- Local deployment will be available at: `http://localhost:4943`
- Your canister ID will be shown in the terminal after deployment

### Deployment Process

#### Local Testing
After making changes, test them locally:
```bash
./deploy-ic.sh
```

#### Production Deployment
Deployment to Internet Computer mainnet requires proper credentials:
```bash
# Deploy to mainnet (requires deployment credentials)
./deploy-ic-mainnet.sh
```

Note: Production deployment is handled by project maintainers. Contributors should focus on local development and testing.

## ✨ Key Features

### 🔐 **Personal Privacy Agent**
- Each user gets a dedicated canister as their privacy gateway
- Complete isolation of user data with privacy-by-design architecture
- No shared state between users

### ⚙️ **Programmable Rules Engine**
- Create custom filtering rules with multiple conditions
- Support for sender verification, content analysis, and priority levels
- Real-time rule evaluation and message processing

### 📱 **Multi-Channel Management**
- Configure multiple communication channels (email, SMS, webhooks)
- Channel-specific routing based on message priority and type
- Secure webhook integration for external services

### 🤖 **AI-Powered Spam Detection**
- Machine learning-based content classification
- Adaptive filtering that learns from user preferences
- Sophisticated spam pattern recognition

### 🛡️ **Privacy Preservation**
- dApps never see users' actual contact information
- End-to-end encrypted message processing
- Zero-knowledge proof of message delivery

## 🏗️ Architecture

### Core Components

1. **Frontend Application** (React + TypeScript)
   - Modern, responsive UI with mobile-first design
   - Real-time dashboard with message analytics
   - Intuitive rule and channel management interface

2. **Backend Canisters** (Motoko)
   - User privacy agent with isolated data storage
   - Rule engine for message evaluation
   - Message processor with webhook integration

3. **Webhook Bridge Service**
   - Secure relay for external channel delivery
   - Rate limiting and error handling
   - Multi-channel support (email, SMS, custom webhooks)

4. **AI Spam Detection System**
   - Content classification and filtering
   - Adaptive learning from user feedback
   - Real-time threat detection

## 📊 Screenshots

### Dashboard
![Dashboard](src/frontend/src/assets/dashboard.png)

### Rules Management
![Rules Page](src/frontend/src/assets/Clypr%20Rules%20Page.png)

### Channel Configuration
![Channels Page](src/frontend/src/assets/Clypr%20Channels%20Page.png)

### Message History
![Messages Page](src/frontend/src/assets/Clypr%20Messages%20page.png)

## 🎯 Use Cases

### For Individual Users
- **Selective Notifications**: Only receive messages from trusted sources
- **Communication Consolidation**: Manage all Web3 communications in one place
- **Intelligent Spam Protection**: AI-powered filtering for unwanted messages
- **Channel-Specific Routing**: Send urgent messages to SMS, regular updates to email

### For dApp Developers
- **Privacy-First Integration**: Build user-friendly apps without privacy concerns
- **Standardized Messaging**: Use consistent API for all user communications
- **Reduced Infrastructure**: No need to manage email/SMS delivery systems
- **Enhanced User Experience**: Better engagement through filtered, relevant messages

### For Enterprises
- **Compliance**: Meet privacy regulations with built-in data protection
- **Scalability**: Handle millions of users with decentralized architecture
- **Cost Efficiency**: Reduce infrastructure costs with shared privacy layer
- **Security**: Enterprise-grade security with blockchain-level immutability

## 🛠️ Technical Stack

- **Frontend**: React 18, TypeScript, Vite, Styled Components
- **Backend**: Motoko canisters on Internet Computer Protocol
- **Authentication**: Internet Identity integration
- **Deployment**: DFX with local and mainnet support
- **Build System**: Vite with custom IC configuration
- **Package Manager**: Yarn

## 📚 Documentation

- [Product Requirements Document](docs/PRD.md)
- [Technical Architecture](docs/ARCHITECTURE.md)
- [API Reference](docs/API.md)
- [User Guide](docs/USER_GUIDE.md)
- [Developer Guide](docs/DEVELOPER_GUIDE.md)
- [Contributing Guide](docs/CONTRIBUTING.md)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](docs/CONTRIBUTING.md) for details on:

- Code of Conduct
- Development Setup
- Pull Request Process
- Issue Reporting

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [GitHub Repository](https://github.com/abdushakurob/clypr)
- [Internet Computer](https://internetcomputer.org/)
- [DFINITY Foundation](https://dfinity.org/)

## 🙏 Acknowledgments

- Built on the Internet Computer Protocol
- Powered by DFINITY's Motoko language
- Inspired by the need for privacy in Web3 communications

---

**Clypr** - Empowering Web3 users with programmable privacy control.

