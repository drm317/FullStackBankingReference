#!/bin/bash

# Fullstack Reference Azure Deployment Script

set -e

# Configuration
RESOURCE_GROUP="fullstack-reference-rg"
LOCATION="eastus"
ENVIRONMENT="dev"
SUBSCRIPTION_ID=""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

echo_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

echo_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo_error "Azure CLI is not installed. Please install it first."
    exit 1
fi

# Login to Azure
echo_info "Logging in to Azure..."
az login

# Set subscription if provided
if [ ! -z "$SUBSCRIPTION_ID" ]; then
    echo_info "Setting subscription to $SUBSCRIPTION_ID"
    az account set --subscription "$SUBSCRIPTION_ID"
fi

# Create resource group
echo_info "Creating resource group '$RESOURCE_GROUP' in '$LOCATION'..."
az group create --name "$RESOURCE_GROUP" --location "$LOCATION"

# Generate secure passwords
echo_info "Generating secure passwords..."
MONGO_USERNAME="fullstackadmin"
MONGO_PASSWORD=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 64)

# Deploy infrastructure
echo_info "Deploying infrastructure..."
DEPLOYMENT_OUTPUT=$(az deployment group create \
    --resource-group "$RESOURCE_GROUP" \
    --template-file main.bicep \
    --parameters \
        environment="$ENVIRONMENT" \
        mongoUsername="$MONGO_USERNAME" \
        mongoPassword="$MONGO_PASSWORD" \
        jwtSecret="$JWT_SECRET" \
    --query 'properties.outputs' \
    --output json)

# Extract outputs
CONTAINER_REGISTRY=$(echo "$DEPLOYMENT_OUTPUT" | jq -r '.containerRegistryName.value')
ACR_LOGIN_SERVER=$(echo "$DEPLOYMENT_OUTPUT" | jq -r '.containerRegistryLoginServer.value')
FRONTEND_URL=$(echo "$DEPLOYMENT_OUTPUT" | jq -r '.frontendUrl.value')
BACKEND_URL=$(echo "$DEPLOYMENT_OUTPUT" | jq -r '.backendUrl.value')

echo_info "Infrastructure deployed successfully!"
echo_info "Container Registry: $CONTAINER_REGISTRY"
echo_info "ACR Login Server: $ACR_LOGIN_SERVER"

# Login to ACR
echo_info "Logging in to Azure Container Registry..."
az acr login --name "$CONTAINER_REGISTRY"

# Build and push Docker images
echo_info "Building and pushing backend image..."
cd ../../backend
docker build -t "$ACR_LOGIN_SERVER/banking-backend:latest" .
docker push "$ACR_LOGIN_SERVER/banking-backend:latest"

echo_info "Building and pushing frontend image..."
cd ../frontend
docker build -t "$ACR_LOGIN_SERVER/banking-frontend:latest" .
docker push "$ACR_LOGIN_SERVER/banking-frontend:latest"

cd ../infrastructure/azure

# Update container apps with new images
echo_info "Updating container apps..."
az containerapp update \
    --name "banking-$ENVIRONMENT-*-backend" \
    --resource-group "$RESOURCE_GROUP" \
    --image "$ACR_LOGIN_SERVER/banking-backend:latest"

az containerapp update \
    --name "banking-$ENVIRONMENT-*-frontend" \
    --resource-group "$RESOURCE_GROUP" \
    --image "$ACR_LOGIN_SERVER/banking-frontend:latest"

echo_info "Deployment completed successfully!"
echo_info "Frontend URL: $FRONTEND_URL"
echo_info "Backend URL: $BACKEND_URL"
echo_warn "Please save these credentials securely:"
echo "MongoDB Username: $MONGO_USERNAME"
echo "MongoDB Password: $MONGO_PASSWORD"
echo "JWT Secret: $JWT_SECRET"