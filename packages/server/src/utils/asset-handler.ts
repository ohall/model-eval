import fs from 'fs';
import path from 'path';
import { Request, Response, NextFunction } from 'express';
import logger from './logger';

// Asset map to store mapping of requested paths to actual paths
const assetMap = new Map<string, string>();

/**
 * Middleware to handle asset requests and redirect to the correct file
 */
export const assetRedirectMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Only handle requests to /assets/
  if (!req.path.startsWith('/assets/')) {
    return next();
  }

  const requestedAsset = req.path.substring('/assets/'.length);
  logger.info(`Asset request: ${requestedAsset}`);
  
  // If we already have a mapping for this asset, redirect to it
  if (assetMap.has(requestedAsset)) {
    const actualPath = assetMap.get(requestedAsset);
    if (actualPath && fs.existsSync(actualPath)) {
      return res.sendFile(actualPath);
    } else {
      // If the previously mapped file no longer exists, remove it from the map
      assetMap.delete(requestedAsset);
    }
  }
  
  // No mapping exists or the mapped file no longer exists, try to find the asset
  const rootDir = process.cwd();
  const possibleDirs = [
    path.join(rootDir, 'packages/client/dist/assets'),
    path.join(rootDir, 'client/dist/assets'),
    path.join(rootDir, 'dist/assets'),
    path.join(__dirname, '../../../client/dist/assets')
  ];
  
  // Look for the exact filename match
  for (const dir of possibleDirs) {
    const filePath = path.join(dir, requestedAsset);
    if (fs.existsSync(filePath)) {
      // Found the exact file, serve it
      assetMap.set(requestedAsset, filePath);
      return res.sendFile(filePath);
    }
  }
  
  // If we reached here, the exact file wasn't found
  // Look for similarly named JS or CSS files (for cases where hash changed)
  if (requestedAsset.endsWith('.js')) {
    for (const dir of possibleDirs) {
      if (fs.existsSync(dir)) {
        // Find all JS files in this directory
        const files = fs.readdirSync(dir).filter(file => file.endsWith('.js'));
        if (files.length > 0) {
          // Take the first JS file we find
          const filePath = path.join(dir, files[0]);
          logger.info(`JS asset ${requestedAsset} not found, using ${files[0]} instead`);
          assetMap.set(requestedAsset, filePath);
          return res.sendFile(filePath);
        }
      }
    }
  } else if (requestedAsset.endsWith('.css')) {
    for (const dir of possibleDirs) {
      if (fs.existsSync(dir)) {
        // Find all CSS files in this directory
        const files = fs.readdirSync(dir).filter(file => file.endsWith('.css'));
        if (files.length > 0) {
          // Take the first CSS file we find
          const filePath = path.join(dir, files[0]);
          logger.info(`CSS asset ${requestedAsset} not found, using ${files[0]} instead`);
          assetMap.set(requestedAsset, filePath);
          return res.sendFile(filePath);
        }
      }
    }
  }
  
  // If still not found, log and continue to next middleware
  logger.error(`Asset ${requestedAsset} not found in any location`);
  next();
};

/**
 * Initialize the asset map from asset manifest files
 */
export const initializeAssetMap = () => {
  const rootDir = process.cwd();
  const possibleManifestPaths = [
    path.join(rootDir, 'packages/client/dist/asset-manifest.json'),
    path.join(rootDir, 'client/dist/asset-manifest.json'),
    path.join(rootDir, 'dist/asset-manifest.json')
  ];
  
  for (const manifestPath of possibleManifestPaths) {
    if (fs.existsSync(manifestPath)) {
      try {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        logger.info(`Loaded asset manifest from ${manifestPath}`);
        
        // If manifest contains mainJs, add it to the map
        if (manifest.mainJs) {
          const jsFile = manifest.mainJs;
          const jsDir = path.dirname(manifestPath);
          const jsPath = path.join(jsDir, 'assets', jsFile);
          
          if (fs.existsSync(jsPath)) {
            // Add a mapping for index.js (general name) to the specific file
            assetMap.set('index.js', jsPath);
            // Add a mapping for the specific file name
            assetMap.set(jsFile, jsPath);
            
            logger.info(`Mapped JS asset: index.js -> ${jsPath}`);
          }
        }
        
        // Same for CSS
        if (manifest.mainCss) {
          const cssFile = manifest.mainCss;
          const cssDir = path.dirname(manifestPath);
          const cssPath = path.join(cssDir, 'assets', cssFile);
          
          if (fs.existsSync(cssPath)) {
            // Add a mapping for index.css (general name) to the specific file
            assetMap.set('index.css', cssPath);
            // Add a mapping for the specific file name
            assetMap.set(cssFile, cssPath);
            
            logger.info(`Mapped CSS asset: index.css -> ${cssPath}`);
          }
        }
      } catch (err) {
        logger.error(`Error loading asset manifest from ${manifestPath}:`, err);
      }
    }
  }
  
  logger.info(`Initialized asset map with ${assetMap.size} entries`);
};