# Google Authentication Troubleshooting

## Common Errors

### "The given origin is not allowed for the given client ID"

This error occurs when the domain/origin you're running your application from doesn't match the authorized JavaScript origins you've set in your Google Cloud Console.

**Solution:**

1. Go to your [Google Cloud Console](https://console.cloud.google.com/) > APIs & Services > Credentials
2. Find the OAuth 2.0 Client ID you're using for this application
3. Check the "Authorized JavaScript origins" section
4. Add the exact URL you're using to access your application, including the protocol and port
   - For local development: `http://localhost:3000`
   - For other environments, add the complete URL (e.g., `https://model-eval.yourdomain.com`)

**Important:** Make sure there's no trailing slash at the end of the URL

5. Save the changes (it may take a few minutes to propagate)
6. Reload your application and try again

### "Popup closed by user"

This occurs when the user closes the Google sign-in popup before completing authentication.

**Solution:** This is a user action, but you can make the login process more reliable by:

- Using the `useOneTap` option for GoogleLogin component
- Providing clearer instructions for users

### "Not a valid origin for the client"

Similar to the first error, but can also occur when using different ports or protocols.

**Solution:**

- Ensure that ALL URLs where your app runs are added to the authorized origins
- If testing on different ports, add those URLs as well
- Check for HTTP vs HTTPS mismatch

### Client ID Issues

If you've set up the client ID correctly but still see issues:

1. Make sure your `.env` file has the correct format:
   ```
   VITE_GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
   ```
2. Check that there are no trailing spaces in the client ID
3. Verify that the application is correctly loading the environment variable:

   - Check the browser console log for "Google Client ID: [your-id]"
   - If it shows as empty or undefined, your app isn't loading the environment variable correctly

4. Try restarting your development server after making changes

## Testing Your Configuration

You can test if your Google OAuth configuration is correct by:

1. Creating a simple HTML file with just the Google login button
2. Opening it in your browser from the same origin (localhost:3000)
3. Checking if the button loads correctly

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Google OAuth Test</title>
    <script src="https://accounts.google.com/gsi/client" async></script>
  </head>
  <body>
    <div
      id="g_id_onload"
      data-client_id="YOUR_CLIENT_ID_HERE"
      data-callback="handleCredentialResponse"
    ></div>
    <div class="g_id_signin" data-type="standard"></div>

    <script>
      function handleCredentialResponse(response) {
        console.log('Encoded JWT ID token: ' + response.credential);
      }
    </script>
  </body>
</html>
```

Replace `YOUR_CLIENT_ID_HERE` with your actual client ID.

## Last Resort Solutions

If all else fails:

1. Create a completely new OAuth 2.0 Client ID in your Google Cloud Console
2. Update your application with the new client ID
3. Clear your browser cache and cookies related to Google services
4. Try in an incognito/private browser window

Remember that changes to Google Cloud Console settings may take a few minutes to propagate.

## FedCM and AbortError Issues

If you see errors related to "FedCM" or "AbortError: signal is aborted without reason", these are typically related to the newer Federated Credential Management API that Google is migrating to.

**Solutions:**

1. **Use standard button type instead of One Tap:**

   - Modify your GoogleLogin component to use standard button styling instead of OneTap:

   ```jsx
   <GoogleLogin
     onSuccess={handleLogin}
     onError={handleError}
     type="standard"
     theme="filled_blue"
     size="large"
     shape="rectangular"
     text="signin_with"
   />
   ```

2. **Clear browser cache and cookies:**

   - Clear all Google-related cookies and cache from your browser
   - Try using incognito/private browsing mode

3. **Check browser compatibility:**
   - Some browsers may have different support levels for the FedCM API
   - Try using Chrome, which has the best support for Google Sign-In
4. **Use a different Google account:**
   - Some Google account settings can affect the FedCM experience
   - Try with a different Google account
