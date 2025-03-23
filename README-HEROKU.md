# Model Evaluation Platform - Heroku Deployment

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/yourusername/model-eval)

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

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for JWT token generation |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |

### Optional Environment Variables

| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | OpenAI API key |
| `ANTHROPIC_API_KEY` | Anthropic API key |
| `GOOGLE_API_KEY` | Google API key for Gemini |
| `CORS_ORIGINS` | Comma-separated list of allowed origins |

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
2. Create a `.env` file with the same variables as your Heroku config
3. Run `pnpm install`
4. Run `pnpm dev`

## Resources

- [Heroku Node.js Documentation](https://devcenter.heroku.com/categories/nodejs-support)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)