# Quick Reference Guide - Seva Features

## 🚀 Quick Start

### 1. Setup Database (One-time)
```sql
-- Run this in Supabase SQL Editor
-- File: scripts/create-seva-opportunities-table.sql
```

### 2. Access Features

| Feature | URL | Auth Required |
|---------|-----|---------------|
| Seva Opportunities | `/seva-opportunities` | No (Yes for donation) |
| Gallery with Delete | `/gallery` | Yes (for delete) |
| Donations with Custom | `/donations` | No (Yes for payment) |
| Admin Seva Management | `/admin` → Seva Opportunities tab | No* |

*Note: Admin panel has no auth currently, add if needed

## 📋 Feature Cheat Sheet

### Gallery Image Deletion
```
1. Sign in with Google
2. Go to /gallery
3. Hover over image
4. Click 🗑️ button
5. Confirm deletion
```

### Custom Donation Amount
```
1. Go to /donations
2. Select campaign
3. Click "Enter Custom Amount"
4. Enter amount (min ₹100)
5. Click "DONATE NOW"
```

### Participate in Seva
```
1. Go to /seva-opportunities
2. Click "Participate in Seva"
3. Choose:
   - Quantity (standard units)
   - OR Custom Amount
4. Click "PROCEED TO DONATE"
5. Complete payment
```

### Create Seva Opportunity (Admin)
```
1. Go to /admin
2. Click "Seva Opportunities" tab
3. Fill form:
   - Name
   - Description
   - Unit Price
   - Total Quantity
   - Category
4. Click "CREATE SEVA OPPORTUNITY"
```

## 🔧 API Endpoints

### Delete Media
```typescript
DELETE /api/delete-media
Body: { mediaId: string, mediaUrl: string }
Auth: Required (OAuth)
```

### Create Donation
```typescript
POST /api/create-donation
Body: {
  amount: number,
  campaignId?: string,
  campaignName: string,
  sevaOpportunityId?: string,
  quantity?: number
}
```

### Verify Donation
```typescript
POST /api/verify-donation
Body: {
  razorpay_order_id: string,
  razorpay_payment_id: string,
  razorpay_signature: string,
  campaignId?: string,
  amount: number,
  sevaOpportunityId?: string,
  quantity?: number
}
```

## 📊 Database Tables

### seva_opportunities
```sql
id                UUID PRIMARY KEY
name              TEXT
description       TEXT
unit_price        INTEGER
total_quantity    INTEGER
obtained_quantity INTEGER (default 0)
category          TEXT
created_at        TIMESTAMP
updated_at        TIMESTAMP
```

## 🎨 Categories

1. **Food Distribution**
   - Annadaan Seva (100, 200, 500 people)
   - Halwa Distribution

2. **Festival Seva**
   - Janmashtami Annadaan
   - Festival Garland
   - Festival Bhoga
   - Festival Decoration

3. **Deity Seva**
   - Sri Sri Radha Vrindaban Behari Dress
   - Sri Sri Radha Madanmohan Dress

4. **Temple Seva**
   - Maha Aarati
   - Maha Abhishek
   - Giriraj Ji Full day Seva

5. **Goshala Seva**
   - Green grass for cows
   - Fodder for cows

## 🐛 Troubleshooting

### Gallery deletion not working
```
✓ Check: User signed in with Google?
✓ Check: OAuth token valid?
✓ Check: Google Drive API enabled?
✓ Check: File ID extracted correctly?
```

### Seva opportunities not loading
```
✓ Check: Table created in Supabase?
✓ Check: RLS policies enabled?
✓ Check: Supabase connection working?
✓ Check: Browser console for errors?
```

### Payment failing
```
✓ Check: Razorpay keys correct?
✓ Check: Test mode enabled?
✓ Check: Amount >= ₹100?
✓ Check: Network connection?
```

### Custom amount not working
```
✓ Check: Amount entered?
✓ Check: Amount >= 100?
✓ Check: showCustomInput state true?
✓ Check: customAmount state updated?
```

## 💡 Tips

### For Developers
- Use Razorpay test mode during development
- Check browser console for detailed errors
- Use Supabase logs for backend issues
- Test with different browsers
- Clear cache if seeing old data

### For Admins
- Create sevas with clear descriptions
- Set realistic total quantities
- Use appropriate categories
- Monitor obtained quantities
- Update descriptions as needed

### For Users
- Sign in before uploading/deleting images
- Use custom amount for flexible donations
- Check progress bars before participating
- Save payment receipts
- Contact support if payment issues

## 📱 Mobile Support

All features are mobile-responsive:
- ✅ Gallery with delete button
- ✅ Seva opportunities cards
- ✅ Custom amount input
- ✅ Payment modal
- ✅ Admin forms

## 🔐 Security Notes

- OAuth required for image deletion
- Razorpay signature verification
- RLS policies on database
- Input validation on all forms
- Service role key for admin ops

## 📈 Monitoring

Check these regularly:
1. Seva progress (obtained vs total)
2. Donation success rate
3. Image deletion success
4. Payment gateway status
5. Database performance

## 🎯 Success Metrics

Track:
- Total sevas participated
- Total amount raised via sevas
- Gallery images uploaded/deleted
- Custom vs preset donations
- Category popularity

## 📞 Quick Links

- Supabase Dashboard: [Your Supabase URL]
- Razorpay Dashboard: https://dashboard.razorpay.com
- Google Drive: https://drive.google.com
- Documentation: See SEVA_OPPORTUNITIES_SETUP.md

## ⚡ Common Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Check TypeScript errors
npm run type-check

# Run linter
npm run lint
```

## 🎉 Quick Test

Test all features in 5 minutes:
1. ✅ Visit /seva-opportunities
2. ✅ Click any seva
3. ✅ Try custom amount
4. ✅ Visit /gallery
5. ✅ Sign in
6. ✅ Try delete button
7. ✅ Visit /donations
8. ✅ Try custom amount
9. ✅ Visit /admin
10. ✅ Check Seva Opportunities tab

Done! All features working? 🎊
