#!/bin/bash

# Health check script for GroeiMetAI blockchain infrastructure

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

echo -e "${BLUE}GroeiMetAI Blockchain Health Check${NC}"
echo "===================================="
echo ""

# Track overall health
HEALTH_STATUS="healthy"

# Function to check service
check_service() {
    local service_name=$1
    local check_command=$2
    
    echo -n "Checking $service_name... "
    
    if eval "$check_command" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ OK${NC}"
        return 0
    else
        echo -e "${RED}✗ FAILED${NC}"
        HEALTH_STATUS="unhealthy"
        return 1
    fi
}

# Function to check contract
check_contract() {
    local network=$1
    local contract_var=$2
    local rpc_url=$3
    
    echo -n "Checking contract on $network... "
    
    CONTRACT_ADDRESS="${!contract_var}"
    
    if [ -z "$CONTRACT_ADDRESS" ]; then
        echo -e "${YELLOW}⚠ Not deployed${NC}"
        return 1
    fi
    
    # Check if contract has code
    CODE=$(curl -s -X POST "$rpc_url" \
        -H "Content-Type: application/json" \
        -d "{\"jsonrpc\":\"2.0\",\"method\":\"eth_getCode\",\"params\":[\"$CONTRACT_ADDRESS\",\"latest\"],\"id\":1}" \
        | jq -r '.result')
    
    if [ "$CODE" != "0x" ] && [ -n "$CODE" ]; then
        echo -e "${GREEN}✓ OK ($CONTRACT_ADDRESS)${NC}"
        return 0
    else
        echo -e "${RED}✗ No code at address${NC}"
        HEALTH_STATUS="unhealthy"
        return 1
    fi
}

# 1. Check Node.js
check_service "Node.js" "node --version"

# 2. Check npm packages
check_service "Dependencies" "npm list --depth=0"

# 3. Check Hardhat
check_service "Hardhat" "npx hardhat --version"

# 4. Check contract compilation
echo -n "Checking contract compilation... "
if [ -d "./artifacts/contracts/CertificateRegistry.sol" ]; then
    echo -e "${GREEN}✓ OK${NC}"
else
    echo -e "${RED}✗ Contracts not compiled${NC}"
    HEALTH_STATUS="unhealthy"
fi

# 5. Check RPC endpoints
echo ""
echo "Network Connectivity:"
echo "--------------------"

# Mumbai testnet
echo -n "Mumbai RPC... "
if curl -s -X POST "${MUMBAI_RPC_URL:-https://rpc-mumbai.maticvigil.com}" \
    -H "Content-Type: application/json" \
    -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' \
    | jq -r '.result' | grep -q "0x13881"; then
    echo -e "${GREEN}✓ OK${NC}"
else
    echo -e "${RED}✗ FAILED${NC}"
    HEALTH_STATUS="unhealthy"
fi

# Polygon mainnet
echo -n "Polygon RPC... "
if curl -s -X POST "${POLYGON_RPC_URL:-https://polygon-rpc.com}" \
    -H "Content-Type: application/json" \
    -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' \
    | jq -r '.result' | grep -q "0x89"; then
    echo -e "${GREEN}✓ OK${NC}"
else
    echo -e "${RED}✗ FAILED${NC}"
    HEALTH_STATUS="unhealthy"
fi

# 6. Check deployed contracts
echo ""
echo "Deployed Contracts:"
echo "------------------"

# Check local
if [ -n "$NEXT_PUBLIC_CERTIFICATE_CONTRACT_LOCAL" ]; then
    check_contract "Local" "NEXT_PUBLIC_CERTIFICATE_CONTRACT_LOCAL" "http://localhost:8545"
fi

# Check Mumbai
if [ -n "$NEXT_PUBLIC_CERTIFICATE_CONTRACT_MUMBAI" ]; then
    check_contract "Mumbai" "NEXT_PUBLIC_CERTIFICATE_CONTRACT_MUMBAI" "${MUMBAI_RPC_URL:-https://rpc-mumbai.maticvigil.com}"
fi

# Check Polygon
if [ -n "$NEXT_PUBLIC_CERTIFICATE_CONTRACT_POLYGON" ]; then
    check_contract "Polygon" "NEXT_PUBLIC_CERTIFICATE_CONTRACT_POLYGON" "${POLYGON_RPC_URL:-https://polygon-rpc.com}"
