-- Manual Analytics Tables Creation Script for Supabase
-- Execute these commands in your Supabase SQL Editor

-- 1. Form Analytics Cache Table
CREATE TABLE IF NOT EXISTS form_analytics_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id UUID NOT NULL REFERENCES review_forms(id) ON DELETE CASCADE,
    analytics_type VARCHAR(50) NOT NULL,
    analytics_date DATE NOT NULL,
    analytics_data JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for form_analytics_cache
CREATE INDEX IF NOT EXISTS idx_form_analytics_cache_form_id ON form_analytics_cache(form_id);
CREATE INDEX IF NOT EXISTS idx_form_analytics_cache_type_date ON form_analytics_cache(analytics_type, analytics_date);
CREATE INDEX IF NOT EXISTS idx_form_analytics_cache_date ON form_analytics_cache(analytics_date);

-- 2. Form Shares Table
CREATE TABLE IF NOT EXISTS form_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id UUID NOT NULL REFERENCES review_forms(id) ON DELETE CASCADE,
    shared_by UUID REFERENCES auth.users(id),
    share_method VARCHAR(20) NOT NULL CHECK (share_method IN ('email', 'link', 'social', 'qr', 'embed')),
    share_url TEXT,
    shared_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    click_count INTEGER DEFAULT 0,
    response_count INTEGER DEFAULT 0,
    last_clicked_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for form_shares
CREATE INDEX IF NOT EXISTS idx_form_shares_form_id ON form_shares(form_id);
CREATE INDEX IF NOT EXISTS idx_form_shares_shared_by ON form_shares(shared_by);
CREATE INDEX IF NOT EXISTS idx_form_shares_method ON form_shares(share_method);
CREATE INDEX IF NOT EXISTS idx_form_shares_shared_at ON form_shares(shared_at);

-- 3. Form Access Logs Table
CREATE TABLE IF NOT EXISTS form_access_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id UUID NOT NULL REFERENCES review_forms(id) ON DELETE CASCADE,
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
    city VARCHAR(100)
);

-- Indexes for form_access_logs
CREATE INDEX IF NOT EXISTS idx_form_access_logs_form_id ON form_access_logs(form_id);
CREATE INDEX IF NOT EXISTS idx_form_access_logs_user_id ON form_access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_form_access_logs_accessed_at ON form_access_logs(accessed_at);
CREATE INDEX IF NOT EXISTS idx_form_access_logs_access_type ON form_access_logs(access_type);
CREATE INDEX IF NOT EXISTS idx_form_access_logs_device_type ON form_access_logs(device_type);

-- 4. Form Response Analytics Table
CREATE TABLE IF NOT EXISTS form_response_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id UUID NOT NULL REFERENCES review_forms(id) ON DELETE CASCADE,
    response_id UUID REFERENCES form_responses(id) ON DELETE CASCADE,
    completion_time INTEGER, -- in seconds
    field_interactions JSONB DEFAULT '{}',
    abandonment_point VARCHAR(100),
    device_info JSONB DEFAULT '{}',
    geographic_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for form_response_analytics
CREATE INDEX IF NOT EXISTS idx_form_response_analytics_form_id ON form_response_analytics(form_id);
CREATE INDEX IF NOT EXISTS idx_form_response_analytics_response_id ON form_response_analytics(response_id);
CREATE INDEX IF NOT EXISTS idx_form_response_analytics_created_at ON form_response_analytics(created_at);

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
CREATE INDEX IF NOT EXISTS idx_automated_reports_next_generation ON automated_reports(next_generation_at);

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
INSERT INTO form_analytics_cache (form_id, analytics_type, analytics_date, analytics_data)
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
INSERT INTO form_shares (form_id, shared_by, share_method, share_url, click_count, response_count)
SELECT 
    rf.id,
    rf.created_by,
    (ARRAY['email', 'link', 'social'])[floor(random() * 3 + 1)],
    'https://example.com/form/' || rf.id,
    floor(random() * 50)::int,
    floor(random() * 10)::int
FROM review_forms rf
WHERE EXISTS (SELECT 1 FROM review_forms LIMIT 1)
ON CONFLICT DO NOTHING;

-- Insert sample access logs
INSERT INTO form_access_logs (form_id, access_type, device_type, browser, os)
SELECT 
    rf.id,
    (ARRAY['view', 'submit'])[floor(random() * 2 + 1)],
    (ARRAY['desktop', 'mobile', 'tablet'])[floor(random() * 3 + 1)],
    (ARRAY['Chrome', 'Firefox', 'Safari', 'Edge'])[floor(random() * 4 + 1)],
    (ARRAY['Windows', 'macOS', 'Linux', 'iOS', 'Android'])[floor(random() * 5 + 1)]
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