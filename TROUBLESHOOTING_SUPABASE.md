# Troubleshooting: Supabase Connection Error

## Error
`Error loading data: {}`

This error occurs when the application cannot connect to Supabase or load data from the database.

## Common Causes & Solutions

### 1. Missing Environment Variables

**Check your `.env.local` file has:**
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**How to get these values:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** > **API**
4. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

### 2. Database Tables Not Created

The application requires these tables:
- `activities`
- `media`
- `donation_campaigns`
- `donations`
- `seva_opportunities`

**To create tables:**
1. Go to Supabase Dashboard > **SQL Editor**
2. Click **"New Query"**
3. Copy and paste this COMPLETE SQL script:

```sql
-- ============================================
-- GOVARDHAN ANNAKSHETRA DATABASE SETUP
-- ============================================

-- Drop existing policies if they exist (for clean setup)
DROP POLICY IF EXISTS "Allow public read access" ON activities;
DROP POLICY IF EXISTS "Allow authenticated insert" ON activities;
DROP POLICY IF EXISTS "Allow authenticated update" ON activities;
DROP POLICY IF EXISTS "Allow authenticated delete" ON activities;
DROP POLICY IF EXISTS "Allow public read access" ON media;
DROP POLICY IF EXISTS "Allow authenticated insert" ON media;
DROP POLICY IF EXISTS "Allow authenticated update" ON media;
DROP POLICY IF EXISTS "Allow authenticated delete" ON media;
DROP POLICY IF EXISTS "Allow public read access" ON donation_campaigns;
DROP POLICY IF EXISTS "Allow public read access" ON donations;
DROP POLICY IF EXISTS "Allow public insert" ON donations;
DROP POLICY IF EXISTS "Allow authenticated update" ON donations;
DROP POLICY IF EXISTS "Allow public read access" ON seva_opportunities;

-- Create activities table
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  activity_type TEXT NOT NULL,
  location TEXT NOT NULL,
  people_served INTEGER DEFAULT 0,
  villages_helped INTEGER DEFAULT 0,
  volunteers_count INTEGER DEFAULT 0,
  cost_per_plate DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create media table
CREATE TABLE IF NOT EXISTS media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create donation_campaigns table
CREATE TABLE IF NOT EXISTS donation_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_name TEXT NOT NULL,
  target_amount DECIMAL(10,2) NOT NULL,
  raised_amount DECIMAL(10,2) DEFAULT 0,
  people_helped INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create donations table
CREATE TABLE IF NOT EXISTS donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES donation_campaigns(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  donor_name TEXT,
  donor_email TEXT,
  donor_phone TEXT,
  payment_status TEXT DEFAULT 'pending',
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create seva_opportunities table
CREATE TABLE IF NOT EXISTS seva_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  unit_price DECIMAL(10,2) NOT NULL,
  total_quantity INTEGER NOT NULL,
  obtained_quantity INTEGER DEFAULT 0,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE donation_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE seva_opportunities ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access" ON activities FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON media FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON donation_campaigns FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON donations FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON seva_opportunities FOR SELECT USING (true);

-- Create policies for public insert/update/delete (for development)
-- NOTE: In production, you should restrict these to authenticated users only
CREATE POLICY "Allow public insert" ON activities FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON activities FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON activities FOR DELETE USING (true);

CREATE POLICY "Allow public insert" ON media FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON media FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON media FOR DELETE USING (true);

CREATE POLICY "Allow public insert" ON donation_campaigns FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON donation_campaigns FOR UPDATE USING (true);

CREATE POLICY "Allow public insert" ON donations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON donations FOR UPDATE USING (true);

CREATE POLICY "Allow public insert" ON seva_opportunities FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON seva_opportunities FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON seva_opportunities FOR DELETE USING (true);

-- Insert sample data for testing
INSERT INTO activities (date, activity_type, location, people_served, villages_helped, volunteers_count, cost_per_plate, notes)
VALUES 
  (CURRENT_DATE, 'Langar', 'Puri', 1, 1, 1, 0.99, 'Sample activity'),
  (CURRENT_DATE, 'Annakshetra', 'Mayapur', 2000000, 20000, 1999999, 19.99, 'Large seva'),
  (CURRENT_DATE, 'Village Seva', 'Kolkata', 0, 0, 0, NULL, 'Test activity')
ON CONFLICT DO NOTHING;

-- Verify tables were created
SELECT 'activities' as table_name, COUNT(*) as row_count FROM activities
UNION ALL
SELECT 'media', COUNT(*) FROM media
UNION ALL
SELECT 'donation_campaigns', COUNT(*) FROM donation_campaigns
UNION ALL
SELECT 'donations', COUNT(*) FROM donations
UNION ALL
SELECT 'seva_opportunities', COUNT(*) FROM seva_opportunities;
```

4. Click **"Run"** button
5. You should see a success message and a table showing row counts

### 3. Restart Development Server

After updating environment variables:
```bash
# Stop the server (Ctrl+C)
# Then restart:
npm run dev
# or
pnpm dev
```

### 4. Check Browser Console

Open browser DevTools (F12) and check the Console tab for more detailed error messages.

### 5. Verify Supabase Project Status

1. Go to Supabase Dashboard
2. Check if your project is active (not paused)
3. Free tier projects pause after inactivity - click "Restore" if needed

## Testing Connection

To test if Supabase is working, try this in your browser console:
```javascript
// Check if environment variables are loaded
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
```

## Still Having Issues?

1. Clear browser cache and cookies
2. Check Supabase project logs in the dashboard
3. Verify your internet connection
4. Check if Supabase is having service issues: https://status.supabase.com/

## What Was Fixed

The error handling has been improved to:
- Show more specific error messages for each table
- Set empty arrays/objects on error to prevent UI crashes
- Log detailed error information to help debugging
