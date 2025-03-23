#!/bin/bash

# Exit on error
set -e

# Check if Heroku CLI is installed
if ! command -v heroku &> /dev/null; then
    echo "Heroku CLI is not installed. Please install it first:"
    echo "https://devcenter.heroku.com/articles/heroku-cli"
    exit 1
fi

# Check if app name is provided
if [ -z "$1" ]; then
    echo "Usage: ./set-heroku-vars.sh <heroku-app-name>"
    exit 1
fi

APP_NAME=$1

# Function to read .env file and set Heroku config vars
set_env_vars() {
    local env_file=$1
    if [ -f "$env_file" ]; then
        echo "Reading variables from $env_file..."
        while IFS='=' read -r key value; do
            # Skip comments and empty lines
            [[ $key =~ ^#.*$ ]] && continue
            [[ -z $key ]] && continue
            
            # Remove quotes if present
            value=$(echo "$value" | sed -e 's/^"//' -e 's/"$//')
            
            echo "Setting $key..."
            heroku config:set "$key=$value" --app "$APP_NAME"
        done < "$env_file"
    else
        echo "Warning: $env_file not found"
    fi
}

# Set variables from server .env
set_env_vars "packages/server/.env"

# Set variables from client .env
set_env_vars "packages/client/.env"

echo "All environment variables have been set successfully!" 