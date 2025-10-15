-- Manual Analytics Tables Creation Script for Supabase
-- Execute these commands in your Supabase SQL Editor
-- Updated to work with existing table structure (form_templates, form_submissions)

-- First, let's check what tables exist and create missing base tables if needed
-- Create form_templates table if it doesn't exist (Form Builder system)
CREATE TABLE IF NOT EXISTS form_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) DEFAULT 'general',
    template VARCHAR(100) DEFAULT 'standard',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create form_submissions table if it doesn't exist
CREATE TABLE IF NOT EXISTS form_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    form_id UUID REFERENCES form_templates(id) ON DELETE CASCADE,
    submission_data JSONB NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

-- Also support legacy review_forms table if it exists
CREATE TABLE IF NOT EXISTS review_forms (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    form_fields JSONB NOT NULL DEFAULT '[]',
    is_active BOOLEAN DEFAULT TRUE,
    created_by INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    slug VARCHAR(255) UNIQUE,
    settings JSONB DEFAULT '{}'
);

-- Create form_responses table for legacy system
CREATE TABLE IF NOT EXISTS form_responses (
    id SERIAL PRIMARY KEY,
    form_id INTEGER REFERENCES review_forms(id) ON DELETE CASCADE,
    response_data JSONB NOT NULL DEFAULT '{}',
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(255)
);

-- 1. Form Analytics Cache Table (supports both systems)
CREATE TABLE IF NOT EXISTS form_analytics_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id UUID, -- Can reference either form_templates or review_forms (converted to UUID)
    legacy_form_id INTEGER, -- For legacy review_forms references
    analytics_type VARCHAR(50) NOT NULL,
    analytics_date DATE NOT NULL,
    analytics_data JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_form_templates FOREIGN KEY (form_id) REFERENCES form_templates(id) ON DELETE CASCADE,
    CONSTRAINT fk_review_forms FOREIGN KEY (legacy_form_id) REFERENCES review_forms(id) ON DELETE CASCADE,
    CONSTRAINT check_form_reference CHECK (
        (form_id IS NOT NULL AND legacy_form_id IS NULL) OR 
        (form_id IS NULL AND legacy_form_id IS NOT NULL)
    )
);

-- Indexes for form_analytics_cache
CREATE INDEX IF NOT EXISTS idx_form_analytics_cache_form_id ON form_analytics_cache(form_id);
CREATE INDEX IF NOT EXISTS idx_form_analytics_cache_legacy_form_id ON form_analytics_cache(legacy_form_id);
CREATE INDEX IF NOT EXISTS idx_form_analytics_cache_type_date ON form_analytics_cache(analytics_type, analytics_date);
CREATE INDEX IF NOT EXISTS idx_form_analytics_cache_date ON form_analytics_cache(analytics_date);

-- 2. Form Shares Table (supports both systems)
CREATE TABLE IF NOT EXISTS form_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id UUID,
    legacy_form_id INTEGER,
    shared_by UUID REFERENCES auth.users(id),
    share_method VARCHAR(20) NOT NULL CHECK (share_method IN ('email', 'link', 'social', 'qr', 'embed')),
    share_url TEXT,
    shared_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    click_count INTEGER DEFAULT 0,
    response_count INTEGER DEFAULT 0,
    last_clicked_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT fk_form_templates_shares FOREIGN KEY (form_id) REFERENCES form_templates(id) ON DELETE CASCADE,
    CONSTRAINT fk_review_forms_shares FOREIGN KEY (legacy_form_id) REFERENCES review_forms(id) ON DELETE CASCADE,
    CONSTRAINT check_form_reference_shares CHECK (
        (form_id IS NOT NULL AND legacy_form_id IS NULL) OR 
        (form_id IS NULL AND legacy_form_id IS NOT NULL)
    )
);

-- Indexes for form_shares
CREATE INDEX IF NOT EXISTS idx_form_shares_form_id ON form_shares(form_id);
CREATE INDEX IF NOT EXISTS idx_form_shares_legacy_form_id ON form_shares(legacy_form_id);
CREATE INDEX IF NOT EXISTS idx_form_shares_shared_by ON form_shares(shared_by);
CREATE INDEX IF NOT EXISTS idx_form_shares_method ON form_shares(share_method);
CREATE INDEX IF NOT EXISTS idx_form_shares_shared_at ON form_shares(shared_at);

