#!/bin/bash

# Exit on error
set -e

# Install pnpm
echo "Installing pnpm..."
npm install -g pnpm@8.15.1

# Install dependencies
echo "Installing dependencies..."
pnpm install

# Build the app
echo "Building the application..."
pnpm build

echo "Build completed successfully!"