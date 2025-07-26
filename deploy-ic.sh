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

echo "� Deploying Internet Identity canister..."
dfx deploy internet_identity

echo "�🚀 Deploying frontend canister..."
dfx deploy frontend

echo "✅ Deployment complete! Your application is now available on the Internet Computer."
echo "   Frontend URL: http://localhost:4943/?canisterId=$(dfx canister id frontend)"
echo "   Frontend Canister URL: http://$(dfx canister id frontend).localhost:4943"
echo "   Backend Canister ID: $(dfx canister id backend)"
echo "   Internet Identity URL: http://$(dfx canister id internet_identity).localhost:4943"
echo ""
echo "   To deploy to the IC mainnet, run: ./deploy-ic-mainnet.sh"

# Update the frontend configuration with ALL canister IDs
BACKEND_ID=$(dfx canister id backend)
FRONTEND_ID=$(dfx canister id frontend)
II_ID=$(dfx canister id internet_identity)

echo "📝 Creating canister ID environment file for the frontend..."
cat > src/frontend/.env.local << EOL
CLYPR_CANISTER_ID=${BACKEND_ID}
FRONTEND_CANISTER_ID=${FRONTEND_ID}
INTERNET_IDENTITY_CANISTER_ID=${II_ID}
DFX_NETWORK=local
EOL

# Also update the public canister-ids.js file
echo "📝 Updating canister IDs configuration..."
cat > src/frontend/public/canister-ids.js << EOL
window.canisterIds = {
  backend: '${BACKEND_ID}',
  frontend: '${FRONTEND_ID}',
  internet_identity: '${II_ID}'
};
EOL

echo "Environment file created at src/frontend/.env.local"
echo "Canister IDs updated in src/frontend/public/canister-ids.js"

echo ""
echo "🎯 Quick Test Commands:"
echo "   Test backend: dfx canister call backend ping"
echo "   Test II: curl http://${II_ID}.localhost:4943"
echo "   Open app: http://${FRONTEND_ID}.localhost:4943"
