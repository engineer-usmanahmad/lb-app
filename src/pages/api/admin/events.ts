// src/pages/api/admin/events.ts
import type { APIRoute } from "astro";
import { createClient } from "@supabase/supabase-js";
import AWS from 'aws-sdk';

// Prefer service role on the server; fall back to anon if needed.
const SUPABASE_URL = import.meta.env.SUPABASE_URL as string;
const SUPABASE_SERVICE_ROLE_KEY =
  (import.meta.env.SUPABASE_SERVICE_ROLE_KEY as string | undefined) ??
  (import.meta.env.SUPABASE_ANON_KEY as string);

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.warn(
    "[events API] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY/ANON env vars. " +
      "Inserts may fail if RLS is enabled.",
  );
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export const prerender = false;

export const POST: APIRoute = async ({ request, url }) => {
  try {
    const action = url.searchParams.get('action');
    
    if (action === 'create') {
      return await createEvent(request);
    } else if (action === 'update') {
      return await updateEvent(request);
    } else if (action === 'toggle-status') {
      return await toggleEventStatus(request);
    } else if (action === 'delete') {
      return await deleteEvent(request);
    } else if (action === 'upload-images') {
      return await uploadEventImages(request);
    } else if (action === 'delete-image') {
      return await deleteEventImage(request);
    } else if (action === 'set-primary-image') {
      return await setPrimaryImage(request);
    } else if (action === 'bulk-delete') {
      return await bulkDeleteEvents(request);
    }
    
    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Events API error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const GET: APIRoute = async ({ url }) => {
  try {
    const eventId = url.searchParams.get('event_id');
    
    if (eventId) {
      return await getEventImages(eventId);
    }
    
    // If no event_id provided, return all events
    return await getAllEvents();
  } catch (error) {
    console.error('Events GET API error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

async function createEvent(request: Request) {
  try {
    console.log('Creating event - start');
    const formData = await request.formData();
    
    const title = formData.get('title') as string;
    const eventDate = formData.get('event_date') as string;
    const category = formData.get('category') as string;
    const location = formData.get('location') as string;
    const description = formData.get('description') as string;
    const active = formData.get('active') === 'on' || formData.get('active') === 'true';

    console.log('Form data received:', { title, eventDate, category, location, description, active });

    if (!title || !eventDate || !category) {
      console.log('Missing required fields:', { title: !!title, eventDate: !!eventDate, category: !!category });
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('Supabase client configured with URL:', SUPABASE_URL);
    console.log('Using service role key:', !!SUPABASE_SERVICE_ROLE_KEY);

    // Test Supabase connection first
    try {
      const { data: testData, error: testError } = await supabase
        .from('events')
        .select('count')
        .limit(1);
      
      console.log('Supabase connection test:', { testData, testError });
      
      if (testError) {
        console.error('Supabase connection failed:', testError);
        return new Response(JSON.stringify({ 
          error: 'Database connection failed',
          details: testError.message
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    } catch (connectionError) {
      console.error('Supabase connection error:', connectionError);
      return new Response(JSON.stringify({ 
        error: 'Database connection error',
        details: connectionError instanceof Error ? connectionError.message : 'Unknown connection error'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Insert event using service role (bypasses RLS)
    const insertData = {
      title,
      event_date: eventDate,
      category,
      location: location || null,
      short_description: description || null,
      active: active
    };
    
    console.log('Inserting data:', insertData);
    
    const { data, error } = await supabase
      .from('events')
      .insert(insertData)
      .select()
      .single();

    console.log('Insert result:', { data, error });

    if (error) {
      console.error('Database insert error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      return new Response(JSON.stringify({ 
        error: 'Failed to create event',
        details: error.message || 'Unknown database error',
        code: error.code || 'NO_CODE'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('Event created successfully:', data);
    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Create event error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return new Response(JSON.stringify({ 
      error: 'Failed to create event',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function updateEvent(request: Request) {
  try {
    const formData = await request.formData();
    
    const id = formData.get('id') as string;
    const title = formData.get('title') as string;
    const eventDate = formData.get('event_date') as string;
    const category = formData.get('category') as string;
    const location = formData.get('location') as string;
    const description = formData.get('description') as string;
    const active = formData.get('active') === 'on' || formData.get('active') === 'true';

    if (!id || !title || !eventDate || !category) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Update event
    const { data, error } = await supabase
      .from('events')
      .update({
        title,
        event_date: eventDate,
        category,
        location: location || null,
        short_description: description || null,
        active: active,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Database update error:', error);
      return new Response(JSON.stringify({ error: 'Failed to update event' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Update event error:', error);
    return new Response(JSON.stringify({ error: 'Failed to update event' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function deleteEvent(request: Request) {
  try {
    const formData = await request.formData();
    const id = formData.get('id') as string;

    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing event ID' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get AWS configuration from database
    const { data: awsConfig, error: configError } = await supabase
      .from('aws_config')
      .select('*')
      .single();

    if (configError || !awsConfig) {
      console.error('AWS config error:', configError);
      // Continue with database deletion even if S3 deletion fails
    }

    // Get event images to delete from S3
    const { data: images } = await supabase
      .from('event_images')
      .select('image_url')
      .eq('event_id', id);

    // Delete images from S3
    if (images && images.length > 0 && awsConfig) {
      const s3 = new AWS.S3({
        accessKeyId: awsConfig.access_key_id,
        secretAccessKey: awsConfig.secret_access_key,
        region: awsConfig.region
      });

      for (const image of images) {
        try {
          // Extract S3 key from the image URL
          const url = new URL(image.image_url);
          const s3Key = url.pathname.substring(1); // Remove leading slash

          await s3.deleteObject({
            Bucket: 'lbistech-website-img',
            Key: s3Key
          }).promise();

          console.log(`Successfully deleted S3 object: ${s3Key}`);
        } catch (s3Error) {
          console.error('S3 delete error:', s3Error);
          // Continue with other deletions even if one fails
        }
      }
    }

    // Delete event images from database (cascade should handle this, but being explicit)
    await supabase
      .from('event_images')
      .delete()
      .eq('event_id', id);

    // Delete event from database
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Database delete error:', error);
      return new Response(JSON.stringify({ error: 'Failed to delete event' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Delete event error:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete event' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function uploadEventImages(request: Request) {
  try {
    const formData = await request.formData();
    const eventId = formData.get('event_id') as string;
    const imageFiles = formData.getAll('images') as File[];

    console.log('Upload request received:', { eventId, fileCount: imageFiles.length });
    console.log('Files details:', imageFiles.map(f => ({ name: f.name, type: f.type, size: f.size })));

    if (!eventId) {
      return new Response(JSON.stringify({ error: 'Missing event ID' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!imageFiles || imageFiles.length === 0) {
      return new Response(JSON.stringify({ error: 'No image files provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get AWS configuration from database
    const { data: awsConfig, error: configError } = await supabase
      .from('aws_config')
      .select('*')
      .single();

    if (configError || !awsConfig) {
      console.error('AWS config error:', configError);
      return new Response(JSON.stringify({ error: 'AWS configuration not found' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Initialize AWS S3
    const s3 = new AWS.S3({
      accessKeyId: awsConfig.access_key_id,
      secretAccessKey: awsConfig.secret_access_key,
      region: awsConfig.region
    });

    // Get event title for folder structure
    const { data: eventData } = await supabase
      .from('events')
      .select('title')
      .eq('id', eventId)
      .single();

    const eventTitle = eventData?.title || 'unknown-event';
    const sanitizedEventTitle = eventTitle.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

    const uploadedImages = [];
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    console.log('Processing files with allowed types:', allowedTypes);

    // Check if this is the first image for the event (to set as primary)
    const { data: existingImages } = await supabase
      .from('event_images')
      .select('id')
      .eq('event_id', eventId);

    const isFirstImage = !existingImages || existingImages.length === 0;
    console.log('Is first image for event:', isFirstImage, 'Existing images count:', existingImages?.length || 0);

    for (let i = 0; i < imageFiles.length; i++) {
      const imageFile = imageFiles[i];
      console.log(`Processing file ${i + 1}/${imageFiles.length}:`, { 
        name: imageFile.name, 
        type: imageFile.type, 
        size: imageFile.size 
      });

      // Validate file type
      if (!allowedTypes.includes(imageFile.type)) {
        console.log(`Skipping file ${imageFile.name} - invalid type: ${imageFile.type}`);
        continue; // Skip invalid files
      }

      // Validate file size
      if (imageFile.size > maxSize) {
        console.log(`Skipping file ${imageFile.name} - too large: ${imageFile.size} bytes`);
        continue; // Skip large files
      }

      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}-${i}.${fileExt}`;
      const s3Key = `events/${sanitizedEventTitle}/${fileName}`;

      try {
        // Convert File to Buffer
        const buffer = Buffer.from(await imageFile.arrayBuffer());
        console.log(`File ${imageFile.name} converted to buffer, size: ${buffer.length} bytes`);

        // Upload to S3
        const uploadParams = {
          Bucket: 'lbistech-website-img',
          Key: s3Key,
          Body: buffer,
          ContentType: imageFile.type
        };

        console.log(`Uploading to S3:`, { bucket: uploadParams.Bucket, key: s3Key, contentType: imageFile.type });
        const uploadResult = await s3.upload(uploadParams).promise();
        const imageUrl = uploadResult.Location;
        console.log(`S3 upload successful:`, { imageUrl });

        // Insert image record
        const { data: imageData, error: insertError } = await supabase
          .from('event_images')
          .insert({
            event_id: eventId,
            image_url: imageUrl,
            image_alt: `${imageFile.name}`,
            is_cover: isFirstImage && i === 0 // Set first image as cover if no images exist
          })
          .select()
          .single();

        console.log('Database insert result:', { imageData, insertError });

        if (!insertError && imageData) {
          uploadedImages.push(imageData);
          console.log(`Successfully processed file ${imageFile.name}`);
        } else {
          console.error(`Database insert failed for ${imageFile.name}:`, insertError);
        }
      } catch (uploadError) {
        console.error('S3 upload error for', imageFile.name, ':', uploadError);
        continue; // Skip failed uploads
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      uploadedCount: uploadedImages.length,
      images: uploadedImages
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Upload event images error:', error);
    return new Response(JSON.stringify({ error: 'Failed to upload images' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function deleteEventImage(request: Request) {
  try {
    const formData = await request.formData();
    const image_id = formData.get('image_id') as string;

    if (!image_id) {
      return new Response(JSON.stringify({ error: 'Missing image ID' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get image to delete from storage
    const { data: image } = await supabase
      .from('event_images')
      .select('image_url, event_id, is_cover')
      .eq('id', image_id)
      .single();

    if (!image) {
      return new Response(JSON.stringify({ error: 'Image not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Delete image from storage
    const imagePath = image.image_url.split('/').pop();
    if (imagePath) {
      await supabase.storage
        .from('events')
        .remove([imagePath]);
    }

    // Delete image from database
    const { error } = await supabase
      .from('event_images')
      .delete()
      .eq('id', image_id);

    if (error) {
      console.error('Database delete error:', error);
      return new Response(JSON.stringify({ error: 'Failed to delete image' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // If this was the cover image, set another image as cover
    if (image.is_cover) {
      const { data: otherImages } = await supabase
        .from('event_images')
        .select('id')
        .eq('event_id', image.event_id)
        .limit(1);

      if (otherImages && otherImages.length > 0) {
        await supabase
          .from('event_images')
          .update({ is_cover: true })
          .eq('id', otherImages[0].id);
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Delete event image error:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete image' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function setPrimaryImage(request: Request) {
  try {
    const formData = await request.formData();
    const image_id = formData.get('image_id') as string;
    const event_id = formData.get('event_id') as string;

    if (!image_id || !event_id) {
      return new Response(JSON.stringify({ error: 'Missing image ID or event ID' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // First, unset all cover images for this event
    await supabase
      .from('event_images')
      .update({ is_cover: false })
      .eq('event_id', event_id);

    // Set the selected image as cover
    const { error } = await supabase
      .from('event_images')
      .update({ is_cover: true })
      .eq('id', image_id);

    if (error) {
      console.error('Set primary image error:', error);
      return new Response(JSON.stringify({ error: 'Failed to set primary image' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Set primary image error:', error);
    return new Response(JSON.stringify({ error: 'Failed to set primary image' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function getEventImages(eventId: string) {
  try {
    const { data: images, error } = await supabase
      .from('event_images')
      .select('*')
      .eq('event_id', eventId)
      .order('is_cover', { ascending: false })
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Get event images error:', error);
      return new Response(JSON.stringify({ error: 'Failed to get event images' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ success: true, images }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Get event images error:', error);
    return new Response(JSON.stringify({ error: 'Failed to get event images' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function getAllEvents() {
  try {
    console.log('Fetching all events from database');
    
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database fetch error:', error);
      return new Response(JSON.stringify({ 
        error: 'Failed to fetch events',
        details: error.message 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('Events fetched successfully:', data?.length || 0, 'events');
    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Get all events error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch events',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function toggleEventStatus(request: Request) {
  try {
    const formData = await request.formData();
    const id = formData.get('id') as string;
    const active = formData.get('active') === 'true';

    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing event ID' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Update only the active status
    const { data, error } = await supabase
      .from('events')
      .update({
        active: active,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Database update error:', error);
      return new Response(JSON.stringify({ error: 'Failed to update event status' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Toggle event status error:', error);
    return new Response(JSON.stringify({ error: 'Failed to update event status' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function bulkDeleteEvents(request: Request) {
  try {
    const { ids } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return new Response(JSON.stringify({ error: 'No event IDs provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get all images for these events to delete from storage
    const { data: images } = await supabase
      .from('event_images')
      .select('image_url')
      .in('event_id', ids);

    // Delete images from storage
    if (images && images.length > 0) {
      const imagePaths = images
        .map(img => img.image_url.split('/').pop())
        .filter(Boolean);

      if (imagePaths.length > 0) {
        await supabase.storage
          .from('events')
          .remove(imagePaths);
      }
    }

    // Delete event images from database
    await supabase
      .from('event_images')
      .delete()
      .in('event_id', ids);

    // Delete events from database
    const { error } = await supabase
      .from('events')
      .delete()
      .in('id', ids);

    if (error) {
      console.error('Bulk delete error:', error);
      return new Response(JSON.stringify({ error: 'Failed to delete events' }), {
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
    console.error('Bulk delete events error:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete events' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}