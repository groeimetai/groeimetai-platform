#!/bin/bash

# GroeiMetAI Blockchain Certificate System Deployment Script
# This script handles deployment to Mumbai testnet and Polygon mainnet

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
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

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check environment variables
check_env_vars() {
    local required_vars=("PRIVATE_KEY" "POLYGONSCAN_API_KEY")
    local missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -ne 0 ]; then
        print_error "Missing required environment variables: ${missing_vars[*]}"
        print_info "Please set them in your .env file"
        exit 1
    fi
}

# Function to deploy contract
deploy_contract() {
    local network=$1
    local gas_price=$2
    
    print_info "Deploying to $network..."
    
    # Run deployment
    npx hardhat run scripts/deploy-certificate-registry.js --network "$network"
    
    # Check if deployment was successful
    if [ $? -eq 0 ]; then
        print_success "Contract deployed successfully to $network"
        
        # Extract contract address from deployment file
        local deployment_file="./deployments/CertificateRegistry-${network}.json"
        if [ -f "$deployment_file" ]; then
            CONTRACT_ADDRESS=$(jq -r '.contractAddress' "$deployment_file")
            print_info "Contract address: $CONTRACT_ADDRESS"
            
            # Update .env file with contract address
            update_env_var "NEXT_PUBLIC_CERTIFICATE_CONTRACT_${network^^}" "$CONTRACT_ADDRESS"
        fi
    else
        print_error "Deployment to $network failed"
        exit 1
    fi
}

# Function to update environment variable
update_env_var() {
    local key=$1
    local value=$2
    local env_file=".env"
    
    if grep -q "^$key=" "$env_file"; then
        # Update existing variable
        sed -i.bak "s/^$key=.*/$key=$value/" "$env_file"
        print_info "Updated $key in $env_file"
    else
        # Add new variable
        echo "$key=$value" >> "$env_file"
        print_info "Added $key to $env_file"
    fi
}

# Function to verify contract
verify_contract() {
    local network=$1
    local contract_address=$2
    
    print_info "Verifying contract on $network..."
    
    npx hardhat verify --network "$network" "$contract_address"
    
    if [ $? -eq 0 ]; then
        print_success "Contract verified successfully"
    else
        print_warning "Contract verification failed. You can verify manually later."
    fi
}

# Function to setup IPFS/Pinata
setup_ipfs() {
    print_info "Setting up IPFS/Pinata configuration..."
    
    # Check for Pinata API keys
    if [ -z "$PINATA_API_KEY" ] || [ -z "$PINATA_SECRET_API_KEY" ]; then
        print_warning "Pinata API keys not found. Please add them to .env:"
        print_info "PINATA_API_KEY=your_pinata_api_key"
        print_info "PINATA_SECRET_API_KEY=your_pinata_secret_api_key"
    else
        print_success "Pinata configuration found"
    fi
}

# Main deployment function
main() {
    print_info "Starting GroeiMetAI Blockchain Certificate System Deployment"
    echo "============================================================"
    
    # Check prerequisites
    print_info "Checking prerequisites..."
    
    if ! command_exists "node"; then
        print_error "Node.js is not installed"
        exit 1
    fi
    
    if ! command_exists "npx"; then
        print_error "npx is not installed"
        exit 1
    fi
    
    if ! command_exists "jq"; then
        print_warning "jq is not installed. Install it for automatic env updates:"
        print_info "brew install jq (macOS) or apt-get install jq (Ubuntu)"
    fi
    
    # Load environment variables
    if [ -f .env ]; then
        export $(cat .env | grep -v '^#' | xargs)
    else
        print_error ".env file not found"
        exit 1
    fi
    
    # Check required environment variables
    check_env_vars
    
    # Install dependencies
    print_info "Installing dependencies..."
    npm install
    
    # Compile contracts
    print_info "Compiling contracts..."
    npx hardhat compile
    
    # Run tests
    print_info "Running contract tests..."
    npx hardhat test
    
    if [ $? -ne 0 ]; then
        print_error "Tests failed. Fix issues before deployment."
        exit 1
    fi
    
    # Choose deployment network
    echo ""
    print_info "Select deployment network:"
    echo "1) Local Hardhat Network"
    echo "2) Mumbai Testnet"
    echo "3) Polygon Mainnet"
    echo "4) Deploy to all networks"
    read -p "Enter your choice (1-4): " choice
    
    case $choice in
        1)
            # Start local hardhat node
            print_info "Starting local Hardhat node..."
            npx hardhat node &
            HARDHAT_PID=$!
            sleep 5
            
            deploy_contract "hardhat" "8000000000"
            
            # Keep node running
            print_info "Local node running with PID: $HARDHAT_PID"
            print_info "Press Ctrl+C to stop"
            wait $HARDHAT_PID
            ;;
        2)
            deploy_contract "mumbai" "35000000000"
            ;;
        3)
            print_warning "You are about to deploy to Polygon Mainnet!"
            read -p "Are you sure? (yes/no): " confirm
            if [ "$confirm" = "yes" ]; then
                deploy_contract "polygon" "50000000000"
            else
                print_info "Mainnet deployment cancelled"
            fi
            ;;
        4)
            # Deploy to all networks
            deploy_contract "mumbai" "35000000000"
            
            print_warning "Deploy to Polygon Mainnet as well?"
            read -p "Are you sure? (yes/no): " confirm
            if [ "$confirm" = "yes" ]; then
                deploy_contract "polygon" "50000000000"
            fi
            ;;
        *)
            print_error "Invalid choice"
            exit 1
            ;;
    esac
    
    # Setup IPFS/Pinata
    setup_ipfs
    
    # Generate deployment report
    print_info "Generating deployment report..."
    ./scripts/generate-deployment-report.sh
    
    print_success "Deployment completed successfully!"
    echo ""
    print_info "Next steps:"
    echo "1. Update frontend environment variables with contract addresses"
    echo "2. Configure Pinata API keys for IPFS storage"
    echo "3. Grant minter roles to authorized addresses"
    echo "4. Test certificate minting on testnet"
    echo ""
    print_info "Check ./deployments/ for deployment details"
}

# Run main function
main "$@"