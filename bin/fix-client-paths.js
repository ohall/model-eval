#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Path to the client dist directory
const clientDistPath = path.join(process.cwd(), 'packages/client/dist');
const indexHtmlPath = path.join(clientDistPath, 'index.html');

console.log('Fixing paths in client HTML...');

// Check if the file exists
if (!fs.existsSync(indexHtmlPath)) {
  console.error(`index.html not found at ${indexHtmlPath}`);
  process.exit(1);
}

// Read the HTML file
let html = fs.readFileSync(indexHtmlPath, 'utf8');

// Replace absolute paths with relative paths
console.log('Original HTML paths:', html.match(/src="\/[^"]+"|href="\/[^"]+"/g));

// Replace absolute paths with relative paths
html = html.replace(/src="\/([^"]+)"/g, 'src="$1"');
html = html.replace(/href="\/([^"]+)"/g, 'href="$1"');

console.log('New HTML paths:', html.match(/src="[^"\/][^"]+"|href="[^"\/][^"]+"/g));

// Write the modified HTML file
fs.writeFileSync(indexHtmlPath, html);

console.log(`Updated ${indexHtmlPath} with relative paths`);

// Copy the index.html to all potential locations
const targetDirs = [
  path.join(process.cwd(), 'client/dist'),
  path.join(process.cwd(), 'dist')
];

for (const dir of targetDirs) {
  if (fs.existsSync(dir)) {
    const targetPath = path.join(dir, 'index.html');
    fs.copyFileSync(indexHtmlPath, targetPath);
    console.log(`Copied updated index.html to ${targetPath}`);
  }
}

// Make sure the assets directory is available in all locations
const assetsDir = path.join(clientDistPath, 'assets');
if (fs.existsSync(assetsDir)) {
  const assetFiles = fs.readdirSync(assetsDir);
  console.log(`Found ${assetFiles.length} asset files to copy`);
  
  for (const dir of targetDirs) {
    if (fs.existsSync(dir)) {
      const targetAssetsDir = path.join(dir, 'assets');
      
      // Create assets directory if it doesn't exist
      if (!fs.existsSync(targetAssetsDir)) {
        fs.mkdirSync(targetAssetsDir, { recursive: true });
      }
      
      // Copy all asset files
      for (const file of assetFiles) {
        const sourcePath = path.join(assetsDir, file);
        const targetPath = path.join(targetAssetsDir, file);
        
        fs.copyFileSync(sourcePath, targetPath);
      }
      
      console.log(`Copied assets to ${targetAssetsDir}`);
    }
  }
}