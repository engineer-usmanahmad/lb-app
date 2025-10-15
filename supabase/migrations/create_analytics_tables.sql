-- Analytics optimization tables for Form Builder system
-- This migration creates tables for advanced analytics, sharing tracking, and access logging

-- Analytics Cache Table for Performance
-- Stores pre-computed analytics data to improve dashboard performance
CREATE TABLE IF NOT EXISTS form_analytics_cache (
    id SERIAL PRIMARY KEY,
    form_id INTEGER REFERENCES review_forms(id) ON DELETE CASCADE,
    analytics_type VARCHAR(50) NOT NULL,
    analytics_date DATE NOT NULL,
    analytics_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes for performance
    INDEX idx_form_analytics_form_id (form_id),
    INDEX idx_form_analytics_type (analytics_type),
    INDEX idx_form_analytics_date (analytics_date)
);

-- Form Sharing History
-- Tracks how forms are shared and their performance metrics
CREATE TABLE IF NOT EXISTS form_shares (
    id SERIAL PRIMARY KEY,
    form_id INTEGER REFERENCES review_forms(id) ON DELETE CASCADE,
    shared_by INTEGER REFERENCES auth.users(id) ON DELETE SET NULL,
    share_method VARCHAR(20) CHECK (share_method IN ('whatsapp', 'email', 'sms', 'social', 'copy_link', 'qr_code')) NOT NULL,
    share_url TEXT,
    shared_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    click_count INTEGER DEFAULT 0,
    response_count INTEGER DEFAULT 0,
    last_clicked_at TIMESTAMP WITH TIME ZONE,
    
    -- Indexes for performance
    INDEX idx_form_shares_form_id (form_id),
    INDEX idx_form_shares_method (share_method),
    INDEX idx_form_shares_date (shared_at)
);

-- Form Access Logs
-- Detailed logging of form interactions for analytics
CREATE TABLE IF NOT EXISTS form_access_logs (
    id SERIAL PRIMARY KEY,
    form_id INTEGER REFERENCES review_forms(id) ON DELETE CASCADE,
    access_type VARCHAR(20) CHECK (access_type IN ('view', 'start', 'submit', 'share', 'preview', 'edit')) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    session_id VARCHAR(255),
    user_id INTEGER REFERENCES auth.users(id) ON DELETE SET NULL,
    accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    additional_data JSONB DEFAULT '{}',
    
    -- Indexes for performance
    INDEX idx_form_access_form_id (form_id),
    INDEX idx_form_access_type (access_type),
    INDEX idx_form_access_date (accessed_at),
    INDEX idx_form_access_ip (ip_address)
);

-- Form Response Analytics
-- Extended analytics for form responses
CREATE TABLE IF NOT EXISTS form_response_analytics (
    id SERIAL PRIMARY KEY,
    response_id INTEGER REFERENCES form_responses(id) ON DELETE CASCADE,
    form_id INTEGER REFERENCES review_forms(id) ON DELETE CASCADE,
    completion_time_seconds INTEGER,
    quality_score DECIMAL(3,2) DEFAULT 0.00,
    is_duplicate BOOLEAN DEFAULT FALSE,
    is_spam BOOLEAN DEFAULT FALSE,
    device_type VARCHAR(20),
    browser_info JSONB DEFAULT '{}',
    location_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes for performance
    INDEX idx_response_analytics_response_id (response_id),
    INDEX idx_response_analytics_form_id (form_id),
    INDEX idx_response_analytics_quality (quality_score),
    INDEX idx_response_analytics_date (created_at)
);

-- Dashboard Widgets Configuration
-- Stores user's custom dashboard layout and preferences
CREATE TABLE IF NOT EXISTS dashboard_widgets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES auth.users(id) ON DELETE CASCADE,
    widget_type VARCHAR(50) NOT NULL,
    widget_config JSONB NOT NULL DEFAULT '{}',
    position_x INTEGER DEFAULT 0,
    position_y INTEGER DEFAULT 0,
    width INTEGER DEFAULT 4,
    height INTEGER DEFAULT 3,
    is_visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes for performance
    INDEX idx_dashboard_widgets_user_id (user_id),
    INDEX idx_dashboard_widgets_type (widget_type)
);

