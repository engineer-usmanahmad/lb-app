import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
dotenv.config();

// Read environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env file');
  console.log('Please check your .env file contains:');
  console.log('SUPABASE_URL=your-supabase-url');
  console.log('SUPABASE_SERVICE_ROLE_KEY=your-service-role-key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  try {
    console.log('Reading migration file...');
    const migrationSQL = readFileSync(join(__dirname, 'supabase/manual-scripts/add-active-column-events.sql'), 'utf8');
    
    console.log('Applying migration to add active column to events table...');
    
    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`Executing: ${statement.substring(0, 50)}...`);
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          // Try direct query if RPC fails
          const { error: directError } = await supabase
            .from('_temp')
            .select('*')
            .limit(0);
          
          // If that fails too, try using the raw query
          console.log('Trying direct SQL execution...');
          const { error: rawError } = await supabase.rpc('exec', { sql: statement });
          
          if (rawError) {
            console.error('Error executing statement:', rawError);
            throw rawError;
          }
        }
      }
    }
    
    console.log('Migration applied successfully!');
    
    // Verify the column was added
    console.log('Verifying the active column was added...');
    const { data, error } = await supabase
      .from('events')
      .select('id, title, active')
      .limit(1);
    
    if (error) {
      console.error('Error verifying migration:', error);
    } else {
      console.log('✅ Migration verified! The active column is now available.');
      if (data && data.length > 0) {
        console.log('Sample event data:', data[0]);
      }
    }
    
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Alternative approach using direct SQL execution
async function applyMigrationDirect() {
  try {
    console.log('Applying migration using direct approach...');
    
    // Check if column already exists
    console.log('Checking if active column already exists...');
    const { data: existingEvents, error: checkError } = await supabase
      .from('events')
      .select('active')
      .limit(1);
    
    if (!checkError) {
      console.log('✅ Active column already exists! Migration not needed.');
      return;
    }
    
    console.log('Active column does not exist, proceeding with migration...');
    
    // Use Supabase's built-in query method for DDL operations
    const { error: addColumnError } = await supabase
      .rpc('exec_sql', { sql: 'ALTER TABLE events ADD COLUMN active BOOLEAN DEFAULT true;' })
      .then(() => ({ error: null }))
      .catch(async () => {
        // Try alternative approach using raw SQL
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'apikey': supabaseServiceKey
          },
          body: JSON.stringify({
            sql: 'ALTER TABLE events ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;'
          })
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return { error: null };
      });
    
    if (addColumnError) {
      console.error('Error adding column:', addColumnError);
      throw addColumnError;
    }
    
    console.log('Column added successfully, updating existing events...');
    
    // Update existing events to be active by default
    const { error: updateError } = await supabase
      .from('events')
      .update({ active: true })
      .is('active', null);
    
    if (updateError) {
      console.log('Note: Could not update existing events (they may already have values):', updateError.message);
    } else {
      console.log('Updated existing events to be active by default');
    }
    
    console.log('✅ Migration completed successfully!');
    
    // Verify the migration worked
    const { data: verifyData, error: verifyError } = await supabase
      .from('events')
      .select('id, title, active')
      .limit(3);
    
    if (verifyError) {
      console.error('Error verifying migration:', verifyError);
    } else {
      console.log('✅ Verification successful! Sample data:');
      console.log(verifyData);
    }
    
  } catch (error) {
    console.error('Direct migration failed:', error);
    throw error;
  }
}

// Run the migration
console.log('Starting database migration...');
applyMigrationDirect().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});