#!/bin/bash

# Stop on error
set -e

# Source dfx environment if it exists
if [ -f "$HOME/.local/share/dfx/env" ]; then
  source "$HOME/.local/share/dfx/env"
fi

echo "🔑 Verifying you are authenticated with Internet Computer..."
dfx identity get-principal || { echo "⚠️  Error: Not authenticated. Please run 'dfx identity new' or 'dfx identity use' to set up your identity."; exit 1; }

echo "💰 Checking cycle wallet..."
dfx wallet --network ic balance || { echo "⚠️  Warning: Couldn't verify cycle wallet. Make sure you have a cycle wallet configured and enough cycles."; }

echo "📦 Building frontend for production..."
cd src/frontend
yarn vite build --config vite.config.ic.ts
cd ../..

echo "🚀 Deploying to Internet Computer mainnet..."
echo "This will deploy both frontend and backend canisters to the IC mainnet."
echo "⚠️  This will require cycles from your wallet. Make sure you have enough cycles."
read -p "Are you sure you want to continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo "Deployment cancelled."
    exit 0
fi

# Deploy to mainnet
echo "Deploying to mainnet..."
dfx deploy --network ic

# Get the deployed canister IDs
FRONTEND_ID=$(dfx canister --network ic id frontend)
BACKEND_ID=$(dfx canister --network ic id backend)

echo "✅ Deployment complete!"
echo "   Frontend URL: https://$FRONTEND_ID.icp0.io/"
echo "   Backend Canister ID: $BACKEND_ID"

# Update the frontend configuration with the backend canister ID
echo "📝 Creating canister ID environment file for production..."
cat > src/frontend/.env.production << EOL
CLYPR_CANISTER_ID=${BACKEND_ID}
FRONTEND_CANISTER_ID=${FRONTEND_ID}
DFX_NETWORK=ic
EOL

echo "Environment file created at src/frontend/.env.production"
echo ""
echo "Note: It may take a few minutes for your canisters to be fully deployed and accessible."
echo "You can check the status of your canisters with: dfx canister --network ic info <canister_id>"
