#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Function to fix API base URLs in JavaScript files
function fixApiUrls() {
  const clientDistPath = path.join(process.cwd(), 'packages/client/dist');
  const assetsDir = path.join(clientDistPath, 'assets');

  if (!fs.existsSync(assetsDir)) {
    console.log('Assets directory not found, skipping API URL fix');
    return;
  }

  const files = fs.readdirSync(assetsDir);
  const jsFiles = files.filter(f => f.endsWith('.js'));

  // The Heroku app URL
  const herokuUrl = 'https://model-eval-aa67ebbb791b.herokuapp.com';

  for (const jsFile of jsFiles) {
    const filePath = path.join(assetsDir, jsFile);
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Replace baseURL pattern for axios
    if (
      content.includes('baseURL:"/api"') ||
      content.includes('baseURL: "/api"') ||
      content.includes("baseURL:'/api'") ||
      content.includes("baseURL: '/api'")
    ) {
      console.log(`Fixing baseURL in ${jsFile}...`);

      content = content.replace(/baseURL:\s*["']\/api["']/g, `baseURL:"${herokuUrl}/api"`);
      modified = true;
    }

    // Replace VITE_API_URL pattern
    if (content.includes('VITE_API_URL') || content.includes('import.meta.env.VITE_API_URL')) {
      console.log(`Fixing VITE_API_URL references in ${jsFile}...`);

      content = content.replace(
        /import\.meta\.env\.VITE_API_URL\s*\|\|\s*["']\/api["']/g,
        `"${herokuUrl}/api"`
      );
      content = content.replace(/VITE_API_URL\s*\|\|\s*["']\/api["']/g, `"${herokuUrl}/api"`);

      modified = true;
    }

    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`Updated ${jsFile} with API URL fixes`);
    }
  }
}

// Path to the client dist directory
const clientDistPath = path.join(process.cwd(), 'packages/client/dist');
const indexHtmlPath = path.join(clientDistPath, 'index.html');

console.log('Fixing paths in client HTML...');

// Scan asset directory to get all available .js and .css files
const assetsDir = path.join(clientDistPath, 'assets');
let jsFiles = [];
let cssFiles = [];

if (fs.existsSync(assetsDir)) {
  const files = fs.readdirSync(assetsDir);
  jsFiles = files.filter(f => f.endsWith('.js'));
  cssFiles = files.filter(f => f.endsWith('.css'));
  console.log(`Found assets: JS=${jsFiles.join(', ')}, CSS=${cssFiles.join(', ')}`);
}

// Check if the file exists
if (!fs.existsSync(indexHtmlPath)) {
  console.error(`index.html not found at ${indexHtmlPath}`);
  process.exit(1);
}

// Read the HTML file
let html = fs.readFileSync(indexHtmlPath, 'utf8');

// Extract asset paths from HTML
const jsMatches = html.match(/src="[^"]*\.js"/g) || [];
const cssMatches = html.match(/href="[^"]*\.css"/g) || [];

console.log('Original asset references:', {
  js: jsMatches,
  css: cssMatches,
});

// Replace absolute paths with relative paths
html = html.replace(/src="\/([^"]+)"/g, 'src="$1"');
html = html.replace(/href="\/([^"]+)"/g, 'href="$1"');

// Extract the js and css filenames from the HTML
let mainJsFile = '';
const jsRegex = /src="[^"]*\/([^\/]*\.js)"/;
const jsMatch = html.match(jsRegex);
if (jsMatch) {
  mainJsFile = jsMatch[1];
}

let mainCssFile = '';
const cssRegex = /href="[^"]*\/([^\/]*\.css)"/;
const cssMatch = html.match(cssRegex);
if (cssMatch) {
  mainCssFile = cssMatch[1];
}

console.log(`Main assets referenced in HTML: JS=${mainJsFile}, CSS=${mainCssFile}`);

// Create asset-manifest.json
const assetManifest = {
  js: jsFiles,
  css: cssFiles,
  mainJs: mainJsFile,
  mainCss: mainCssFile,
  timestamp: new Date().toISOString(),
};

// Write the asset manifest
const manifestPath = path.join(clientDistPath, 'asset-manifest.json');
fs.writeFileSync(manifestPath, JSON.stringify(assetManifest, null, 2));
console.log(`Created asset manifest at ${manifestPath}`);

// Write the modified HTML file
fs.writeFileSync(indexHtmlPath, html);
console.log('Updated HTML with relative paths');

console.log(`Updated ${indexHtmlPath} with relative paths`);

// Copy the index.html to all potential locations
const targetDirs = [path.join(process.cwd(), 'client/dist'), path.join(process.cwd(), 'dist')];

for (const dir of targetDirs) {
  if (fs.existsSync(dir)) {
    const targetPath = path.join(dir, 'index.html');
    fs.copyFileSync(indexHtmlPath, targetPath);
    console.log(`Copied updated index.html to ${targetPath}`);
  }
}

// Make sure the assets directory is available in all locations
const clientAssetsDir = path.join(clientDistPath, 'assets');
if (fs.existsSync(clientAssetsDir)) {
  const assetFiles = fs.readdirSync(clientAssetsDir);
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
        const sourcePath = path.join(clientAssetsDir, file);
        const targetPath = path.join(targetAssetsDir, file);

        fs.copyFileSync(sourcePath, targetPath);
      }

      console.log(`Copied assets to ${targetAssetsDir}`);
    }
  }
}

// Fix API URLs in JavaScript files
console.log('Fixing API URLs in JavaScript files...');
fixApiUrls();
