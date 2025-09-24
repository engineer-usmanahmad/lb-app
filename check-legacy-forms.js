import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkLegacyForms() {
  try {
    console.log('Checking for existing forms in legacy system...');
    
    // Check legacy forms table
    const { data: legacyForms, error: formsError } = await supabase
      .from('forms')
      .select('*')
      .order('created_at', { ascending: false });

    if (formsError) {
      console.log('Legacy forms table might not exist or is empty:', formsError.message);
    } else {
      console.log(`Found ${legacyForms?.length || 0} forms in legacy system:`);
      legacyForms?.forEach(form => {
        console.log(`- ${form.name} (${form.slug}) - ${form.is_active ? 'Active' : 'Inactive'}`);
      });
    }

    // Check legacy form fields
    if (legacyForms && legacyForms.length > 0) {
      for (const form of legacyForms) {
        const { data: fields, error: fieldsError } = await supabase
          .from('form_fields')
          .select('*')
          .eq('form_id', form.id)
          .order('order_index');

        if (fieldsError) {
          console.log(`Error fetching fields for form ${form.name}:`, fieldsError.message);
        } else {
          console.log(`  Fields for "${form.name}": ${fields?.length || 0} fields`);
          fields?.forEach(field => {
            console.log(`    - ${field.label} (${field.field_type}) ${field.required ? '- Required' : ''}`);
          });
        }
      }
    }

    // Check new form builder system
    console.log('\nChecking new Form Builder system...');
    const { data: newForms, error: newFormsError } = await supabase
      .from('form_templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (newFormsError) {
      console.log('Form Builder table error:', newFormsError.message);
    } else {
      console.log(`Found ${newForms?.length || 0} forms in Form Builder system:`);
      newForms?.forEach(form => {
        console.log(`- ${form.name} - ${form.is_active ? 'Active' : 'Inactive'}`);
      });
    }

  } catch (error) {
    console.error('Error checking forms:', error);
  }
}

checkLegacyForms();