#!/bin/bash

# Stop on error
set -e

# Source dfx environment if it exists
if [ -f "$HOME/.local/share/dfx/env" ]; then
  source "$HOME/.local/share/dfx/env"
fi

echo "📦 Building frontend..."
cd src/frontend
# Create the config file if it doesn't exist
if [ ! -f vite.config.ic.ts ]; then
  echo "Creating IC-specific Vite config..."
  cp vite.config.ts vite.config.ic.ts
fi
# Use the direct vite command with the specific config
yarn vite build --config vite.config.ic.ts
cd ../..

echo "🔄 Setting up local Internet Computer replica..."
# Try to stop any running replica first
dfx stop 2>/dev/null || true
echo "Starting new replica..."
dfx start --background --clean

echo "📝 Creating canisters..."
dfx canister create --all

echo "🚀 Deploying backend canister..."
dfx deploy backend

echo "🚀 Deploying frontend canister..."
dfx deploy frontend

echo "✅ Deployment complete! Your application is now available on the Internet Computer."
echo "   Frontend URL: http://localhost:4943/?canisterId=$(dfx canister id frontend)"
echo "   Backend Canister ID: $(dfx canister id backend)"
echo ""
echo "   To deploy to the IC mainnet, run: ./deploy-ic-mainnet.sh"

# Update the frontend configuration with the backend canister ID
BACKEND_ID=$(dfx canister id backend)
FRONTEND_ID=$(dfx canister id frontend)

echo "📝 Creating canister ID environment file for the frontend..."
cat > src/frontend/.env.local << EOL
CLYPR_CANISTER_ID=${BACKEND_ID}
FRONTEND_CANISTER_ID=${FRONTEND_ID}
DFX_NETWORK=local
EOL

echo "Environment file created at src/frontend/.env.local"
