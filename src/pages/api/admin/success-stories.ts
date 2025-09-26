// src/pages/api/admin/success-stories.ts
import type { APIRoute } from "astro";
import { createClient } from "@supabase/supabase-js";
import AWS from 'aws-sdk';
import { s3Uploader } from '../../../utils/s3-upload';

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

export const POST: APIRoute = async ({ request, url }) => {
  try {
    const action = url.searchParams.get('action');
    
    if (action === 'create') {
      return await createSuccessStory(request);
    } else if (action === 'update') {
      return await updateSuccessStory(request);
    } else if (action === 'delete') {
      return await deleteSuccessStory(request);
    } else if (action === 'upload-image') {
      return await uploadImage(request);
    } else if (action === 'bulk-delete') {
      return await bulkDeleteSuccessStories(request);
    }
    
    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Success stories API error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

async function createSuccessStory(request: Request) {
  try {
    const formData = await request.formData();
    
    const studentName = formData.get('student_name') as string;
    const certificationTitle = formData.get('certification_title') as string;
    const provider = formData.get('provider') as string;
    const certificationType = formData.get('certification_type') as string || 'Cloud';
    const achievementDate = formData.get('achievement_date') as string;
    const description = formData.get('description') as string;
    const isFeatured = formData.get('is_featured') === 'true';
    const imageFile = formData.get('image') as File;

    console.log('=== SUCCESS STORY CREATION DEBUG ===');
    console.log('Student Name:', studentName);
    console.log('Image File:', imageFile ? `${imageFile.name} (${imageFile.size} bytes)` : 'No image file');
    console.log('Image File Type:', imageFile?.type);

    if (!studentName || !certificationTitle || !provider || !achievementDate) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    let imageUrl = '';
    
    // Handle image upload to S3 if provided
    if (imageFile && imageFile.size > 0) {
      console.log('🔄 Starting S3 upload process...');
      try {
        // Initialize S3 uploader
        console.log('🔧 Initializing S3 uploader...');
        const initialized = await s3Uploader.initialize();
        console.log('✅ S3 uploader initialized:', initialized);
        
        if (!initialized) {
          console.log('❌ S3 uploader not initialized');
          return new Response(JSON.stringify({ error: 'AWS S3 not configured. Please configure S3 settings in admin panel.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        // Upload image to S3
        console.log('📤 Uploading image to S3...');
        const uploadResult = await s3Uploader.uploadSuccessStoryImage(imageFile, studentName);
        console.log('📤 Upload result:', uploadResult);
        
        if (!uploadResult.success) {
          console.log('❌ S3 upload failed:', uploadResult.error);
          return new Response(JSON.stringify({ error: `Image upload failed: ${uploadResult.error}` }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        imageUrl = uploadResult.url!;
        console.log('✅ Image uploaded to S3:', imageUrl);
      } catch (s3Error) {
        console.error('❌ S3 upload error:', s3Error);
        return new Response(JSON.stringify({ 
          error: 'Failed to upload image to S3',
          details: s3Error instanceof Error ? s3Error.message : 'Unknown S3 error'
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    } else {
      console.log('ℹ️ No image file provided or file is empty');
    }

    // Insert success story using service role (bypasses RLS)
    const { data, error } = await supabase
      .from('success_stories')
      .insert({
        student_name: studentName,
        certification_title: certificationTitle,
        certification_provider: provider,
        certification_type: certificationType,
        date_achieved: achievementDate,
        description: description || null,
        image_url: imageUrl || null,
        is_featured: isFeatured
      })
      .select()
      .single();

    if (error) {
      console.error('Database insert error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return new Response(JSON.stringify({ 
        error: 'Failed to create success story',
        details: error.message 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Create success story error:', error);
    return new Response(JSON.stringify({ error: 'Failed to create success story' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function updateSuccessStory(request: Request) {
  try {
    const formData = await request.formData();
    
    const id = formData.get('id') as string;
    const studentName = formData.get('student_name') as string;
    const certificationTitle = formData.get('certification_title') as string;
    const provider = formData.get('provider') as string;
    const certificationType = formData.get('certification_type') as string || 'Cloud';
    const achievementDate = formData.get('achievement_date') as string;
    const description = formData.get('description') as string;
    const isFeatured = formData.get('is_featured') === 'true';
    const imageFile = formData.get('image') as File;

    if (!id || !studentName || !certificationTitle || !provider || !achievementDate) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get current success story to check for existing image
    const { data: currentStory } = await supabase
      .from('success_stories')
      .select('image_url')
      .eq('id', id)
      .single();

    let imageUrl = currentStory?.image_url || '';
    
    // Handle image upload if new image provided
    if (imageFile && imageFile.size > 0) {
      // Delete old image if exists
      if (currentStory?.image_url) {
        await s3Uploader.deleteImage(currentStory.image_url);
      }

      // Initialize S3 uploader
      const initialized = await s3Uploader.initialize();
      if (!initialized) {
        return new Response(JSON.stringify({ error: 'AWS S3 not configured. Please configure S3 settings in admin panel.' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Upload new image to S3
      const uploadResult = await s3Uploader.uploadSuccessStoryImage(imageFile, studentName);
      
      if (!uploadResult.success) {
        return new Response(JSON.stringify({ error: `Image upload failed: ${uploadResult.error}` }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      imageUrl = uploadResult.url!;
    }

    // Update success story
    const { data, error } = await supabase
      .from('success_stories')
      .update({
        student_name: studentName,
        certification_title: certificationTitle,
        certification_provider: provider,
        certification_type: certificationType,
        date_achieved: achievementDate,
        description: description || null,
        image_url: imageUrl || null,
        is_featured: isFeatured,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Database update error:', error);
      return new Response(JSON.stringify({ error: 'Failed to update success story' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Update success story error:', error);
    return new Response(JSON.stringify({ error: 'Failed to update success story' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function deleteSuccessStory(request: Request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing success story ID' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get success story to delete associated image
    const { data: story } = await supabase
      .from('success_stories')
      .select('image_url')
      .eq('id', id)
      .single();

    // Delete image from storage if exists
    if (story?.image_url) {
      const imagePath = story.image_url.split('/').pop();
      if (imagePath) {
        await supabase.storage
          .from('success-stories')
          .remove([imagePath]);
      }
    }

    // Delete success story from database
    const { error } = await supabase
      .from('success_stories')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Database delete error:', error);
      return new Response(JSON.stringify({ error: 'Failed to delete success story' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Delete success story error:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete success story' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function uploadImage(request: Request) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;
    const studentName = formData.get('student_name') as string || 'unknown';

    if (!imageFile || imageFile.size === 0) {
      return new Response(JSON.stringify({ error: 'No image file provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(imageFile.type)) {
      return new Response(JSON.stringify({ error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (imageFile.size > maxSize) {
      return new Response(JSON.stringify({ error: 'File size too large. Maximum 10MB allowed.' }), {
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

    // Upload image to S3
    const uploadResult = await s3Uploader.uploadSuccessStoryImage(imageFile, studentName);
    
    if (!uploadResult.success) {
      return new Response(JSON.stringify({ error: `Image upload failed: ${uploadResult.error}` }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      imageUrl: uploadResult.url,
      fileName: uploadResult.url?.split('/').pop() || ''
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Upload image error:', error);
    return new Response(JSON.stringify({ error: 'Failed to upload image' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function bulkDeleteSuccessStories(request: Request) {
  try {
    const { ids } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return new Response(JSON.stringify({ error: 'No success story IDs provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get success stories to delete associated images
    const { data: stories } = await supabase
      .from('success_stories')
      .select('image_url')
      .in('id', ids);

    // Delete images from storage
    if (stories && stories.length > 0) {
      const imagePaths = stories
        .filter(story => story.image_url)
        .map(story => story.image_url.split('/').pop())
        .filter(Boolean);

      if (imagePaths.length > 0) {
        await supabase.storage
          .from('success-stories')
          .remove(imagePaths);
      }
    }

    // Delete success stories from database
    const { error } = await supabase
      .from('success_stories')
      .delete()
      .in('id', ids);

    if (error) {
      console.error('Bulk delete error:', error);
      return new Response(JSON.stringify({ error: 'Failed to delete success stories' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      deletedCount: ids.length 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Bulk delete success stories error:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete success stories' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}