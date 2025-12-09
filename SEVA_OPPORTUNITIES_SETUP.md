# Seva Opportunities Setup Guide

## Overview
This guide explains how to set up the new Seva Opportunities feature that allows devotees to participate in various seva offerings with manual entry options for custom amounts.

## Features Added

### 1. Gallery Page Enhancements
- **Delete functionality**: Each image now has a delete button (visible when signed in)
- **Google Drive integration**: Deleting an image removes it from both the database and Google Drive
- **Real-time updates**: Gallery refreshes automatically after deletion

### 2. Donations Page Enhancements
- **Preset amounts**: Quick selection buttons for common donation amounts (₹500, ₹1000, ₹2500, ₹5000, ₹10000, ₹25000)
- **Custom amount option**: Users can enter any custom amount (minimum ₹100)
- **Better UX**: Visual feedback for selected amounts

### 3. New Seva Opportunities Page
- **Multiple categories**: Food Distribution, Festival Seva, Deity Seva, Temple Seva, Goshala Seva
- **Progress tracking**: Visual progress bars showing how many units have been obtained
- **Flexible donations**: Users can select quantity or enter custom amounts
- **Real-time updates**: Quantities update automatically after successful donations

## Database Setup

### Step 1: Create the seva_opportunities table

Run the SQL script in your Supabase SQL Editor:

```bash
# The script is located at: scripts/create-seva-opportunities-table.sql
```

This will:
- Create the `seva_opportunities` table
- Insert sample seva opportunities (Annadaan Seva, Janmashtami, Deity Dresses, etc.)
- Set up Row Level Security policies

### Step 2: Verify the table

Check that the table was created successfully:

```sql
SELECT * FROM seva_opportunities;
```

You should see 15 seva opportunities with various categories.

## API Routes

### New API Route: `/api/delete-media`
- **Method**: DELETE
- **Purpose**: Deletes media from both Supabase and Google Drive
- **Authentication**: Requires Google OAuth session
- **Parameters**: 
  - `mediaId`: The ID of the media record in Supabase
  - `mediaUrl`: The Google Drive URL to extract file ID

### Updated API Routes

#### `/api/create-donation`
- Added support for `sevaOpportunityId` and `quantity` parameters
- Handles both campaign donations and seva opportunity donations

#### `/api/verify-donation`
- Updates `seva_opportunities.obtained_quantity` when a seva donation is completed
- Maintains backward compatibility with campaign donations

## Pages

### New Page: `/seva-opportunities`
- Displays all seva opportunities grouped by category
- Shows progress bars for each opportunity
- Modal dialog for donation with quantity or custom amount selection
- Integrates with Razorpay for payment processing

### Updated Pages

#### `/gallery`
- Added delete button for each image (visible when authenticated)
- Confirmation dialog before deletion
- Loading state during deletion

#### `/donations`
- Added preset amount buttons
- Added custom amount input option
- Improved visual design with better button states

## Navigation Updates

The Seva Opportunities link has been added to the main navigation menu on the home page.

## Usage Instructions

### For Administrators

1. **Managing Seva Opportunities**:
   - Go to Supabase dashboard
   - Navigate to the `seva_opportunities` table
   - Add, edit, or remove seva opportunities as needed

2. **Deleting Gallery Images**:
   - Sign in with Google OAuth
   - Go to the Gallery page
   - Hover over any image
   - Click the delete button (🗑️)
   - Confirm deletion

### For Devotees

1. **Participating in Seva**:
   - Visit `/seva-opportunities`
   - Browse available seva options
   - Click "Participate in Seva" on any opportunity
   - Choose quantity or enter custom amount
   - Complete payment via Razorpay

2. **Making Donations**:
   - Visit `/donations`
   - Select a campaign
   - Choose a preset amount or click "Enter Custom Amount"
   - Complete payment

## Environment Variables Required

Make sure these are set in your `.env.local`:

```env
# Razorpay
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Google OAuth (for image deletion)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_DRIVE_FOLDER_ID=your_google_drive_folder_id (optional)
```

## Testing

### Test Gallery Deletion
1. Sign in with Google
2. Upload a test image
3. Delete the test image
4. Verify it's removed from both gallery and Google Drive

### Test Seva Opportunities
1. Visit `/seva-opportunities`
2. Select any seva opportunity
3. Try both quantity selection and custom amount
4. Complete a test payment (use Razorpay test mode)
5. Verify the obtained_quantity increases

### Test Custom Donations
1. Visit `/donations`
2. Try preset amounts
3. Try custom amount entry
4. Verify both work correctly

## Troubleshooting

### Gallery deletion fails
- Check that user is authenticated with Google OAuth
- Verify Google Drive API permissions
- Check browser console for error messages

### Seva opportunities not loading
- Verify the `seva_opportunities` table exists
- Check Row Level Security policies
- Ensure Supabase connection is working

### Payment issues
- Verify Razorpay credentials
- Check that Razorpay is in test mode for testing
- Review API logs for payment verification errors

## Future Enhancements

Potential improvements:
- Admin panel for managing seva opportunities
- Email notifications for seva participation
- Seva opportunity images
- Recurring seva subscriptions
- Seva impact reports
