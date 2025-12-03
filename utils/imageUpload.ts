/**
 * Cloudinary Image Upload Utility
 * 
 * Handles image compression and upload to Cloudinary
 * Free tier: 25GB storage + 25GB bandwidth/month
 */

/**
 * Compress an image file to reduce size before uploading
 * @param file - The image file to compress
 * @param maxWidth - Maximum width in pixels (default: 800)
 * @param maxHeight - Maximum height in pixels (default: 600)
 * @param quality - JPEG quality 0-1 (default: 0.7)
 * @returns Promise<Blob> - Compressed image blob
 */
export const compressImage = async (
  file: File | Blob,
  maxWidth: number = 800,
  maxHeight: number = 600,
  quality: number = 0.7
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    img.onload = () => {
      // Calculate new dimensions while maintaining aspect ratio
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
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
            reject(new Error("Failed to compress image"));
          }
        },
        "image/jpeg",
        quality
      );
    };

    img.onerror = () => {
      reject(new Error("Failed to load image"));
    };

    // Create object URL from file
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Convert base64 string to Blob
 * @param base64 - Base64 string (with or without data URL prefix)
 * @returns Blob
 */
export const base64ToBlob = (base64: string): Blob => {
  // Remove data URL prefix if present
  const base64Data = base64.includes(",") ? base64.split(",")[1] : base64;
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }

  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: "image/jpeg" });
};

/**
 * Upload an image to Cloudinary
 * @param imageData - Base64 string or File object
 * @param folder - Cloudinary folder (e.g., 'shift-photos')
 * @param userId - User ID for organizing files
 * @param compress - Whether to compress the image (default: true)
 * @returns Promise<string> - Cloudinary URL of uploaded image
 */
export const uploadImageToCloudinary = async (
  imageData: string | File,
  folder: string = "shift-photos",
  userId: string = "unknown",
  compress: boolean = true
): Promise<string> => {
  try {
    let fileToUpload: string | Blob;

    // Convert to blob if string
    if (typeof imageData === "string") {
      fileToUpload = base64ToBlob(imageData);
    } else {
      fileToUpload = imageData;
    }

    // Compress if needed
    if (compress && fileToUpload instanceof Blob) {
      fileToUpload = await compressImage(fileToUpload);
    }

    // Convert blob to base64 for Cloudinary upload
    let base64Data: string;
    if (fileToUpload instanceof Blob) {
      base64Data = await blobToBase64(fileToUpload);
    } else {
      base64Data = fileToUpload;
    }

    // Prepare form data for Cloudinary unsigned upload
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      throw new Error("Cloudinary configuration missing. Check environment variables.");
    }

    const formData = new FormData();
    formData.append("file", base64Data);
    formData.append("upload_preset", uploadPreset);
    formData.append("folder", `${folder}/${userId}`);
    formData.append("resource_type", "image");

    // Upload to Cloudinary
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Failed to upload to Cloudinary");
    }

    const data = await response.json();
    
    // Return the secure URL
    return data.secure_url;
  } catch (error) {
    console.error("Error uploading image to Cloudinary:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to upload image");
  }
};

/**
 * Convert Blob to base64 string
 * @param blob - Blob to convert
 * @returns Promise<string> - Base64 string with data URL prefix
 */
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to convert blob to base64"));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * Delete an image from Cloudinary
 * Note: Requires backend API endpoint with Cloudinary Admin API
 * @param publicId - Cloudinary public ID (extracted from URL)
 * @returns Promise<void>
 */
export const deleteImageFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    // This requires a backend API endpoint because deletion needs API secret
    const response = await fetch("/api/cloudinary/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ publicId }),
    });

    if (!response.ok) {
      throw new Error("Failed to delete image from Cloudinary");
    }
  } catch (error) {
    console.error("Error deleting image from Cloudinary:", error);
    throw new Error("Failed to delete image");
  }
};

/**
 * Extract public ID from Cloudinary URL
 * @param url - Full Cloudinary URL
 * @returns string - Public ID
 */
export const extractPublicId = (url: string): string => {
  // Example URL: https://res.cloudinary.com/demo/image/upload/v1234567890/folder/image.jpg
  const match = url.match(/\/v\d+\/(.+)\.\w+$/);
  return match ? match[1] : "";
};

/**
 * Generate a unique identifier for shift photos
 * @param userId - User ID
 * @param eventType - Type of shift event
 * @returns string - Unique identifier
 */
export const generateShiftPhotoId = (
  userId: string,
  eventType: string
): string => {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `${eventType}_${timestamp}_${randomStr}`;
};
