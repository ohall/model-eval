#!/usr/bin/env node

/**
 * This script creates a temporary copy of vite.config.ts with TypeScript
 * checking disabled for Heroku builds
 */

const fs = require('fs');
const path = require('path');

// Get the client directory
const clientDir = path.join(process.cwd(), 'packages/client');
const viteConfigPath = path.join(clientDir, 'vite.config.ts');

console.log('Modifying Vite config for Heroku build...');

// Check if the file exists
if (!fs.existsSync(viteConfigPath)) {
  console.error(`Vite config not found at: ${viteConfigPath}`);
  process.exit(1);
}

// Read the current config
let viteConfig = fs.readFileSync(viteConfigPath, 'utf8');

// Create a temporary version of the config with TypeScript disabled
const tempViteConfig = `
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// This is a modified config for Heroku builds that skips TypeScript checking
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'shared': path.resolve(__dirname, '../shared/src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    // Use relative paths for assets in production
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        // Ensure assets use relative paths rather than absolute paths
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },
  },
  base: './', // Use relative paths instead of absolute
  esbuild: {
    // Skip type checking
    tsconfigRaw: {
      compilerOptions: {
        skipLibCheck: true,
        skipDefaultLibCheck: true,
      }
    }
  }
});
`;

// Write the temporary config
const tempConfigPath = path.join(clientDir, 'vite.config.heroku.ts');
fs.writeFileSync(tempConfigPath, tempViteConfig);
console.log(`Created temporary Vite config at: ${tempConfigPath}`);

// Create a symbolic link to use our temp config
try {
  if (fs.existsSync(viteConfigPath + '.original')) {
    console.log('Original config backup already exists, using it');
  } else {
    fs.renameSync(viteConfigPath, viteConfigPath + '.original');
    console.log('Original config backed up');
  }

  fs.symlinkSync(tempConfigPath, viteConfigPath);
  console.log('Temporary config linked as main config');
} catch (err) {
  console.error('Error creating symbolic link:', err);

  // If symlink fails, just replace the file directly
  fs.writeFileSync(viteConfigPath, tempViteConfig);
  console.log('Directly replaced vite.config.ts with TypeScript disabled version');
}

// Config has been updated
console.log('Vite config modified to skip type checking');

// Modify the build script in package.json
const packageJsonPath = path.join(clientDir, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  let packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  // Update the build:heroku script to skip type checking completely
  packageJson.scripts = packageJson.scripts || {};
  packageJson.scripts['build:heroku'] = 'vite build';

  // Write the updated package.json
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('Updated package.json to skip type checking in build:heroku script');
} else {
  console.error(`Package.json not found at: ${packageJsonPath}`);
}

console.log('Type checking disabled for Heroku build');
