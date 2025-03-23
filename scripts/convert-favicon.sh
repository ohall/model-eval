#!/bin/bash

# Change to project root directory
cd "$(dirname "$0")/.."

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "ImageMagick is not installed. Please install it first:"
    echo "  brew install imagemagick"
    exit 1
fi

# Convert SVG to ICO
convert packages/client/public/favicon.svg -background transparent -define icon:auto-resize=16,32,48,64 packages/client/public/favicon.ico

echo "Favicon conversion complete!" 