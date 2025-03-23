#!/usr/bin/env bash

# This script fixes pnpm deployment on Heroku

# Display current environment
echo "Current environment:"
echo "Node.js version: $(node --version)"
echo "NPM version: $(npm --version)"

# Install pnpm
echo "Installing pnpm..."
npm install -g pnpm@8.15.1

# Downgrade npm if needed
if [[ "$(npm --version)" == 10* ]]; then
  echo "Downgrading npm to v9..."
  npm install -g npm@9
fi

# Configure pnpm
echo "Configuring pnpm..."
pnpm config set node-linker hoisted
pnpm config set shamefully-hoist true

# Set pnpm store directory
echo "Setting pnpm store directory..."
pnpm config set store-dir ./.pnpm-store

# Display pnpm version
echo "pnpm version: $(pnpm --version)"

# Check for pnpm-lock.yaml and recreate if needed
if [ -f "pnpm-lock.yaml" ]; then
  echo "pnpm-lock.yaml found, recreating for compatibility..."
  # Temporarily move the existing lockfile
  mv pnpm-lock.yaml pnpm-lock.yaml.bak
  
  # Install with no lockfile to recreate it with current pnpm version
  echo "Recreating lockfile with current pnpm version..."
  pnpm install --no-frozen-lockfile
  
  # Validate the new lockfile
  if [ -f "pnpm-lock.yaml" ]; then
    echo "Successfully recreated pnpm-lock.yaml"
    rm -f pnpm-lock.yaml.bak
  else
    echo "ERROR: Failed to recreate lockfile, restoring backup"
    mv pnpm-lock.yaml.bak pnpm-lock.yaml
  fi
else
  echo "WARNING: pnpm-lock.yaml not found!"
  echo "Installing dependencies will create a new lockfile"
  pnpm install --no-frozen-lockfile
fi

echo "pnpm setup completed"