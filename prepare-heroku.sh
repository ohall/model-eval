#!/bin/bash

# This script prepares the repo for Heroku deployment

# Remove package-lock.json and yarn.lock if present
echo "Removing any conflicting lockfiles..."
rm -f package-lock.json yarn.lock

# Ensure our .npmrc is configured for Heroku
echo "Updating .npmrc for Heroku..."
if ! grep -q "shamefully-hoist=true" .npmrc; then
  echo "shamefully-hoist=true" >> .npmrc
fi

# Ensure node version is set correctly
echo "Setting exact Node.js version..."
sed -i.bak 's/use-node-version=.*/use-node-version=18.20.7/' .npmrc
rm -f .npmrc.bak

# Update .node-version file
echo "18.20.7" > .node-version

# Update package.json engines
echo "Updating package.json engines..."
tmp=$(mktemp)
jq '.engines.node = "18.20.7" | .engines.pnpm = "8.15.1"' package.json > "$tmp" && mv "$tmp" package.json

# Create a static setup for Heroku builds
echo "Preparing Heroku build environment..."

# Make heroku build files executable
chmod +x bin/compile bin/detect bin/release
chmod +x heroku-build.sh

echo "Preparation complete! You can now deploy to Heroku."
echo "Make sure to set the following environment variables:"
echo "- MONGODB_URI"
echo "- JWT_SECRET"
echo "- GOOGLE_CLIENT_ID"
echo "- API keys for LLM providers (if needed)"