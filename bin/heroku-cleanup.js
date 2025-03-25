#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Starting Heroku dependency cleanup...');

// Current directory should be project root
const rootDir = process.cwd();
console.log(`Working in directory: ${rootDir}`);

// Get all workspace package directories
const packageDirs = [
  path.join(rootDir, 'packages', 'shared'),
  path.join(rootDir, 'packages', 'client'),
  path.join(rootDir, 'packages', 'server'),
];

// Check and remove node_modules
console.log('Checking for node_modules directories...');
let cleanupNeeded = false;

function recursiveDirectorySize(dirPath) {
  let size = 0;
  if (!fs.existsSync(dirPath)) return size;

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      size += recursiveDirectorySize(fullPath);
    } else {
      const { size: fileSize } = fs.statSync(fullPath);
      size += fileSize;
    }
  }

  return size;
}

function formatSize(bytes) {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

// Root node_modules
const rootNodeModules = path.join(rootDir, 'node_modules');
if (fs.existsSync(rootNodeModules)) {
  const size = recursiveDirectorySize(rootNodeModules);
  console.log(`Root node_modules exists (${formatSize(size)}), removing...`);
  try {
    execSync(`rm -rf ${rootNodeModules}`);
    console.log('Root node_modules removed successfully');
    cleanupNeeded = true;
  } catch (err) {
    console.error(`Error removing root node_modules: ${err.message}`);
  }
}

// Workspace node_modules
for (const dir of packageDirs) {
  const nodeModulesPath = path.join(dir, 'node_modules');
  if (fs.existsSync(nodeModulesPath)) {
    const size = recursiveDirectorySize(nodeModulesPath);
    console.log(`node_modules exists in ${dir} (${formatSize(size)}), removing...`);
    try {
      execSync(`rm -rf ${nodeModulesPath}`);
      console.log(`node_modules in ${path.basename(dir)} removed successfully`);
      cleanupNeeded = true;
    } catch (err) {
      console.error(`Error removing node_modules in ${dir}: ${err.message}`);
    }
  }
}

// Check for and remove pnpm store if it exists in the project directory
const pnpmStorePaths = [path.join(rootDir, '.pnpm-store'), path.join(rootDir, '.pnpm')];

for (const storePath of pnpmStorePaths) {
  if (fs.existsSync(storePath)) {
    const size = recursiveDirectorySize(storePath);
    console.log(`pnpm store exists at ${storePath} (${formatSize(size)}), removing...`);
    try {
      execSync(`rm -rf ${storePath}`);
      console.log(`Removed pnpm store at ${storePath}`);
      cleanupNeeded = true;
    } catch (err) {
      console.error(`Error removing pnpm store at ${storePath}: ${err.message}`);
    }
  }
}

// Create a fresh .npmrc file
console.log('Creating fresh .npmrc file...');
const npmrcContent = `
strict-peer-dependencies=false
auto-install-peers=true
node-linker=hoisted
shamefully-hoist=true
link-workspace-packages=true
shared-workspace-lockfile=true
prefer-frozen-lockfile=false
`;

try {
  fs.writeFileSync(path.join(rootDir, '.npmrc'), npmrcContent.trim());
  console.log('.npmrc file created successfully');
} catch (err) {
  console.error(`Error creating .npmrc file: ${err.message}`);
}

// Check disk space after cleanup
try {
  console.log('\nDisk space available:');
  execSync('df -h /tmp', { stdio: 'inherit' });
} catch (err) {
  console.error(`Error checking disk space: ${err.message}`);
}

if (cleanupNeeded) {
  console.log('\nCleanup completed. Please install dependencies again with:');
  console.log('pnpm install --no-frozen-lockfile');
} else {
  console.log('\nNo cleanup needed. All node_modules directories were already clean.');
}

console.log('Heroku dependency cleanup completed.');
