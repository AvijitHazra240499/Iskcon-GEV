# 🚀 Deployment Checklist

## Pre-Deployment Setup

### 1. Database Configuration ✅

#### Supabase Setup
- [ ] Create Supabase project
- [ ] Run `scripts/init-schema.sql` in SQL Editor
- [ ] Verify all tables created:
  - [ ] activities
  - [ ] donation_campaigns
  - [ ] donations
  - [ ] media
  - [ ] quotes
  - [ ] admin_users
- [ ] Enable Realtime for tables:
  - [ ] activities
  - [ ] donation_campaigns
  - [ ] donations
- [ ] Copy API credentials:
  - [ ] Project URL
  - [ ] Anon key
  - [ ] Service role key

#### Optional: Row Level Security
- [ ] Configure RLS policies if needed
- [ ] Set up authentication if required
- [ ] Test access permissions

### 2. Payment Gateway Setup ✅

#### Razorpay Configuration
- [ ] Create Razorpay account
- [ ] Verify business details
- [ ] Generate API keys
- [ ] For Testing:
  - [ ] Use Test Mode keys (rzp_test_xxx)
  - [ ] Test with test cards
- [ ] For Production:
  - [ ] Complete KYC verification
  - [ ] Switch to Live Mode keys (rzp_live_xxx)
  - [ ] Configure webhook (optional)

### 3. Environment Variables ✅

