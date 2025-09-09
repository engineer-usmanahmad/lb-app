// src/pages/api/admin/blog.ts
import type { APIRoute } from "astro";
import { createClient } from "@supabase/supabase-js";

// Prefer service role on the server; fall back to anon if needed.
const SUPABASE_URL = import.meta.env.SUPABASE_URL as string;
const SUPABASE_SERVICE_ROLE_KEY =
  (import.meta.env.SUPABASE_SERVICE_ROLE_KEY as string | undefined) ??
  (import.meta.env.SUPABASE_ANON_KEY as string);

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.warn(
    "[blog API] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY/ANON env vars. " +
      "Inserts may fail if RLS is enabled.",
  );
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export const prerender = false;

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function isUUID(v: string | null | undefined) {
  return (
    !!v &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      v,
    )
  );
}

async function parseBody(request: Request) {
  const ct = request.headers.get("content-type") || "";
  let body: any = {};

  if (ct.includes("application/json")) {
    body = await request.json();
  } else if (
    ct.includes("multipart/form-data") ||
    ct.includes("application/x-www-form-urlencoded")
  ) {
    const fd = await request.formData();
    fd.forEach((v, k) => (body[k] = v));
  } else {
    // Try JSON as a fallback
    try {
      body = await request.json();
    } catch {
      body = {};
    }
  }
  return body;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await parseBody(request);

    const title = (body.title ?? "").toString().trim();
    let slug = (body.slug ?? "").toString().trim();
    const excerpt = body.excerpt ? String(body.excerpt) : null;

    // Your schema uses "content" and "featured_image".
    // Accept alternative keys just in case (content_md / cover_image).
    const content = (body.content ?? body.content_md ?? "").toString();
    const featured_image =
      (body.featured_image ?? body.cover_image ?? "") || null;

    // Author is optional; only set if it's a valid UUID
    const author_id = isUUID(body.author_id) ? String(body.author_id) : null;

    // Status/publish handling
    const rawStatus = (body.status ?? "").toString().toLowerCase();
    const isPublishedFlag =
      typeof body.is_published === "boolean"
        ? (body.is_published as boolean)
        : undefined;

    const status =
      isPublishedFlag === true
        ? "published"
        : isPublishedFlag === false
          ? "draft"
          : ["draft", "published", "archived"].includes(rawStatus)
            ? (rawStatus as "draft" | "published" | "archived")
            : "draft";

    const published_at =
      status === "published"
        ? body.published_at
          ? new Date(body.published_at).toISOString()
          : new Date().toISOString()
        : null;

    // Validation
    if (!title || !content) {
      return new Response(
        JSON.stringify({ error: "Title and content are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }
    if (!slug) slug = slugify(title);

    const { data, error } = await supabase
      .from("blog_posts")
      .insert([
        {
          title,
          slug,
          excerpt,
          content,
          featured_image,
          author_id, // may be null
          status,
          published_at,
        },
      ])
      .select("id, slug")
      .maybeSingle();

    if (error) {
      console.error("Supabase insert error:", error);
      const msg = (error as any).message || "";
      const code = (error as any).code;

      // Duplicate slug
      if (code === "23505" || /duplicate key value/.test(msg)) {
        return new Response(JSON.stringify({ error: "Duplicate slug" }), {
          status: 409,
          headers: { "Content-Type": "application/json" },
        });
      }
      // FK violation
      if (code === "23503" || /foreign key/.test(msg)) {
        return new Response(
          JSON.stringify({ error: "Invalid author_id (foreign key)" }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }

      return new Response(
        JSON.stringify({ error: "Database error", details: msg }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    return new Response(JSON.stringify({ success: true, data }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Blog creation error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: err?.message }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
};

export const PUT: APIRoute = async ({ request }) => {
  try {
    const body = await parseBody(request);

    const id = (body.id ?? "").toString().trim();
    if (!isUUID(id)) {
      return new Response(
        JSON.stringify({ error: "Valid post ID is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const title = body.title ? String(body.title).trim() : undefined;
    const slug = body.slug ? String(body.slug).trim() : undefined;
    const excerpt =
      body.excerpt !== undefined ? String(body.excerpt) : undefined;

    // Accept alternative keys as well
    const content =
      body.content !== undefined
        ? String(body.content)
        : body.content_md !== undefined
          ? String(body.content_md)
          : undefined;

    const featured_image =
      body.featured_image !== undefined
        ? body.featured_image || null
        : body.cover_image !== undefined
          ? body.cover_image || null
          : undefined;

    const author_id =
      body.author_id !== undefined
        ? isUUID(body.author_id)
          ? String(body.author_id)
          : null
        : undefined;

    // Status/publish handling
    let status: "draft" | "published" | "archived" | undefined = undefined;
    let published_at: string | null | undefined = undefined;

    const rawStatus = body.status
      ? String(body.status).toLowerCase()
      : undefined;
    const isPublishedFlag =
      typeof body.is_published === "boolean"
        ? (body.is_published as boolean)
        : undefined;

    if (isPublishedFlag === true) {
      status = "published";
      published_at = body.published_at
        ? new Date(body.published_at).toISOString()
        : new Date().toISOString();
    } else if (isPublishedFlag === false) {
      status = "draft";
      published_at = null;
    } else if (
      rawStatus &&
      ["draft", "published", "archived"].includes(rawStatus)
    ) {
      status = rawStatus as any;
      if (status === "published") {
        published_at = body.published_at
          ? new Date(body.published_at).toISOString()
          : new Date().toISOString();
      } else {
        published_at = null;
      }
    }

    // Build update patch (only defined keys)
    const patch: Record<string, any> = {};
    if (title !== undefined) patch.title = title;
    if (slug !== undefined) patch.slug = slug;
    if (excerpt !== undefined) patch.excerpt = excerpt;
    if (content !== undefined) patch.content = content;
    if (featured_image !== undefined) patch.featured_image = featured_image;
    if (author_id !== undefined) patch.author_id = author_id;
    if (status !== undefined) patch.status = status;
    if (published_at !== undefined) patch.published_at = published_at;

    if (Object.keys(patch).length === 0) {
      return new Response(JSON.stringify({ error: "No fields to update" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { data, error } = await supabase
      .from("blog_posts")
      .update(patch)
      .eq("id", id)
      .select("id, slug")
      .maybeSingle();

    if (error) {
      console.error("Supabase update error:", error);
      const msg = (error as any).message || "";
      const code = (error as any).code;

      if (code === "23505" || /duplicate key value/.test(msg)) {
        return new Response(JSON.stringify({ error: "Duplicate slug" }), {
          status: 409,
          headers: { "Content-Type": "application/json" },
        });
      }
      if (code === "23503" || /foreign key/.test(msg)) {
        return new Response(
          JSON.stringify({ error: "Invalid author_id (foreign key)" }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }

      return new Response(
        JSON.stringify({ error: "Database error", details: msg }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Blog update error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: err?.message }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
};

export const DELETE: APIRoute = async ({ request, url }) => {
  try {
    // Support id via query (?id=...) or JSON body { id } or form-data
    let id = url.searchParams.get("id");

    if (!id) {
      const ct = request.headers.get("content-type") || "";
      if (ct.includes("application/json")) {
        const body = await request.json().catch(() => ({}));
        if ((body as any)?.id) id = String((body as any).id);
      } else if (
        ct.includes("multipart/form-data") ||
        ct.includes("application/x-www-form-urlencoded")
      ) {
        const fd = await request.formData();
        if (fd.get("id")) id = String(fd.get("id"));
      }
    }

    if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
      return new Response(
        JSON.stringify({ error: "Valid post ID is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const { data, error } = await supabase
      .from("blog_posts")
      .delete()
      .eq("id", id)
      .select("id")
      .maybeSingle();

    if (error) {
      console.error("Supabase delete error:", error);
      return new Response(
        JSON.stringify({
          error: "Database error",
          details: (error as any).message,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    if (!data) {
      return new Response(JSON.stringify({ error: "Post not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Blog delete error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: err?.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};
