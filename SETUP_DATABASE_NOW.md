# Setup Database - Quick Guide

## Problem
Admin page shows "No activities recorded yet" because the database tables don't exist.

## Solution - 5 Minutes Setup

### Step 1: Go to Supabase Dashboard
1. Open [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project: **oroxipgwoeixxqwltsnx**
3. Click on **SQL Editor** in the left sidebar

### Step 2: Run the Setup Script
1. Click **"New Query"** button
2. Copy the ENTIRE SQL script from `TROUBLESHOOTING_SUPABASE.md` (starting from line 30)
3. Paste it into the SQL Editor
4. Click **"Run"** button (or press Ctrl+Enter)

### Step 3: Verify Success
You should see a table showing:
```
table_name              | row_count
------------------------|----------
activities              | 3
media                   | 0
donation_campaigns      | 0
donations               | 0
seva_opportunities      | 0
```

This means 3 sample activities were created!

### Step 4: Refresh Your Admin Page
1. Go back to your app at `http://localhost:3000/admin`
2. Refresh the page (F5)
3. You should now see the table with 3 sample activities!

## What the Script Does

✅ Creates all 5 required tables:
- `activities` - Stores seva activities
- `media` - Stores images/videos
- `donation_campaigns` - Stores fundraising campaigns
- `donations` - Stores donation records
- `seva_opportunities` - Stores seva offerings

✅ Sets up Row Level Security (RLS) policies
✅ Allows public read/write access (for development)
✅ Inserts 3 sample activities for testing

## After Setup

Once the tables are created, you can:

1. **View Activities**: Go to `/admin` → See the table with edit/delete buttons
2. **Add New Activity**: Click "✚ ADD NEW ACTIVITY" button
3. **Edit Activity**: Click "✏️ EDIT" on any row
4. **Delete Activity**: Click "🗑️ DELETE" on any row

## Troubleshooting

### Still seeing "No activities"?
1. Check browser console (F12) for errors
2. Verify your `.env.local` has correct Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://oroxipgwoeixxqwltsnx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```
3. Restart your dev server

### SQL Error?
- Make sure you copied the ENTIRE script
- Check if tables already exist (script handles this)
- Try running the script again

### Need to Reset?
To delete all data and start fresh:
```sql
DROP TABLE IF EXISTS media CASCADE;
DROP TABLE IF EXISTS donations CASCADE;
DROP TABLE IF EXISTS activities CASCADE;
DROP TABLE IF EXISTS donation_campaigns CASCADE;
DROP TABLE IF EXISTS seva_opportunities CASCADE;
```
Then run the setup script again.

## Next Steps

After verifying the admin panel works:
1. Delete the sample activities
2. Add your real activities
3. Test edit and delete functions
4. Check the `/impact` page to see statistics
5. Upload images via `/gallery` page

## Production Security

⚠️ **Important**: The current setup allows public write access for development.

Before going to production, update the RLS policies to require authentication:
```sql
-- Replace public policies with authenticated-only
DROP POLICY "Allow public insert" ON activities;
DROP POLICY "Allow public update" ON activities;
DROP POLICY "Allow public delete" ON activities;

CREATE POLICY "Allow authenticated insert" ON activities 
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update" ON activities 
  FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated delete" ON activities 
  FOR DELETE USING (auth.role() = 'authenticated');
```
