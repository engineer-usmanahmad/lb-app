import type { MiddlewareHandler } from 'astro';
import { verifyUserSession, verifyAdminSession } from '../lib/auth';

export const onRequest: MiddlewareHandler = async ({ request, redirect, locals, url }) => {
  // Get session token from cookies
  const cookies = request.headers.get('cookie');
  const sessionToken = cookies?.split(';')
    .find(c => c.trim().startsWith('session='))
    ?.split('=')[1];

  const adminToken = cookies?.split(';')
    .find(c => c.trim().startsWith('admin_session='))
    ?.split('=')[1];

  // Admin routes protection
  if (url.pathname.startsWith('/admin/')) {
    if (url.pathname === '/admin/login') {
      // Allow access to login page
      return;
    }

    if (!adminToken) {
      return redirect('/admin/login');
    }

    const adminUser = await verifyAdminSession(adminToken);
    if (!adminUser) {
      return redirect('/admin/login');
    }

    locals.admin = adminUser;
    return;
  }

  // User authenticated routes
  if (url.pathname.startsWith('/dashboard/')) {
    if (!sessionToken) {
      return redirect('/auth/login');
    }

    const user = await verifyUserSession(sessionToken);
    if (!user) {
      return redirect('/auth/login');
    }

    locals.user = user;
    return;
  }

  // Set user in locals if authenticated (for conditional rendering)
  if (sessionToken) {
    const user = await verifyUserSession(sessionToken);
    if (user) {
      locals.user = user;
    }
  }

  if (adminToken) {
    const admin = await verifyAdminSession(adminToken);
    if (admin) {
      locals.admin = admin;
    }
  }

  // Continue to the next middleware or route handler
  return;
};