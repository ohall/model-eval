# Development Authentication

This document explains the development authentication setup for the Model Evaluation Platform.

## Overview

To simplify development and testing, this application includes a development authentication mode that bypasses the need for actual Google OAuth authentication. This is **NOT** for production use.

## Development Authentication Features

1. **Skip Google Login button**:

   - Available only in development mode
   - Instantly logs you in with a fake development user
   - No actual Google authentication is performed

2. **Client-side fallback**:

   - If the Google authentication fails but the Google credential is valid
   - Creates a user from the Google credential information
   - Uses a local "dev token" for authentication

3. **Demo Account**:

   - Appears after a Google login error
   - Provides a way to log in without any Google interaction

4. **Server-side bypass**:
   - In development mode, all API endpoints will accept any token starting with "dev-"
   - The `/api/auth/google` endpoint will return a successful response with a fake user

## How to Use Development Authentication

### Option 1: Skip Google Login (Easiest)

1. Run the application in development mode
2. Navigate to the login page
3. Click the "Skip Google Login (Dev Only)" button

### Option 2: Use Demo Account After Error

1. Run the application in development mode
2. Navigate to the login page
3. Try signing in with Google (it will likely fail)
4. Click the "Use Demo Account" button that appears

### Option 3: Use Client-Side Fallback

1. Run the application in development mode
2. Navigate to the login page
3. Sign in with Google
4. If the server authentication fails, it will automatically fall back to client-side auth

## Development User Details

The development user has the following properties:

```json
{
  "id": "dev-user-id",
  "email": "dev@example.com",
  "name": "Development User",
  "provider": "google"
}
```

## Security Notice

The development authentication is ONLY enabled when:

1. The application is running in development mode, OR
2. The hostname is "localhost"

It is NEVER enabled in production builds or on non-localhost domains.

## Configuring Production Authentication

For production deployment, follow these steps:

1. Set the environment to "production"
2. Provide valid Google OAuth credentials
3. Set a strong JWT secret
4. Remove all development fallbacks by setting `NODE_ENV` to "production"

See the `GOOGLE_AUTH_SETUP.md` and `GOOGLE_AUTH_TROUBLESHOOTING.md` files for details on setting up real Google authentication.
