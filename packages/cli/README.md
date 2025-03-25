# Model Eval CLI

A command-line interface for interacting with the Model Evaluation Platform. This CLI tool allows you to manage prompts and run model evaluations directly from your terminal, with seamless Google authentication integration.

## Installation

Since this is a monorepo package, you'll need to build and link it locally:

```bash
# From the root of the monorepo
pnpm install
cd packages/cli
pnpm build
pnpm link --global
```

Once published, you can install it globally via:

```bash
pnpm add -g @model-eval/cli
```

## Configuration

The CLI requires the following environment variables:

- `GOOGLE_CLIENT_ID`: Your Google OAuth client ID (required for authentication)
- `API_URL`: The URL of the Model Eval API (defaults to http://localhost:3000)

You can set these in your shell profile or create a `.env` file in your working directory:

```bash
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
API_URL=http://localhost:3000  # Optional, defaults to this value
```

## Usage

### Authentication

The CLI uses Google OAuth for authentication. When you run any command that requires authentication, it will automatically:

1. Check for an existing valid token
2. If no valid token exists, open your default browser for Google authentication
3. Start a local server to handle the OAuth callback
4. Store the token securely for future use

Login explicitly:
```bash
model-eval login
```

Logout and clear stored credentials:
```bash
model-eval logout
```

### Managing Prompts

List all prompts:
```bash
model-eval prompts
```

Create a new prompt:
```bash
model-eval create-prompt
```

This will open an interactive session where you can:
- Enter a name for the prompt
- Provide an optional description
- Open your default text editor to write the prompt content

### Running Evaluations

Create a new evaluation:
```bash
model-eval evaluate
```

This interactive command will:
1. Show a list of your available prompts to choose from
2. Ask for the model ID to use for evaluation
3. Open your default text editor to enter evaluation parameters in JSON format

Get evaluation results:
```bash
model-eval results <evaluationId>
```

## Development

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Build the package:
   ```bash
   pnpm build
   ```
4. Run in development mode:
   ```bash
   pnpm dev
   ```

### Local Testing

To test the CLI locally without installing globally:

```bash
# From the packages/cli directory
pnpm dev -- <command>

# Examples:
pnpm dev -- login
pnpm dev -- prompts
pnpm dev -- evaluate
```

## Troubleshooting

### Authentication Issues

If you encounter authentication issues:

1. Ensure your `GOOGLE_CLIENT_ID` is correctly set
2. Check that port 3333 is available (used for OAuth callback)
3. Make sure you're using a supported browser for authentication
4. Try logging out and logging in again: `model-eval logout && model-eval login`

### API Connection Issues

If you can't connect to the API:

1. Verify the API is running and accessible
2. Check your `API_URL` environment variable if using a custom endpoint
3. Ensure you're authenticated: `model-eval login`

## License

MIT 