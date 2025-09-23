// src/pages/api/admin/success-stories/bulk-upload.ts
import type { APIRoute } from 'astro';
import { s3Uploader } from '../../../../utils/s3-upload';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const files = formData.getAll('images') as File[];
    const eventTitle = formData.get('event_title') as string || 'bulk_upload';

    if (!files || files.length === 0) {
      return new Response(JSON.stringify({ error: 'No files provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Initialize S3 uploader
    const initialized = await s3Uploader.initialize();
    if (!initialized) {
      return new Response(JSON.stringify({ error: 'AWS S3 not configured. Please configure S3 settings in admin panel.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const results = [];
    const errors = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        errors.push(`File ${i + 1}: Invalid file type. Only JPEG, PNG, and WebP are allowed.`);
        continue;
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        errors.push(`File ${i + 1}: File size too large. Maximum 10MB allowed.`);
        continue;
      }

      try {
        // Use a generic student name for bulk uploads
        const studentName = `bulk_${eventTitle}_${i + 1}`;
        const uploadResult = await s3Uploader.uploadSuccessStoryImage(file, studentName);
        
        if (uploadResult.success) {
          results.push({
            fileName: file.name,
            url: uploadResult.url,
            size: file.size
          });
        } else {
          errors.push(`File ${i + 1} (${file.name}): ${uploadResult.error}`);
        }
      } catch (error: any) {
        errors.push(`File ${i + 1} (${file.name}): ${error.message || 'Upload failed'}`);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      uploaded: results.length,
      total: files.length,
      results,
      errors: errors.length > 0 ? errors : undefined
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Bulk upload error:', error);
    return new Response(JSON.stringify({ error: 'Bulk upload failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};