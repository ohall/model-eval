# Original Project Prompt

```
Build a full-stack LLM evaluation tool in a TypeScript monorepo, consisting of:

### Client (Frontend)
- React-based user interface (TypeScript)
- Simple and intuitive design
- Input area for users to select or input prompts
- Display LLM responses clearly
- Show performance metrics for each evaluated prompt, including latency, token usage, and model confidence (where available)

### Server (Backend)
- Node.js server using TypeScript and Express.js
- API endpoints to:
  - Fetch prompts from MongoDB
  - Submit prompts to various LLM providers: OpenAI, Anthropic, Google
  - Calculate and return evaluation metrics (response time, token count, provider-specific metrics)
- Secure handling of API keys and sensitive data using environment variables
- Comprehensive error handling

### Database
- MongoDB for storing and retrieving prompts and results
- Schemas clearly structured for prompts and evaluation metrics

### Monorepo Structure
- Use a monorepo setup with clear separation:
  - `packages/client`: React app (TypeScript)
  - `packages/server`: Node.js API (TypeScript)
  - Shared TypeScript types and utilities in a common package (e.g., `packages/shared`)

### Requirements
- Clear README instructions for setup and execution
- Use appropriate tooling (Turborepo, Yarn workspaces, or PNPM) for monorepo management
- Include basic tests for server endpoints and React components
```

This prompt requested the creation of a full-stack application for evaluating and comparing responses from different Large Language Model (LLM) providers. The project was implemented as described, using PNPM workspaces for monorepo management and including all the requested features.
