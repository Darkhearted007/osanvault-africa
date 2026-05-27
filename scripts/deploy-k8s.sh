#!/bin/bash
# ÒsánVault Africa - Kubernetes Deployment Script

set -e

ENV=${1:-dev}
NAMESPACE=osanvault

echo "=========================================="
echo "  ÒsánVault Africa - K8s Deployment"
echo "  Environment: $ENV"
echo "=========================================="
echo ""

# Check prerequisites
command -v kubectl >/dev/null 2>&1 || { echo "kubectl not found"; exit 1; }
command -v kustomize >/dev/null 2>&1 || { echo "kustomize not found"; exit 1; }

# Context check
echo "Current context:"
kubectl config current-context
echo ""

# Apply kustomization
echo "Deploying to $ENV environment..."

if [ "$ENV" = "prod" ]; then
    read -p "Deploy to PRODUCTION? (y/n) " -n 1 -r
    echo ""
    [[ ! $REPLY =~ ^[Yy]$ ]] && exit 0
fi

kubectl apply -k "infra/k8s/envs/$ENV"
kubectl rollout status deployment -n $NAMESPACE

echo ""
echo "Deployment complete!"
kubectl get pods -n $NAMESPACE