-- Create aws_config table for storing AWS S3 configuration
CREATE TABLE IF NOT EXISTS aws_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  access_key_id TEXT NOT NULL,
  secret_access_key TEXT NOT NULL,
  bucket_name TEXT NOT NULL,
  region TEXT NOT NULL,
  success_stories_folder TEXT DEFAULT 'certifications',
  events_folder TEXT DEFAULT 'events',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Enable Row Level Security
ALTER TABLE aws_config ENABLE ROW LEVEL SECURITY;

-- Create policy for service role access (for admin operations)
CREATE POLICY "Allow service role full access to aws_config" ON aws_config
  FOR ALL USING (auth.role() = 'service_role');

-- Create policy for authenticated admin users
CREATE POLICY "Allow admin users access to aws_config" ON aws_config
  FOR ALL USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_aws_config_updated_at 
  BEFORE UPDATE ON aws_config 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_aws_config_active ON aws_config(is_active);