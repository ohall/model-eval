# Model Evaluation Platform - Heroku Deployment

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/yourusername/model-eval)

## Important: Prepare Repository First

Before deploying to Heroku, run the preparation script:

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

## Quick Start

1. Click the "Deploy to Heroku" button above
2. Fill in the required environment variables:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Secret for JWT token generation
   - `GOOGLE_CLIENT_ID`: Your Google OAuth client ID
   - `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GOOGLE_API_KEY`: API keys for LLM providers (optional)
3. Click "Deploy App"

## Manual Setup

For detailed manual setup instructions, see [HEROKU_DEPLOYMENT.md](HEROKU_DEPLOYMENT.md).

## Configuration

### Required Environment Variables

| Variable                | Description                         |
| ----------------------- | ----------------------------------- |
| `MONGODB_URI`           | MongoDB connection string           |
| `JWT_SECRET`            | Secret for JWT token generation     |
| `GOOGLE_CLIENT_ID`      | Google OAuth client ID (for server) |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID (for client) |

### Optional Environment Variables

| Variable            | Description                             |
| ------------------- | --------------------------------------- |
| `OPENAI_API_KEY`    | OpenAI API key                          |
| `ANTHROPIC_API_KEY` | Anthropic API key                       |
| `GOOGLE_API_KEY`    | Google API key for Gemini               |
| `CORS_ORIGINS`      | Comma-separated list of allowed origins |

## Post-Deployment Tasks

After deploying to Heroku:

1. Update your Google OAuth authorized domains to include your Heroku app URL
2. Test the authentication flow
3. Verify that the LLM evaluation features work correctly

## Troubleshooting

See the [HEROKU_DEPLOYMENT.md](HEROKU_DEPLOYMENT.md#troubleshooting) section for common issues and solutions.

## Local Development

To run this application locally with the same configuration as Heroku:

1. Clone the repository
2. Create a `.env` file in the `packages/client` directory with:
   ```
   VITE_GOOGLE_CLIENT_ID=your_google_client_id
   ```
3. Create a `.env` file in the `packages/server` directory with:
   ```
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   GOOGLE_CLIENT_ID=your_google_client_id
   ```
4. Run `pnpm install`
5. Run `pnpm dev`

## Setting Heroku Environment Variables

To set all environment variables on Heroku from your local .env files:

1. Install the [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)
2. Run the script:
   ```bash
   ./scripts/set-heroku-vars.sh <your-heroku-app-name>
   ```

This will read both `packages/client/.env` and `packages/server/.env` and set all variables on your Heroku app.

## Resources

- [Heroku Node.js Documentation](https://devcenter.heroku.com/categories/nodejs-support)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
