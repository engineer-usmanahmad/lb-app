import type { APIRoute } from 'astro';
import { registerUser, createUserSession } from '../../../lib/auth';

export const prerender = false;

export const POST: APIRoute = async ({ request, clientAddress }) => {
  try {
    const formData = await request.formData();
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const firstName = formData.get('first_name') as string;
    const lastName = formData.get('last_name') as string;
    const phone = formData.get('phone') as string;

    // Validation
    if (!email || !password || !firstName || !lastName) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'All required fields must be filled' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (password.length < 8) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Password must be at least 8 characters long' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const user = await registerUser({
      email,
      password,
      first_name: firstName,
      last_name: lastName,
      phone: phone || undefined
    });

    if (!user) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Email already exists or registration failed' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const userAgent = request.headers.get('user-agent') || '';
    const sessionToken = await createUserSession(user.id, clientAddress, userAgent);
    if (!sessionToken) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Registration successful but failed to create session' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        is_verified: user.is_verified
      }
    }), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': `session=${sessionToken}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${7 * 24 * 60 * 60}` // 7 days
      }
    });

  } catch (error) {
    console.error('User signup error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Internal server error' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};