-- 3. Form Access Logs Table (supports both systems)
CREATE TABLE IF NOT EXISTS form_access_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id UUID,
    legacy_form_id INTEGER,
    user_id UUID REFERENCES auth.users(id),
    session_id VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    access_type VARCHAR(20) DEFAULT 'view' CHECK (access_type IN ('view', 'submit', 'share')),
    accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    device_type VARCHAR(20),
    browser VARCHAR(50),
    os VARCHAR(50),
    country VARCHAR(2),
    city VARCHAR(100),
    CONSTRAINT fk_form_templates_access FOREIGN KEY (form_id) REFERENCES form_templates(id) ON DELETE CASCADE,
    CONSTRAINT fk_review_forms_access FOREIGN KEY (legacy_form_id) REFERENCES review_forms(id) ON DELETE CASCADE,
    CONSTRAINT check_form_reference_access CHECK (
        (form_id IS NOT NULL AND legacy_form_id IS NULL) OR 
        (form_id IS NULL AND legacy_form_id IS NOT NULL)
    )
);

-- Indexes for form_access_logs
CREATE INDEX IF NOT EXISTS idx_form_access_logs_form_id ON form_access_logs(form_id);
CREATE INDEX IF NOT EXISTS idx_form_access_logs_legacy_form_id ON form_access_logs(legacy_form_id);
CREATE INDEX IF NOT EXISTS idx_form_access_logs_user_id ON form_access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_form_access_logs_accessed_at ON form_access_logs(accessed_at);
CREATE INDEX IF NOT EXISTS idx_form_access_logs_access_type ON form_access_logs(access_type);
CREATE INDEX IF NOT EXISTS idx_form_access_logs_device_type ON form_access_logs(device_type);

-- 4. Form Response Analytics Table (supports both systems)
CREATE TABLE IF NOT EXISTS form_response_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id UUID,
    legacy_form_id INTEGER,
    response_id UUID, -- References form_submissions
    legacy_response_id INTEGER, -- References form_responses
    completion_time INTEGER, -- in seconds
    field_interactions JSONB DEFAULT '{}',
    abandonment_point VARCHAR(100),
    device_info JSONB DEFAULT '{}',
    geographic_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_form_templates_response_analytics FOREIGN KEY (form_id) REFERENCES form_templates(id) ON DELETE CASCADE,
    CONSTRAINT fk_review_forms_response_analytics FOREIGN KEY (legacy_form_id) REFERENCES review_forms(id) ON DELETE CASCADE,
    CONSTRAINT fk_form_submissions FOREIGN KEY (response_id) REFERENCES form_submissions(id) ON DELETE CASCADE,
    CONSTRAINT fk_form_responses FOREIGN KEY (legacy_response_id) REFERENCES form_responses(id) ON DELETE CASCADE,
    CONSTRAINT check_form_reference_response_analytics CHECK (
        (form_id IS NOT NULL AND legacy_form_id IS NULL) OR 
        (form_id IS NULL AND legacy_form_id IS NOT NULL)
    ),
    CONSTRAINT check_response_reference CHECK (
        (response_id IS NOT NULL AND legacy_response_id IS NULL) OR 
        (response_id IS NULL AND legacy_response_id IS NOT NULL)
    )
);

-- Indexes for form_response_analytics
CREATE INDEX IF NOT EXISTS idx_form_response_analytics_form_id ON form_response_analytics(form_id);
CREATE INDEX IF NOT EXISTS idx_form_response_analytics_legacy_form_id ON form_response_analytics(legacy_form_id);
CREATE INDEX IF NOT EXISTS idx_form_response_analytics_response_id ON form_response_analytics(response_id);
CREATE INDEX IF NOT EXISTS idx_form_response_analytics_legacy_response_id ON form_response_analytics(legacy_response_id);
CREATE INDEX IF NOT EXISTS idx_form_response_analytics_created_at ON form_response_analytics(created_at);

-- 5. Dashboard Widgets Table
CREATE TABLE IF NOT EXISTS dashboard_widgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    widget_type VARCHAR(50) NOT NULL,
    widget_config JSONB NOT NULL DEFAULT '{}',
    position_x INTEGER DEFAULT 0,
    position_y INTEGER DEFAULT 0,
    width INTEGER DEFAULT 4,
    height INTEGER DEFAULT 3,
    is_visible BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for dashboard_widgets
