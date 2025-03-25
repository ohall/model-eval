#!/usr/bin/env node

/**
 * API Security Testing Script
 *
 * This script tests the security of the deployed API on Heroku by:
 * - Testing authentication mechanisms
 * - Attempting to access protected endpoints
 * - Testing if dev auth tokens are properly rejected
 * - Testing CORS, rate limiting, and other security measures
 *
 * Usage:
 *   node test-api-security.js [options]
 *
 * Options:
 *   --url=<url>     Base URL of the API (default: https://model-eval-aa67ebbb791b.herokuapp.com)
 *   --verbose       Show detailed output and request info
 *   --html          Generate HTML report
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');
const { promisify } = require('util');
const writeFileAsync = promisify(fs.writeFile);

// Parse command line arguments
const args = process.argv.slice(2);
let baseUrl = 'https://model-eval-aa67ebbb791b.herokuapp.com';
let verbose = false;
let generateHtml = false;

for (const arg of args) {
  if (arg.startsWith('--url=')) {
    baseUrl = arg.substring('--url='.length);
  } else if (arg === '--verbose') {
    verbose = true;
  } else if (arg === '--html') {
    generateHtml = true;
  }
}

// Ensure baseUrl doesn't end with a slash
if (baseUrl.endsWith('/')) {
  baseUrl = baseUrl.slice(0, -1);
}

console.log(`🔒 API Security Test for ${baseUrl}`);
console.log('--------------------------------------');

// Test results
const results = {
  passed: [],
  failed: [],
  warnings: [],
  info: [],
};

/**
 * Make an HTTP request with various options
 */
async function makeRequest(options) {
  return new Promise(resolve => {
    const url = new URL(options.url);
    const requestOptions = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method: options.method || 'GET',
      headers: options.headers || {},
    };

    const client = url.protocol === 'https:' ? https : http;

    if (verbose) {
      console.log(`\n🌐 Request: ${options.method || 'GET'} ${options.url}`);
      console.log('Headers:', options.headers || {});
      if (options.body) console.log('Body:', options.body);
    }

    const req = client.request(requestOptions, res => {
      let responseData = '';

      res.on('data', chunk => {
        responseData += chunk;
      });

      res.on('end', () => {
        let parsedData = responseData;
        try {
          // Try to parse as JSON if possible
          parsedData = JSON.parse(responseData);
        } catch (e) {
          // If it's not JSON, keep it as is
        }

        const result = {
          statusCode: res.statusCode,
          headers: res.headers,
          data: parsedData,
          success: res.statusCode >= 200 && res.statusCode < 300,
        };

        if (verbose) {
          console.log(`Response: ${res.statusCode}`);
          console.log('Headers:', res.headers);
          console.log(
            'Body:',
            typeof parsedData === 'object' ? JSON.stringify(parsedData, null, 2) : parsedData
          );
        }

        resolve(result);
      });
    });

    req.on('error', error => {
      console.error(`Request error: ${error.message}`);
      resolve({
        statusCode: 0,
        error: error.message,
        success: false,
      });
    });

    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }

    req.end();
  });
}

/**
 * Log test result
 */
function logResult(name, success, message, data = null) {
  if (success) {
    console.log(`✅ PASS: ${name} - ${message}`);
    results.passed.push({ name, message, data });
  } else {
    console.log(`❌ FAIL: ${name} - ${message}`);
    results.failed.push({ name, message, data });
  }
}

/**
 * Log a warning
 */
function logWarning(name, message, data = null) {
  console.log(`⚠️ WARNING: ${name} - ${message}`);
  results.warnings.push({ name, message, data });
}

/**
 * Log information
 */
