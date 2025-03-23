# LLM Evaluation Platform

![LLM Evaluation Platform](docs/robo.jpg)

A modern web application for evaluating and comparing Large Language Model (LLM) responses across different providers. Built with TypeScript, React, and Node.js.

## Features

- Test prompts across multiple LLM providers (OpenAI, Anthropic, Google)
- Measure and compare performance metrics (latency, token usage, cost)
- Store and retrieve prompts and evaluation results
- Simple and intuitive user interface
- Real-time comparison of model outputs and performance

## Project Structure

This is a TypeScript monorepo with the following packages:

- `packages/client`: React-based frontend (TypeScript, Chakra UI)
- `packages/server`: Node.js/Express.js API (TypeScript)
- `packages/shared`: Shared TypeScript types and utilities

## Architecture

### Client (Frontend)
- Built with React and TypeScript
- Chakra UI for responsive design and components
- React Query for data fetching and caching
- React Router for navigation
- Context API for state management

### Server (Backend)
- Node.js with Express.js 
- MongoDB for data storage
- Integration with multiple LLM APIs:
  - OpenAI API (GPT models)
  - Anthropic API (Claude models)
  - Google Gemini API

### Database Schema
- Prompts: Store reusable prompts with titles and tags
- Evaluations: Store model responses and performance metrics

## Setup

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (optional - some features require a MongoDB connection)
- PNPM package manager (`npm install -g pnpm`)
- API keys for at least one of the supported LLM providers:
  - OpenAI: https://platform.openai.com/api-keys
  - Anthropic: https://console.anthropic.com/
  - Google: https://ai.google.dev/

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/model-eval.git
   cd model-eval
   ```

2. Install dependencies:
   ```
   pnpm install
   ```

3. Set up environment variables:
   ```
   # In packages/server directory
   cp .env.example .env
   # Edit .env and add your API keys and other configuration
   
   # Important: If port 8000 is already in use, change PORT to another value (e.g., 8001)
   # If MongoDB is unavailable, the server will continue to run with limited functionality
   ```

4. Start the development servers:
   ```
   pnpm dev
   ```

### Docker Setup (Alternative)

You can also run the application using Docker and Docker Compose:

1. Make sure Docker and Docker Compose are installed
2. Run:
   ```
   docker-compose up
   ```

## Usage

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000 (or the port you specified in the .env file)

### Workflow

1. Create prompts through the UI
2. Select a prompt to evaluate
3. Choose which LLM providers and models to test
4. Run the evaluation
5. View and compare the results

## Development

- Build all packages: `pnpm build`
- Build shared package only: `cd packages/shared && npm run build`
- Run tests: `pnpm test`
- Lint code: `pnpm lint`
- Format code: `pnpm format`

Note: Always build the shared package before starting the server if you've made changes to it.

## API Endpoints

The server exposes the following API endpoints:

- `GET /api/prompts`: List all prompts
- `POST /api/prompts`: Create a new prompt
- `GET /api/prompts/:id`: Get a specific prompt
- `PUT /api/prompts/:id`: Update a prompt
- `DELETE /api/prompts/:id`: Delete a prompt

- `GET /api/evaluations`: List all evaluations
- `POST /api/evaluations`: Create a new evaluation
- `GET /api/evaluations/:id`: Get a specific evaluation
- `GET /api/evaluations/prompt/:promptId`: Get evaluations for a specific prompt
- `POST /api/evaluations/multi`: Run evaluation across multiple providers

- `GET /api/providers`: Get available LLM providers
- `GET /api/providers/:provider/models`: Get available models for a provider

## License

[MIT](LICENSE)

## Documentation

Additional documentation is available in the [docs](docs) directory:

- [Heroku Deployment Guide](docs/README-HEROKU.md) - Instructions for deploying to Heroku
- [Detailed Heroku Setup](docs/HEROKU_DEPLOYMENT.md) - Comprehensive guide for Heroku deployment
- [Development Authentication](docs/DEV_AUTH_README.md) - Guide for setting up authentication in development
- [Prompt Documentation](docs/PROMPT.md) - Documentation about the prompt system
