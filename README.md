# model-eval

A full-stack TypeScript application for evaluating and comparing Large Language Model (LLM) responses across different providers.

## Features

- Test prompts across multiple LLM providers (OpenAI, Anthropic, Google)
- Measure and compare performance metrics (latency, token usage, etc.)
- Store and retrieve evaluation results
- Simple and intuitive user interface

## Project Structure

This is a TypeScript monorepo with the following packages:

- `packages/client`: React-based frontend (TypeScript)
- `packages/server`: Node.js/Express.js API (TypeScript)
- `packages/shared`: Shared TypeScript types and utilities

## Setup

### Prerequisites

- Node.js (v18 or higher)
- MongoDB
- API keys for LLM providers

### Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see `.env.example` files in each package)
4. Start the development servers: `npm run dev`

## Usage

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000

## Development

- Build all packages: `npm run build`
- Run tests: `npm test`
- Lint code: `npm run lint`
