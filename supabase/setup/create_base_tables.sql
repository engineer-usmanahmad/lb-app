-- Create base tables required for the analytics system

-- Review Forms table (base table for forms)
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

-- Form Responses table (stores form submissions)
CREATE TABLE IF NOT EXISTS form_responses (
    id SERIAL PRIMARY KEY,
    form_id INTEGER REFERENCES review_forms(id) ON DELETE CASCADE,
    response_data JSONB NOT NULL DEFAULT '{}',
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(255)
);

-- Contact Submissions table (for contact forms)
CREATE TABLE IF NOT EXISTS contact_submissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    message TEXT NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    status VARCHAR(20) DEFAULT 'new',
    comments TEXT
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_review_forms_created_by ON review_forms (created_by);
CREATE INDEX IF NOT EXISTS idx_review_forms_slug ON review_forms (slug);
CREATE INDEX IF NOT EXISTS idx_form_responses_form_id ON form_responses (form_id);
CREATE INDEX IF NOT EXISTS idx_form_responses_submitted_at ON form_responses (submitted_at);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_email ON contact_submissions (email);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_submitted_at ON contact_submissions (submitted_at);

-- Insert some sample data for testing
INSERT INTO review_forms (title, description, form_fields, slug) VALUES 
('Course Feedback Form', 'Please provide your feedback about the course', 
'[{"type": "text", "label": "Name", "required": true}, {"type": "email", "label": "Email", "required": true}, {"type": "rating", "label": "Overall Rating", "required": true}, {"type": "textarea", "label": "Comments", "required": false}]', 
'course-feedback')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO review_forms (title, description, form_fields, slug) VALUES 
('Training Evaluation', 'Evaluate the training session', 
'[{"type": "text", "label": "Participant Name", "required": true}, {"type": "select", "label": "Training Type", "options": ["Technical", "Soft Skills", "Leadership"], "required": true}, {"type": "rating", "label": "Content Quality", "required": true}, {"type": "rating", "label": "Instructor Rating", "required": true}]', 
'training-evaluation')
ON CONFLICT (slug) DO NOTHING;