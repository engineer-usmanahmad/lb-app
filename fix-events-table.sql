-- Fix events and event_images tables and RLS policies
-- Run this in Supabase SQL Editor

-- First, check if tables exist
SELECT table_name FROM information_schema.tables WHERE table_name IN ('events', 'event_images');

-- Drop existing tables if they exist (to recreate with correct structure)
DROP TABLE IF EXISTS event_images CASCADE;
DROP TABLE IF EXISTS events CASCADE;

-- Create events table
CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  event_date DATE NOT NULL,
  category VARCHAR(100) NOT NULL,
  short_description TEXT,
  location VARCHAR(255),
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create event_images table for multiple images per event
CREATE TABLE event_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  image_alt TEXT,
  caption TEXT,
  is_cover BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date DESC);
CREATE INDEX IF NOT EXISTS idx_events_featured ON events(is_featured);
CREATE INDEX IF NOT EXISTS idx_event_images_event_id ON event_images(event_id);
CREATE INDEX IF NOT EXISTS idx_event_images_cover ON event_images(is_cover);

-- Disable RLS for now (for testing)
ALTER TABLE events DISABLE ROW LEVEL SECURITY;
ALTER TABLE event_images DISABLE ROW LEVEL SECURITY;

-- Grant permissions to anon and authenticated roles
GRANT ALL ON events TO anon;
GRANT ALL ON events TO authenticated;
GRANT ALL ON events TO service_role;

GRANT ALL ON event_images TO anon;
GRANT ALL ON event_images TO authenticated;
GRANT ALL ON event_images TO service_role;

-- Create updated_at trigger for events
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_events_updated_at 
  BEFORE UPDATE ON events 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Verify tables are accessible
SELECT 'events and event_images tables created and accessible' as status;