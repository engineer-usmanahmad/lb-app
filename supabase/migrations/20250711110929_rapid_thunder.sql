/*
  # Create enrollment submissions table

  1. New Tables
    - `enrollment_submissions`
      - `id` (bigint, primary key, auto-increment)
      - `course_id` (text, required)
      - `first_name` (text, required)
      - `last_name` (text, required)
      - `email` (text, required)
      - `phone` (text, required)
      - `experience_level` (text, required)
      - `learning_goals` (text, required)
      - `is_free` (boolean, default false)
      - `status` (text, default 'pending')
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `enrollment_submissions` table
    - Add policy for authenticated users to read all data
    - Add policy for anonymous users to insert data
*/

CREATE TABLE IF NOT EXISTS enrollment_submissions (
  id bigserial PRIMARY KEY,
  course_id text NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  experience_level text NOT NULL CHECK (experience_level IN ('beginner', 'intermediate', 'advanced')),
  learning_goals text NOT NULL,
  is_free boolean DEFAULT false,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'enrolled', 'payment_pending', 'cancelled')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE enrollment_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous insert on enrollment_submissions"
  ON enrollment_submissions
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow authenticated read on enrollment_submissions"
  ON enrollment_submissions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated update on enrollment_submissions"
  ON enrollment_submissions
  FOR UPDATE
  TO authenticated
  USING (true);