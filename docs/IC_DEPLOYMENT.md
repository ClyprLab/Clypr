# Deployment Guide: Frontend to Internet Computer

This guide explains how to deploy your Clypr frontend from Vercel to the Internet Computer.

## Prerequisites

- Install the DFINITY Canister SDK (dfx):
  ```bash
  sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"
  ```

- Verify installation:
  ```bash
  dfx --version
  ```

## Project Structure

The project has been configured for Internet Computer deployment:

- `dfx.json` in the project root defines canisters
- `src/frontend` contains your React frontend
- `src/backend` contains the Motoko backend (placeholder)

## Deployment Steps

### 1. Local Deployment for Testing

Run the provided deployment script:

```bash
./deploy-ic.sh
```

This script will:
- Build your frontend with IC-specific configuration
- Start a local IC replica
- Create the necessary canisters
- Deploy your frontend to the local replica
- Display the local URL to access your app

### 2. Manual Deployment Process

If you prefer to run the steps individually:

```bash
# Start the local IC replica
dfx start --clean --background

# Create the canisters
dfx canister create --all

# Build the frontend
cd src/frontend
yarn build:ic
cd ../..

# Deploy the frontend canister
dfx deploy frontend
```

### 3. Accessing Your Deployed Frontend

- **Local**: `http://localhost:4943/?canisterId=$(dfx canister id frontend)`
- **Production**: After deploying to the IC mainnet, your app will be accessible at a URL like `https://<canister-id>.icp0.io/`

### 4. Deploying to IC Mainnet

To deploy to the production Internet Computer network:

1. Get some ICP tokens and convert them to cycles
2. Configure your identity: `dfx identity new production`
3. Deploy: `dfx deploy --network ic`

## Vercel to IC Migration Considerations

1. **Environment Variables**: Update any environment variables in your code to work with IC
2. **API Endpoints**: Update API endpoints to point to your backend canister
3. **Authentication**: Ensure Internet Identity integration works correctly
4. **Asset Loading**: Make sure all assets use relative paths

## Technical Notes

- The Vite configuration has been updated to work with IC (see `vite.config.ic.ts`)
- The frontend is configured as an assets canister
- A basic backend canister placeholder has been created in Motoko

## Troubleshooting

- **Build Issues**: Check Vite configuration and dependencies
- **Deployment Errors**: Ensure dfx is properly installed and configured
- **Runtime Errors**: Check browser console for errors related to canister calls
- **Authentication Issues**: Verify Internet Identity integration
