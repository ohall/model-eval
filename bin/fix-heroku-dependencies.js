#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Starting Heroku dependency fix...');

// Current directory should be project root
const rootDir = process.cwd();
console.log(`Working in directory: ${rootDir}`);

// Add express-rate-limit to packages/server/package.json if not present
const serverPackageJsonPath = path.join(rootDir, 'packages', 'server', 'package.json');
console.log(`Checking ${serverPackageJsonPath} for express-rate-limit...`);

try {
  const packageJsonContent = fs.readFileSync(serverPackageJsonPath, 'utf-8');
  const packageJson = JSON.parse(packageJsonContent);

  // Check if the dependency is already present
  let modified = false;
  if (!packageJson.dependencies['express-rate-limit']) {
    console.log('Adding express-rate-limit dependency...');
    packageJson.dependencies['express-rate-limit'] = '^7.1.5';
    modified = true;
  }

  // Check if the type definition is already present
  if (!packageJson.devDependencies['@types/express-rate-limit']) {
    console.log('Adding @types/express-rate-limit dev dependency...');
    packageJson.devDependencies['@types/express-rate-limit'] = '^6.0.0';
    modified = true;
  }

  if (modified) {
    // Write the updated package.json
    fs.writeFileSync(serverPackageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
    console.log('Server package.json updated successfully.');

    // Manually install the dependency to ensure it's available during build
    console.log('Installing new dependencies...');
    execSync(
      'cd packages/server && pnpm add express-rate-limit@^7.1.5 && pnpm add -D @types/express-rate-limit@^6.0.0',
      { stdio: 'inherit' }
    );
  } else {
    console.log('Dependencies already present in package.json.');
  }
} catch (err) {
  console.error(`Error updating server package.json: ${err.message}`);
}

// Set up pnpm store correctly
console.log('\nSetting up pnpm store...');
try {
  // First check existing store path
  const storePathOutput = execSync('pnpm store path').toString().trim();
  console.log(`Current pnpm store path: ${storePathOutput}`);

  // Ensure all dependencies use the same store
  if (storePathOutput !== '/tmp/pnpmcache.EZMf1/v3') {
    console.log('Setting pnpm store path to use Heroku cache...');
    execSync('pnpm config set store-dir /tmp/pnpmcache.EZMf1/v3 --global');
    execSync('pnpm config set store-dir /tmp/pnpmcache.EZMf1/v3');
    console.log('Store path updated.');
  }
} catch (err) {
  console.error(`Error configuring pnpm store: ${err.message}`);
}

console.log('\nDependency fix completed.');
