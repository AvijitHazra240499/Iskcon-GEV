# Supabase Storage Setup Guide (Simpler Alternative)

This is a simpler alternative to Google Drive that uses Supabase Storage.

## Step 1: Create Storage Bucket

1. Go to your Supabase project dashboard
2. Click on "Storage" in the left sidebar
3. Click "Create a new bucket"
4. Enter bucket name: `media`
5. Make it **Public** (toggle the public option)
6. Click "Create bucket"

## Step 2: Set Storage Policies

1. Click on the `media` bucket
2. Go to "Policies" tab
3. Click "New Policy"
4. Create a policy for **SELECT** (read):
   - Policy name: `Public read access`
   - Target roles: `public`
   - Policy definition: `true`
   - Click "Review" then "Save policy"

5. Create a policy for **INSERT** (upload):
   - Policy name: `Authenticated upload`
   - Target roles: `authenticated`
   - Policy definition: `true`
   - Click "Review" then "Save policy"

## Step 3: Test the Upload

1. Make sure your Supabase credentials are in `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

2. Restart your development server

3. Go to the Gallery page

4. Click "Upload Image"

5. Select an activity and image

6. Click "Upload to Gallery"

## Advantages over Google Drive

✅ No additional API setup required
✅ Uses your existing Supabase project
✅ Simpler authentication
✅ Better integration with your database
✅ Automatic CDN delivery
✅ Built-in image optimization options

## Storage Limits

- Free tier: 1 GB storage
- Pro tier: 100 GB storage
- Can be upgraded as needed

## Troubleshooting

### Error: "new row violates row-level security policy"
- Make sure you created the INSERT policy for authenticated users
- Check that the user is logged in (or adjust policy to allow public uploads)

### Error: "Bucket not found"
- Verify the bucket name is exactly `media`
- Check that the bucket is created in your Supabase project

### Images not displaying
- Ensure the bucket is set to **Public**
- Check the SELECT policy allows public access
- Verify the URL in the browser console

## Optional: Image Optimization

Supabase Storage supports automatic image transformations. You can add parameters to the URL:

```typescript
// Resize image to 800px width
const optimizedUrl = `${publicUrl}?width=800`

// Create thumbnail
const thumbnailUrl = `${publicUrl}?width=300&height=300`
```
