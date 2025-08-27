
import type { APIRoute } from 'astro';
import { supabaseAdmin } from '../../../lib/supabase-admin';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    if (!supabaseAdmin) {
      return new Response(JSON.stringify({ error: 'Service unavailable' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const formData = await request.formData();
    const form_id = formData.get('form_id') as string;
    const label = formData.get('label') as string;
    const field_name = formData.get('field_name') as string;
    const field_type = formData.get('field_type') as string;
    const required = formData.get('required') === 'true';
    const options = formData.get('options') as string;
    const order_index = parseInt(formData.get('order_index') as string) || 0;

    if (!form_id || !label || !field_name || !field_type) {
      return new Response(JSON.stringify({ error: 'Required fields missing' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const optionsArray = options ? options.split(',').map(opt => opt.trim()).filter(Boolean) : [];

    const { data, error } = await supabaseAdmin
      .from('form_fields')
      .insert({
        form_id,
        label,
        field_name: field_name.toLowerCase().replace(/[^a-z0-9_]/g, '_'),
        field_type,
        required,
        options: optionsArray,
        order_index
      })
      .select()
      .single();

    if (error) {
      console.error('Field creation error:', error);
      return new Response(JSON.stringify({ error: 'Failed to create field' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ success: true, data }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Field API error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const PUT: APIRoute = async ({ request }) => {
  try {
    if (!supabaseAdmin) {
      return new Response(JSON.stringify({ error: 'Service unavailable' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const formData = await request.formData();
    const id = formData.get('id') as string;
    const label = formData.get('label') as string;
    const field_name = formData.get('field_name') as string;
    const field_type = formData.get('field_type') as string;
    const required = formData.get('required') === 'true';
    const options = formData.get('options') as string;
    const order_index = parseInt(formData.get('order_index') as string) || 0;

    if (!id || !label || !field_name || !field_type) {
      return new Response(JSON.stringify({ error: 'Required fields missing' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const optionsArray = options ? options.split(',').map(opt => opt.trim()).filter(Boolean) : [];

    const { data, error } = await supabaseAdmin
      .from('form_fields')
      .update({
        label,
        field_name: field_name.toLowerCase().replace(/[^a-z0-9_]/g, '_'),
        field_type,
        required,
        options: optionsArray,
        order_index
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Field update error:', error);
      return new Response(JSON.stringify({ error: 'Failed to update field' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Field API error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const DELETE: APIRoute = async ({ request, url }) => {
  try {
    if (!supabaseAdmin) {
      return new Response(JSON.stringify({ error: 'Service unavailable' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const id = url.searchParams.get('id');
    if (!id) {
      return new Response(JSON.stringify({ error: 'Field ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { error } = await supabaseAdmin
      .from('form_fields')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Field deletion error:', error);
      return new Response(JSON.stringify({ error: 'Failed to delete field' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Field API error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
