#!/bin/bash

# This script configures pnpm on Heroku

echo "Setting up pnpm for Heroku deployment"

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "Installing pnpm globally"
    npm install -g pnpm
fi

# Configure pnpm
echo "Configuring pnpm"
pnpm config set store-dir .pnpm-store
pnpm config set node-linker hoisted
pnpm config set shamefully-hoist true

# Install dependencies
echo "Installing dependencies with pnpm"
pnpm install

# Print pnpm version
pnpm --version

echo "pnpm setup complete"