-- Automated Reports Configuration
-- Stores settings for scheduled reports
CREATE TABLE IF NOT EXISTS automated_reports (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES auth.users(id) ON DELETE CASCADE,
    report_name VARCHAR(255) NOT NULL,
    report_type VARCHAR(50) NOT NULL,
    form_ids INTEGER[] DEFAULT '{}',
    schedule_frequency VARCHAR(20) CHECK (schedule_frequency IN ('daily', 'weekly', 'monthly', 'quarterly')) NOT NULL,
    schedule_day INTEGER, -- Day of week (1-7) for weekly, day of month (1-31) for monthly
    schedule_time TIME DEFAULT '09:00:00',
    email_recipients TEXT[] DEFAULT '{}',
    report_config JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    last_sent_at TIMESTAMP WITH TIME ZONE,
    next_send_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes for performance
    INDEX idx_automated_reports_user_id (user_id),
    INDEX idx_automated_reports_next_send (next_send_at),
    INDEX idx_automated_reports_active (is_active)
);

-- Update triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers
CREATE TRIGGER update_form_analytics_cache_updated_at 
    BEFORE UPDATE ON form_analytics_cache 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dashboard_widgets_updated_at 
    BEFORE UPDATE ON dashboard_widgets 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_automated_reports_updated_at 
    BEFORE UPDATE ON automated_reports 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) Policies
ALTER TABLE form_analytics_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_response_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE automated_reports ENABLE ROW LEVEL SECURITY;

-- Policies for form_analytics_cache
CREATE POLICY "Users can view analytics for their forms" ON form_analytics_cache
    FOR SELECT USING (
        form_id IN (
            SELECT id FROM review_forms 
            WHERE created_by = auth.uid()
        )
    );

-- Policies for form_shares
CREATE POLICY "Users can manage shares for their forms" ON form_shares
    FOR ALL USING (
        form_id IN (
            SELECT id FROM review_forms 
            WHERE created_by = auth.uid()
        )
    );

-- Policies for form_access_logs
CREATE POLICY "Users can view access logs for their forms" ON form_access_logs
    FOR SELECT USING (
        form_id IN (
            SELECT id FROM review_forms 
            WHERE created_by = auth.uid()
        )
    );

-- Policies for form_response_analytics
CREATE POLICY "Users can view response analytics for their forms" ON form_response_analytics
    FOR SELECT USING (
        form_id IN (
            SELECT id FROM review_forms 
            WHERE created_by = auth.uid()
        )
    );

-- Policies for dashboard_widgets
CREATE POLICY "Users can manage their own dashboard widgets" ON dashboard_widgets
    FOR ALL USING (user_id = auth.uid());

-- Policies for automated_reports
CREATE POLICY "Users can manage their own automated reports" ON automated_reports
    FOR ALL USING (user_id = auth.uid());

-- Insert default dashboard widgets for existing users
INSERT INTO dashboard_widgets (user_id, widget_type, widget_config, position_x, position_y, width, height)
SELECT 
    id as user_id,
    'response_overview' as widget_type,
    '{"title": "Response Overview", "chart_type": "pie"}' as widget_config,
    0 as position_x,
    0 as position_y,
    6 as width,
    4 as height
FROM auth.users
WHERE id NOT IN (SELECT DISTINCT user_id FROM dashboard_widgets WHERE widget_type = 'response_overview');

-- Comments for documentation
COMMENT ON TABLE form_analytics_cache IS 'Stores pre-computed analytics data for improved dashboard performance';
COMMENT ON TABLE form_shares IS 'Tracks form sharing methods and their performance metrics';
COMMENT ON TABLE form_access_logs IS 'Detailed logging of all form interactions for comprehensive analytics';
COMMENT ON TABLE form_response_analytics IS 'Extended analytics data for form responses including quality scoring';
COMMENT ON TABLE dashboard_widgets IS 'User customizable dashboard widget configurations';
COMMENT ON TABLE automated_reports IS 'Configuration for scheduled automated reports';