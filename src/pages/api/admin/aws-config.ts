import type { APIRoute } from "astro";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.SUPABASE_ANON_KEY as string;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables');
}

// Use anon key with RLS policies instead of service role
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const action = formData.get('action') as string;

    console.log('AWS Config API - Action:', action);
    console.log('AWS Config API - FormData keys:', Array.from(formData.keys()));

    if (action === 'save') {
      return await saveAwsConfig(formData);
    } else if (action === 'test') {
      return await testAwsConnection(formData);
    } else {
      console.error('AWS Config API - Invalid action:', action);
      return new Response(JSON.stringify({ error: 'Invalid action' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error('AWS Config API - Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: 'Internal server error', details: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const GET: APIRoute = async () => {
  try {
    const { data, error } = await supabase
      .from('aws_config')
      .select('*')
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Get AWS config error:', error);
      return new Response(JSON.stringify({ error: 'Failed to fetch configuration' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ data: data || null }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Get AWS config error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const DELETE: APIRoute = async () => {
  try {
    const { error } = await supabase
      .from('aws_config')
      .update({ is_active: false })
      .eq('is_active', true);

    if (error) {
      console.error('Delete AWS config error:', error);
      return new Response(JSON.stringify({ error: 'Failed to delete configuration' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Delete AWS config error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};


async function saveAwsConfig(formData: FormData) {
  try {
    const accessKeyId = formData.get('access_key_id') as string;
    const secretAccessKey = formData.get('secret_access_key') as string;
    const bucketName = formData.get('bucket_name') as string;
    const region = formData.get('region') as string;
    const successStoriesFolder = formData.get('success_stories_folder') as string || 'certifications';
    const eventsFolder = formData.get('events_folder') as string || 'events';

    console.log('Save AWS Config - Received data:', {
      accessKeyId: accessKeyId ? '***' : 'missing',
      secretAccessKey: secretAccessKey ? '***' : 'missing',
      bucketName,
      region,
      successStoriesFolder,
      eventsFolder
    });

    if (!accessKeyId || !secretAccessKey || !bucketName || !region) {
      console.error('Save AWS Config - Missing required fields:', {
        accessKeyId: !!accessKeyId,
        secretAccessKey: !!secretAccessKey,
        bucketName: !!bucketName,
        region: !!region
      });
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // First, deactivate any existing configurations
    const { error: deactivateError } = await supabase
      .from('aws_config')
      .update({ is_active: false })
      .eq('is_active', true);

    if (deactivateError) {
      console.error('Save AWS Config - Deactivate error:', deactivateError);
    }

    // Insert new configuration
    const { data, error } = await supabase
      .from('aws_config')
      .insert({
        access_key_id: accessKeyId,
        secret_access_key: secretAccessKey,
        bucket_name: bucketName,
        region: region,
        success_stories_folder: successStoriesFolder,
        events_folder: eventsFolder,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      console.error('Save AWS Config - Insert error:', error);
      return new Response(JSON.stringify({ error: 'Failed to save configuration', details: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('Save AWS Config - Success:', data?.id);
    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Save AWS Config - Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: 'Internal server error', details: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function testAwsConnection(formData: FormData) {
  try {
    const accessKeyId = formData.get('access_key_id') as string;
    const secretAccessKey = formData.get('secret_access_key') as string;
    const bucketName = formData.get('bucket_name') as string;
    const region = formData.get('region') as string;

    if (!accessKeyId || !secretAccessKey || !bucketName || !region) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Test AWS S3 connection using AWS SDK
    try {
      // Import AWS SDK dynamically to avoid build issues
      const AWS = await import('aws-sdk');
      
      // Configure AWS - use default export if available
      const AWSConfig = AWS.default || AWS;
      
      AWSConfig.config.update({
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
        region: region
      });

      const s3 = new AWSConfig.S3();

      // Test bucket access by listing objects (limit to 1)
      const params = {
        Bucket: bucketName,
        MaxKeys: 1
      };

      await s3.listObjectsV2(params).promise();

      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Connection successful! S3 bucket is accessible.' 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (awsError: any) {
      console.error('AWS S3 connection error:', awsError);
      
      let errorMessage = 'Connection failed';
      if (awsError.code === 'InvalidAccessKeyId') {
        errorMessage = 'Invalid Access Key ID';
      } else if (awsError.code === 'SignatureDoesNotMatch') {
        errorMessage = 'Invalid Secret Access Key';
      } else if (awsError.code === 'NoSuchBucket') {
        errorMessage = 'Bucket does not exist or is not accessible';
      } else if (awsError.code === 'AccessDenied') {
        errorMessage = 'Access denied to the bucket';
      } else if (awsError.message) {
        errorMessage = awsError.message;
      }

      return new Response(JSON.stringify({ 
        success: false, 
        error: errorMessage 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    console.error('Test AWS connection error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Failed to test connection' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}