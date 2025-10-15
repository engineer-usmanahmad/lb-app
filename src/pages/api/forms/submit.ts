
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
    const { formSlug, data, form_id, submission_data } = body;

    // Handle new form builder submissions
    if (form_id && submission_data) {
      // Verify form exists and is active
      const { data: form, error: formError } = await supabase
        .from('form_templates')
        .select('id, name')
        .eq('id', form_id)
        .eq('is_active', true)
        .single();

      if (formError || !form) {
        return new Response(JSON.stringify({ ok: false, error: 'Form not found or inactive' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Fetch fields for validation
      const { data: fields, error: fieldsError } = await supabase
        .from('form_fields')
        .select('id, field_type, label, is_required, validation')
        .eq('form_id', form_id)
        .order('field_order');

      if (fieldsError) {
        return new Response(JSON.stringify({ ok: false, error: 'Failed to validate form fields' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Helper to get value for a field from the submission_data payload
      const getValueForField = (field: any) => {
        const payload: any = submission_data || {};

        // Try exact label key
        if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
          // Common public form: name is "field_<id>"
          const idKey = `field_${field.id}`;
          if (Object.prototype.hasOwnProperty.call(payload, idKey)) {
            return payload[idKey];
          }

          if (Object.prototype.hasOwnProperty.call(payload, field.label)) {
            return payload[field.label];
          }
          // Try normalized label key (lowercase, non-alphanumeric to underscore)
          const normalized = String(field.label)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '_')
            .replace(/^_|_$/g, '');
          if (Object.prototype.hasOwnProperty.call(payload, normalized)) {
            return payload[normalized];
          }
          // If payload has a fields array, search by label or id
          if (Array.isArray(payload.fields)) {
            const found = payload.fields.find((f: any) => 
              (f.label && String(f.label) === field.label) || (f.id && f.id === field.id)
            );
            if (found) return found.value ?? found.response ?? found.answer ?? null;
          }
        }

        // If payload itself is an array of responses
        if (Array.isArray(payload)) {
          const found = payload.find((f: any) => 
            (f.label && String(f.label) === field.label) || (f.id && f.id === field.id)
          );
          if (found) return found.value ?? found.response ?? found.answer ?? null;
        }

        return null;
      };

      // Validate required fields, including rating
      const missing: string[] = [];
      const invalid: string[] = [];
      for (const field of (fields || [])) {
        if (field.is_required) {
          const value = getValueForField(field);
          const isEmptyArray = Array.isArray(value) && value.length === 0;
          const isEmptyString = typeof value === 'string' && value.trim() === '';
          const isNullish = value === null || value === undefined;
          if (isNullish || isEmptyString || isEmptyArray) {
            missing.push(field.label);
            continue;
          }
        }

        // Rating-specific validation: must be a number >= 1
        // Treat empty string as "no value" so optional ratings aren't flagged
        if (String(field.field_type).toLowerCase() === 'rating') {
          const value = getValueForField(field);
          const hasValue = (
            value !== null &&
            value !== undefined &&
            !(typeof value === 'string' && value.trim() === '')
          );
          if (hasValue) {
            const num = typeof value === 'number' ? value : parseFloat(String(value));
            if (Number.isNaN(num) || num < 1) {
              invalid.push(`${field.label} must be at least 1 star`);
            }
          } else if (field.is_required) {
            missing.push(field.label);
          }
        }
      }

      if (missing.length > 0 || invalid.length > 0) {
        return new Response(JSON.stringify({ 
          ok: false, 
          error: `Please complete required fields. ${missing.length ? 'Missing: ' + missing.join(', ') + '. ' : ''}${invalid.length ? 'Invalid: ' + invalid.join(', ') + '.' : ''}`
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Insert form submission
      const { data: submission, error: submissionError } = await supabase
        .from('form_submissions')
        .insert({
          form_id,
          submission_data,
          submitted_at: new Date().toISOString()
        })
        .select()
        .single();

      if (submissionError) {
        console.error('Error creating submission:', submissionError);
        return new Response(JSON.stringify({ ok: false, error: 'Failed to submit form' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      submissionThrottle.set(clientAddress || 'unknown', now);
      return new Response(JSON.stringify({ 
        ok: true, 
        submission_id: submission.id 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Handle legacy form submissions
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
