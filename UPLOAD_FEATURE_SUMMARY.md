# Gallery Upload Feature - Quick Reference

## What Was Added

### 1. Upload Button
- Located at the top of the gallery page
- Click to show/hide the upload form

### 2. Upload Form
- Select an activity from dropdown (links image to specific event)
- Choose image or video file
- Upload button with loading state

### 3. API Route (`/api/upload-to-drive`)
- Handles file upload to Google Drive
- Makes files publicly viewable
- Saves reference in Supabase database

### 4. Automatic Display
- Uploaded images appear immediately in the gallery
- Uses Google Drive iframe embed for reliable display
- Maintains all existing gallery features

## How to Use

1. **Setup Google Drive** (one-time):
   - Follow instructions in `GOOGLE_DRIVE_SETUP.md`
   - Add credentials to `.env.local`

2. **Upload Images**:
   - Go to `/gallery` page
   - Click "📤 Upload Image"
   - Select activity and file
   - Click "✓ Upload to Gallery"

3. **View Images**:
   - Uploaded images appear automatically
   - Organized by activity type, location, and date

## Files Modified/Created

- ✅ `app/gallery/page.tsx` - Added upload UI and functionality
- ✅ `app/api/upload-to-drive/route.ts` - New API endpoint
- ✅ `.env.example` - Added Google Drive variables
- ✅ `GOOGLE_DRIVE_SETUP.md` - Setup instructions
- ✅ `package.json` - Added googleapis dependency

## Next Steps

1. Follow `GOOGLE_DRIVE_SETUP.md` to configure Google Drive
2. Add the environment variables to `.env.local`
3. Restart your dev server
4. Test the upload feature

## Features

- ✅ Upload images/videos to Google Drive
- ✅ Link uploads to specific activities
- ✅ Automatic public sharing
- ✅ Immediate display in gallery
- ✅ Loading states and error handling
- ✅ File type validation
- ✅ Responsive design matching site theme
