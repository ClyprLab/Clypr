# Clypr Installation Guide

This guide will help you set up Clypr for local development and production deployment on the Internet Computer Protocol (ICP).

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your system:

### Required Software

1. **Node.js** (version 16 or higher)
   ```bash
   # Check your Node.js version
   node --version
   
   # If not installed, download from: https://nodejs.org/
   ```

2. **Yarn** (version 1.22 or higher)
   ```bash
   # Install Yarn globally
   npm install -g yarn
   
   # Verify installation
   yarn --version
   ```

3. **DFINITY Canister SDK (dfx)**
   ```bash
   # Install DFX
   sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"
   
   # Source the environment (add to your shell profile)
   source "$HOME/.local/share/dfx/env"
   
   # Verify installation
   dfx --version
   ```

### Optional but Recommended

- **Git** for version control
- **VS Code** or your preferred code editor
- **Internet Identity** for authentication testing

## 🚀 Quick Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/abdushakurob/clypr.git
cd clypr
```

### Step 2: Install Dependencies

```bash
cd src/frontend
yarn install
cd ../..
```

### Step 3: Deploy to Local IC Replica

```bash
# Make scripts executable
chmod +x deploy-ic.sh
chmod +x deploy-ic-mainnet.sh

# Deploy to local replica
./deploy-ic.sh
```

### Step 4: Access the Application

- **Frontend**: http://localhost:4943/?canisterId=[FRONTEND_ID]
- **Direct URL**: http://[FRONTEND_ID].localhost:4943

## 🔧 Detailed Setup Instructions

### Local Development Setup

1. **Environment Preparation**
   ```bash
   # Ensure you're in the project root
   pwd  # Should show /path/to/clypr
   
   # Check all prerequisites
   node --version
   yarn --version
   dfx --version
   ```

2. **Frontend Development**
   ```bash
   cd src/frontend
   
   # Install dependencies
   yarn install
   
   # Start development server
   yarn dev
   ```

3. **Backend Development**
   ```bash
   # In a new terminal, start local IC replica
   dfx start --background --clean
   
   # Deploy backend canisters
   dfx deploy backend
   dfx deploy internet_identity
   ```

4. **Testing the Setup**
   ```bash
   # Test backend connectivity
   dfx canister call backend ping
   
   # Check canister status
   dfx canister status backend
   ```

### Production Deployment Setup

1. **Identity Configuration**
   ```bash
   # Create production identity
   dfx identity new production
   dfx identity use production
   
   # Verify identity
   dfx identity get-principal
   ```

2. **Cycle Wallet Setup**
   ```bash
   # Check wallet balance
   dfx wallet --network ic balance
   
   # If no wallet exists, create one
   dfx wallet --network ic create
   ```

3. **Deploy to Mainnet**
   ```bash
   # Deploy to Internet Computer mainnet
   ./deploy-ic-mainnet.sh
   ```

## 🐛 Troubleshooting

### Common Issues and Solutions

#### 1. DFX Not Found
```bash
# Error: dfx: command not found
# Solution: Add DFX to your PATH
echo 'source "$HOME/.local/share/dfx/env"' >> ~/.bashrc
source ~/.bashrc
```

#### 2. Yarn Installation Issues
```bash
# Error: yarn: command not found
# Solution: Install Yarn globally
npm install -g yarn

# Alternative: Use npm instead
npm install
npm run dev
```

#### 3. Port Already in Use
```bash
# Error: Port 4943 is already in use
# Solution: Stop existing replica
dfx stop

# Or kill the process
lsof -ti:4943 | xargs kill -9
```

#### 4. Insufficient Cycles
```bash
# Error: Insufficient cycles for deployment
# Solution: Add cycles to your wallet
dfx wallet --network ic send [WALLET_ID] [AMOUNT]
```

#### 5. Build Failures
```bash
# Error: Build failed
# Solution: Clear cache and rebuild
cd src/frontend
rm -rf node_modules
rm -rf dist
yarn install
yarn build
```

### Environment-Specific Issues

#### Linux
```bash
# Permission issues with scripts
chmod +x *.sh

# Node.js installation issues
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### macOS
```bash
# Homebrew installation
brew install node yarn

# DFX installation
brew install dfinity/tap/dfx
```

#### Windows
```bash
# Use WSL2 for better compatibility
# Install Ubuntu on WSL2 and follow Linux instructions

# Or use Windows Subsystem for Linux
wsl --install
```

## 📊 Verification Checklist

After installation, verify that everything is working:

- [ ] Node.js version 16+ installed
- [ ] Yarn version 1.22+ installed
- [ ] DFX version latest installed
- [ ] Repository cloned successfully
- [ ] Frontend dependencies installed
- [ ] Local IC replica starts without errors
- [ ] Backend canister deploys successfully
- [ ] Frontend canister deploys successfully
- [ ] Application accessible via browser
- [ ] Internet Identity authentication works
- [ ] Can create and manage privacy rules
- [ ] Can configure communication channels

## 🔗 Additional Resources

- [Internet Computer Documentation](https://internetcomputer.org/docs/current/developer-docs/)
- [DFINITY Developer Portal](https://dfinity.org/developers)
- [Motoko Language Guide](https://internetcomputer.org/docs/current/developer-docs/build/languages/motoko/)
- [React Documentation](https://reactjs.org/docs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 📞 Support

If you encounter issues not covered in this guide:

1. Check the [Troubleshooting](#-troubleshooting) section above
2. Review the [Documentation](docs/) folder
3. Open an issue on the [GitHub repository](https://github.com/abdushakurob/clypr)
4. Check the [Internet Computer forums](https://forum.dfinity.org/)

## 🎯 Next Steps

After successful installation:

1. **Explore the Application**
   - Navigate through the dashboard
   - Create your first privacy rule
   - Configure a communication channel

2. **Read the Documentation**
   - [User Guide](docs/USER_GUIDE.md)
   - [API Reference](docs/API.md)
   - [Architecture Overview](docs/ARCHITECTURE.md)

3. **Start Developing**
   - [Developer Guide](docs/DEVELOPER_GUIDE.md)
   - [Contributing Guidelines](docs/CONTRIBUTING.md)

---

**Happy coding! 🚀** 