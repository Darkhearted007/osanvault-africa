#!/bin/bash
# ÒsánVault Africa - Production Deployment Script

set -e

echo "=========================================="
echo "  ÒsánVault Africa - Production Deploy"
echo "=========================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check prerequisites
check_prereqs() {
    echo -e "${YELLOW}Checking prerequisites...${NC}"
    
    if ! command -v node &> /dev/null; then
        echo -e "${RED}Error: Node.js not installed${NC}"
        exit 1
    fi
    
    if ! command -v pnpm &> /dev/null; then
        echo -e "${RED}Error: pnpm not installed${NC}"
        exit 1
    fi
    
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}Error: Docker not installed${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}All prerequisites satisfied${NC}"
}

# Setup environment
setup_env() {
    echo -e "${YELLOW}Setting up environment...${NC}"
    
    if [ ! -f "apps/api/.env" ]; then
        cp .env.production.example apps/api/.env
        echo -e "${YELLOW}Created .env from template - please fill in values${NC}"
    fi
    
    pnpm install
    pnpm build
}

# Build Docker images
build_docker() {
    echo -e "${YELLOW}Building Docker images...${NC}"
    
    docker-compose -f infra/docker-compose.prod.yml build
    
    echo -e "${GREEN}Docker images built successfully${NC}"
}

# Start production stack
start_production() {
    echo -e "${YELLOW}Starting production stack...${NC}"
    
    # Stop existing containers
    docker-compose -f infra/docker-compose.prod.yml down || true
    
    # Start fresh
    docker-compose -f infra/docker-compose.prod.yml up -d
    
    # Wait for services
    echo -e "${YELLOW}Waiting for services to be ready...${NC}"
    sleep 10
    
    # Check health
    if curl -sf http://localhost:3001/health > /dev/null; then
        echo -e "${GREEN}API is healthy${NC}"
    else
        echo -e "${RED}API health check failed${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}Production stack started successfully${NC}"
}

# Main
main() {
    check_prereqs
    setup_env
    build_docker
    start_production
    
    echo -e "${GREEN}"
    echo "=========================================="
    echo "  Deployment Complete!"
    echo "=========================================="
    echo ""
    echo "Services:"
    echo "  - API: http://localhost:3001"
    echo "  - Web: http://localhost"
    echo "  - Nginx: http://localhost:80"
    echo ""
    echo "View logs: docker-compose -f infra/docker-compose.prod.yml logs -f"
    echo "Stop: docker-compose -f infra/docker-compose.prod.yml down"
    echo -e "${NC}"
}

main "$@"