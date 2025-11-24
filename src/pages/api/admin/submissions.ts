
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

    const form_id = url.searchParams.get('form_id');
    const count_only = url.searchParams.get('count_only') === 'true';
    const from_date = url.searchParams.get('from_date');
    const to_date = url.searchParams.get('to_date');
    
    // If no form_id and count_only is true, return counts for all forms
    if (count_only && !form_id) {
      // First get all unique form_ids
      const { data: formIds, error: formIdsError } = await supabaseAdmin
        .from('form_submissions')
        .select('form_id')
        .order('form_id');
      
      if (formIdsError) {
        console.error('Form IDs fetch error:', formIdsError);
        return new Response(JSON.stringify({ error: 'Failed to fetch form IDs' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // Get unique form_ids
      const uniqueFormIds = [...new Set(formIds?.map(item => item.form_id) || [])];
      
      // Count submissions for each form_id
      const formCounts = [];
      for (const formId of uniqueFormIds) {
        const { count, error: countError } = await supabaseAdmin
          .from('form_submissions')
          .select('*', { count: 'exact', head: true })
          .eq('form_id', formId);
        
        if (countError) {
          console.error(`Count error for form ${formId}:`, countError);
          formCounts.push({ form_id: formId, count: 0 });
        } else {
          formCounts.push({ form_id: formId, count: count || 0 });
        }
      }
      
      return new Response(JSON.stringify({ success: true, data: formCounts }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (!form_id) {
      return new Response(JSON.stringify({ error: 'Form ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // If count_only is true, return only the count for the specified form
    if (count_only) {
      let countQuery = supabaseAdmin
        .from('form_submissions')
        .select('*', { count: 'exact', head: true })
        .eq('form_id', form_id);

      // Optional date range filtering for count
      if (from_date) {
        countQuery = countQuery.gte('submitted_at', from_date);
      }
      if (to_date) {
        // Include the entire day by ending at 23:59:59 of to_date
        const toEnd = new Date(to_date);
        toEnd.setHours(23, 59, 59, 999);
        countQuery = countQuery.lte('submitted_at', toEnd.toISOString());
      }

      const { count, error: countError } = await countQuery;
      
      if (countError) {
        console.error('Submissions count error:', countError);
        return new Response(JSON.stringify({ error: 'Failed to fetch submission count' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      return new Response(JSON.stringify({ success: true, count }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    let query = supabaseAdmin
      .from('form_submissions')
      .select('*')
      .eq('form_id', form_id);

    // Optional date range filtering
    if (from_date) {
      query = query.gte('submitted_at', from_date);
    }
    if (to_date) {
      const toEnd = new Date(to_date);
      toEnd.setHours(23, 59, 59, 999);
      query = query.lte('submitted_at', toEnd.toISOString());
    }

    const { data: submissions, error } = await query.order('submitted_at', { ascending: false });

    if (error) {
      console.error('Submissions fetch error:', error);
      return new Response(JSON.stringify({ error: 'Failed to fetch submissions' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ success: true, data: submissions }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Submissions API error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    if (!supabaseAdmin) {
      return new Response(JSON.stringify({ error: 'Service unavailable' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const body = await request.json();
    const { form_id, submission_data } = body;

    if (!form_id || !submission_data) {
      return new Response(JSON.stringify({ error: 'form_id and submission_data are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Insert the submission
    const { data, error } = await supabaseAdmin
      .from('form_submissions')
      .insert({
        form_id,
        submission_data,
        submitted_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating submission:', error);
      return new Response(JSON.stringify({ error: 'Failed to create submission' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ success: true, data }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Submissions POST API error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
