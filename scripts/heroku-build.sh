#!/bin/bash

# Change to project root directory
cd "$(dirname "$0")/.."

# Exit on error
set -e

# Install pnpm
echo "Installing pnpm..."
npm install -g pnpm@8.15.1

# Install dependencies
echo "Installing dependencies..."
pnpm install --no-frozen-lockfile

# Build shared package first
echo "Building shared package..."
cd packages/shared
pnpm build
cd ../..

# Build client package
echo "Building client package..."
cd packages/client
pnpm build
cd ../..

# Build server package
echo "Building server package..."
cd packages/server
pnpm build
cd ../..

# Debug: List contents of client build directory
echo "Listing contents of client build directory..."
ls -la packages/client/dist

echo "Build complete!"