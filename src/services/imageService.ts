import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

// Canvas dimensions for processing images
const MAX_WIDTH = 1200;
const MAX_HEIGHT = 1200;
const WATERMARK_OPACITY = 0.4;
const WATERMARK_FONT = '24px Arial';
const WATERMARK_COLOR = 'rgba(255, 255, 255, 0.7)';
const WATERMARK_TEXT = 'DateKelly.com';

/**
 * Resize an image to fit within maximum dimensions while maintaining aspect ratio
 */
const resizeImage = (file: File): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      // Calculate new dimensions
      let width = img.width;
      let height = img.height;
      
      if (width > MAX_WIDTH) {
        height = (height * MAX_WIDTH) / width;
        width = MAX_WIDTH;
      }
      
      if (height > MAX_HEIGHT) {
        width = (width * MAX_HEIGHT) / height;
        height = MAX_HEIGHT;
      }
      
      // Create canvas for resizing
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      // Draw resized image
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to blob
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to convert canvas to blob'));
        }
      }, file.type);
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Add a watermark to an image
 */
const addWatermark = (file: Blob, watermarkText: string = WATERMARK_TEXT): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      // Create canvas for watermarking
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw image
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      ctx.drawImage(img, 0, 0);
      
      // Add diagonal watermark
      ctx.save();
      
      // Configure watermark text
      ctx.font = WATERMARK_FONT;
      ctx.fillStyle = WATERMARK_COLOR;
      ctx.globalAlpha = WATERMARK_OPACITY;
      
      // Measure text width
      const textWidth = ctx.measureText(watermarkText).width;
      
      // Calculate diagonal position
      const angle = Math.atan2(canvas.height, canvas.width);
      const diagonal = Math.sqrt(canvas.width * canvas.width + canvas.height * canvas.height);
      
      // Add multiple watermarks across the diagonal
      const spacing = diagonal / 5; // 5 watermarks across the diagonal
      
      for (let i = -diagonal; i < diagonal * 2; i += spacing) {
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(angle);
        ctx.translate(i - textWidth / 2, 0);
        ctx.fillText(watermarkText, 0, 0);
        ctx.restore();
      }
      
      ctx.restore();
      
      // Convert to blob
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to convert canvas to blob'));
        }
      }, file.type);
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Process an image: resize and add watermark
 */
export const processImage = async (file: File): Promise<Blob> => {
  // First resize the image
  const resizedImage = await resizeImage(file);
  
  // Then add the watermark
  const watermarkedImage = await addWatermark(resizedImage);
  
  return watermarkedImage;
};

/**
 * Upload a processed image to Supabase storage
 */
export const uploadImage = async (
  file: File, 
  bucket: string = 'profile-pictures',
  folder: string = '',
  userId: string
): Promise<{ path: string; url: string }> => {
  try {
    // Process the image (resize and add watermark)
    const processedImage = await processImage(file);
    
    // Generate a unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}_${uuidv4()}.${fileExt}`;
    // Always store images inside a user-specific folder to satisfy RLS policies
    const filePath = folder
      ? `${userId}/${folder}/${fileName}`
      : `${userId}/${fileName}`;
    
    // Upload to Supabase with retry for RLS issues
    let uploadData = null;
    let uploadError = null;
    
    // First attempt - try normal upload
    const uploadResult = await supabase.storage
      .from(bucket)
      .upload(filePath, processedImage, {
        cacheControl: '3600',
        contentType: file.type
      });
      
    uploadData = uploadResult.data;
    uploadError = uploadResult.error;
    
    // If any error occurred, log and attempt a retry (path already user-specific)
    if (uploadError) {
      console.log('Attempting upload with user-specific path due to RLS policy...');
      
      // Try with a user-specific path which might be allowed by RLS
      const userSpecificPath = `${userId}/${fileName}`;
      
      const retryResult = await supabase.storage
        .from(bucket)
        .upload(userSpecificPath, processedImage, {
          cacheControl: '3600',
          contentType: file.type
        });
        
      uploadData = retryResult.data;
      uploadError = retryResult.error;
    }
    
    if (uploadError) {
      throw uploadError;
    }
    
    if (!uploadData) {
      throw new Error('Upload failed with no error or data returned');
    }
    
    // Get the public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(uploadData.path);
    
    return {
      path: uploadData.path,
      url: urlData.publicUrl
    };
  } catch (error) {
    console.error('Error processing and uploading image:', error);
    throw error;
  }
};

/**
 * Upload multiple images with watermark and optimization
 */
export const uploadMultipleImages = async (
  files: File[],
  bucket: string = 'gallery-images',
  folder: string = '',
  userId: string
): Promise<Array<{ path: string; url: string }>> => {
  const uploadPromises = files.map(file => uploadImage(file, bucket, folder, userId));
  const uploads = await Promise.all(uploadPromises);
  // Record uploads for admin moderation if they come from supported buckets
  try {
    const { ContentModerationService } = await import('./contentModerationService');
    await ContentModerationService.recordUploadedImages(userId, uploads);
  } catch (_) {
    // noop if service import fails
  }
  return uploads;
};

/**
 * Delete an image from storage
 */
export const deleteImage = async (path: string, bucket: string = 'profile-pictures'): Promise<void> => {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);
  
  if (error) {
    throw error;
  }
};
