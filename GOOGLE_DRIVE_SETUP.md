# Google Drive Upload Setup Guide

## Prerequisites
- Google Cloud Platform account
- Google Drive folder for storing images

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Drive API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Drive API"
   - Click "Enable"

## Step 2: Create a Service Account

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "Service Account"
3. Fill in the service account details:
   - Name: `govardhan-drive-uploader`
   - Description: `Service account for uploading images to Google Drive`
4. Click "Create and Continue"
5. Skip the optional steps and click "Done"

## Step 3: Generate Service Account Key

1. Click on the service account you just created
2. Go to the "Keys" tab
3. Click "Add Key" > "Create new key"
4. Select "JSON" format
5. Click "Create" - this will download a JSON file

## Step 4: Extract Credentials from JSON

Open the downloaded JSON file and find:
- `client_email`: Copy this value
- `private_key`: Copy this value (including the `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` parts)

## Step 5: Create Google Drive Folder

1. Go to [Google Drive](https://drive.google.com/)
2. Create a new folder for your images (e.g., "Govardhan Gallery")
3. Right-click the folder > "Share"
4. Add the service account email (from step 4) with "Editor" permissions
5. Copy the folder ID from the URL:
   - URL format: `https://drive.google.com/drive/folders/FOLDER_ID_HERE`
   - Copy the `FOLDER_ID_HERE` part

## Step 6: Update Environment Variables

Add these to your `.env.local` file:

```env
GOOGLE_DRIVE_CLIENT_EMAIL=your_service_account_email@project.iam.gserviceaccount.com
GOOGLE_DRIVE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour\nPrivate\nKey\nHere\n-----END PRIVATE KEY-----\n"
GOOGLE_DRIVE_FOLDER_ID=your_folder_id_here
```

**Important Notes:**
- The private key must be wrapped in quotes
- Keep the `\n` characters in the private key
- Never commit the `.env.local` file to version control

## Step 7: Test the Upload

1. Restart your development server
2. Go to the Gallery page
3. Click "Upload Image"
4. Select an activity and image
5. Click "Upload to Gallery"

## Troubleshooting

### Error: "Invalid credentials"
- Double-check your `GOOGLE_DRIVE_CLIENT_EMAIL` and `GOOGLE_DRIVE_PRIVATE_KEY`
- Ensure the private key includes the BEGIN and END markers
- Make sure `\n` characters are preserved

### Error: "Permission denied"
- Verify the service account has Editor access to the folder
- Check that the `GOOGLE_DRIVE_FOLDER_ID` is correct

### Images not displaying
- Ensure the file permissions are set to "anyone with the link can view"
- Check the browser console for errors
- Verify the Google Drive API is enabled

## Security Best Practices

1. Never expose your service account credentials in client-side code
2. Keep your `.env.local` file secure and never commit it
3. Regularly rotate your service account keys
4. Use environment-specific service accounts for production
