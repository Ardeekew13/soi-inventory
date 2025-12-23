/**
 * API Endpoint for Cleanup Old Shift Photos
 * 
 * POST /api/cleanup/shift-photos
 * 
 * Deletes shift photos older than specified months
 * Requires CRON_SECRET or admin authentication
 */

import { NextRequest, NextResponse } from 'next/server';
import { cleanupOldShiftPhotos } from '@/lib/cleanupOldShiftPhotos';

export async function POST(request: NextRequest) {
  try {
    // Check for cron secret (for automated scheduled runs)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    const isAuthorizedCron = cronSecret && authHeader === `Bearer ${cronSecret}`;
    
    // For manual runs, you can add user authentication check here if needed
    if (!isAuthorizedCron) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const monthsToKeep = parseInt(searchParams.get('months') || '12');
    const dryRun = searchParams.get('dryRun') === 'true';

    // Validate months parameter
    if (monthsToKeep < 1 || monthsToKeep > 60) {
      return NextResponse.json(
        { success: false, message: 'Months must be between 1 and 60' },
        { status: 400 }
      );
    }

    console.log(`Starting cleanup: keeping ${monthsToKeep} months, dryRun: ${dryRun}`);

    // Run cleanup
    const result = await cleanupOldShiftPhotos(monthsToKeep, dryRun);

    return NextResponse.json({
      success: true,
      message: dryRun 
        ? `Dry run completed. Would delete ${result.photosDeleted} photos.`
        : `Successfully deleted ${result.cloudinaryDeletedCount} photos from Cloudinary.`,
      data: result,
    });

  } catch (error) {
    console.error('Error in cleanup API:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Cleanup failed',
      },
      { status: 500 }
    );
  }
}
