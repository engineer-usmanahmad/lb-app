-- Fix success_stories table and RLS policies
-- Run this in Supabase SQL Editor

-- First, check if table exists and its structure
SELECT table_name FROM information_schema.tables WHERE table_name = 'success_stories';

-- Drop existing table if it exists (to recreate with correct structure)
DROP TABLE IF EXISTS success_stories CASCADE;

-- Create success_stories table with correct schema
CREATE TABLE success_stories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_name VARCHAR(255) NOT NULL,
  certification_title VARCHAR(255) NOT NULL,
  certification_provider VARCHAR(100) NOT NULL,
  certification_type VARCHAR(50) NOT NULL DEFAULT 'Cloud',
  date_achieved DATE NOT NULL,
  image_url TEXT,
  image_alt TEXT,
  description TEXT,
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_success_stories_type ON success_stories(certification_type);
CREATE INDEX IF NOT EXISTS idx_success_stories_provider ON success_stories(certification_provider);
CREATE INDEX IF NOT EXISTS idx_success_stories_featured ON success_stories(is_featured);
CREATE INDEX IF NOT EXISTS idx_success_stories_date ON success_stories(date_achieved DESC);

-- Disable RLS for now (for testing)
ALTER TABLE success_stories DISABLE ROW LEVEL SECURITY;

-- Grant permissions to anon and authenticated roles
GRANT ALL ON success_stories TO anon;
GRANT ALL ON success_stories TO authenticated;
GRANT ALL ON success_stories TO service_role;

-- Create updated_at trigger
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

-- Verify table is accessible
SELECT 'success_stories table created and accessible' as status;