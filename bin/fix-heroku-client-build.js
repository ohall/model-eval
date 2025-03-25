#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Starting Heroku client build verification...');

// Check if we're in a Heroku environment
const isHeroku = process.env.DYNO || process.env.NODE_ENV === 'production';
if (!isHeroku) {
  console.log('Not in Heroku environment, exiting.');
  process.exit(0);
}

// Verify working directory
const rootDir = process.cwd();
console.log(`Current working directory: ${rootDir}`);

// Check if client dist exists
const clientDistPath = path.join(rootDir, 'packages/client/dist');
const clientDistExists = fs.existsSync(clientDistPath);

if (clientDistExists) {
  console.log(`Client dist directory exists at ${clientDistPath}`);
  try {
    const distFiles = fs.readdirSync(clientDistPath);
    console.log(`Files in client dist: ${distFiles.join(', ')}`);

    // Check for index.html
    if (distFiles.includes('index.html')) {
      console.log('✓ index.html found');
    } else {
      console.log('✗ index.html NOT found - client was not built properly');
      console.log('Attempting to build client...');
      buildClient();
    }
  } catch (err) {
    console.error(`Error reading client dist directory: ${err}`);
    buildClient();
  }
} else {
  console.log(`Client dist directory does NOT exist at ${clientDistPath}`);
  buildClient();
}

// Function to build the client
function buildClient() {
  try {
    console.log('Building client...');

    // Make sure client directory exists
    const clientDir = path.join(rootDir, 'packages/client');
    if (!fs.existsSync(clientDir)) {
      console.error(`Client directory does not exist at ${clientDir}`);
      console.log('Available directories:');
      try {
        const dirs = fs.readdirSync(path.join(rootDir, 'packages'));
        console.log(`Packages: ${dirs.join(', ')}`);
      } catch (err) {
        console.error(`Error listing packages: ${err}`);
      }
      return;
    }

    // Check if node_modules exists
    const nodeModulesPath = path.join(clientDir, 'node_modules');
    if (!fs.existsSync(nodeModulesPath)) {
      console.log('Installing client dependencies...');
      execSync('cd packages/client && pnpm install', { stdio: 'inherit' });
    }

    // Build the client
    console.log('Running client build...');
    execSync('cd packages/client && pnpm build', { stdio: 'inherit' });

    // Verify the build
    if (fs.existsSync(clientDistPath)) {
      const distFilesAfterBuild = fs.readdirSync(clientDistPath);
      console.log(`Client build successful. Files: ${distFilesAfterBuild.join(', ')}`);

      // Create a simple HTML file if needed
      const indexHtmlPath = path.join(clientDistPath, 'index.html');
      if (!fs.existsSync(indexHtmlPath)) {
        console.log('Creating fallback index.html...');

        // Try to copy from fallback file
        const fallbackFilePath = path.join(rootDir, 'packages/client/fallback-index.html');
        if (fs.existsSync(fallbackFilePath)) {
          console.log(`Copying fallback from ${fallbackFilePath}`);
          try {
            fs.copyFileSync(fallbackFilePath, indexHtmlPath);
            console.log('Fallback index.html copied successfully.');
          } catch (err) {
            console.error(`Error copying fallback file: ${err}`);
            createSimpleFallback();
          }
        } else {
          console.log('Fallback file not found, creating simple HTML');
          createSimpleFallback();
        }
      }

      // Create minimal index.html as last resort
      function createSimpleFallback() {
        const fallbackHtml = `<!DOCTYPE html>
<html>
<head>
  <title>Model Evaluation Platform</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
    h1 { color: #333; }
    .message { background: #e3f2fd; border: 1px solid #bbdefb; padding: 15px; border-radius: 4px; }
  </style>
</head>
<body>
  <h1>Model Evaluation Platform</h1>
  <div class="message">
    <h2>Server is running</h2>
    <p>The app server is running, but the client was built with a fallback page.</p>
    <p>API endpoints are available:</p>
    <ul>
      <li><a href="/api/providers">/api/providers</a></li>
      <li><a href="/health">/health</a></li>
      <li><a href="/debug">/debug</a></li>
    </ul>
  </div>
</body>
</html>`;

        try {
          fs.writeFileSync(indexHtmlPath, fallbackHtml);
          console.log('Simple fallback index.html created.');
        } catch (err) {
          console.error(`Failed to create fallback HTML: ${err}`);
        }
      }
    } else {
      console.error('Client build failed - dist directory still does not exist');
    }
  } catch (err) {
    console.error(`Error building client: ${err}`);
  }
}

console.log('Finished Heroku client build verification.');
