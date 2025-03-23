#!/bin/bash

# Exit on error
set -e

# Install pnpm
echo "Installing pnpm..."
npm install -g pnpm@8.15.1

# Install dependencies
echo "Installing dependencies..."
pnpm install

# Build shared package first (since it's a dependency)
echo "Building shared package..."
cd packages/shared
pnpm build
cd ../..

# Build client
echo "Building client..."
cd packages/client
pnpm build
cd ../..

# Build server
echo "Building server..."
cd packages/server
pnpm build
cd ../..

echo "Build completed successfully!"