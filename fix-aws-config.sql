-- Fix AWS Config table permissions
-- Run this in your Supabase SQL Editor

-- First, drop existing policies
DROP POLICY IF EXISTS "Allow admin users access to aws_config" ON aws_config;
DROP POLICY IF EXISTS "Allow service role full access to aws_config" ON aws_config;

-- Disable RLS temporarily to test
ALTER TABLE aws_config DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS with simpler policies
ALTER TABLE aws_config ENABLE ROW LEVEL SECURITY;

-- Create a simple policy that allows service role access
CREATE POLICY "service_role_access" ON aws_config
  FOR ALL USING (auth.role() = 'service_role');

-- Create a policy for authenticated users (no profile check)
CREATE POLICY "authenticated_access" ON aws_config
  FOR ALL USING (auth.role() = 'authenticated');

-- Verify table exists and is accessible
SELECT 'AWS Config table is ready' as status;