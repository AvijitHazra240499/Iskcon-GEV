# Fix: Google OAuth Insufficient Scopes Error

## Problem
Error: `"Request had insufficient authentication scopes"`

This happens when the Google OAuth token doesn't have permission to access Google Drive.

## Solution

### Step 1: Update Auth Configuration (Already Done ✓)
The `lib/auth.ts` file has been updated to include the full Google Drive scope:
```typescript
scope: "openid email profile https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/drive.file"
```

### Step 2: Update Google Cloud Console OAuth Scopes

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to **APIs & Services** > **Credentials**
4. Click on your OAuth 2.0 Client ID
5. Under **Authorized redirect URIs**, make sure you have:
   - `http://localhost:3000/api/auth/callback/google` (for local development)
   - Your production URL callback (e.g., `https://yourdomain.com/api/auth/callback/google`)

### Step 3: Enable Google Drive API

1. In Google Cloud Console, go to **APIs & Services** > **Library**
2. Search for "Google Drive API"
3. Click on it and click **Enable**

### Step 4: Re-authenticate

**IMPORTANT:** Users must sign out and sign in again to get the new scopes!

1. In your app, click **Sign Out**
2. Click **Sign in with Google** again
3. You should see a new consent screen asking for Google Drive permissions
4. Accept the permissions

### Step 5: Test Upload

After re-authenticating:
1. Click **Upload Image** button
2. Select an activity type
3. Choose an image file
4. Click **Upload to Gallery**

The upload should now work successfully!

## Troubleshooting

### Still getting the error?
- Clear your browser cookies and cache
- Make sure Google Drive API is enabled in Google Cloud Console
- Verify your `.env.local` file has correct `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- Check that `NEXTAUTH_SECRET` is set (generate one with: `openssl rand -base64 32`)

### Token expired?
- Sign out and sign in again
- The auth is configured with `access_type: "offline"` and `prompt: "consent"` to get refresh tokens

## Environment Variables Required

Make sure your `.env.local` has:
```env
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
AUTH_TRUST_HOST=true
```

**Important:** The `AUTH_TRUST_HOST=true` is required to fix the "UntrustedHost" error in development.
