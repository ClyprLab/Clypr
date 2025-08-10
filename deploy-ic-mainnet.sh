#!/bin/bash

# Clypr - Internet Computer Mainnet Deployment Script
# This script deploys Clypr to the Internet Computer mainnet for production use

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

# Setup environment
setup_environment() {
    print_status "Setting up environment..."
    
    if [ -f "$HOME/.local/share/dfx/env" ]; then
        source "$HOME/.local/share/dfx/env"
        print_success "DFX environment sourced"
    else
        print_warning "DFX environment file not found. DFX may not be in PATH."
    fi
}

# Verify authentication and wallet
verify_authentication() {
    print_status "Verifying Internet Computer authentication..."
    
    # Check if user is authenticated
    if ! dfx identity get-principal &> /dev/null; then
        print_error "Not authenticated with Internet Computer."
        echo "Please set up your identity:"
        echo "   dfx identity new production"
        echo "   dfx identity use production"
        exit 1
    fi
    
    PRINCIPAL=$(dfx identity get-principal)
    print_success "Authenticated as: $PRINCIPAL"
    
    # Check cycle wallet
    print_status "Checking cycle wallet balance..."
    if ! dfx wallet --network ic balance &> /dev/null; then
        print_warning "Could not verify cycle wallet. Make sure you have:"
        echo "   • A cycle wallet configured"
        echo "   • Sufficient cycles for deployment"
        echo "   • Proper network configuration"
    else
        BALANCE=$(dfx wallet --network ic balance)
        print_success "Cycle wallet balance: $BALANCE"
    fi
}

# Build frontend for production
build_frontend() {
    print_status "Building frontend for production deployment..."
    
    cd src/frontend
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        print_status "Installing frontend dependencies..."
        yarn install
    fi
    
    # Build with IC configuration
    print_status "Building with production configuration..."
    yarn vite build
    
    cd ../..
    print_success "Frontend build completed"
}

# Confirm deployment
confirm_deployment() {
    echo ""
    print_warning "🚨 PRODUCTION DEPLOYMENT WARNING 🚨"
    echo "This will deploy Clypr to the Internet Computer mainnet."
    echo "This action will:"
    echo "   • Deploy frontend and backend canisters to mainnet"
    echo "   • Consume cycles from your wallet"
    echo "   • Make the application publicly accessible"
    echo "   • Cannot be easily undone"
    echo ""
    
    read -p "Are you sure you want to continue with production deployment? (y/N): " -n 1 -r
    echo
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_status "Deployment cancelled by user."
        exit 0
    fi
    
    print_success "Deployment confirmed. Proceeding..."
}

# Deploy to mainnet
deploy_to_mainnet() {
    print_status "Deploying to Internet Computer mainnet..."
    
    # Deploy backend first
    print_status "Deploying backend canister..."
    dfx deploy --network ic backend
    print_success "Backend deployment completed"
    
    # Wait a moment for backend to stabilize
    sleep 10
    
    # Deploy frontend with increased timeout
    print_status "Deploying frontend canister..."
    DFX_HTTP_TIMEOUT=1800000 dfx deploy --network ic frontend
    
    print_success "Mainnet deployment completed"
}

# Update configuration files
update_configuration() {
    print_status "Updating production configuration files..."
    
    # Get deployed canister IDs
    FRONTEND_ID=$(dfx canister --network ic id frontend)
    BACKEND_ID=$(dfx canister --network ic id backend)
    
    # Create production environment file
    cat > src/frontend/.env.production << EOL
# Clypr Production Environment
CLYPR_CANISTER_ID=${BACKEND_ID}
FRONTEND_CANISTER_ID=${FRONTEND_ID}
DFX_NETWORK=ic
EOL
    
    # Update canister IDs for production
    cat > src/frontend/public/canister-ids.js << EOL
// Clypr Canister IDs for Production
window.canisterIds = {
  backend: '${BACKEND_ID}',
  frontend: '${FRONTEND_ID}'
};
EOL
    
    print_success "Production configuration files updated"
}

# Display deployment information
show_deployment_info() {
    FRONTEND_ID=$(dfx canister --network ic id frontend)
    BACKEND_ID=$(dfx canister --network ic id backend)
    
    print_success "🎉 Clypr successfully deployed to Internet Computer mainnet!"
    echo ""
    echo "🌐 Production URLs:"
    echo "   Frontend: https://${FRONTEND_ID}.icp0.io/"
    echo "   Direct: https://${FRONTEND_ID}.icp0.io/"
    echo ""
    echo "🔧 Canister IDs:"
    echo "   Frontend: ${FRONTEND_ID}"
    echo "   Backend: ${BACKEND_ID}"
    echo ""
    echo "📊 Deployment Status:"
    echo "   • Canisters deployed successfully"
    echo "   • Configuration files updated"
    echo "   • Application is now live on mainnet"
    echo ""
    echo "⏱️  Important Notes:"
    echo "   • It may take 2-5 minutes for canisters to be fully accessible"
    echo "   • Monitor canister status: dfx canister --network ic info ${FRONTEND_ID}"
    echo "   • Check cycle consumption: dfx wallet --network ic balance"
    echo ""
    echo "🔗 Next Steps:"
    echo "   • Test the live application"
    echo "   • Monitor performance and usage"
    echo "   • Set up monitoring and analytics"
    echo ""
    echo "📚 Documentation:"
    echo "   • User Guide: docs/USER_GUIDE.md"
    echo "   • API Reference: docs/API.md"
    echo "   • Architecture: docs/ARCHITECTURE.md"
}

# Main execution
main() {
    echo "🚀 Clypr - Internet Computer Mainnet Deployment"
    echo "================================================"
    echo ""
    
    check_prerequisites
    setup_environment
    verify_authentication
    build_frontend
    confirm_deployment
    deploy_to_mainnet
    update_configuration
    show_deployment_info
}

# Run main function
main "$@"
