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
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for form_analytics_cache
CREATE INDEX IF NOT EXISTS idx_form_analytics_form_id ON form_analytics_cache (form_id);
CREATE INDEX IF NOT EXISTS idx_form_analytics_type ON form_analytics_cache (analytics_type);
CREATE INDEX IF NOT EXISTS idx_form_analytics_date ON form_analytics_cache (analytics_date);

-- Form Sharing History
-- Tracks how forms are shared and their performance metrics
CREATE TABLE IF NOT EXISTS form_shares (
    id SERIAL PRIMARY KEY,
    form_id INTEGER REFERENCES review_forms(id) ON DELETE CASCADE,
    shared_by INTEGER,
    share_method VARCHAR(20) CHECK (share_method IN ('whatsapp', 'email', 'sms', 'social', 'copy_link', 'qr_code')) NOT NULL,
    share_url TEXT,
    shared_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    click_count INTEGER DEFAULT 0,
    response_count INTEGER DEFAULT 0,
    last_clicked_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for form_shares
CREATE INDEX IF NOT EXISTS idx_form_shares_form_id ON form_shares (form_id);
CREATE INDEX IF NOT EXISTS idx_form_shares_method ON form_shares (share_method);
CREATE INDEX IF NOT EXISTS idx_form_shares_date ON form_shares (shared_at);

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
    user_id INTEGER,
    accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    additional_data JSONB DEFAULT '{}'
);

-- Create indexes for form_access_logs
CREATE INDEX IF NOT EXISTS idx_form_access_form_id ON form_access_logs (form_id);
CREATE INDEX IF NOT EXISTS idx_form_access_type ON form_access_logs (access_type);
CREATE INDEX IF NOT EXISTS idx_form_access_date ON form_access_logs (accessed_at);
CREATE INDEX IF NOT EXISTS idx_form_access_ip ON form_access_logs (ip_address);

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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for form_response_analytics
CREATE INDEX IF NOT EXISTS idx_response_analytics_response_id ON form_response_analytics (response_id);
CREATE INDEX IF NOT EXISTS idx_response_analytics_form_id ON form_response_analytics (form_id);
CREATE INDEX IF NOT EXISTS idx_response_analytics_quality ON form_response_analytics (quality_score);
CREATE INDEX IF NOT EXISTS idx_response_analytics_date ON form_response_analytics (created_at);

-- Dashboard Widgets Configuration
-- Stores user's custom dashboard layout and preferences
CREATE TABLE IF NOT EXISTS dashboard_widgets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    widget_type VARCHAR(50) NOT NULL,
    widget_config JSONB NOT NULL DEFAULT '{}',
    position_x INTEGER DEFAULT 0,
    position_y INTEGER DEFAULT 0,
    width INTEGER DEFAULT 4,
    height INTEGER DEFAULT 3,
    is_visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for dashboard_widgets
CREATE INDEX IF NOT EXISTS idx_dashboard_widgets_user_id ON dashboard_widgets (user_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_widgets_type ON dashboard_widgets (widget_type);

-- Automated Reports Configuration
-- Stores settings for scheduled reports
CREATE TABLE IF NOT EXISTS automated_reports (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    report_name VARCHAR(255) NOT NULL,
    report_type VARCHAR(50) NOT NULL,
    form_ids INTEGER[] DEFAULT '{}',
    schedule_frequency VARCHAR(20) CHECK (schedule_frequency IN ('daily', 'weekly', 'monthly', 'quarterly')) NOT NULL,
    schedule_day INTEGER,
    schedule_time TIME DEFAULT '09:00:00',
    email_recipients TEXT[] DEFAULT '{}',
    report_config JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    last_sent_at TIMESTAMP WITH TIME ZONE,
    next_send_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for automated_reports
CREATE INDEX IF NOT EXISTS idx_automated_reports_user_id ON automated_reports (user_id);
CREATE INDEX IF NOT EXISTS idx_automated_reports_next_send ON automated_reports (next_send_at);
CREATE INDEX IF NOT EXISTS idx_automated_reports_active ON automated_reports (is_active);

-- Update triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers
DROP TRIGGER IF EXISTS update_form_analytics_cache_updated_at ON form_analytics_cache;
CREATE TRIGGER update_form_analytics_cache_updated_at 
    BEFORE UPDATE ON form_analytics_cache 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_dashboard_widgets_updated_at ON dashboard_widgets;
CREATE TRIGGER update_dashboard_widgets_updated_at 
    BEFORE UPDATE ON dashboard_widgets 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_automated_reports_updated_at ON automated_reports;
CREATE TRIGGER update_automated_reports_updated_at 
    BEFORE UPDATE ON automated_reports 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();