#!/bin/bash

# Change to project root directory
cd "$(dirname "$0")/.."

# This script prepares the repo for Heroku deployment

# Remove package-lock.json and yarn.lock if present
echo "Removing any conflicting lockfiles..."
rm -f package-lock.json yarn.lock

# Ensure our .npmrc is configured for Heroku
echo "Updating .npmrc for Heroku..."
cat > .npmrc << EOF
strict-peer-dependencies=false
auto-install-peers=true
node-linker=hoisted
shamefully-hoist=true
link-workspace-packages=true
shared-workspace-lockfile=true
prefer-frozen-lockfile=false
engine-strict=true
use-node-version=18.20.7
node-version=18.20.7
EOF

# Update Node.js version files
echo "Setting exact Node.js version in all version files..."
echo "18.20.7" > .node-version
echo "18.20.7" > .nvmrc
echo "18.20.7" > .node-version.txt
echo "18.20.7" > .heroku-node-version

# Update package.json for Heroku
echo "Updating package.json for Heroku..."
tmp=$(mktemp)
cat > "$tmp" << EOF
{
  "name": "model-eval",
  "version": "0.1.0",
  "private": true,
  "description": "LLM evaluation tool for comparing performance across providers",
  "volta": {
    "node": "18.20.7"
  },
  "engines": {
    "node": "18.20.7",
    "pnpm": "8.15.1"
  },
  "packageManager": "pnpm@8.15.1",
  "scripts": {
    "dev": "pnpm -r dev",
    "build": "pnpm -r build",
    "test": "pnpm -r test",
    "lint": "pnpm -r lint",
    "format": "prettier --write \"**/*.{ts,tsx,js,json,md}\"",
    "start": "node packages/server/dist/index.js",
    "heroku-prebuild": "chmod +x bin/fix-pnpm.sh && ./bin/fix-pnpm.sh",
    "heroku-postbuild": "pnpm install --no-frozen-lockfile && pnpm run build"
  },
  "workspaces": [
    "packages/*"
  ]
}
EOF
# Merge with existing package.json to preserve dependencies
jq -s '.[0] * .[1]' package.json "$tmp" > package.json.new && mv package.json.new package.json

# Ensure bin directory exists and scripts are executable
echo "Setting up Heroku build environment..."
mkdir -p bin .heroku/nodejs

# Create special Heroku Node.js package.json
cat > .heroku/nodejs/package.json << EOF
{
  "name": "model-eval-heroku",
  "engines": {
    "node": "18.20.7",
    "npm": "9.8.1"
  }
}
EOF

# Make sure scripts are executable
chmod +x bin/fix-pnpm.sh
if [ -f "bin/compile" ]; then
  chmod +x bin/compile bin/detect bin/release
fi
if [ -f "scripts/heroku-build.sh" ]; then
  chmod +x scripts/heroku-build.sh
fi

echo "=== Heroku Preparation Complete ==="
echo "Your project is now ready for Heroku deployment."
echo ""
echo "Make sure to set the following environment variables:"
echo "- MONGODB_URI"
echo "- JWT_SECRET"
echo "- GOOGLE_CLIENT_ID"
echo "- API keys for LLM providers (if needed)"
echo ""
echo "To deploy, run:"
echo "git add ."
echo "git commit -m \"Prepare for Heroku deployment\""
echo "git push heroku main"