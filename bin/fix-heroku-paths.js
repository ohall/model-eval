#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Create symbolic links if needed for client dist folder
function createSymlinks() {
  const rootDir = process.cwd();
  console.log('Current directory:', rootDir);
  
  // Check if we're in production/Heroku
  if (process.env.NODE_ENV !== 'production') {
    console.log('Not in production, skipping symlink creation.');
    return;
  }
  
  // Source directory - where the client/dist actually is
  const sourceDir = path.join(rootDir, 'packages/client/dist');
  
  // Check if the source directory exists
  if (!fs.existsSync(sourceDir)) {
    console.error(`Source directory ${sourceDir} does not exist!`);
    console.log('Attempting to list packages directory:');
    try {
      const packagesDir = path.join(rootDir, 'packages');
      if (fs.existsSync(packagesDir)) {
        console.log('Contents of packages directory:', fs.readdirSync(packagesDir));
        
        const clientDir = path.join(packagesDir, 'client');
        if (fs.existsSync(clientDir)) {
          console.log('Contents of client directory:', fs.readdirSync(clientDir));
        } else {
          console.log('Client directory does not exist');
        }
      } else {
        console.log('Packages directory does not exist');
      }
    } catch (err) {
      console.error('Error listing directories:', err);
    }
    return;
  }
  
  console.log(`Source directory ${sourceDir} exists.`);
  console.log('Contents:', fs.readdirSync(sourceDir));
  
  // Potential target directories where the server might look for client files
  const targetDirs = [
    path.join(rootDir, 'client/dist'),
    path.join(rootDir, 'packages/server/client/dist')
  ];
  
  for (const targetDir of targetDirs) {
    try {
      // Create parent directory if it doesn't exist
      const parentDir = path.dirname(targetDir);
      if (!fs.existsSync(parentDir)) {
        fs.mkdirSync(parentDir, { recursive: true });
        console.log(`Created directory: ${parentDir}`);
      }
      
      // Check if target already exists
      if (fs.existsSync(targetDir)) {
        const stats = fs.lstatSync(targetDir);
        if (stats.isSymbolicLink()) {
          console.log(`Symlink already exists at ${targetDir}`);
          continue;
        } else {
          console.log(`Removing existing directory at ${targetDir}`);
          fs.rmSync(targetDir, { recursive: true, force: true });
        }
      }
      
      // Create symlink
      fs.symlinkSync(sourceDir, targetDir, 'dir');
      console.log(`Created symlink: ${targetDir} -> ${sourceDir}`);
    } catch (err) {
      console.error(`Error creating symlink to ${targetDir}:`, err);
    }
  }
}

// Copy client dist files to alternate locations
function copyClientFiles() {
  const rootDir = process.cwd();
  const sourceDir = path.join(rootDir, 'packages/client/dist');
  
  if (!fs.existsSync(sourceDir)) {
    console.error(`Source directory ${sourceDir} does not exist!`);
    return;
  }
  
  console.log(`Copying client files from ${sourceDir}`);
  
  // Potential target directories where the server might look for client files
  const targetDirs = [
    path.join(rootDir, 'client/dist'),
    path.join(rootDir, 'dist')
  ];
  
  for (const targetDir of targetDirs) {
    try {
      // Create parent directory if it doesn't exist
      const parentDir = path.dirname(targetDir);
      if (!fs.existsSync(parentDir)) {
        fs.mkdirSync(parentDir, { recursive: true });
      }
      
      // Create target directory if it doesn't exist
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      
      // Copy all files from source to target
      copyDirectory(sourceDir, targetDir);
      console.log(`Copied files to ${targetDir}`);
    } catch (err) {
      console.error(`Error copying files to ${targetDir}:`, err);
    }
  }
}

function copyDirectory(source, target) {
  // Get all files in the source directory
  const files = fs.readdirSync(source, { withFileTypes: true });
  
  // Process each file
  for (const file of files) {
    const sourcePath = path.join(source, file.name);
    const targetPath = path.join(target, file.name);
    
    if (file.isDirectory()) {
      // Create target directory if it doesn't exist
      if (!fs.existsSync(targetPath)) {
        fs.mkdirSync(targetPath, { recursive: true });
      }
      
      // Recursively copy subdirectory
      copyDirectory(sourcePath, targetPath);
    } else {
      // Copy file
      fs.copyFileSync(sourcePath, targetPath);
    }
  }
}

// Run both functions
try {
  console.log('Starting Heroku path fix script...');
  createSymlinks();
  copyClientFiles();
  console.log('Finished Heroku path fix script.');
} catch (err) {
  console.error('Error in Heroku path fix script:', err);
}