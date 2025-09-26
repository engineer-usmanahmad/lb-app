-- Create form_templates table
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

-- Create form_fields table
CREATE TABLE IF NOT EXISTS form_fields (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    form_id UUID REFERENCES form_templates(id) ON DELETE CASCADE,
    field_type VARCHAR(50) NOT NULL, -- text, dropdown, rating, multiple_choice, textarea, date, number, checkbox
    label VARCHAR(255) NOT NULL,
    placeholder VARCHAR(255),
    is_required BOOLEAN DEFAULT false,
    field_order INTEGER NOT NULL DEFAULT 0,
    options JSONB, -- For dropdown, multiple_choice, rating options
    validation JSONB, -- For validation rules (min, max, pattern, etc.)
    conditional_logic JSONB, -- For show/hide logic based on other fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create form_submissions table
CREATE TABLE IF NOT EXISTS form_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    form_id UUID REFERENCES form_templates(id) ON DELETE CASCADE,
    submission_data JSONB NOT NULL, -- Store all form field responses
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_form_fields_form_id ON form_fields(form_id);
CREATE INDEX IF NOT EXISTS idx_form_fields_order ON form_fields(form_id, field_order);
CREATE INDEX IF NOT EXISTS idx_form_submissions_form_id ON form_submissions(form_id);
CREATE INDEX IF NOT EXISTS idx_form_submissions_date ON form_submissions(submitted_at);
CREATE INDEX IF NOT EXISTS idx_form_templates_active ON form_templates(is_active);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_form_templates_updated_at 
    BEFORE UPDATE ON form_templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_form_fields_updated_at 
    BEFORE UPDATE ON form_fields 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE form_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for admin access
CREATE POLICY "Admin can manage form templates" ON form_templates
    FOR ALL USING (true);

CREATE POLICY "Admin can manage form fields" ON form_fields
    FOR ALL USING (true);

CREATE POLICY "Admin can view form submissions" ON form_submissions
    FOR SELECT USING (true);

-- Create RLS policies for public form access (for form display and submission)
CREATE POLICY "Public can view active form templates" ON form_templates
    FOR SELECT USING (is_active = true);

CREATE POLICY "Public can view form fields for active forms" ON form_fields
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM form_templates 
            WHERE form_templates.id = form_fields.form_id 
            AND form_templates.is_active = true
        )
    );

CREATE POLICY "Public can submit to active forms" ON form_submissions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM form_templates 
            WHERE form_templates.id = form_submissions.form_id 
            AND form_templates.is_active = true
        )
    );

-- Insert some sample data for testing
INSERT INTO form_templates (name, description, category, template, is_active) VALUES
('Customer Feedback Form', 'Collect customer feedback and reviews', 'feedback', 'standard', true),
('Event Registration Form', 'Register participants for events', 'registration', 'standard', true),
('Contact Us Form', 'General contact and inquiry form', 'contact', 'standard', true);