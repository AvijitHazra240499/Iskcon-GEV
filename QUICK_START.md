# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies
```bash
pnpm install
```

### Step 2: Setup Supabase Database

1. **Create Supabase Account**: Go to https://supabase.com
2. **Create New Project**: Click "New Project" and wait for setup
3. **Run Database Schema**:
   - Open Supabase Dashboard
   - Go to SQL Editor
   - Copy contents from `scripts/init-schema.sql`
   - Click "Run"

4. **Enable Realtime**:
   - Go to Database > Replication
   - Enable for: `activities`, `donation_campaigns`, `donations`

5. **Get API Keys**:
   - Go to Project Settings > API
   - Copy: Project URL, anon key, service_role key

### Step 3: Setup Razorpay

1. **Sign Up**: Go to https://razorpay.com
2. **Get Test Keys**:
   - Go to Settings > API Keys
   - Generate Test Mode keys
   - Copy Key ID and Key Secret

### Step 4: Configure Environment

Create `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=your-secret-key
```

### Step 5: Run the App
```bash
pnpm dev
```

Visit: http://localhost:3000

## 🎯 Test the Features

### Test Donation Flow
1. Go to http://localhost:3000/donations
2. Select a campaign (create one in admin first)
3. Enter amount: 500
4. Click "DONATE NOW"
5. Use test card: `4111 1111 1111 1111`
6. Watch charts update in real-time! 📊

### Create Your First Campaign
1. Go to http://localhost:3000/admin
2. Click "Donation Campaigns" tab
3. Fill in:
   - Name: "Emergency Food Relief"
   - Target: 100000
   - People to Help: 1000
4. Click "CREATE CAMPAIGN"
5. Campaign appears on donations page instantly! ✨

### Add Seva Activity
1. Stay in Admin Panel
2. Click "Seva Activities" tab
3. Click "ADD NEW ACTIVITY"
4. Fill in activity details
5. Submit and see impact on charts! 📈

## 🔥 Key Features to Test

### Real-time Updates
- Open donations page in two browser windows
- Make a donation in one window
- Watch the other window update automatically!

### Dynamic Charts
- Pie chart shows distribution of people served
- Bar chart shows cost breakdown
- Both update when you add activities or donations

### Campaign Progress
- Progress bars fill up as donations come in
- Percentage updates in real-time
- Campaign status toggles (Active/Inactive)

## 🎨 Pages Overview

- `/` - Home page with overview
- `/donations` - Public donation page with charts
- `/admin` - Admin panel for management
- `/impact` - Impact statistics page
- `/gallery` - Photo gallery
- `/spiritual` - Spiritual content

## 🐛 Troubleshooting

### "Port 3000 in use"
- App will auto-use port 3001
- Or stop other apps using port 3000

### "Supabase connection error"
- Check `.env.local` has correct values
- Verify Supabase project is active
- Check API keys are copied correctly

### "Razorpay not loading"
- Ensure `NEXT_PUBLIC_RAZORPAY_KEY_ID` is set
- Check key starts with `rzp_test_` for test mode
- Clear browser cache and reload

### Charts not updating
- Enable Realtime in Supabase for all tables
- Check browser console for errors
- Refresh the page

## 📱 Mobile Testing

The app is fully responsive! Test on:
- Desktop browsers
- Mobile browsers
- Tablet devices

## 🎉 You're Ready!

Your donation management system is now running with:
- ✅ Real-time donation tracking
- ✅ Dynamic charts and visualizations
- ✅ Secure payment processing
- ✅ Admin management panel
- ✅ Campaign management
- ✅ Activity tracking

**Hare Krishna! 🙏**
