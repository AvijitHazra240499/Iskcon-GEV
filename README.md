# Govardhan Annakshetra - Donation Management System

A comprehensive web application for managing donations, tracking seva activities, and providing transparency for the Govardhan Annakshetra charitable organization.

## Features

### 🎯 Dynamic Donation System
- **Real-time Updates**: Pie charts and donation campaigns update automatically when donations are received
- **Multiple Campaigns**: Admin can create and manage multiple active donation campaigns
- **Payment Integration**: Secure payment processing via Razorpay
- **Live Progress Tracking**: Visual progress bars showing campaign funding status

### 📊 Transparency Dashboard
- **Cost Breakdown**: Interactive bar charts showing costs by activity type
- **People Served**: Pie charts displaying distribution of beneficiaries
- **Impact Metrics**: Real-time statistics on total costs, people served, and cost per person

### 👨‍💼 Admin Panel
- **Activity Management**: Record and track Langar, Annakshetra, and Village Seva activities
- **Campaign Management**: Create, edit, and toggle donation campaigns
- **Donations Tracking**: View all received donations with real-time updates
- **Media Upload**: Attach photos and videos as proof of activities

### 🔄 Real-time Features
- Automatic updates when donations are received
- Live campaign progress tracking
- Real-time activity feed
- Instant chart updates

## Tech Stack

- **Framework**: Next.js 16 with React 19
- **Database**: Supabase (PostgreSQL)
- **Payment Gateway**: Razorpay
- **Charts**: Recharts
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI

## Setup Instructions

### 1. Prerequisites
- Node.js 18+ installed
- pnpm package manager
- Supabase account
- Razorpay account

### 2. Clone and Install
```bash
git clone <repository-url>
cd iskcon-gev
pnpm install
```

### 3. Database Setup

#### Create Supabase Project
1. Go to [Supabase](https://supabase.com) and create a new project
2. Once created, go to Project Settings > API
3. Copy your project URL and anon key

#### Run Database Schema
1. Go to SQL Editor in Supabase dashboard
2. Copy the contents of `scripts/init-schema.sql`
3. Run the SQL script to create all tables

#### Enable Realtime
1. Go to Database > Replication in Supabase dashboard
2. Enable replication for these tables:
   - `activities`
   - `donation_campaigns`
   - `donations`

### 4. Razorpay Setup
1. Sign up at [Razorpay](https://razorpay.com)
2. Go to Settings > API Keys
3. Generate API keys (Key ID and Key Secret)
4. For testing, use Test Mode keys

### 5. Environment Variables
Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Razorpay Configuration
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

### 6. Run Development Server
```bash
pnpm dev
```

The application will be available at `http://localhost:3000`

## Usage Guide

### For Administrators

#### Adding Seva Activities
1. Navigate to `/admin`
2. Click "ADD NEW ACTIVITY"
3. Fill in activity details:
   - Date
   - Activity Type (Langar/Annakshetra/Village Seva)
   - Location
   - Number of people served
   - Villages helped
   - Volunteers count
   - Cost per plate
   - Notes
4. Submit to record the activity

#### Creating Donation Campaigns
1. Go to Admin Panel
2. Click "Donation Campaigns" tab
3. Click "Create New Campaign"
4. Enter:
   - Campaign name
   - Target amount
   - Number of people to help
5. Campaign will appear on donations page immediately

#### Managing Campaigns
- Toggle campaigns between Active/Inactive status
- Active campaigns appear on the public donations page
- View real-time progress and raised amounts

#### Viewing Donations
1. Go to "Donations Received" tab in Admin Panel
2. See all donations with:
   - Amount
   - Campaign name
   - Payment status
   - Timestamp
3. Updates automatically when new donations arrive

### For Donors

#### Making a Donation
1. Visit `/donations` page
2. Select a campaign from the dropdown
3. Enter donation amount (minimum ₹100)
4. Click "DONATE NOW"
5. Complete payment via Razorpay
6. See immediate updates in charts and campaign progress

#### Viewing Impact
- See real-time cost breakdown by activity type
- View distribution of people served
- Track total impact metrics
- Monitor campaign progress

## Database Schema

### Tables

#### activities
- Stores all seva activities (Langar, Annakshetra, Village Seva)
- Tracks people served, costs, volunteers, and locations

#### donation_campaigns
- Manages fundraising campaigns
- Tracks target amounts, raised amounts, and status

#### donations
- Records individual donations
- Links to campaigns and payment details

#### media
- Stores photos/videos for activities
- Provides proof of seva work

#### quotes
- Devotional quotes for the website

## API Endpoints

### POST /api/create-donation
Creates a Razorpay order for donation
- Body: `{ amount, campaignId, campaignName }`
- Returns: `{ orderId }`

### POST /api/verify-donation
Verifies payment and updates campaign
- Body: `{ razorpay_order_id, razorpay_payment_id, razorpay_signature, campaignId, amount }`
- Returns: `{ success, message }`

## Real-time Updates

The application uses Supabase Realtime to provide instant updates:

1. **Donation Page**: Subscribes to `donation_campaigns` and `activities` tables
2. **Admin Panel**: Subscribes to `donations` table
3. **Charts**: Automatically refresh when data changes
4. **Campaign Progress**: Updates immediately after donations

## Security Features

- Payment signature verification
- Supabase Row Level Security (RLS) ready
- Service role key for server-side operations
- Secure API routes

## Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Other Platforms
- Ensure Node.js 18+ support
- Set all environment variables
- Build command: `pnpm build`
- Start command: `pnpm start`

## Testing Donations

### Test Mode (Razorpay)
Use these test card details:
- Card Number: `4111 1111 1111 1111`
- CVV: Any 3 digits
- Expiry: Any future date
- Name: Any name

## Support

For issues or questions:
1. Check Supabase logs for database errors
2. Check browser console for frontend errors
3. Verify environment variables are set correctly
4. Ensure Razorpay keys are in correct mode (Test/Live)

## License

This project is created for charitable purposes for Govardhan Annakshetra.

---

**Hare Krishna! 🙏**
