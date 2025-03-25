# Model Eval CLI

A command-line interface for interacting with the Model Evaluation Platform.

## Installation

```bash
npm install -g @model-eval/cli
```

Or using pnpm:

```bash
pnpm add -g @model-eval/cli
```

## Configuration

The CLI requires the following environment variables:

- `GOOGLE_CLIENT_ID`: Your Google OAuth client ID
- `API_URL` (optional): The URL of the Model Eval API (defaults to http://localhost:3000)

You can set these in your shell profile or create a `.env` file in your working directory.

## Usage

### Authentication

Login to the platform:
```bash
model-eval login
```

This will open your browser for Google authentication. After successful authentication, you can close the browser window and return to the CLI.

Logout from the platform:
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

This will open an interactive prompt where you can enter the prompt details.

### Running Evaluations

Create a new evaluation:
```bash
model-eval evaluate
```

This will:
1. Show a list of available prompts to choose from
2. Ask for the model ID
3. Open an editor for entering evaluation parameters in JSON format

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
4. Link the package for local development:
   ```bash
   pnpm link
   ```

## License

MIT 