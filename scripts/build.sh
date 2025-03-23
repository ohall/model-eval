#!/bin/bash

# Change to project root directory
cd "$(dirname "$0")/.."

# Build the shared package
echo "Building shared package..."
cd packages/shared
pnpm build

# Build the server package
echo "Building server package..."
cd ../server
pnpm build

# Build the client package
echo "Building client package..."
cd ../client
pnpm build

echo "Build completed! You can start the application with:"
echo "- Server: cd packages/server && pnpm start"
echo "- Client: cd packages/client && npm run preview"