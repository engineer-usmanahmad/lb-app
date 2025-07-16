import type { APIRoute } from 'astro';
import { logoutUser, logoutAdmin } from '../../../lib/auth';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const cookies = request.headers.get('cookie');
    const sessionToken = cookies?.split(';')
      .find(c => c.trim().startsWith('session='))
      ?.split('=')[1];
    
    const adminToken = cookies?.split(';')
      .find(c => c.trim().startsWith('admin_session='))
      ?.split('=')[1];

    let success = false;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (sessionToken) {
      success = await logoutUser(sessionToken);
      headers['Set-Cookie'] = 'session=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0';
    }

    if (adminToken) {
      success = await logoutAdmin(adminToken);
      headers['Set-Cookie'] = 'admin_session=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0';
    }

    return new Response(JSON.stringify({ success }), {
      status: 200,
      headers
    });

  } catch (error) {
    console.error('Logout error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Internal server error' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};