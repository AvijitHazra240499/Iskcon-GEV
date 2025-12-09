-- Create seva_opportunities table
CREATE TABLE IF NOT EXISTS seva_opportunities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  unit_price INTEGER NOT NULL,
  total_quantity INTEGER NOT NULL,
  obtained_quantity INTEGER DEFAULT 0,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample seva opportunities
INSERT INTO seva_opportunities (name, description, unit_price, total_quantity, obtained_quantity, category) VALUES
('Annadaan Seva (100 people)', 'Provide prasadam for 100 devotees', 3000, 100, 6, 'Food Distribution'),
('Annadaan Seva (200 people)', 'Provide prasadam for 200 devotees', 6000, 200, 3, 'Food Distribution'),
('Annadaan Seva (500 people)', 'Provide prasadam for 500 devotees', 15000, 500, 0, 'Food Distribution'),
('Janmashtami Annadaan Part Seva', 'Special prasadam distribution on Janmashtami', 51000, 1, 0, 'Festival Seva'),
('Sri Sri Radha Vrindaban Behari Dress', 'Beautiful dress for Sri Sri Radha Vrindaban Behari', 51000, 10, 2, 'Deity Seva'),
('Sri Sri Radha Madanmohan Dress', 'Beautiful dress for Sri Sri Radha Madanmohan', 51000, 10, 1, 'Deity Seva'),
('Maha Aarati Seva', 'Participate in the grand aarati ceremony', 3000, 500, 8, 'Temple Seva'),
('Festival Garland Seva', 'Offer beautiful garlands during festivals', 5000, 50, 1, 'Festival Seva'),
('Festival Bhoga Seva', 'Sponsor festival bhoga offerings', 11000, 56, 1, 'Festival Seva'),
('Maha Abhishek Seva', 'Grand abhishek ceremony for the deities', 21000, 21, 1, 'Temple Seva'),
('Festival Decoration', 'Sponsor festival temple decorations', 51000, 10, 0, 'Festival Seva'),
('Halwa Distribution', 'Distribute halwa prasadam to devotees', 200000, 5, 1, 'Food Distribution'),
('Giriraj Ji Full day Seva', 'Complete day seva for Giriraj Ji', 51000, 5, 0, 'Temple Seva'),
('Green grass for all cows', 'Provide fresh green grass for cow protection', 5000, 51, 6, 'Goshala Seva'),
('Fodder for all cows', 'Provide nutritious fodder for cow protection', 11000, 51, 5, 'Goshala Seva');

-- Enable Row Level Security
ALTER TABLE seva_opportunities ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
CREATE POLICY "Allow public read access" ON seva_opportunities
  FOR SELECT USING (true);

-- Create policy to allow authenticated users to update
CREATE POLICY "Allow authenticated users to update" ON seva_opportunities
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Create policy to allow authenticated users to insert
CREATE POLICY "Allow authenticated users to insert" ON seva_opportunities
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
