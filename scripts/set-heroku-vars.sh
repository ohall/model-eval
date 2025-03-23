#!/bin/bash

# Check if Heroku app name is provided
if [ -z "$1" ]; then
  echo "Usage: $0 <heroku-app-name>"
  exit 1
fi

HEROKU_APP=$1

# Check if Heroku CLI is installed
if ! command -v heroku &> /dev/null; then
  echo "Error: Heroku CLI is not installed."
  echo "Please install it from: https://devcenter.heroku.com/articles/heroku-cli"
  exit 1
fi

# Function to set environment variables from .env file
set_env_vars() {
  local ENV_FILE=$1
  if [ -f "$ENV_FILE" ]; then
    echo "Reading variables from $ENV_FILE..."
    
    # Read each line from .env file
    while IFS= read -r line || [[ -n "$line" ]]; do
      # Skip comments and empty lines
      if [[ $line =~ ^#.*$ ]] || [[ -z $line ]]; then
        continue
      fi
      
      # Extract variable name and value
      var_name=$(echo "$line" | cut -d '=' -f 1)
      var_value=$(echo "$line" | cut -d '=' -f 2-)
      
      # Set the variable on Heroku
      if [ -n "$var_name" ] && [ -n "$var_value" ]; then
        echo "Setting $var_name..."
        heroku config:set "$var_name=$var_value" --app "$HEROKU_APP"
      fi
    done < "$ENV_FILE"
  else
    echo "Warning: $ENV_FILE not found."
  fi
}

# Set variables from server .env
set_env_vars "packages/server/.env"

# Set variables from client .env (prefixed with VITE_)
set_env_vars "packages/client/.env"

# Set fixed variables
echo "Setting NODE_ENV..."
heroku config:set NODE_ENV=production --app "$HEROKU_APP"

echo "Environment variables have been set for $HEROKU_APP."