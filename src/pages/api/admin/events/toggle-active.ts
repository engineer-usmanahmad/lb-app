import type { APIRoute } from 'astro';
import { supabase } from '../../../../lib/supabase';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { id, active } = await request.json();

    if (!id) {
      return new Response(JSON.stringify({ error: 'Event ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!supabase) {
      return new Response(JSON.stringify({ error: 'Database connection not available' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Update the event's active status
    const { data, error } = await supabase
      .from('events')
      .update({ active })
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error updating event active status:', error);
      return new Response(JSON.stringify({ error: 'Failed to update event active status' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Event ${active ? 'activated' : 'deactivated'} successfully`,
      data 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Toggle active error:', error);
    return new Response(JSON.stringify({ error: 'Failed to toggle event active status' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};