#!/bin/bash

# This script recreates the pnpm-lock.yaml file for better compatibility with Heroku

echo "Recreating pnpm-lock.yaml for Heroku compatibility..."

# Backup existing lockfile
if [ -f "pnpm-lock.yaml" ]; then
  echo "Backing up existing lockfile..."
  cp pnpm-lock.yaml pnpm-lock.yaml.backup
fi

# Remove lockfile
echo "Removing existing lockfile..."
rm -f pnpm-lock.yaml

# Install dependencies to create a fresh lockfile
echo "Creating new lockfile with current pnpm version..."
pnpm install

# Verify lockfile creation
if [ -f "pnpm-lock.yaml" ]; then
  echo "✓ Successfully recreated pnpm-lock.yaml"
  echo "You can now deploy to Heroku with the updated lockfile."
else
  echo "✗ Failed to create lockfile!"
  
  # Restore backup if available
  if [ -f "pnpm-lock.yaml.backup" ]; then
    echo "Restoring backup lockfile..."
    mv pnpm-lock.yaml.backup pnpm-lock.yaml
  fi
fi