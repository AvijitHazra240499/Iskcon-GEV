# Dynamic Campaigns Feature Guide

## Overview
The donation campaigns system is fully dynamic, automatically updating based on real donations and allowing manual updates by admins.

## How It Works

### 1. Automatic Updates (Online Donations)
When users make donations through the website:

1. **User donates** → Selects campaign and amount on `/donations` page
2. **Payment processed** → Razorpay handles the payment
3. **Verification** → `/api/verify-donation` verifies the payment
4. **Auto-update** → Campaign `raised_amount` is automatically incremented
5. **Real-time sync** → All pages update instantly via Supabase real-time subscriptions

**Code Flow:**
```typescript
// In app/api/verify-donation/route.ts
if (campaignId) {
  const { data: campaign } = await supabase
    .from("donation_campaigns")
    .select("raised_amount")
    .eq("id", campaignId)
    .single()

  const newRaisedAmount = (campaign?.raised_amount || 0) + amount

  await supabase
    .from("donation_campaigns")
    .update({ raised_amount: newRaisedAmount })
    .eq("id", campaignId)
}
```

### 2. Manual Updates (Admin Panel)
Admins can manually update the raised amount for offline donations or corrections:

**Steps:**
1. Go to `/admin` page
2. Click on **"Donation Campaigns"** tab
3. Find the campaign you want to update
4. Click **"✏️ EDIT AMOUNT"** button
5. Enter the new raised amount
6. Click **"✓ UPDATE"**

**Use Cases:**
- Recording cash donations received offline
- Recording bank transfer donations
- Correcting errors in the raised amount
- Adding donations from other sources

### 3. Campaign Management

#### Create New Campaign
1. Go to `/admin` → **Donation Campaigns** tab
2. Fill in the form:
   - **Campaign Name**: e.g., "Emergency Food Relief"
   - **Target Amount**: e.g., 100000 (₹1,00,000)
   - **People to Help**: e.g., 1000
3. Click **"CREATE CAMPAIGN"**

#### Toggle Campaign Status
- Click **"🟢 ACTIVE"** to deactivate (stops showing on donation page)
- Click **"🔴 INACTIVE"** to activate (shows on donation page)

### 4. Real-Time Updates

The system uses Supabase real-time subscriptions to keep all pages in sync:

**Donations Page:**
```typescript
const campaignSubscription = supabase
  .channel("donation_campaigns_changes")
  .on("postgres_changes", {
    event: "*",
    schema: "public",
    table: "donation_campaigns",
  }, (payload) => {
    loadDonationData() // Refresh campaigns
  })
  .subscribe()
```

This means:
- When a donation is made, all users see the updated progress bar immediately
- When admin updates a campaign, it reflects instantly on the donations page
- No page refresh needed!

## Display Features

### On Donations Page (`/donations`)
- **Active Campaigns Card**: Shows all active campaigns
- **Progress Bars**: Visual representation of funding progress
- **Percentage**: Shows % of target reached
- **People Helped**: Displays how many devotees will be helped

### On Admin Page (`/admin`)
- **Campaign List**: All campaigns (active and inactive)
- **Edit Amount Button**: Manually update raised amount
- **Status Toggle**: Activate/deactivate campaigns
- **Progress Tracking**: See funding progress at a glance

## Database Schema

### donation_campaigns Table
```sql
CREATE TABLE donation_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_name TEXT NOT NULL,
  target_amount DECIMAL(10,2) NOT NULL,
  raised_amount DECIMAL(10,2) DEFAULT 0,  -- Auto-updated!
  people_helped INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### donations Table
```sql
CREATE TABLE donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES donation_campaigns(id),
  amount DECIMAL(10,2) NOT NULL,
  payment_status TEXT DEFAULT 'pending',
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## API Endpoints

### POST /api/create-donation
Creates a Razorpay order for donation
- **Body**: `{ amount, campaignId, campaignName }`
- **Returns**: Razorpay order details

### POST /api/verify-donation
Verifies payment and updates campaign
- **Body**: `{ razorpay_order_id, razorpay_payment_id, razorpay_signature, campaignId, amount }`
- **Actions**:
  1. Verifies Razorpay signature
  2. Records donation in database
  3. **Automatically updates campaign raised_amount**
  4. Returns success/failure

## Benefits

✅ **Fully Automated**: Online donations update campaigns automatically
✅ **Manual Control**: Admins can add offline donations
✅ **Real-Time**: All users see updates instantly
✅ **Transparent**: Donors see exactly how much has been raised
✅ **Progress Tracking**: Visual progress bars show funding status
✅ **Flexible**: Support both online and offline donations

## Example Workflow

### Scenario: Emergency Food Relief Campaign

1. **Admin creates campaign**:
   - Name: "Emergency Food Relief"
   - Target: ₹1,00,000
   - People to help: 1000
   - Status: Active

2. **User donates ₹5,000 online**:
   - Raised amount: ₹0 → ₹5,000 (automatic)
   - Progress: 0% → 5%

3. **Admin receives ₹10,000 cash donation**:
   - Goes to admin panel
   - Clicks "Edit Amount"
   - Updates to ₹15,000
   - Progress: 5% → 15%

4. **Another user donates ₹2,000 online**:
   - Raised amount: ₹15,000 → ₹17,000 (automatic)
   - Progress: 15% → 17%

5. **Campaign reaches target**:
   - Admin can mark as inactive
   - Or create a new campaign!

## Tips for Admins

💡 **Regular Updates**: Update offline donations regularly to keep the progress accurate
💡 **Clear Names**: Use descriptive campaign names so donors know what they're supporting
💡 **Realistic Targets**: Set achievable targets to maintain donor confidence
💡 **Status Management**: Deactivate completed campaigns to keep the list clean
💡 **Monitor Progress**: Check the admin panel regularly to track campaign performance
