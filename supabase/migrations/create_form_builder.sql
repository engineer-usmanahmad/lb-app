-- Create form_templates table for form builder
CREATE TABLE IF NOT EXISTS form_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) DEFAULT 'general',
    template_type VARCHAR(50) DEFAULT 'blank', -- blank, course_review, trainer_feedback, etc.
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create form_fields table to store dynamic form fields
CREATE TABLE IF NOT EXISTS form_fields (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    form_id UUID REFERENCES form_templates(id) ON DELETE CASCADE,
    field_type VARCHAR(50) NOT NULL, -- text, email, phone, dropdown, rating, radio, checkbox, textarea, date, number
    field_name VARCHAR(255) NOT NULL,
    field_label VARCHAR(255) NOT NULL,
    placeholder_text VARCHAR(255),
    help_text TEXT,
    is_required BOOLEAN DEFAULT false,
    field_order INTEGER DEFAULT 0,
    field_options JSONB, -- For dropdown, radio, checkbox options
    validation_rules JSONB, -- Custom validation rules
    conditional_logic JSONB, -- Show/hide conditions
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create form_submissions table to store form responses
CREATE TABLE IF NOT EXISTS form_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    form_id UUID REFERENCES form_templates(id) ON DELETE CASCADE,
    submission_data JSONB NOT NULL, -- Store all form field responses
    submitted_by_email VARCHAR(255),
    submitted_by_name VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_form_templates_active ON form_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_form_templates_category ON form_templates(category);
CREATE INDEX IF NOT EXISTS idx_form_fields_form_id ON form_fields(form_id);
CREATE INDEX IF NOT EXISTS idx_form_fields_order ON form_fields(form_id, field_order);
CREATE INDEX IF NOT EXISTS idx_form_submissions_form_id ON form_submissions(form_id);
CREATE INDEX IF NOT EXISTS idx_form_submissions_created_at ON form_submissions(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE form_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for form_templates
CREATE POLICY "Admin can manage form templates" ON form_templates
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Public can view active forms" ON form_templates
    FOR SELECT USING (is_active = true);

-- RLS Policies for form_fields
CREATE POLICY "Admin can manage form fields" ON form_fields
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Public can view fields of active forms" ON form_fields
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM form_templates 
            WHERE form_templates.id = form_fields.form_id 
            AND form_templates.is_active = true
        )
    );

-- RLS Policies for form_submissions
CREATE POLICY "Admin can view all submissions" ON form_submissions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Anyone can submit forms" ON form_submissions
    FOR INSERT WITH CHECK (true);

-- Create function to update updated_at timestamp
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