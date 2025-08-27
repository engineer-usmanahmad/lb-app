
import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';

export const prerender = false;

// Simple in-memory throttling (reset on server restart)
const submissionThrottle = new Map<string, number>();

export const POST: APIRoute = async ({ request, clientAddress }) => {
  try {
    if (!supabase) {
      return new Response(JSON.stringify({ ok: false, error: 'Service unavailable' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Basic throttling - 1 submission per 10 seconds per IP
    const now = Date.now();
    const lastSubmission = submissionThrottle.get(clientAddress || 'unknown');
    if (lastSubmission && now - lastSubmission < 10000) {
      return new Response(JSON.stringify({ ok: false, error: 'Please wait before submitting again' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const body = await request.json();
    const { formSlug, data } = body;

    if (!formSlug || !data) {
      return new Response(JSON.stringify({ ok: false, error: 'Form slug and data are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Fetch form and fields
    const { data: form, error: formError } = await supabase
      .from('forms')
      .select('id, is_active')
      .eq('slug', formSlug)
      .eq('is_active', true)
      .single();

    if (formError || !form) {
      return new Response(JSON.stringify({ ok: false, error: 'Form not found or inactive' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { data: fields, error: fieldsError } = await supabase
      .from('form_fields')
      .select('*')
      .eq('form_id', form.id)
      .order('order_index');

    if (fieldsError) {
      return new Response(JSON.stringify({ ok: false, error: 'Failed to validate form' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validate required fields
    const requiredFields = fields?.filter(field => field.required) || [];
    for (const field of requiredFields) {
      if (!data[field.field_name] || (Array.isArray(data[field.field_name]) && data[field.field_name].length === 0)) {
        return new Response(JSON.stringify({ ok: false, error: `${field.label} is required` }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Insert submission
    const { error: insertError } = await supabase
      .from('form_submissions')
      .insert({
        form_id: form.id,
        data
      });

    if (insertError) {
      console.error('Submission insert error:', insertError);
      return new Response(JSON.stringify({ ok: false, error: 'Failed to submit form' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Update throttle
    submissionThrottle.set(clientAddress || 'unknown', now);

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Form submission error:', error);
    return new Response(JSON.stringify({ ok: false, error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
