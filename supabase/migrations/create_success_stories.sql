-- Create success_stories table for Our Success page
CREATE TABLE IF NOT EXISTS success_stories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_name VARCHAR(255) NOT NULL,
  certification_title VARCHAR(255) NOT NULL,
  certification_provider VARCHAR(100) NOT NULL,
  certification_type VARCHAR(50) NOT NULL, -- Cloud, DevOps, AWS, Azure, etc.
  date_achieved DATE NOT NULL,
  image_url TEXT,
  image_alt TEXT,
  description TEXT,
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_success_stories_type ON success_stories(certification_type);
CREATE INDEX IF NOT EXISTS idx_success_stories_provider ON success_stories(certification_provider);
CREATE INDEX IF NOT EXISTS idx_success_stories_featured ON success_stories(is_featured);
CREATE INDEX IF NOT EXISTS idx_success_stories_date ON success_stories(date_achieved DESC);

-- Enable Row Level Security
ALTER TABLE success_stories ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access to success stories" ON success_stories
  FOR SELECT USING (true);

-- Create policies for authenticated admin access
CREATE POLICY "Allow admin full access to success stories" ON success_stories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email IN (
        SELECT email FROM profiles WHERE role = 'admin'
      )
    )
  );

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_success_stories_updated_at 
  BEFORE UPDATE ON success_stories 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();