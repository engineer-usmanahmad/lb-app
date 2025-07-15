import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';
import { sendContactNotification, sendContactConfirmation } from '../../lib/resend';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    
    const contactData = {
      first_name: formData.get('first_name') as string,
      last_name: formData.get('last_name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      course_interest: formData.get('course_interest') as string,
      message: formData.get('message') as string,
      status: 'new' as const,
    };
    
    // Validate required fields
    if (!contactData.first_name || !contactData.last_name || !contactData.email || !contactData.phone || !contactData.course_interest || !contactData.message) {
      return new Response(JSON.stringify({ error: 'All fields are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Insert into Supabase
    const { data, error } = await supabase
      .from('contact_submissions')
      .insert([contactData])
      .select();
    
    if (error) {
      console.error('Supabase error:', error);
      return new Response(JSON.stringify({ error: 'Database error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Send email notification
    try {
      await Promise.all([
        sendContactNotification(contactData),
        sendContactConfirmation(contactData)
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
    console.error('Contact form error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};