// Script to create test form submission data directly in the database
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://your-project.supabase.co';
const supabaseKey = 'your-anon-key';
const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestData() {
  const formId = '05982408-e58b-4b27-8d26-d2bc47fa7b08';
  
  // Create multiple test submissions
  const testSubmissions = [
    {
      form_id: formId,
      submission_data: {
        overall_rating: 5,
        content_quality: 4,
        instructor_performance: 5,
        course_materials: 4,
        feedback_comments: "Excellent session! Very informative and well-structured. The instructor explained complex concepts clearly.",
        suggestions: "Maybe add more hands-on exercises for better practice."
      },
      submitted_at: new Date().toISOString()
    },
    {
      form_id: formId,
      submission_data: {
        overall_rating: 4,
        content_quality: 5,
        instructor_performance: 4,
        course_materials: 5,
        feedback_comments: "Great content and delivery. Learned a lot about DevOps practices.",
        suggestions: "Could use more real-world examples and case studies."
      },
      submitted_at: new Date().toISOString()
    },
    {
      form_id: formId,
      submission_data: {
        overall_rating: 5,
        content_quality: 5,
        instructor_performance: 5,
        course_materials: 4,
        feedback_comments: "Outstanding session! The instructor was very knowledgeable and engaging.",
        suggestions: "Perfect as is. Maybe extend the duration for more in-depth coverage."
      },
      submitted_at: new Date().toISOString()
    }
  ];

  for (const submission of testSubmissions) {
    const { data, error } = await supabase
      .from('form_submissions')
      .insert(submission);
    
    if (error) {
      console.error('Error inserting submission:', error);
    } else {
      console.log('Successfully created submission');
    }
  }
}

createTestData();