Create `.env.local` for development:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=xxx
```

For production, set these in your hosting platform.

### 4. Testing Checklist ✅

#### Local Testing
- [ ] Run `pnpm dev`
- [ ] Test home page loads
- [ ] Test donations page loads
- [ ] Test admin panel loads
- [ ] Create test campaign
- [ ] Make test donation
- [ ] Verify charts update
- [ ] Check real-time updates
- [ ] Test on mobile view
- [ ] Test on tablet view

#### Payment Testing
- [ ] Use Razorpay test card: 4111 1111 1111 1111
- [ ] Complete payment flow
- [ ] Verify payment recorded
- [ ] Check campaign updated
- [ ] Confirm charts refreshed
- [ ] Test failed payment handling

#### Admin Testing
- [ ] Add new activity
- [ ] Edit activity
- [ ] Delete activity
- [ ] Create campaign
- [ ] Toggle campaign status
- [ ] View donations list
- [ ] Check real-time updates

## Deployment Options

### Option 1: Vercel (Recommended) ⭐

#### Steps
1. [ ] Push code to GitHub
2. [ ] Go to [Vercel](https://vercel.com)
3. [ ] Click "Import Project"
4. [ ] Select your repository
5. [ ] Configure project:
   - Framework: Next.js
   - Build Command: `pnpm build`
   - Output Directory: `.next`
6. [ ] Add environment variables:
   - [ ] NEXT_PUBLIC_SUPABASE_URL
   - [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY
   - [ ] SUPABASE_SERVICE_ROLE_KEY
   - [ ] NEXT_PUBLIC_RAZORPAY_KEY_ID
   - [ ] RAZORPAY_KEY_SECRET
7. [ ] Click "Deploy"
8. [ ] Wait for deployment
9. [ ] Test production URL

#### Post-Deployment
- [ ] Test all pages
- [ ] Make test donation
- [ ] Verify real-time updates
- [ ] Check mobile responsiveness
- [ ] Test payment flow
- [ ] Monitor error logs

### Option 2: Netlify

#### Steps
1. [ ] Push code to GitHub
2. [ ] Go to [Netlify](https://netlify.com)
3. [ ] Click "Add new site"
4. [ ] Select repository
5. [ ] Configure build:
   - Build command: `pnpm build`
   - Publish directory: `.next`
6. [ ] Add environment variables
7. [ ] Deploy

### Option 3: Self-Hosted

#### Requirements
- [ ] Node.js 18+ installed
- [ ] PM2 or similar process manager
- [ ] Nginx or Apache
- [ ] SSL certificate
- [ ] Domain name

#### Steps
1. [ ] Clone repository on server
2. [ ] Install dependencies: `pnpm install`
3. [ ] Create `.env.local` with production values
4. [ ] Build: `pnpm build`
5. [ ] Start: `pnpm start`
6. [ ] Configure reverse proxy
7. [ ] Set up SSL
8. [ ] Configure domain

## Post-Deployment

### 1. Production Testing ✅
- [ ] Visit production URL
- [ ] Test all pages load
- [ ] Make real donation (small amount)
- [ ] Verify payment processed
- [ ] Check database updated
- [ ] Test admin panel
- [ ] Verify real-time updates work
- [ ] Test on multiple devices
- [ ] Check browser console for errors

### 2. Switch to Live Mode 💰

#### When Ready for Real Donations
1. [ ] Complete Razorpay KYC
2. [ ] Get Live Mode API keys
3. [ ] Update environment variables:
   ```env
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxx
   RAZORPAY_KEY_SECRET=live_secret_xxx
   ```
4. [ ] Redeploy application
5. [ ] Test with real payment (small amount)
6. [ ] Verify funds received in Razorpay dashboard

### 3. Monitoring Setup 📊

#### Error Tracking
- [ ] Set up Sentry or similar
- [ ] Monitor API errors
- [ ] Track payment failures
- [ ] Log database issues

#### Analytics
- [ ] Set up Google Analytics
- [ ] Track donation conversions
- [ ] Monitor page views
- [ ] Analyze user behavior

#### Performance
- [ ] Monitor page load times
- [ ] Check API response times
- [ ] Monitor database queries
- [ ] Track real-time connection health

### 4. Security Hardening 🔒

#### Environment
- [ ] Verify all secrets are in environment variables
- [ ] No hardcoded credentials
- [ ] `.env.local` in `.gitignore`
- [ ] Service role key never exposed to client

#### Database
- [ ] Configure RLS policies
- [ ] Set up backup schedule
- [ ] Enable audit logging
- [ ] Restrict admin access

#### Application
- [ ] Enable HTTPS only
- [ ] Set security headers
- [ ] Configure CORS properly
- [ ] Rate limit API routes

### 5. Backup Strategy 💾

#### Database Backups
- [ ] Enable Supabase automatic backups
- [ ] Set up manual backup schedule
- [ ] Test restore procedure
- [ ] Document backup location

#### Code Backups
- [ ] Code in version control (Git)
- [ ] Multiple remote repositories
- [ ] Tag releases
- [ ] Document deployment process

### 6. Documentation 📚

#### For Team
- [ ] Share admin credentials securely
- [ ] Document admin procedures
- [ ] Create user guides
- [ ] Set up support process

#### For Users
- [ ] Add FAQ page
- [ ] Create donation guide
- [ ] Provide contact information
- [ ] Set up support email

## Launch Checklist 🎉

### Final Checks Before Going Live
- [ ] All features tested
- [ ] Payment gateway in live mode
- [ ] Database properly configured
- [ ] Real-time updates working
- [ ] Mobile responsive
- [ ] Error handling in place
- [ ] Monitoring set up
- [ ] Backups configured
- [ ] Security hardened
- [ ] Documentation complete

### Launch Day
- [ ] Announce on social media
- [ ] Send email to supporters
- [ ] Monitor for issues
- [ ] Be ready for support requests
- [ ] Track first donations
- [ ] Celebrate! 🎊

## Maintenance

### Daily
- [ ] Check for errors
- [ ] Monitor donations
- [ ] Verify real-time updates

### Weekly
- [ ] Review donation reports
- [ ] Check database health
- [ ] Update campaigns if needed
- [ ] Respond to support requests

### Monthly
- [ ] Review analytics
- [ ] Optimize performance
- [ ] Update dependencies
- [ ] Backup verification

## Troubleshooting

### Common Issues

#### Payments Not Working
- Check Razorpay keys are correct
- Verify keys match mode (test/live)
- Check browser console for errors
- Verify webhook configuration

#### Real-time Not Updating
- Check Supabase Realtime is enabled
- Verify table replication is on
- Check browser console for connection errors
- Test with multiple browser tabs

#### Charts Not Showing
- Verify data exists in database
- Check API responses
- Look for JavaScript errors
- Test with sample data

#### Admin Panel Issues
- Verify authentication (if enabled)
- Check API permissions
- Test database connections
- Review error logs

## Support Resources

- Supabase Docs: https://supabase.com/docs
- Razorpay Docs: https://razorpay.com/docs
- Next.js Docs: https://nextjs.org/docs
- Vercel Support: https://vercel.com/support

---

**Ready to launch! 🚀 Hare Krishna! 🙏**