function logInfo(name, message, data = null) {
  console.log(`ℹ️ INFO: ${name} - ${message}`);
  results.info.push({ name, message, data });
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('\n🔍 Starting security tests...');

  // ==========================================
  // 1. Basic API Connectivity
  // ==========================================
  try {
    console.log('\n📡 Testing basic API connectivity...');

    // Test if the API is reachable
    const response = await makeRequest({
      url: `${baseUrl}/api/health`,
      method: 'GET',
    });

    logResult(
      'API Connectivity',
      response.success,
      response.success ? 'API is reachable' : `API is not reachable (${response.statusCode})`
    );
  } catch (error) {
    console.error('Error testing API connectivity:', error);
    logResult('API Connectivity', false, `Error: ${error.message}`);
  }

  // ==========================================
  // 2. Authentication Tests
  // ==========================================
  console.log('\n🔑 Testing authentication...');

  // Test accessing protected endpoint without auth
  const noAuthResponse = await makeRequest({
    url: `${baseUrl}/api/prompts`,
    method: 'GET',
  });

  logResult(
    'Protected Routes',
    noAuthResponse.statusCode === 401,
    noAuthResponse.statusCode === 401
      ? 'Protected routes properly require authentication'
      : `Protected route returned ${noAuthResponse.statusCode} instead of 401 Unauthorized`
  );

  // Test with invalid JWT token
  const invalidTokenResponse = await makeRequest({
    url: `${baseUrl}/api/prompts`,
    method: 'GET',
    headers: {
      Authorization: 'Bearer invalid.jwt.token',
    },
  });

  logResult(
    'Invalid JWT',
    invalidTokenResponse.statusCode === 401,
    invalidTokenResponse.statusCode === 401
      ? 'Invalid JWT is properly rejected'
      : `Invalid JWT returned ${invalidTokenResponse.statusCode} instead of 401`
  );

  // Test with development token
  const devTokenResponse = await makeRequest({
    url: `${baseUrl}/api/prompts`,
    method: 'GET',
    headers: {
      Authorization: 'Bearer dev-jwt-token',
    },
  });

  logResult(
    'Dev Token Rejected',
    devTokenResponse.statusCode === 401,
    devTokenResponse.statusCode === 401
      ? 'Development token properly rejected in production'
      : `Development token returned ${devTokenResponse.statusCode} instead of 401`
  );

  // Test with development token and special header
  const devTokenWithHeaderResponse = await makeRequest({
    url: `${baseUrl}/api/prompts`,
    method: 'GET',
    headers: {
      Authorization: 'Bearer dev-jwt-token',
      'X-Allow-Dev-Token': 'true',
    },
  });

  if (devTokenWithHeaderResponse.statusCode === 401) {
    logResult(
      'Dev Token with Header',
      true,
      'Development token with special header properly rejected in production'
    );
  } else {
    logWarning(
      'Dev Token with Header',
      `Development token with special header returned ${devTokenWithHeaderResponse.statusCode} - this may be a security issue`
    );
  }

  // Test auth debug endpoint
  const authDebugResponse = await makeRequest({
    url: `${baseUrl}/api/auth/debug`,
    method: 'GET',
  });

  if (authDebugResponse.success) {
    logInfo('Auth Debug', 'Auth debug endpoint is available', authDebugResponse.data);

    // Check if debug endpoint leaks sensitive information
    const debugData = authDebugResponse.data;
    if (debugData && debugData.environment) {
      logInfo('Environment', `API is running in ${debugData.environment} mode`);
    }
  } else {
    logInfo('Auth Debug', 'Auth debug endpoint is not accessible or not implemented');
  }

  // Test authentication with test token endpoint
  const testTokenResponse = await makeRequest({
    url: `${baseUrl}/api/auth/test-token`,
    method: 'GET',
  });

  if (testTokenResponse.success) {
    logWarning(
      'Test Token',
      'Test token endpoint is accessible - this should be disabled in production',
      testTokenResponse.data
    );
  } else {
    logResult('Test Token', true, 'Test token endpoint is properly disabled in production');
  }

  // ==========================================
  // 3. CORS Tests
  // ==========================================
  console.log('\n🌐 Testing CORS configuration...');

  // Check CORS preflight response
  const corsResponse = await makeRequest({
    url: `${baseUrl}/api/health`,
    method: 'OPTIONS',
    headers: {
      Origin: 'https://example.com',
      'Access-Control-Request-Method': 'GET',
      'Access-Control-Request-Headers': 'Authorization,Content-Type',
    },
  });

  const corsHeaders = corsResponse.headers;
  if (corsHeaders['access-control-allow-origin']) {
    const allowOrigin = corsHeaders['access-control-allow-origin'];
    if (allowOrigin === '*') {
      logWarning(
        'CORS',
        'CORS allows requests from any origin (*) - consider restricting this in production'
      );
    } else {
      logResult('CORS', true, `CORS properly restricts allowed origins: ${allowOrigin}`);
    }
  } else {
    logInfo('CORS', 'CORS headers not detected in response');
  }

  // ==========================================
  // 4. Rate Limiting Tests
  // ==========================================
  console.log('\n⏱️ Testing rate limiting...');

  // Make multiple rapid requests to check for rate limiting
  const rateLimitRequests = [];
  for (let i = 0; i < 5; i++) {
    rateLimitRequests.push(
      makeRequest({
        url: `${baseUrl}/api/health`,
        method: 'GET',
      })
    );
  }

  const rateLimitResponses = await Promise.all(rateLimitRequests);

  // Check for rate limit headers
  const hasRateLimitHeaders = rateLimitResponses.some(
    response =>
      response.headers['x-ratelimit-limit'] ||
      response.headers['x-ratelimit-remaining'] ||
      response.headers['ratelimit-limit'] ||
      response.headers['ratelimit-remaining']
  );

  if (hasRateLimitHeaders) {
    logResult('Rate Limiting', true, 'Rate limiting headers detected');
  } else {
    logWarning(
      'Rate Limiting',
      'No rate limiting headers detected - consider implementing rate limiting'
    );
  }

  // Check if any requests were rate limited
  const rateLimited = rateLimitResponses.some(response => response.statusCode === 429);
  if (rateLimited) {
    logInfo('Rate Limiting', 'Rate limiting is active and blocked rapid requests');
  }

  // ==========================================
  // 5. Security Headers Tests
  // ==========================================
  console.log('\n🛡️ Testing security headers...');

  const headersResponse = await makeRequest({
    url: `${baseUrl}`,
    method: 'GET',
  });

  const headers = headersResponse.headers;

  // Check for important security headers
  const securityHeaders = {
    'Strict-Transport-Security': 'HSTS',
    'Content-Security-Policy': 'CSP',
    'X-Content-Type-Options': 'X-Content-Type-Options',
    'X-Frame-Options': 'X-Frame-Options',
    'X-XSS-Protection': 'XSS Protection',
    'Referrer-Policy': 'Referrer Policy',
  };

  let missingHeaders = [];

  for (const [header, name] of Object.entries(securityHeaders)) {
    const headerValue = headers[header.toLowerCase()];
    if (headerValue) {
      logResult(`${name} Header`, true, `${name} header is set: ${headerValue}`);
    } else {
      missingHeaders.push(name);
    }
  }

  if (missingHeaders.length > 0) {
    logWarning(
      'Security Headers',
      `Missing recommended security headers: ${missingHeaders.join(', ')}`
    );
  }

  // ==========================================
  // 6. Endpoint tests & access control
  // ==========================================
  console.log('\n🚪 Testing API endpoints and access control...');

  // Test common sensitive endpoints
  const sensitiveEndpoints = [
    // API endpoints that shouldn't be directly accessible
    '/api/users',
    '/api/admin',
    '/api/config',
    '/api/auth/users',
    '/api/v1/users',

    // Authentication related
    '/login',
    '/admin',

    // Config and environment files
    '/.env',
    '/package.json',
    '/package-lock.json',
    '/pnpm-lock.yaml',

    // Source control
    '/.git',
    '/.git/config',
    '/.git/HEAD',
    '/.github/workflows',

    // Files and directories that shouldn't be accessible
    '/node_modules',
    '/node_modules/express',
    '/.vscode',
    '/src',
    '/bin/compile',
  ];

  for (const endpoint of sensitiveEndpoints) {
    const endpointResponse = await makeRequest({
      url: `${baseUrl}${endpoint}`,
      method: 'GET',
    });

    if (
      endpointResponse.statusCode !== 404 &&
      endpointResponse.statusCode !== 401 &&
      endpointResponse.statusCode !== 403
    ) {
      logWarning(
        'Sensitive Endpoint',
        `Endpoint ${endpoint} returned ${endpointResponse.statusCode} - verify this endpoint is properly secured`
      );
    } else {
      logResult(
        'Sensitive Endpoint',
        true,
        `Endpoint ${endpoint} properly restricted with ${endpointResponse.statusCode} response`
      );
    }
  }

  // Generate summary
  console.log('\n📊 Test Summary');
  console.log('--------------------------------------');
  console.log(`✅ ${results.passed.length} tests passed`);
  console.log(`❌ ${results.failed.length} tests failed`);
  console.log(`⚠️ ${results.warnings.length} warnings`);
  console.log(`ℹ️ ${results.info.length} informational messages`);

  // Generate HTML report if requested
  if (generateHtml) {
    await generateHtmlReport();
    console.log('\n📄 HTML report generated: security-report.html');
  }
}

