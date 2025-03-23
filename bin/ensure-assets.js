#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('Running asset verification and repair script...');

// Get the app root directory
const rootDir = process.cwd();

// Function to list all files in a directory recursively
function listFilesRecursively(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      fileList = listFilesRecursively(filePath, fileList);
    } else {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Function to verify and serve assets from any found location
function verifyAndLinkAssets() {
  // Find all client build directories
  const possibleClientDirs = [
    path.join(rootDir, 'packages/client/dist'),
    path.join(rootDir, 'client/dist'),
    path.join(rootDir, 'dist')
  ];
  
  // Find which ones exist
  const existingDirs = possibleClientDirs.filter(dir => fs.existsSync(dir));
  
  if (existingDirs.length === 0) {
    console.error('No client build directories found!');
    process.exit(1);
  }
  
  console.log(`Found ${existingDirs.length} client build directories`);
  
  // Collect all asset files from all directories
  const allAssetFiles = new Map(); // path -> content
  
  // First, find all JS and CSS files in all asset directories
  for (const dir of existingDirs) {
    const assetsDir = path.join(dir, 'assets');
    if (fs.existsSync(assetsDir)) {
      const files = fs.readdirSync(assetsDir);
      console.log(`Found ${files.length} files in ${assetsDir}`);
      
      for (const file of files) {
        const filePath = path.join(assetsDir, file);
        if (!fs.statSync(filePath).isDirectory()) {
          const content = fs.readFileSync(filePath);
          allAssetFiles.set(file, content);
        }
      }
    }
  }
  
  console.log(`Collected ${allAssetFiles.size} unique asset files`);
  
  // Now, ensure each asset exists in every asset directory
  for (const dir of existingDirs) {
    const assetsDir = path.join(dir, 'assets');
    
    // Create assets directory if it doesn't exist
    if (!fs.existsSync(assetsDir)) {
      fs.mkdirSync(assetsDir, { recursive: true });
      console.log(`Created assets directory at ${assetsDir}`);
    }
    
    // Write all collected assets to this directory
    for (const [filename, content] of allAssetFiles.entries()) {
      const filePath = path.join(assetsDir, filename);
      fs.writeFileSync(filePath, content);
    }
    
    console.log(`Updated assets in ${assetsDir}`);
  }
  
  // Find all index.html files
  for (const dir of existingDirs) {
    const indexPath = path.join(dir, 'index.html');
    if (fs.existsSync(indexPath)) {
      let html = fs.readFileSync(indexPath, 'utf8');
      
      // Find all JS and CSS references
      const jsMatches = html.match(/src="[^"]*\.js"/g) || [];
      const cssMatches = html.match(/href="[^"]*\.css"/g) || [];
      
      console.log(`Found in ${indexPath}:`);
      console.log('- JS:', jsMatches);
      console.log('- CSS:', cssMatches);
      
      // Create a copy for each filename variant
      for (const filename of allAssetFiles.keys()) {
        if (filename.endsWith('.js')) {
          // Create symlinks or copies for all JS assets
          for (const dir of existingDirs) {
            // Create the base assets directory
            const publicDir = path.join(dir, 'assets');
            if (!fs.existsSync(publicDir)) {
              fs.mkdirSync(publicDir, { recursive: true });
            }
            
            // Now copy the file to the assets directory
            const sourcePath = path.join(existingDirs[0], 'assets', filename);
            const destPath = path.join(publicDir, filename);
            
            try {
              // Copy the file
              if (fs.existsSync(sourcePath) && !fs.existsSync(destPath)) {
                fs.copyFileSync(sourcePath, destPath);
                console.log(`Copied ${filename} to ${destPath}`);
              }
            } catch (err) {
              console.error(`Error handling ${filename}:`, err);
            }
          }
        }
      }
    }
  }
  
  // Handle root assets (favicon, etc)
  for (const dir of existingDirs) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      if (!fs.statSync(path.join(dir, file)).isDirectory()) {
        const content = fs.readFileSync(path.join(dir, file));
        
        // Copy to all other directories
        for (const otherDir of existingDirs) {
          if (otherDir !== dir) {
            const destPath = path.join(otherDir, file);
            if (!fs.existsSync(destPath)) {
              fs.writeFileSync(destPath, content);
              console.log(`Copied ${file} to ${destPath}`);
            }
          }
        }
      }
    }
  }
  
  // Create a manifest of all available assets for debugging
  const manifest = {
    directories: existingDirs,
    assets: Array.from(allAssetFiles.keys()),
    created: new Date().toISOString(),
  };
  
  // Write the manifest to all dirs
  for (const dir of existingDirs) {
    fs.writeFileSync(
      path.join(dir, 'assets-manifest.json'),
      JSON.stringify(manifest, null, 2)
    );
  }
  
  // Create environment.js file for runtime configuration
  const herokuUrl = 'https://model-eval-aa67ebbb791b.herokuapp.com';
  const environmentJs = `
// Runtime environment configuration
window.ENV = {
  API_URL: "${herokuUrl}/api",
  ENV: "${process.env.NODE_ENV || 'development'}",
  APP_VERSION: "${new Date().toISOString()}"
};
console.log('Environment loaded:', window.ENV);
`;

  // Add environment.js to all directories
  for (const dir of existingDirs) {
    // Write environment.js file
    fs.writeFileSync(path.join(dir, 'environment.js'), environmentJs);
    console.log(`Created environment.js in ${dir}`);
    
    // Add script tag to index.html if not already present
    const indexPath = path.join(dir, 'index.html');
    if (fs.existsSync(indexPath)) {
      let html = fs.readFileSync(indexPath, 'utf8');
      
      if (!html.includes('environment.js')) {
        // Add before closing head tag
        html = html.replace('</head>', '<script src="/environment.js"></script>\n  </head>');
        fs.writeFileSync(indexPath, html);
        console.log(`Updated ${indexPath} with environment.js script tag`);
      }
    }
  }
  
  console.log('Asset verification and repair completed.');
}

// Run the function
verifyAndLinkAssets();