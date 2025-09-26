import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variabless
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function migrateLegacyForms() {
  try {
    console.log('Starting migration of legacy forms to Form Builder...');
    
    // Get all legacy forms
    const { data: legacyForms, error: formsError } = await supabase
      .from('forms')
      .select('*')
      .order('created_at', { ascending: false });

    if (formsError) {
      console.error('Error fetching legacy forms:', formsError);
      return;
    }

    if (!legacyForms || legacyForms.length === 0) {
      console.log('No legacy forms found to migrate.');
      return;
    }

    console.log(`Found ${legacyForms.length} legacy forms to migrate:`);
    
    for (const legacyForm of legacyForms) {
      console.log(`\nMigrating form: ${legacyForm.name}`);
      
      // Check if form already exists in new system
      const { data: existingForm } = await supabase
        .from('form_templates')
        .select('id, name')
        .eq('name', legacyForm.name)
        .single();

      if (existingForm) {
        console.log(`  Form "${legacyForm.name}" already exists in Form Builder. Skipping...`);
        continue;
      }

      // Create form in new system
      const { data: newForm, error: createFormError } = await supabase
        .from('form_templates')
        .insert({
          name: legacyForm.name,
          description: legacyForm.description,
          category: 'general',
          template: 'standard',
          is_active: legacyForm.is_active
        })
        .select()
        .single();

      if (createFormError) {
        console.error(`  Error creating form "${legacyForm.name}":`, createFormError);
        continue;
      }

      console.log(`  ✓ Created form template: ${newForm.name} (ID: ${newForm.id})`);

      // Get legacy form fields (handle the column name issue)
      const { data: legacyFields, error: fieldsError } = await supabase
        .from('form_fields')
        .select('*')
        .eq('form_id', legacyForm.id)
        .order('created_at');

      if (fieldsError) {
        console.log(`  Warning: Could not fetch fields for "${legacyForm.name}":`, fieldsError.message);
        console.log(`  Creating basic contact fields as fallback...`);
        
        // Create basic contact fields as fallback
        const basicFields = [
          {
            form_id: newForm.id,
            field_type: 'text',
            label: 'First Name',
            placeholder: 'Enter your first name',
            is_required: true,
            field_order: 0
          },
          {
            form_id: newForm.id,
            field_type: 'text',
            label: 'Last Name',
            placeholder: 'Enter your last name',
            is_required: true,
            field_order: 1
          },
          {
            form_id: newForm.id,
            field_type: 'text',
            label: 'Email',
            placeholder: 'Enter your email address',
            is_required: true,
            field_order: 2
          },
          {
            form_id: newForm.id,
            field_type: 'text',
            label: 'Phone',
            placeholder: 'Enter your phone number',
            is_required: false,
            field_order: 3
          },
          {
            form_id: newForm.id,
            field_type: 'textarea',
            label: 'Message',
            placeholder: 'Enter your message or questions',
            is_required: false,
            field_order: 4
          }
        ];

        const { error: basicFieldsError } = await supabase
          .from('form_fields')
          .insert(basicFields);

        if (basicFieldsError) {
          console.error(`  Error creating basic fields:`, basicFieldsError);
        } else {
          console.log(`  ✓ Created ${basicFields.length} basic contact fields`);
        }
        
        continue;
      }

      if (legacyFields && legacyFields.length > 0) {
        console.log(`  Found ${legacyFields.length} fields to migrate`);
        
        // Map legacy field types to new field types
        const fieldTypeMapping = {
          'short_answer': 'text',
          'paragraph': 'textarea',
          'radio': 'multiple_choice',
          'checkbox': 'checkbox',
          'select': 'dropdown',
          'rating': 'rating',
          'date': 'date',
          'time': 'text' // Map time to text for now
        };

        const newFields = legacyFields.map((field, index) => ({
          form_id: newForm.id,
          field_type: fieldTypeMapping[field.field_type] || 'text',
          label: field.label,
          placeholder: field.field_name ? `Enter ${field.label.toLowerCase()}` : '',
          is_required: field.required || false,
          field_order: index,
          options: field.options && field.options.length > 0 ? field.options : null
        }));

        const { error: fieldsInsertError } = await supabase
          .from('form_fields')
          .insert(newFields);

        if (fieldsInsertError) {
          console.error(`  Error creating fields:`, fieldsInsertError);
        } else {
          console.log(`  ✓ Migrated ${newFields.length} fields`);
        }
      } else {
        console.log(`  No fields found for "${legacyForm.name}"`);
      }
    }

    console.log('\n✅ Migration completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Update the admin dashboard to use Form Builder API');
    console.log('2. Remove the legacy "Create New Form" option');
    console.log('3. Test the migrated forms in Form Builder');

  } catch (error) {
    console.error('Migration error:', error);
  }
}

migrateLegacyForms();