# Google OAuth Upload Setup

Upload images to Google Drive using your own Google account (no service account needed!).

## Step 1: Create OAuth Credentials

1. Go to https://console.cloud.google.com/apis/credentials
2. Select your project (or create one)
3. Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**

### Configure OAuth Consent Screen (if first time):
1. Click **"CONFIGURE CONSENT SCREEN"**
2. User Type: **External**
3. Fill in:
   - App name: `Govardhan Gallery`
   - User support email: your email
   - Developer contact: your email
4. Click **"SAVE AND CONTINUE"** through all steps
5. Add test users (your email) if needed
6. Click **"BACK TO DASHBOARD"**

### Create OAuth Client:
1. Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
2. Application type: **Web application**
3. Name: `Govardhan Web Client`
4. Authorized redirect URIs - Add:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
   (Add production URL later: `https://yourdomain.com/api/auth/callback/google`)
5. Click **"CREATE"**
6. **Copy the Client ID and Client Secret**

## Step 2: Generate NextAuth Secret

Run this command:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Copy the output.

## Step 3: Update .env.local

Add these variables to your `.env.local`:

```env
# Google OAuth
GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your_secret_here
NEXTAUTH_SECRET=your_generated_secret_from_step_2
NEXTAUTH_URL=http://localhost:3000
```

## Step 4: Restart Dev Server

```bash
# Stop the current server (Ctrl+C)
pnpm dev
```

## Step 5: Test Upload

1. Go to http://localhost:3000/gallery
2. Click **"Sign in with Google to Upload"**
3. Sign in with your Google account
4. Grant permissions (Drive access)
5. Click **"Upload Image"**
6. Select activity and file
7. Click **"Upload to Gallery"**

## How It Works

- Users sign in with their Google account
- Files are uploaded to **their own Google Drive**
- A folder called "Govardhan Gallery" is auto-created
- Files are made publicly viewable
- URLs are saved in your Supabase database

## Benefits

✅ No service account needed
✅ No quota issues
✅ Uses user's own Drive storage
✅ Simple OAuth flow
✅ Automatic folder creation
✅ Public sharing enabled automatically

## Production Deployment

When deploying to production:

1. Add production URL to OAuth redirect URIs:
   ```
   https://yourdomain.com/api/auth/callback/google
   ```

2. Update `.env` on your hosting platform:
   ```env
   NEXTAUTH_URL=https://yourdomain.com
   ```

3. Publish your OAuth consent screen (if needed for public use)

## Troubleshooting

### "Redirect URI mismatch"
- Make sure the redirect URI in Google Console matches exactly
- Check for trailing slashes
- Verify the port number (3000)

### "Access blocked: This app's request is invalid"
- Add your email as a test user in OAuth consent screen
- Make sure all required scopes are added

### "Failed to upload"
- Check browser console for detailed errors
- Verify the access token is being passed correctly
- Ensure Drive API is enabled in Google Cloud Console
