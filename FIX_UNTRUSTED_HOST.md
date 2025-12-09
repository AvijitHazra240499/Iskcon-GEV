# Fix: UntrustedHost Error

## Error
```
[auth][error] UntrustedHost: Host must be trusted. URL was: http://localhost:3000/api/auth/session
```

## Quick Fix

Add this line to your `.env.local` file:

```env
AUTH_TRUST_HOST=true
```

## Complete Environment Variables

Your `.env.local` should have these NextAuth variables:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000
AUTH_TRUST_HOST=true
```

## Steps to Fix

1. **Open your `.env.local` file** (create it if it doesn't exist)

2. **Add the AUTH_TRUST_HOST variable:**
   ```env
   AUTH_TRUST_HOST=true
   ```

3. **Restart your development server:**
   ```bash
   # Stop the server (Ctrl+C)
   # Then restart:
   npm run dev
   # or
   pnpm dev
   ```

4. **Refresh your browser**

## Why This Happens

NextAuth requires you to explicitly trust the host URL for security reasons. In development, you need to tell NextAuth to trust `localhost`.

## For Production

When deploying to production, update your environment variables:

```env
NEXTAUTH_URL=https://yourdomain.com
AUTH_TRUST_HOST=true
```

Or you can use the `AUTH_URL` variable instead:

```env
AUTH_URL=https://yourdomain.com
```

## Alternative Solution

If you don't want to use `AUTH_TRUST_HOST`, you can configure trusted hosts in your auth configuration:

```typescript
// lib/auth.ts
export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true, // Add this line
  providers: [
    // ... your providers
  ],
  // ... rest of config
})
```

## Still Having Issues?

1. Make sure there are no typos in your `.env.local` file
2. Ensure the file is in the root directory of your project
3. Check that you restarted the dev server after adding the variable
4. Clear your browser cache and cookies
5. Try accessing the site in an incognito/private window

## Related Links

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [NextAuth Error Reference](https://errors.authjs.dev#untrustedhost)
