import { defineMiddleware } from "astro/middleware";
import { verifyUserSession, verifyAdminSession } from "../lib/auth";

export const onRequest = defineMiddleware(async ({ request, redirect, locals, url }, next) => {
  const cookies = request.headers.get("cookie");
  const sessionToken = cookies?.split(";")
    .find(c => c.trim().startsWith("session="))
    ?.split("=")[1];

  const adminToken = cookies?.split(";")
    .find(c => c.trim().startsWith("admin_session="))
    ?.split("=")[1];

  // Admin routes protection
  if (url.pathname.startsWith("/admin/")) {
    if (url.pathname === "/admin/login") {
      return next(); // allow access
    }

    if (!adminToken) {
      return redirect("/admin/login");
    }

    const adminUser = await verifyAdminSession(adminToken);
    if (!adminUser) {
      return redirect("/admin/login");
    }

    locals.admin = adminUser;
    return next();
  }

  // User routes protection
  if (url.pathname.startsWith("/dashboard/")) {
    if (!sessionToken) {
      return redirect("/auth/login");
    }

    const user = await verifyUserSession(sessionToken);
    if (!user) {
      return redirect("/auth/login");
    }

    locals.user = user;
    return next();
  }

  // Set optional locals for non-protected routes
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

  return next(); // ✅ let Astro handle rendering
});

