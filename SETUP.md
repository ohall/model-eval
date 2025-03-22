# Setting Up and Running the Model Evaluation Tool

This document provides instructions for setting up and running the Model Evaluation Tool.

## Prerequisites

- Node.js (v18 or higher)
- PNPM package manager
- MongoDB

## Installation

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Setup environment variables for the server:
   ```bash
   cd packages/server
   cp .env.example .env
   ```
   
   Edit the `.env` file to add your API keys for OpenAI, Anthropic, and Google.

## Development Setup

### Running the shared package in watch mode:
```bash
cd packages/shared
pnpm dev
```

### Running the server:
```bash
cd packages/server
pnpm dev
```

### Running the client:
```bash
cd packages/client
pnpm dev
```

## Build Issues and Fixes

If you encounter build issues, here are some common solutions:

1. **Import Resolution Issues**:
   Update the imports in code files to use relative paths to the shared package:
   ```typescript
   // Change from
   import { Provider } from 'shared/index';
   // To
   import { Provider } from '../../shared/dist';
   ```

2. **TypeScript Build Errors**:
   Ensure TypeScript is properly installed in each package:
   ```bash
   cd packages/shared && pnpm add -D typescript
   cd packages/server && pnpm add -D typescript
   cd packages/client && pnpm add -D typescript
   ```

3. **Dependency Issues**:
   Make sure all dependencies are properly installed:
   ```bash
   pnpm install
   ```

## Docker Setup

You can also run the application using Docker:

1. Make sure Docker and Docker Compose are installed
2. Run:
   ```bash
   docker-compose up
   ```

## Accessing the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- MongoDB: mongodb://localhost:27017

## Common Issues

1. **MongoDB Connection Issues**: Make sure MongoDB is running and accessible.
2. **API Key Issues**: Ensure you've added the correct API keys in the `.env` file.
3. **Port Conflicts**: If ports 3000 or 8000 are already in use, you can change them in the respective configuration files.

## Project Structure

- `/packages/shared`: Shared TypeScript types and utilities
- `/packages/server`: Node.js/Express API
- `/packages/client`: React frontend application