# Setting Up Google Authentication

This guide will help you set up Google Authentication for the Model Evaluation Platform.

## Step 1: Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note down your Project ID

## Step 2: Enable the Google OAuth API

1. In your project, go to "APIs & Services" > "Library"
2. Search for "Google OAuth" or "OAuth 2.0"
3. Enable the OAuth 2.0 API

## Step 3: Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" as the user type (unless you're in a Google Workspace organization)
3. Fill in the required fields:
   - App name: "Model Eval Platform" (or your preferred name)
   - User support email: Your email
   - Developer contact information: Your email
4. Add the following scopes:
   - `./auth/userinfo.email`
   - `./auth/userinfo.profile`
5. Save and continue

## Step 4: Create OAuth Client ID

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Select "Web application" as the application type
4. Name: "Model Eval Client" (or your preferred name)
5. Add authorized JavaScript origins:
   - `http://localhost:3000` (for development)
   - Your production URL if applicable
6. Add authorized redirect URIs:
   - `http://localhost:3000` (for development)
   - Your production URL if applicable
7. Click "Create"
8. Note down the Client ID and Client Secret

## Step 5: Configure Your Application

1. Update your `.env` file with the Google Client ID:
   ```
   GOOGLE_CLIENT_ID=your-client-id-from-google-cloud
   ```

2. Update the client-side code in `/packages/client/src/App.tsx` with your Google Client ID:
   ```typescript
   // Replace this line
   const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID";
   
   // With your actual Client ID
   const GOOGLE_CLIENT_ID = "123456789-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com";
   ```

## Testing Google Authentication

1. Start your application
2. Navigate to the login page
3. Click the "Sign in with Google" button
4. You should be redirected to Google's authentication page
5. After successful authentication, you should be redirected back to your application and logged in

## Troubleshooting

- If you get a "redirect_uri_mismatch" error, ensure that the URL in your browser exactly matches one of the authorized redirect URIs in your Google Cloud Console.
- If the Google button doesn't appear, check your browser console for errors and ensure the GOOGLE_CLIENT_ID is correctly set.
- For domain verification issues in production, you may need to verify domain ownership in Google Search Console.