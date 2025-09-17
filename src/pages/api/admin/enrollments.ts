import type { APIRoute } from 'astro';
import { supabaseAdmin } from '../../../lib/supabase-admin';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  try {
    if (!supabaseAdmin) {
      return new Response(JSON.stringify({ error: 'Service unavailable' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check for admin authentication
    const cookies = request.headers.get('cookie');
    const adminSession = cookies?.split(';')
      .find(c => c.trim().startsWith('admin_session='))
      ?.split('=')[1];

    if (!adminSession) {
      return new Response(JSON.stringify({ error: 'Authentication required' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Fetch all enrollments from enrollment_submissions table
    const { data: enrollments, error } = await supabaseAdmin
      .from('enrollment_submissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Enrollments fetch error:', error);
      return new Response(JSON.stringify({ error: 'Failed to fetch enrollments' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      data: enrollments || [] 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error fetching enrollments:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};