import type { APIRoute } from 'astro';
import { supabaseAdmin } from '../../../lib/supabase-admin';

export const prerender = false;

export const GET: APIRoute = async ({ request, url }) => {
  try {
    if (!supabaseAdmin) {
      return new Response(JSON.stringify({ error: 'Service unavailable' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const searchParams = url.searchParams;
    const formId = searchParams.get('id');
    const includeFields = searchParams.get('includeFields') === 'true';

    if (formId) {
      // Get specific form
      const { data: form, error: formError } = await supabaseAdmin
        .from('form_templates')
        .select('*')
        .eq('id', formId)
        .single();

      if (formError) {
        return new Response(JSON.stringify({ error: formError.message }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      if (includeFields) {
        // Get form fields
        const { data: fields, error: fieldsError } = await supabaseAdmin
          .from('form_fields')
          .select('*')
          .eq('form_id', formId)
          .order('field_order');

        if (fieldsError) {
          return new Response(JSON.stringify({ error: fieldsError.message }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        form.fields = fields;
      }

      return new Response(JSON.stringify({ success: true, data: form }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      // Get all forms
      const { data: forms, error } = await supabaseAdmin
        .from('form_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      return new Response(JSON.stringify({ success: true, data: forms }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error('Error in form-builder API:', error);
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
    const { name, description, category, template_type, is_active, fields } = body;

    // Create form template
    const { data: form, error: formError } = await supabaseAdmin
      .from('form_templates')
      .insert({
        name,
        description,
        category: category || 'general',
        template_type: template_type || 'blank',
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

    // Create form fields if provided
    if (fields && fields.length > 0) {
      const fieldsToInsert = fields.map((field: any, index: number) => ({
        form_id: form.id,
        field_type: field.field_type,
        field_name: field.field_name,
        field_label: field.field_label,
        placeholder_text: field.placeholder_text,
        help_text: field.help_text,
        is_required: field.is_required || false,
        field_order: field.field_order !== undefined ? field.field_order : index,
        field_options: field.field_options,
        validation_rules: field.validation_rules,
        conditional_logic: field.conditional_logic
      }));

      const { error: fieldsError } = await supabaseAdmin
        .from('form_fields')
        .insert(fieldsToInsert);

      if (fieldsError) {
        // Rollback form creation if fields creation fails
        await supabaseAdmin.from('form_templates').delete().eq('id', form.id);
        return new Response(JSON.stringify({ error: fieldsError.message }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    return new Response(JSON.stringify({ success: true, data: form }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error creating form:', error);
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

    const body = await request.json();
    const { id, name, description, category, template_type, is_active, fields } = body;

    if (!id) {
      return new Response(JSON.stringify({ error: 'Form ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Update form template
    const { data: form, error: formError } = await supabaseAdmin
      .from('form_templates')
      .update({
        name,
        description,
        category,
        template_type,
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

    // Update form fields if provided
    if (fields) {
      // Delete existing fields
      await supabaseAdmin.from('form_fields').delete().eq('form_id', id);

      // Insert new fields
      if (fields.length > 0) {
        const fieldsToInsert = fields.map((field: any, index: number) => ({
          form_id: id,
          field_type: field.field_type,
          field_name: field.field_name,
          field_label: field.field_label,
          placeholder_text: field.placeholder_text,
          help_text: field.help_text,
          is_required: field.is_required || false,
          field_order: field.field_order !== undefined ? field.field_order : index,
          field_options: field.field_options,
          validation_rules: field.validation_rules,
          conditional_logic: field.conditional_logic
        }));

        const { error: fieldsError } = await supabaseAdmin
          .from('form_fields')
          .insert(fieldsToInsert);

        if (fieldsError) {
          return new Response(JSON.stringify({ error: fieldsError.message }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }
    }

    return new Response(JSON.stringify({ success: true, data: form }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error updating form:', error);
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

    const searchParams = url.searchParams;
    const formId = searchParams.get('id');

    if (!formId) {
      return new Response(JSON.stringify({ error: 'Form ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Delete form (fields will be deleted automatically due to CASCADE)
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

    return new Response(JSON.stringify({ success: true, message: 'Form deleted successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error deleting form:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};