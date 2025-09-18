#!/bin/bash

set -e

echo "Pulling latest code from origin main..."
if ! git pull origin main; then
    echo "Error: Failed to pull from origin main"
    exit 1
fi

echo "Installing dependencies with pnpm..."
if ! pnpm install; then
    echo "Error: Failed to install dependencies"
    exit 1
fi

echo "Building project with pnpm..."
if ! pnpm run build; then
    echo "Error: Build failed"
    exit 1
fi

echo "Reloading backend PM2 process..."
if ! cd apps/backend; then
    echo "Error: Could not change to apps/backend directory"
    exit 1
fi

if ! pm2 reload superatom-runtime-backend; then
    echo "Error: Failed to reload PM2 process"
    exit 1
fi

echo "Deployment complete!"