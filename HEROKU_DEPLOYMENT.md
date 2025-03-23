# Heroku Deployment Guide

This guide walks you through deploying the Model Evaluation Platform to Heroku.

## Prerequisites

1. [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli) installed
2. Heroku account
3. MongoDB Atlas account (or any MongoDB provider)
4. API keys for OpenAI, Anthropic, and Google (if you plan to use them)
5. Google OAuth client ID for authentication

## Setup Steps

### 1. Create a new Heroku app

```bash
# Log in to Heroku CLI
heroku login

# Create a new app
heroku create model-eval-app  # replace with your preferred app name

# Or if you want to specify a region
heroku create model-eval-app --region eu  # eu or us
```

### 2. Set up MongoDB

1. Create a MongoDB cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (free tier is available)
2. Get your connection string from MongoDB Atlas
3. Add it to your Heroku app as an environment variable:

```bash
heroku config:set MONGODB_URI="your-mongodb-connection-string" -a model-eval-app
```

### 3. Configure Environment Variables

Set up all required environment variables:

```bash
# JWT Secret for authentication
heroku config:set JWT_SECRET="your-secret-key" -a model-eval-app

# CORS settings (replace with your actual Heroku app URL)
heroku config:set CORS_ORIGINS="https://model-eval-app.herokuapp.com" -a model-eval-app

# Google OAuth client ID
heroku config:set GOOGLE_CLIENT_ID="your-google-client-id" -a model-eval-app

# API Keys for LLM providers
heroku config:set OPENAI_API_KEY="your-openai-api-key" -a model-eval-app
heroku config:set ANTHROPIC_API_KEY="your-anthropic-api-key" -a model-eval-app
heroku config:set GOOGLE_API_KEY="your-google-api-key" -a model-eval-app

# Set to production mode
heroku config:set NODE_ENV="production" -a model-eval-app
```

### 4. Add Buildpack for pnpm

Heroku needs to know how to handle pnpm:

```bash
heroku buildpacks:add -i 1 https://github.com/heroku/heroku-buildpack-nodejs -a model-eval-app
```

### 5. Prepare for Deployment

Before deploying, run the preparation script:

```bash
# Make the script executable
chmod +x prepare-heroku.sh

# Run the preparation script
./prepare-heroku.sh
```

This script will:
- Remove any conflicting lockfiles
- Configure .npmrc for Heroku
- Set up the necessary Heroku build files

### 6. Deploy to Heroku

Push your code to Heroku:

```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit for Heroku deployment"

# Add Heroku remote
heroku git:remote -a model-eval-app

# Push to Heroku
git push heroku main  # or git push heroku master
```

### 7. Monitor the Deployment

```bash
# Watch logs during deployment
heroku logs --tail -a model-eval-app

# Open the app when deployment is complete
heroku open -a model-eval-app
```

## Post Deployment Setup

### 1. Update Google OAuth Settings

After deployment, update your Google OAuth credentials:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to your project > APIs & Services > Credentials
3. Edit your OAuth 2.0 Client ID
4. Add your Heroku app URL to Authorized JavaScript origins:
   - `https://model-eval-app.herokuapp.com`
5. Add your Heroku app URL to Authorized redirect URIs:
   - `https://model-eval-app.herokuapp.com`
   - `https://model-eval-app.herokuapp.com/login`

### 2. Verify Application

1. Visit your Heroku app URL
2. Try to log in with Google authentication
3. Test the evaluation features with different LLM providers

## Troubleshooting

### MongoDB Connection Issues

If you have issues connecting to MongoDB:

1. Check that your connection string is correct
2. Ensure your IP is whitelisted in MongoDB Atlas

```bash
# Check your current environment variables
heroku config -a model-eval-app
```

### Authentication Issues

If Google authentication is not working:

1. Verify your Google Client ID is set correctly
2. Check that your authorized domains are configured properly
3. Look at the browser console for specific errors

### Application Crashes

If the application crashes:

```bash
# Check logs
heroku logs --tail -a model-eval-app

# Restart the app if needed
heroku restart -a model-eval-app
```

## Scaling Your App

If you need to scale your application:

```bash
# Scale to more dynos
heroku ps:scale web=2 -a model-eval-app

# Upgrade to a different dyno type
heroku ps:type web=standard-2x -a model-eval-app
```

## Additional Resources

- [Heroku Node.js Documentation](https://devcenter.heroku.com/categories/nodejs-support)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Configuring CORS for Express.js](https://expressjs.com/en/resources/middleware/cors.html)