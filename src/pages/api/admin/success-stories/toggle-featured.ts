// src/pages/api/admin/success-stories/toggle-featured.ts
import type { APIRoute } from "astro";
import { createClient } from "@supabase/supabase-js";

// Prefer service role on the server; fall back to anon if needed.
const SUPABASE_URL = import.meta.env.SUPABASE_URL as string;
const SUPABASE_SERVICE_ROLE_KEY =
  (import.meta.env.SUPABASE_SERVICE_ROLE_KEY as string | undefined) ??
  (import.meta.env.SUPABASE_ANON_KEY as string);

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const { id, is_featured } = await request.json();

    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing success story ID' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Update the featured status
    const { data, error } = await supabase
      .from('success_stories')
      .update({ 
        is_featured: is_featured,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Database update error:', error);
      return new Response(JSON.stringify({ error: 'Failed to update featured status' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Toggle featured error:', error);
    return new Response(JSON.stringify({ error: 'Failed to toggle featured status' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};