/**
 * Generate HTML report from test results
 */
async function generateHtmlReport() {
  const reportDate = new Date().toISOString();
  const reportPath = path.join(process.cwd(), 'security-report.html');

  let htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>API Security Test Report - ${reportDate}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1000px;
      margin: 0 auto;
      padding: 20px;
    }
    header {
      text-align: center;
      margin-bottom: 30px;
      border-bottom: 1px solid #eee;
      padding-bottom: 20px;
    }
    h1, h2, h3 {
      color: #2c3e50;
    }
    .summary {
      display: flex;
      justify-content: space-around;
      margin: 20px 0;
      text-align: center;
    }
    .summary-item {
      padding: 10px;
      border-radius: 5px;
      min-width: 150px;
    }
    .test-section {
      margin-bottom: 30px;
    }
    .test-item {
      border-left: 4px solid #ddd;
      padding: 10px;
      margin: 10px 0;
    }
    .pass { border-color: #4CAF50; }
    .fail { border-color: #F44336; }
    .warn { border-color: #FF9800; }
    .info { border-color: #2196F3; }
    .pass-bg { background-color: rgba(76, 175, 80, 0.1); }
    .fail-bg { background-color: rgba(244, 67, 54, 0.1); }
    .warn-bg { background-color: rgba(255, 152, 0, 0.1); }
    .info-bg { background-color: rgba(33, 150, 243, 0.1); }
    .technical-details {
      background-color: #f5f5f5;
      padding: 10px;
      border-radius: 4px;
      overflow: auto;
      font-family: monospace;
      margin-top: 10px;
    }
    .count {
      font-size: 24px;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <header>
    <h1>API Security Test Report</h1>
    <p>Generated on ${new Date(reportDate).toLocaleString()}</p>
    <p>Target API: ${baseUrl}</p>
  </header>
  
  <div class="summary">
    <div class="summary-item pass-bg">
      <div class="count">${results.passed.length}</div>
      <div>Tests Passed</div>
    </div>
    <div class="summary-item fail-bg">
      <div class="count">${results.failed.length}</div>
      <div>Tests Failed</div>
    </div>
    <div class="summary-item warn-bg">
      <div class="count">${results.warnings.length}</div>
      <div>Warnings</div>
    </div>
    <div class="summary-item info-bg">
      <div class="count">${results.info.length}</div>
      <div>Info</div>
    </div>
  </div>
  
  <div class="test-section">
    <h2>Failed Tests</h2>
    ${results.failed.length === 0 ? '<p>No test failures. Great job!</p>' : ''}
    ${results.failed
      .map(
        result => `
      <div class="test-item fail">
        <h3>${result.name}</h3>
        <p>${result.message}</p>
        ${
          result.data
            ? `
          <div class="technical-details">
            <pre>${JSON.stringify(result.data, null, 2)}</pre>
          </div>
        `
            : ''
        }
      </div>
    `
      )
      .join('')}
  </div>
  
  <div class="test-section">
    <h2>Warnings</h2>
    ${results.warnings.length === 0 ? '<p>No warnings. Great job!</p>' : ''}
    ${results.warnings
      .map(
        result => `
      <div class="test-item warn">
        <h3>${result.name}</h3>
        <p>${result.message}</p>
        ${
          result.data
            ? `
          <div class="technical-details">
            <pre>${JSON.stringify(result.data, null, 2)}</pre>
          </div>
        `
            : ''
        }
      </div>
    `
      )
      .join('')}
  </div>
  
  <div class="test-section">
    <h2>Passed Tests</h2>
    ${results.passed
      .map(
        result => `
      <div class="test-item pass">
        <h3>${result.name}</h3>
        <p>${result.message}</p>
        ${
          result.data
            ? `
          <div class="technical-details">
            <pre>${JSON.stringify(result.data, null, 2)}</pre>
          </div>
        `
            : ''
        }
      </div>
    `
      )
      .join('')}
  </div>
  
  <div class="test-section">
    <h2>Informational</h2>
    ${results.info
      .map(
        result => `
      <div class="test-item info">
        <h3>${result.name}</h3>
        <p>${result.message}</p>
        ${
          result.data
            ? `
          <div class="technical-details">
            <pre>${JSON.stringify(result.data, null, 2)}</pre>
          </div>
        `
            : ''
        }
      </div>
    `
      )
      .join('')}
  </div>
  
  <footer>
    <p>Security testing script executed on ${new Date(reportDate).toLocaleString()}</p>
  </footer>
</body>
</html>
  `;

  await writeFileAsync(reportPath, htmlContent);
}

// Run all tests
runTests().catch(error => {
  console.error('Error running tests:', error);
});
