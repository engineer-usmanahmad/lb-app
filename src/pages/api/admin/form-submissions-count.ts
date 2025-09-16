import type { APIRoute } from 'astro';
import { supabaseAdmin } from '../../../lib/supabase-admin';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  try {
    if (!supabaseAdmin) {
      return new Response(JSON.stringify({ error: 'Service unavailable' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const formId = url.searchParams.get('formId');
    
    if (!formId) {
      return new Response(JSON.stringify({ error: 'Form ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get the count of submissions for the specified form
    const { count, error: countError } = await supabaseAdmin
      .from('form_submissions')
      .select('*', { count: 'exact', head: true })
      .eq('form_id', formId);

    if (countError) {
      console.error('Form submissions count error:', countError);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Failed to fetch submission count',
        count: 0 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      count: count || 0 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Form submissions count API error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Internal server error',
      count: 0 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};