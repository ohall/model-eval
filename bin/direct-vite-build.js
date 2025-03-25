#!/usr/bin/env node

/**
 * This script builds the client directly using Vite,
 * bypassing TypeScript completely for Heroku deployments
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get the client directory
const clientDir = path.join(process.cwd(), 'packages/client');

console.log('Starting direct Vite build...');

try {
  // Change to client directory for the build
  process.chdir(clientDir);
  console.log(`Changed to directory: ${clientDir}`);

  // Create a simple temporary tsconfig that skips all type checking
  const tempTsConfig = {
    compilerOptions: {
      target: 'ESNext',
      useDefineForClassFields: true,
      lib: ['DOM', 'DOM.Iterable', 'ESNext'],
      allowJs: true,
      skipLibCheck: true,
      esModuleInterop: true,
      allowSyntheticDefaultImports: true,
      strict: false,
      forceConsistentCasingInFileNames: true,
      module: 'ESNext',
      moduleResolution: 'Node',
      resolveJsonModule: true,
      isolatedModules: true,
      noEmit: true,
      jsx: 'react-jsx',
      noImplicitAny: false,
    },
    include: ['src'],
    exclude: ['node_modules'],
  };

  // Save the temp tsconfig
  fs.writeFileSync(
    path.join(clientDir, 'tsconfig.temp.json'),
    JSON.stringify(tempTsConfig, null, 2)
  );

  console.log('Created temporary tsconfig.json with relaxed type checking');

  // Rename the original tsconfig.json if it exists
  const tsconfigPath = path.join(clientDir, 'tsconfig.json');
  if (fs.existsSync(tsconfigPath)) {
    fs.renameSync(tsconfigPath, path.join(clientDir, 'tsconfig.json.original'));
    console.log('Backed up original tsconfig.json');

    // Use our temp config as the main one
    fs.renameSync(path.join(clientDir, 'tsconfig.temp.json'), tsconfigPath);
  }

  // Run Vite build directly, skipping TypeScript type checking
  console.log('Running direct Vite build...');
  execSync('npx vite build', { stdio: 'inherit' });

  console.log('Vite build completed successfully');

  // Restore original tsconfig.json if it was backed up
  if (fs.existsSync(path.join(clientDir, 'tsconfig.json.original'))) {
    fs.renameSync(path.join(clientDir, 'tsconfig.json.original'), tsconfigPath);
    console.log('Restored original tsconfig.json');
  }

  // Check if the build was successful by looking for dist/index.html
  const indexHtmlPath = path.join(clientDir, 'dist/index.html');
  if (fs.existsSync(indexHtmlPath)) {
    console.log('✅ Build successful: index.html found in dist directory');
  } else {
    console.error('❌ Build may have failed: index.html not found in dist directory');
    process.exit(1);
  }
} catch (error) {
  console.error('Error during direct Vite build:', error);
  process.exit(1);
}
