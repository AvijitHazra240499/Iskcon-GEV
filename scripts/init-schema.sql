-- Create activities table
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  activity_type VARCHAR(50) NOT NULL, -- 'Langar', 'Annakshetra', 'Village Seva'
  location VARCHAR(255) NOT NULL,
  people_served INTEGER NOT NULL DEFAULT 0,
  villages_helped INTEGER NOT NULL DEFAULT 0,
  volunteers_count INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  cost_per_plate DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create media table for photo/video proof
CREATE TABLE IF NOT EXISTS media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  media_url VARCHAR(500) NOT NULL,
  media_type VARCHAR(20) NOT NULL, -- 'image' or 'video'
  uploaded_at TIMESTAMP DEFAULT NOW()
);

-- Create donation campaigns table
CREATE TABLE IF NOT EXISTS donation_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_name VARCHAR(255) NOT NULL,
  target_amount DECIMAL(12, 2),
  raised_amount DECIMAL(12, 2) DEFAULT 0,
  people_helped INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create donations table to track individual donations
CREATE TABLE IF NOT EXISTS donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES donation_campaigns(id) ON DELETE SET NULL,
  amount DECIMAL(12, 2) NOT NULL,
  donor_name VARCHAR(255),
  donor_email VARCHAR(255),
  donor_phone VARCHAR(20),
  razorpay_order_id VARCHAR(255),
  razorpay_payment_id VARCHAR(255),
  payment_status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create devotional quotes table
CREATE TABLE IF NOT EXISTS quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_text TEXT NOT NULL,
  source VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL, -- 'admin' or 'volunteer'
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_activities_date ON activities(date);
CREATE INDEX IF NOT EXISTS idx_activities_location ON activities(location);
CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_media_activity ON media(activity_id);
CREATE INDEX IF NOT EXISTS idx_donations_campaign ON donations(campaign_id);
CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(payment_status);
CREATE INDEX IF NOT EXISTS idx_donations_created ON donations(created_at);

-- Enable Row Level Security (Optional - configure based on your needs)
-- ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE donation_campaigns ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE media ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

-- Sample data for testing (Optional)
-- INSERT INTO donation_campaigns (campaign_name, target_amount, raised_amount, people_helped, status) VALUES
-- ('Emergency Food Relief', 100000, 0, 1000, 'active'),
-- ('Village Seva Program', 50000, 0, 500, 'active'),
-- ('Daily Langar Support', 200000, 0, 2000, 'active');

-- INSERT INTO quotes (quote_text, source) VALUES
-- ('The Supreme Lord is satisfied by the one who does not harm or destroy other living entities.', 'Bhagavad Gita'),
-- ('Charity given out of duty, without expectation of return, is considered to be in the mode of goodness.', 'Bhagavad Gita 17.20'),
-- ('One who sees the Supersoul in every living being and equal everywhere does not degrade himself by his mind.', 'Bhagavad Gita 13.29');