CREATE INDEX IF NOT EXISTS idx_dashboard_widgets_user_id ON dashboard_widgets(user_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_widgets_type ON dashboard_widgets(widget_type);
CREATE INDEX IF NOT EXISTS idx_dashboard_widgets_visible ON dashboard_widgets(is_visible);

-- 6. Automated Reports Table
CREATE TABLE IF NOT EXISTS automated_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    report_name VARCHAR(255) NOT NULL,
    report_type VARCHAR(50) NOT NULL,
    form_filters JSONB DEFAULT '{}',
    schedule_config JSONB NOT NULL DEFAULT '{}',
    recipients JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    last_sent_at TIMESTAMP WITH TIME ZONE,
    next_send_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for automated_reports
CREATE INDEX IF NOT EXISTS idx_automated_reports_user_id ON automated_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_automated_reports_type ON automated_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_automated_reports_active ON automated_reports(is_active);
CREATE INDEX IF NOT EXISTS idx_automated_reports_next_send ON automated_reports(next_send_at);

-- Create update triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_form_templates_updated_at') THEN
        CREATE TRIGGER update_form_templates_updated_at
        BEFORE UPDATE ON form_templates
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_review_forms_updated_at') THEN
        CREATE TRIGGER update_review_forms_updated_at
        BEFORE UPDATE ON review_forms
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_form_analytics_cache_updated_at') THEN
        CREATE TRIGGER update_form_analytics_cache_updated_at
        BEFORE UPDATE ON form_analytics_cache
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_dashboard_widgets_updated_at') THEN
        CREATE TRIGGER update_dashboard_widgets_updated_at
        BEFORE UPDATE ON dashboard_widgets
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_automated_reports_updated_at') THEN
        CREATE TRIGGER update_automated_reports_updated_at
        BEFORE UPDATE ON automated_reports
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Optional: Insert sample data for testing (uncomment if needed)
/*
-- Sample form template
INSERT INTO form_templates (name, description, category) VALUES 
('Customer Feedback Form', 'Collect customer feedback and ratings', 'feedback');

-- Sample dashboard widgets
INSERT INTO dashboard_widgets (user_id, widget_type, widget_config) VALUES 
((SELECT id FROM auth.users LIMIT 1), 'form_submissions_chart', '{"timeRange": "7d", "chartType": "line"}'),
((SELECT id FROM auth.users LIMIT 1), 'response_rate_gauge', '{"targetRate": 75}'),
((SELECT id FROM auth.users LIMIT 1), 'top_forms_list', '{"limit": 5}');

-- Sample automated report
INSERT INTO automated_reports (user_id, report_name, report_type, schedule_config, recipients) VALUES 
((SELECT id FROM auth.users LIMIT 1), 'Weekly Analytics Report', 'weekly_summary', '{"frequency": "weekly", "day": "monday", "time": "09:00"}', '["admin@example.com"]');
*/

-- Verify tables were created successfully
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE tablename IN (
    'form_templates', 
    'form_submissions', 
    'review_forms', 
    'form_responses',
    'form_analytics_cache', 
    'form_shares', 
    'form_access_logs', 
    'form_response_analytics', 
    'dashboard_widgets', 
    'automated_reports'
)
ORDER BY tablename;

-- 5. Dashboard Widgets Table
CREATE TABLE IF NOT EXISTS dashboard_widgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    widget_type VARCHAR(50) NOT NULL,
    widget_config JSONB NOT NULL DEFAULT '{}',
    position_x INTEGER DEFAULT 0,
    position_y INTEGER DEFAULT 0,
    width INTEGER DEFAULT 1,
    height INTEGER DEFAULT 1,
    is_visible BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for dashboard_widgets
CREATE INDEX IF NOT EXISTS idx_dashboard_widgets_user_id ON dashboard_widgets(user_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_widgets_type ON dashboard_widgets(widget_type);
CREATE INDEX IF NOT EXISTS idx_dashboard_widgets_visible ON dashboard_widgets(is_visible);

-- 6. Automated Reports Table
CREATE TABLE IF NOT EXISTS automated_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    report_name VARCHAR(255) NOT NULL,
    report_type VARCHAR(50) NOT NULL,
    report_config JSONB NOT NULL DEFAULT '{}',
    schedule_config JSONB NOT NULL DEFAULT '{}',
    recipients TEXT[],
    is_active BOOLEAN DEFAULT true,
    last_generated_at TIMESTAMP WITH TIME ZONE,
    next_generation_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for automated_reports
CREATE INDEX IF NOT EXISTS idx_automated_reports_user_id ON automated_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_automated_reports_type ON automated_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_automated_reports_active ON automated_reports(is_active);
DO $$
BEGIN
    -- Create index on the appropriate next-send column depending on schema
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'automated_reports' AND column_name = 'next_generation_at'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_automated_reports_next_generation 
        ON automated_reports(next_generation_at);
    ELSIF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'automated_reports' AND column_name = 'next_send_at'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_automated_reports_next_send 
        ON automated_reports(next_send_at);
    END IF;
END $$;

-- 7. Update Triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to tables with updated_at columns
CREATE TRIGGER update_form_analytics_cache_updated_at 
    BEFORE UPDATE ON form_analytics_cache 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dashboard_widgets_updated_at 
    BEFORE UPDATE ON dashboard_widgets 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_automated_reports_updated_at 
    BEFORE UPDATE ON automated_reports 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. Sample Data Insertion (Optional)
-- Insert sample analytics cache data
INSERT INTO form_analytics_cache (legacy_form_id, analytics_type, analytics_date, analytics_data)
SELECT 
    rf.id,
    'daily_summary',
    CURRENT_DATE - INTERVAL '1 day' * generate_series(0, 6),
    jsonb_build_object(
        'views', floor(random() * 100 + 10)::int,
        'responses', floor(random() * 20 + 1)::int,
        'completion_rate', round((random() * 0.4 + 0.6)::numeric, 2)
    )
FROM review_forms rf
WHERE EXISTS (SELECT 1 FROM review_forms LIMIT 1)
ON CONFLICT DO NOTHING;

-- Insert sample form shares
INSERT INTO form_shares (legacy_form_id, shared_by, share_method, share_url, click_count, response_count)
SELECT 
    rf.id,
    (SELECT id FROM auth.users LIMIT 1),
    (ARRAY['email', 'link', 'social'])[floor(random() * 3 + 1)::int],
    'https://example.com/form/' || rf.id::text,
    floor(random() * 50)::int,
    floor(random() * 10)::int
FROM review_forms rf
WHERE EXISTS (SELECT 1 FROM review_forms LIMIT 1)
ON CONFLICT DO NOTHING;

-- Insert sample access logs
INSERT INTO form_access_logs (legacy_form_id, access_type, device_type, browser, os)
SELECT 
    rf.id,
    (ARRAY['view', 'submit'])[floor(random() * 2 + 1)::int],
    (ARRAY['desktop', 'mobile', 'tablet'])[floor(random() * 3 + 1)::int],
    (ARRAY['Chrome', 'Firefox', 'Safari', 'Edge'])[floor(random() * 4 + 1)::int],
    (ARRAY['Windows', 'macOS', 'Linux', 'iOS', 'Android'])[floor(random() * 5 + 1)::int]
FROM review_forms rf
CROSS JOIN generate_series(1, 10)
WHERE EXISTS (SELECT 1 FROM review_forms LIMIT 1)
ON CONFLICT DO NOTHING;

-- Insert sample dashboard widgets
INSERT INTO dashboard_widgets (user_id, widget_type, widget_config, position_x, position_y, width, height)
SELECT 
    u.id,
    widget_type,
    jsonb_build_object('title', widget_type || ' Widget', 'color', 'blue'),
    position_x,
    position_y,
    2,
    2
FROM auth.users u
CROSS JOIN (
    VALUES 
        ('response_chart', 0, 0),
        ('completion_rate', 2, 0),
        ('recent_responses', 0, 2),
        ('analytics_summary', 2, 2)
) AS widgets(widget_type, position_x, position_y)
WHERE EXISTS (SELECT 1 FROM auth.users LIMIT 1)
ON CONFLICT DO NOTHING;

-- Verification Queries (Run these to check if tables were created successfully)
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE '%analytics%' OR table_name IN ('form_shares', 'dashboard_widgets', 'automated_reports');
-- SELECT COUNT(*) as form_analytics_cache_count FROM form_analytics_cache;
-- SELECT COUNT(*) as form_shares_count FROM form_shares;
-- SELECT COUNT(*) as form_access_logs_count FROM form_access_logs;
-- SELECT COUNT(*) as dashboard_widgets_count FROM dashboard_widgets;