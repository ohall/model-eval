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