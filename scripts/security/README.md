# API Security Testing

This directory contains tools for testing the security of the Model Evaluation Platform API.

## Available Tools

### `test-api-security.js`

A comprehensive security testing script that validates your API's authentication mechanisms, CORS configuration, rate limiting, and other security measures.

#### Usage

```bash
# Run basic security test against the default Heroku URL
node test-api-security.js

# Test against a custom URL
node test-api-security.js --url=https://your-custom-url.com

# Show detailed information about requests and responses
node test-api-security.js --verbose

# Generate an HTML report of security test results
node test-api-security.js --html
```

#### What it Tests

1. **API Connectivity**
   - Verifies if the API is reachable

2. **Authentication**
   - Tests accessing protected endpoints without authentication
   - Tests with invalid JWT tokens
   - Tests with development tokens
   - Tests with development tokens and special headers

3. **CORS Configuration**
   - Checks CORS preflight responses
   - Validates CORS headers

4. **Rate Limiting**
   - Makes multiple rapid requests to check for rate limiting
   - Detects rate limiting headers

5. **Security Headers**
   - Validates the presence of recommended HTTP security headers:
     - Content-Security-Policy
     - Strict-Transport-Security
     - X-Content-Type-Options
     - X-Frame-Options
     - X-XSS-Protection
     - Referrer-Policy

6. **Access Control**
   - Tests common sensitive endpoints
   - Validates proper authorization is enforced

## Security Best Practices

When deploying your API to production, ensure the following security measures are in place:

1. **Authentication**
   - Use JWT tokens with proper expiration times
   - Implement token refresh mechanisms
   - Never allow development tokens in production

2. **API Access Controls**
   - Implement proper authorization checks for all endpoints
   - Use middleware to validate permissions

3. **Environment Configuration**
   - Use different configurations for development and production
   - Never expose sensitive debugging information in production

4. **Security Headers**
   - Implement proper Content-Security-Policy
   - Enable HTTP Strict Transport Security (HSTS)
   - Set proper X-Frame-Options to prevent clickjacking

5. **CORS Configuration**
   - Restrict allowed origins to known domains
   - Avoid using wildcard (*) origins in production

6. **Rate Limiting**
   - Implement rate limiting to prevent abuse
   - Consider different limits for authenticated vs. unauthenticated requests

## Regular Testing

It's recommended to run these security tests:
- After making significant changes to the authentication system
- Before deploying to production
- Periodically (e.g., monthly) to ensure security is maintained