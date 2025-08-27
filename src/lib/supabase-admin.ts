
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseServiceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAnonKey = import.meta.env.SUPABASE_ANON_KEY || '';

// Use service role key if available, otherwise fall back to anon key
const keyToUse = supabaseServiceKey || supabaseAnonKey;

export const supabaseAdmin = supabaseUrl && keyToUse 
  ? createClient(supabaseUrl, keyToUse)
  : null;
