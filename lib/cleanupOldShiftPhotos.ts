/**
 * Cleanup Script for Old Shift Photos
 * 
 * Deletes shift photos older than specified months to save Cloudinary storage
 * Run this as a scheduled job (monthly recommended)
 * 
 * Usage:
 * - Manual: npm run cleanup-photos
 * - Scheduled: Set up cron job or use Vercel Cron
 */

import EmployeeShift from "@/app/api/graphql/models/EmployeeShift";
import dbConnect from "@/lib/mongodb";

interface CleanupResult {
  totalShiftsChecked: number;
  photosDeleted: number;
  cloudinaryDeletedCount: number;
  cloudinaryFailedCount: number;
  errors: string[];
}

/**
 * Delete an image from Cloudinary using public ID
 * This requires Cloudinary credentials to be set in environment variables
 */
const deleteFromCloudinary = async (imageUrl: string): Promise<boolean> => {
  try {
    // Extract public ID from Cloudinary URL
    // Format: https://res.cloudinary.com/[cloud_name]/image/upload/v[version]/[folder]/[public_id].[extension]
    const urlParts = imageUrl.split('/');
    const uploadIndex = urlParts.indexOf('upload');
    if (uploadIndex === -1) return false;

    // Get everything after 'upload/v[version]/'
    const pathAfterUpload = urlParts.slice(uploadIndex + 2).join('/');
    // Remove file extension
    const publicId = pathAfterUpload.replace(/\.[^/.]+$/, '');

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      console.warn('Cloudinary credentials not configured. Skipping cloud deletion.');
      return false;
    }

    // Create signature for authenticated request
    const timestamp = Math.round(new Date().getTime() / 1000);
    const crypto = require('crypto');
    const signature = crypto
      .createHash('sha1')
      .update(`public_id=${publicId}&timestamp=${timestamp}${apiSecret}`)
      .digest('hex');

    const formData = new FormData();
    formData.append('public_id', publicId);
    formData.append('timestamp', timestamp.toString());
    formData.append('api_key', apiKey);
    formData.append('signature', signature);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const result = await response.json();
    return result.result === 'ok';
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    return false;
  }
};

/**
 * Clean up old shift photos
 * @param monthsToKeep - Number of months to keep (default: 12)
 * @param dryRun - If true, only logs what would be deleted without actually deleting
 * @returns Cleanup result statistics
 */
export const cleanupOldShiftPhotos = async (
  monthsToKeep: number = 12,
  dryRun: boolean = false
): Promise<CleanupResult> => {
  const result: CleanupResult = {
    totalShiftsChecked: 0,
    photosDeleted: 0,
    cloudinaryDeletedCount: 0,
    cloudinaryFailedCount: 0,
    errors: [],
  };

  try {
    // Connect to database
    await dbConnect();

    // Calculate cutoff date (X months ago)
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - monthsToKeep);

    console.log(`🔍 Searching for shifts older than ${cutoffDate.toISOString()}`);
    console.log(`📅 Keeping only last ${monthsToKeep} months of data`);
    if (dryRun) {
      console.log('🏃 DRY RUN MODE - No actual deletions will occur');
    }

    // Find shifts older than cutoff date that have photos
    const oldShifts = await EmployeeShift.find({
      date: { $lt: cutoffDate },
      $or: [
        { 'shiftStart.photo': { $exists: true, $ne: null } },
        { 'lunchBreakStart.photo': { $exists: true, $ne: null } },
        { 'lunchBreakEnd.photo': { $exists: true, $ne: null } },
        { 'shiftEnd.photo': { $exists: true, $ne: null } },
      ],
    });

    result.totalShiftsChecked = oldShifts.length;
    console.log(`📊 Found ${oldShifts.length} shifts with photos to process`);

    // Process each shift
    for (const shift of oldShifts) {
      const photosToDelete: string[] = [];

      // Collect all photo URLs from this shift
      if (shift.shiftStart?.photo) photosToDelete.push(shift.shiftStart.photo);
      if (shift.lunchBreakStart?.photo) photosToDelete.push(shift.lunchBreakStart.photo);
      if (shift.lunchBreakEnd?.photo) photosToDelete.push(shift.lunchBreakEnd.photo);
      if (shift.shiftEnd?.photo) photosToDelete.push(shift.shiftEnd.photo);

      // Delete from Cloudinary
      for (const photoUrl of photosToDelete) {
        if (dryRun) {
          console.log(`[DRY RUN] Would delete: ${photoUrl}`);
          result.photosDeleted++;
        } else {
          const deleted = await deleteFromCloudinary(photoUrl);
          if (deleted) {
            result.cloudinaryDeletedCount++;
            result.photosDeleted++;
            console.log(`✅ Deleted from Cloudinary: ${photoUrl}`);
          } else {
            result.cloudinaryFailedCount++;
            console.warn(`⚠️  Failed to delete from Cloudinary: ${photoUrl}`);
          }
        }
      }

      // Remove photo URLs from database
      if (!dryRun) {
        if (shift.shiftStart) shift.shiftStart.photo = undefined;
        if (shift.lunchBreakStart) shift.lunchBreakStart.photo = undefined;
        if (shift.lunchBreakEnd) shift.lunchBreakEnd.photo = undefined;
        if (shift.shiftEnd) shift.shiftEnd.photo = undefined;

        await shift.save();
        console.log(`💾 Updated shift record: ${shift._id}`);
      }
    }

    console.log('\n📈 Cleanup Summary:');
    console.log(`   Total shifts checked: ${result.totalShiftsChecked}`);
    console.log(`   Photos marked for deletion: ${result.photosDeleted}`);
    if (!dryRun) {
      console.log(`   Successfully deleted from Cloudinary: ${result.cloudinaryDeletedCount}`);
      console.log(`   Failed to delete from Cloudinary: ${result.cloudinaryFailedCount}`);
    }

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    result.errors.push(errorMessage);
    console.error('❌ Error during cleanup:', error);
    throw error;
  }
};

/**
 * Main execution when run as a script
 */
if (require.main === module) {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const monthsArg = args.find(arg => arg.startsWith('--months='));
  const months = monthsArg ? parseInt(monthsArg.split('=')[1]) : 12;

  console.log('🧹 Starting shift photo cleanup...\n');

  cleanupOldShiftPhotos(months, dryRun)
    .then((result) => {
      console.log('\n✅ Cleanup completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Cleanup failed:', error);
      process.exit(1);
    });
}
