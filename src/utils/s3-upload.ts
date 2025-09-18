import AWS from 'aws-sdk';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.SUPABASE_URL as string;
const SUPABASE_SERVICE_ROLE_KEY = (import.meta.env.SUPABASE_SERVICE_ROLE_KEY as string | undefined) ?? (import.meta.env.SUPABASE_ANON_KEY as string);

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface S3Config {
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  region: string;
  successStoriesFolder: string;
  eventsFolder: string;
}

interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export class S3Uploader {
  private s3: AWS.S3 | null = null;
  private config: S3Config | null = null;

  async initialize(): Promise<boolean> {
    try {
      // Fetch AWS configuration from database
      const { data, error } = await supabase
        .from('aws_config')
        .select('*')
        .eq('is_active', true)
        .single();

      if (error || !data) {
        console.error('No active AWS configuration found:', error);
        return false;
      }

      this.config = {
        accessKeyId: data.access_key_id,
        secretAccessKey: data.secret_access_key,
        bucketName: data.bucket_name,
        region: data.region,
        successStoriesFolder: data.success_stories_folder || 'certifications',
        eventsFolder: data.events_folder || 'events'
      };

      // Configure AWS SDK
      AWS.config.update({
        accessKeyId: this.config.accessKeyId,
        secretAccessKey: this.config.secretAccessKey,
        region: this.config.region
      });

      this.s3 = new AWS.S3();
      return true;
    } catch (error) {
      console.error('Failed to initialize S3 uploader:', error);
      return false;
    }
  }

  async uploadSuccessStoryImage(file: File, studentName: string): Promise<UploadResult> {
    if (!this.s3 || !this.config) {
      return { success: false, error: 'S3 not initialized' };
    }

    try {
      // Compress and process image
      const processedFile = await this.compressImage(file);
      
      // Generate unique filename
      const timestamp = Date.now();
      const sanitizedName = studentName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
      const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${sanitizedName}_${timestamp}.${fileExtension}`;
      const key = `${this.config.successStoriesFolder}/${fileName}`;

      // Upload to S3
      const uploadParams = {
        Bucket: this.config.bucketName,
        Key: key,
        Body: processedFile,
        ContentType: file.type,
        ACL: 'public-read'
      };

      const result = await this.s3.upload(uploadParams).promise();
      
      return {
        success: true,
        url: result.Location
      };
    } catch (error: any) {
      console.error('S3 upload error:', error);
      return {
        success: false,
        error: error.message || 'Upload failed'
      };
    }
  }

  async uploadEventImages(files: File[], eventId: string, eventTitle: string): Promise<UploadResult[]> {
    if (!this.s3 || !this.config) {
      return files.map(() => ({ success: false, error: 'S3 not initialized' }));
    }

    const results: UploadResult[] = [];
    const sanitizedTitle = eventTitle.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    const eventFolder = `${this.config.eventsFolder}/${sanitizedTitle}_${eventId}`;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      try {
        // Compress and process image
        const processedFile = await this.compressImage(file);
        
        // Generate unique filename
        const timestamp = Date.now();
        const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
        const fileName = `image_${i + 1}_${timestamp}.${fileExtension}`;
        const key = `${eventFolder}/${fileName}`;

        // Upload to S3
        const uploadParams = {
          Bucket: this.config.bucketName,
          Key: key,
          Body: processedFile,
          ContentType: file.type,
          ACL: 'public-read'
        };

        const result = await this.s3.upload(uploadParams).promise();
        
        results.push({
          success: true,
          url: result.Location
        });
      } catch (error: any) {
        console.error('S3 upload error for file', i, ':', error);
        results.push({
          success: false,
          error: error.message || 'Upload failed'
        });
      }
    }

    return results;
  }

  async deleteImage(imageUrl: string): Promise<boolean> {
    if (!this.s3 || !this.config) {
      return false;
    }

    try {
      // Extract key from URL
      const url = new URL(imageUrl);
      const key = url.pathname.substring(1); // Remove leading slash

      await this.s3.deleteObject({
        Bucket: this.config.bucketName,
        Key: key
      }).promise();

      return true;
    } catch (error) {
      console.error('S3 delete error:', error);
      return false;
    }
  }

  private async compressImage(file: File, maxWidth: number = 1200, quality: number = 0.8): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          file.type,
          quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }
}

// Export singleton instance
export const s3Uploader = new S3Uploader();