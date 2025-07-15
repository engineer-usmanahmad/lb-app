import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';
import { sendEnrollmentNotification, sendEnrollmentConfirmation } from '../../lib/resend';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    
    const enrollmentData = {
      course_id: formData.get('course_id') as string,
      first_name: formData.get('first_name') as string,
      last_name: formData.get('last_name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      experience_level: formData.get('experience_level') as 'beginner' | 'intermediate' | 'advanced',
      learning_goals: formData.get('learning_goals') as string,
      is_free: formData.get('is_free') === 'true',
      status: 'pending' as const,
    };
    
    // Validate required fields
    if (!enrollmentData.course_id || !enrollmentData.first_name || !enrollmentData.last_name || 
        !enrollmentData.email || !enrollmentData.phone || !enrollmentData.experience_level || 
        !enrollmentData.learning_goals) {
      return new Response(JSON.stringify({ error: 'All fields are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Insert into Supabase
    const { data, error } = await supabase
      .from('enrollment_submissions')
      .insert([enrollmentData])
      .select();
    
    if (error) {
      console.error('Supabase error:', error);
      return new Response(JSON.stringify({ error: 'Database error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Send email notifications
    try {
      await Promise.all([
        sendEnrollmentNotification(enrollmentData),
        sendEnrollmentConfirmation(enrollmentData)
      ]);
    } catch (emailError) {
      console.error('Email error:', emailError);
      // Don't fail the request if email fails
    }
    
    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Enrollment form error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};