fi

# 7. Check IPFS/Pinata
echo ""
echo "IPFS/Storage:"
echo "-------------"

echo -n "Pinata API... "
if [ -n "$PINATA_API_KEY" ] && [ -n "$PINATA_SECRET_API_KEY" ]; then
    if curl -s -X GET "https://api.pinata.cloud/data/testAuthentication" \
        -H "pinata_api_key: $PINATA_API_KEY" \
        -H "pinata_secret_api_key: $PINATA_SECRET_API_KEY" \
        | jq -r '.message' | grep -q "Congratulations"; then
        echo -e "${GREEN}✓ OK${NC}"
    else
        echo -e "${RED}✗ Authentication failed${NC}"
        HEALTH_STATUS="unhealthy"
    fi
else
    echo -e "${YELLOW}⚠ Not configured${NC}"
fi

# 8. Check wallet balance
echo ""
echo "Wallet Status:"
echo "--------------"

if [ -n "$PRIVATE_KEY" ]; then
    # Get wallet address from private key
    WALLET_ADDRESS=$(npx hardhat accounts 2>/dev/null | grep -o '0x[a-fA-F0-9]\{40\}' | head -1)
    
    if [ -n "$WALLET_ADDRESS" ]; then
        echo "Deployment wallet: $WALLET_ADDRESS"
        
        # Check Mumbai balance
        echo -n "Mumbai balance... "
        BALANCE_WEI=$(curl -s -X POST "${MUMBAI_RPC_URL:-https://rpc-mumbai.maticvigil.com}" \
            -H "Content-Type: application/json" \
            -d "{\"jsonrpc\":\"2.0\",\"method\":\"eth_getBalance\",\"params\":[\"$WALLET_ADDRESS\",\"latest\"],\"id\":1}" \
            | jq -r '.result')
        
        if [ -n "$BALANCE_WEI" ] && [ "$BALANCE_WEI" != "null" ]; then
            # Convert wei to ether (approximately)
            BALANCE_MATIC=$(echo "scale=4; $(printf "%d" $BALANCE_WEI) / 1000000000000000000" | bc 2>/dev/null || echo "0")
            echo -e "${GREEN}$BALANCE_MATIC MATIC${NC}"
            
            if (( $(echo "$BALANCE_MATIC < 0.1" | bc -l) )); then
                echo -e "  ${YELLOW}⚠ Low balance warning${NC}"
            fi
        else
            echo -e "${RED}✗ Could not fetch balance${NC}"
        fi
    fi
else
    echo -e "${YELLOW}⚠ No deployment wallet configured${NC}"
fi

# 9. Check Docker services (if using docker-compose)
echo ""
echo "Docker Services (if applicable):"
echo "-------------------------------"

if command -v docker-compose > /dev/null 2>&1; then
    if docker-compose -f docker-compose.blockchain.yml ps 2>/dev/null | grep -q "Up"; then
        echo -e "${GREEN}✓ Docker services running${NC}"
        docker-compose -f docker-compose.blockchain.yml ps --format "table {{.Service}}\t{{.Status}}"
    else
        echo -e "${YELLOW}⚠ No docker services running${NC}"
    fi
else
    echo "Docker Compose not installed"
fi

# 10. Recent deployments
echo ""
echo "Recent Deployments:"
echo "------------------"

if [ -d "./deployments" ]; then
    ls -lt ./deployments/*.json 2>/dev/null | head -5 | while read -r line; do
        echo "$line"
    done
else
    echo "No deployment records found"
fi

# Summary
echo ""
echo "===================================="
if [ "$HEALTH_STATUS" = "healthy" ]; then
    echo -e "${GREEN}Overall Status: HEALTHY${NC}"
else
    echo -e "${RED}Overall Status: UNHEALTHY${NC}"
    echo ""
    echo "Action items:"
    echo "- Check failed services above"
    echo "- Ensure all environment variables are set"
    echo "- Run 'npm install' if dependencies are missing"
    echo "- Deploy contracts if not deployed"
fi

echo ""
echo "Run './scripts/deploy-blockchain.sh' to deploy contracts"
echo "Run 'npm run migrate:certificates' to migrate existing certificates"

# Exit with appropriate code
if [ "$HEALTH_STATUS" = "healthy" ]; then
    exit 0
else
    exit 1
fi