#!/bin/bash

# Clypr - Local Internet Computer Deployment Script
# This script deploys Clypr to a local Internet Computer replica for development and testing

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    if ! command -v dfx &> /dev/null; then
        print_error "DFX is not installed. Please install it first:"
        echo "   sh -ci \"\$(curl -fsSL https://internetcomputer.org/install.sh)\""
        exit 1
    fi
    
    if ! command -v yarn &> /dev/null; then
        print_error "Yarn is not installed. Please install it first:"
        echo "   npm install -g yarn"
        exit 1
    fi
    
    if [ ! -f "src/frontend/package.json" ]; then
        print_error "Frontend package.json not found. Are you in the correct directory?"
        exit 1
    fi
    
    print_success "All prerequisites are satisfied"
}

# Source dfx environment if it exists
setup_environment() {
    print_status "Setting up environment..."
    
    if [ -f "$HOME/.local/share/dfx/env" ]; then
        source "$HOME/.local/share/dfx/env"
        print_success "DFX environment sourced"
    else
        print_warning "DFX environment file not found. DFX may not be in PATH."
    fi
}

# Build frontend
build_frontend() {
    print_status "Building frontend application..."
    
    cd src/frontend
    
    # Install dependencies if node_modules doesn't exist
    if [ ! -d "node_modules" ]; then
        print_status "Installing frontend dependencies..."
        yarn install
    fi
    
    # Create IC-specific config if it doesn't exist
    if [ ! -f "vite.config.ic.ts" ]; then
        print_status "Creating IC-specific Vite configuration..."
        cp vite.config.ts vite.config.ic.ts
    fi
    
    # Build with IC configuration
    print_status "Building with IC configuration..."
    yarn vite build --config vite.config.ic.ts
    
    cd ../..
    print_success "Frontend build completed"
}

# Start local IC replica
start_replica() {
    print_status "Starting local Internet Computer replica..."
    
    # Stop any running replica
    if dfx stop 2>/dev/null; then
        print_status "Stopped existing replica"
    fi
    
    # Start new replica
    dfx start --background --clean
    print_success "Local IC replica started"
}

# Deploy canisters
deploy_canisters() {
    print_status "Creating and deploying canisters..."
    
    # Create canisters
    dfx canister create --all
    
    # Deploy backend
    print_status "Deploying backend canister..."
    dfx deploy backend
    
    # Deploy Internet Identity
    print_status "Deploying Internet Identity canister..."
    dfx deploy internet_identity
    
    # Deploy frontend
    print_status "Deploying frontend canister..."
    dfx deploy frontend
    
    print_success "All canisters deployed successfully"
}

# Update configuration files
update_configuration() {
    print_status "Updating configuration files..."
    
    # Get canister IDs
    BACKEND_ID=$(dfx canister id backend)
    FRONTEND_ID=$(dfx canister id frontend)
    II_ID=$(dfx canister id internet_identity)
    
    # Create environment file
    cat > src/frontend/.env.local << EOL
# Clypr Local Development Environment
CLYPR_CANISTER_ID=${BACKEND_ID}
FRONTEND_CANISTER_ID=${FRONTEND_ID}
INTERNET_IDENTITY_CANISTER_ID=${II_ID}
DFX_NETWORK=local
EOL
    
    # Update canister IDs configuration
    cat > src/frontend/public/canister-ids.js << EOL
// Clypr Canister IDs for Local Development
window.canisterIds = {
  backend: '${BACKEND_ID}',
  frontend: '${FRONTEND_ID}',
  internet_identity: '${II_ID}'
};
EOL
    
    print_success "Configuration files updated"
}

# Display deployment information
show_deployment_info() {
    print_success "🎉 Clypr deployment completed successfully!"
    echo ""
    echo "📱 Application URLs:"
    echo "   Frontend: http://localhost:4943/?canisterId=$(dfx canister id frontend)"
    echo "   Direct: http://$(dfx canister id frontend).localhost:4943"
    echo ""
    echo "🔧 Canister IDs:"
    echo "   Backend: $(dfx canister id backend)"
    echo "   Frontend: $(dfx canister id frontend)"
    echo "   Internet Identity: $(dfx canister id internet_identity)"
    echo ""
    echo "🧪 Quick Test Commands:"
    echo "   Test backend: dfx canister call backend ping"
    echo "   Test II: curl http://$(dfx canister id internet_identity).localhost:4943"
    echo ""
    echo "🚀 Next Steps:"
    echo "   • Open the frontend URL in your browser"
    echo "   • Authenticate with Internet Identity"
    echo "   • Start creating privacy rules and channels"
    echo ""
    echo "📚 For production deployment, run: ./deploy-ic-mainnet.sh"
}

# Main execution
main() {
    echo "🚀 Clypr - Local Internet Computer Deployment"
    echo "=============================================="
    echo ""
    
    check_prerequisites
    setup_environment
    build_frontend
    start_replica
    deploy_canisters
    update_configuration
    show_deployment_info
}

# Run main function
main "$@"
