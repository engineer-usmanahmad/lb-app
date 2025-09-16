import type { APIRoute } from 'astro';
import { supabaseAdmin } from '../../../lib/supabase-admin';

export const prerender = false;

export const PUT: APIRoute = async ({ request }) => {
  try {
    if (!supabaseAdmin) {
      return new Response(JSON.stringify({ error: 'Service unavailable' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Parse JSON data from request body
    const data = await request.json();
    const enrollment_id = data.enrollment_id as string;
    const status = data.status as string;
    const comments = data.comments as string;

    if (!enrollment_id || !status) {
      return new Response(JSON.stringify({ error: 'Enrollment ID and status are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validate status value
    const validStatuses = ['pending', 'enrolled', 'not_interested', 'free_training'];
    if (!validStatuses.includes(status)) {
      return new Response(JSON.stringify({ error: 'Invalid status value' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Prepare update data
    const updateData: any = {
      status: status,
      updated_at: new Date().toISOString()
    };

    if (comments) {
      updateData.comments = comments;
    }

    const { data: updatedEnrollment, error } = await supabaseAdmin
      .from('enrollment_submissions')
      .update(updateData)
      .eq('id', enrollment_id)
      .select()
      .single();

    if (error) {
      console.error('Enrollment status update error:', error);
      return new Response(JSON.stringify({ error: 'Failed to update enrollment status' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      enrollment: updatedEnrollment 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error updating enrollment status:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};