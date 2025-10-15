-- Create the success_stories table
CREATE TABLE IF NOT EXISTS public.success_stories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_name VARCHAR(255) NOT NULL,
  certification_title VARCHAR(255) NOT NULL,
  certification_provider VARCHAR(255),
  certification_type VARCHAR(100) DEFAULT 'Cloud',
  date_achieved DATE,
  image_url TEXT,
  description TEXT,
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_success_stories_featured ON public.success_stories(is_featured);
CREATE INDEX IF NOT EXISTS idx_success_stories_display_order ON public.success_stories(display_order);
CREATE INDEX IF NOT EXISTS idx_success_stories_created_at ON public.success_stories(created_at);

-- Enable Row Level Security
ALTER TABLE public.success_stories ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow public read access" ON public.success_stories;
DROP POLICY IF EXISTS "Allow admin full access" ON public.success_stories;

-- Create policies for public read access
CREATE POLICY "Allow public read access" ON public.success_stories
  FOR SELECT USING (true);

-- Create policies for authenticated admin access
CREATE POLICY "Allow admin full access" ON public.success_stories
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin' OR 
    auth.jwt() ->> 'email' = 'engr.syedusmanahmad@gmail.com'
  );

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_success_stories_updated_at ON public.success_stories;
CREATE TRIGGER update_success_stories_updated_at 
    BEFORE UPDATE ON public.success_stories 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();