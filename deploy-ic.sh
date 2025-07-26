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

echo "🚀 Deploying frontend canister..."
dfx deploy frontend

echo "✅ Deployment complete! Your frontend is now available on the Internet Computer."
echo "   Local URL: http://localhost:4943/?canisterId=$(dfx canister id frontend)"
echo "   To deploy to the IC mainnet, run: dfx deploy --network ic"
