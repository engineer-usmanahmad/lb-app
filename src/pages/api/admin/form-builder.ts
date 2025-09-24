import type { APIRoute } from 'astro';
import { supabaseAdmin } from '../../../lib/supabase-admin';

export const GET: APIRoute = async ({ request }) => {
  if (!supabaseAdmin) {
    return new Response(JSON.stringify({ error: 'Database service unavailable' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const url = new URL(request.url);
  const formId = url.searchParams.get('id');

  try {
    if (formId) {
      // Get specific form with fields and submission count
      const { data: form, error: formError } = await supabaseAdmin
        .from('form_templates')
        .select('*')
        .eq('id', formId)
        .single();

      if (formError) {
        return new Response(JSON.stringify({ error: 'Form not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const { data: fields, error: fieldsError } = await supabaseAdmin
        .from('form_fields')
        .select('*')
        .eq('form_id', formId)
        .order('field_order');

      if (fieldsError) {
        return new Response(JSON.stringify({ error: 'Failed to fetch fields' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Get submission count
      const { count: submissionCount, error: countError } = await supabaseAdmin
        .from('form_submissions')
        .select('*', { count: 'exact', head: true })
        .eq('form_id', formId);

      return new Response(JSON.stringify({ 
        form: { ...form, submission_count: submissionCount || 0 }, 
        fields: fields || [] 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      // Get all forms with submission counts
      const { data: forms, error } = await supabaseAdmin
        .from('form_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        return new Response(JSON.stringify({ error: 'Failed to fetch forms' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Get submission counts for all forms
      const formsWithCounts = await Promise.all(
        (forms || []).map(async (form) => {
          const { count: submissionCount } = await supabaseAdmin
            .from('form_submissions')
            .select('*', { count: 'exact', head: true })
            .eq('form_id', form.id);
          
          return { ...form, submission_count: submissionCount || 0 };
        })
      );

      return new Response(JSON.stringify({ forms: formsWithCounts }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  if (!supabaseAdmin) {
    return new Response(JSON.stringify({ error: 'Database service unavailable' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await request.json();
    const { name, description, category, template, is_active, fields } = body;

    // Start a transaction by creating the form first
    const { data: form, error: formError } = await supabaseAdmin
      .from('form_templates')
      .insert({
        name,
        description,
        category: category || 'general',
        template: template || 'standard',
        is_active: is_active !== undefined ? is_active : true
      })
      .select()
      .single();

    if (formError) {
      return new Response(JSON.stringify({ error: formError.message }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // If fields are provided, insert them
    if (fields && fields.length > 0) {
      const fieldsToInsert = fields.map((field: any, index: number) => ({
        form_id: form.id,
        field_type: field.field_type,
        label: field.label,
        placeholder: field.placeholder,
        is_required: field.is_required || false,
        field_order: field.field_order !== undefined ? field.field_order : index,
        options: field.options || null,
        validation: field.validation || null,
        conditional_logic: field.conditional_logic || null
      }));

      const { data: insertedFields, error: fieldsError } = await supabaseAdmin
        .from('form_fields')
        .insert(fieldsToInsert)
        .select();

      if (fieldsError) {
        // Rollback: delete the form if field insertion fails
        await supabaseAdmin
          .from('form_templates')
          .delete()
          .eq('id', form.id);

        return new Response(JSON.stringify({ error: fieldsError.message }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      return new Response(JSON.stringify({ form, fields: insertedFields }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ form }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const PUT: APIRoute = async ({ request }) => {
  if (!supabaseAdmin) {
    return new Response(JSON.stringify({ error: 'Database service unavailable' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await request.json();
    const { id, name, description, category, template, is_active, fields } = body;

    if (!id) {
      return new Response(JSON.stringify({ error: 'Form ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Update the form template
    const { data: form, error: formError } = await supabaseAdmin
      .from('form_templates')
      .update({
        name,
        description,
        category,
        template,
        is_active
      })
      .eq('id', id)
      .select()
      .single();

    if (formError) {
      return new Response(JSON.stringify({ error: formError.message }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // If fields are provided, update them
    if (fields) {
      // Delete existing fields
      const { error: deleteError } = await supabaseAdmin
        .from('form_fields')
        .delete()
        .eq('form_id', id);

      if (deleteError) {
        return new Response(JSON.stringify({ error: deleteError.message }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Insert new fields
      if (fields.length > 0) {
        const fieldsToInsert = fields.map((field: any, index: number) => ({
          form_id: id,
          field_type: field.field_type,
          label: field.label,
          placeholder: field.placeholder,
          is_required: field.is_required || false,
          field_order: field.field_order !== undefined ? field.field_order : index,
          options: field.options || null,
          validation: field.validation || null,
          conditional_logic: field.conditional_logic || null
        }));

        const { data: insertedFields, error: fieldsError } = await supabaseAdmin
          .from('form_fields')
          .insert(fieldsToInsert)
          .select();

        if (fieldsError) {
          return new Response(JSON.stringify({ error: fieldsError.message }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        return new Response(JSON.stringify({ form, fields: insertedFields }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    return new Response(JSON.stringify({ form }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const DELETE: APIRoute = async ({ request }) => {
  if (!supabaseAdmin) {
    return new Response(JSON.stringify({ error: 'Database service unavailable' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const url = new URL(request.url);
    const formId = url.searchParams.get('id');

    if (!formId) {
      return new Response(JSON.stringify({ error: 'Form ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Delete the form (fields will be deleted automatically due to CASCADE)
    const { error } = await supabaseAdmin
      .from('form_templates')
      .delete()
      .eq('id', formId);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ message: 'Form deleted successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};