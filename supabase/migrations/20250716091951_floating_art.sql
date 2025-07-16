/*
  # Create authentication and user management tables

  1. New Tables
    - `admin_users` - Admin authentication
    - `admin_sessions` - Admin session management
    - `users` - General user authentication
    - `user_sessions` - User session management
    - `user_profiles` - Extended user information
    - `course_enrollments` - Course enrollment tracking
    - `course_access_logs` - User access tracking
    - `free_content_access` - Free content access tracking

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for each table
    - Create indexes for performance
*/

-- Create admin_users table for admin dashboard access
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create admin_sessions table for session management
CREATE TABLE IF NOT EXISTS admin_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id UUID REFERENCES admin_users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create users table for general user signup
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    is_verified BOOLEAN DEFAULT false,
    verification_token VARCHAR(255),
    reset_token VARCHAR(255),
    reset_token_expires TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_sessions table for user session management
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_profiles table for extended user information
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    avatar_url VARCHAR(500),
    bio TEXT,
    company VARCHAR(200),
    job_title VARCHAR(200),
    linkedin_url VARCHAR(500),
    github_url VARCHAR(500),
    learning_goals TEXT,
    experience_level VARCHAR(50) DEFAULT 'beginner',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create course_enrollments table
CREATE TABLE IF NOT EXISTS course_enrollments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    course_id VARCHAR(100) NOT NULL,
    course_name VARCHAR(255) NOT NULL,
    enrollment_type VARCHAR(50) DEFAULT 'free',
    payment_status VARCHAR(50) DEFAULT 'completed',
    payment_amount DECIMAL(10,2) DEFAULT 0.00,
    payment_reference VARCHAR(255),
    learning_goals TEXT,
    is_active BOOLEAN DEFAULT true,
    progress_percentage INTEGER DEFAULT 0,
    completed_at TIMESTAMPTZ,
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create course_access_logs table for tracking user access
CREATE TABLE IF NOT EXISTS course_access_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    course_id VARCHAR(100) NOT NULL,
    access_type VARCHAR(50) NOT NULL,
    resource_identifier VARCHAR(255),
    duration_seconds INTEGER,
    ip_address INET,
    user_agent TEXT,
    accessed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create free_content_access table for tracking free content access
CREATE TABLE IF NOT EXISTS free_content_access (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content_type VARCHAR(50) NOT NULL,
    content_id VARCHAR(100) NOT NULL,
    content_title VARCHAR(255),
    first_accessed_at TIMESTAMPTZ DEFAULT NOW(),
    last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
    access_count INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE free_content_access ENABLE ROW LEVEL SECURITY;

-- Admin policies
CREATE POLICY "Admin users can read own data" ON admin_users FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "Admin sessions for authenticated admins" ON admin_sessions FOR ALL USING (auth.uid()::text = admin_id::text);

-- User policies
CREATE POLICY "Users can read own data" ON users FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid()::text = id::text);
CREATE POLICY "Allow user signup" ON users FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can manage own sessions" ON user_sessions FOR ALL USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can manage own profiles" ON user_profiles FOR ALL USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can view own enrollments" ON course_enrollments FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can enroll in courses" ON course_enrollments FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can view own access logs" ON course_access_logs FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "System can log access" ON course_access_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view own content access" ON free_content_access FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "System can track content access" ON free_content_access FOR INSERT WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admin_sessions_admin_id ON admin_sessions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_user_id ON course_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_course_id ON course_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_course_access_logs_user_id ON course_access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_free_content_access_user_id ON free_content_access(user_id);

-- Insert default admin user (password: admin123 - should be changed in production)
INSERT INTO admin_users (email, password_hash, first_name, last_name, role)
VALUES ('admin@lbistech.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qK', 'Admin', 'User', 'super_admin')
ON CONFLICT (email) DO NOTHING;