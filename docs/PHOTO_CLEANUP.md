# Automatic Shift Photo Cleanup

This feature automatically deletes old shift photos from Cloudinary to save storage space and stay within the free tier limits.

## How It Works

- **Retention Period**: Keeps shift photos for 12 months by default
- **What Gets Deleted**: Photos from shift start, lunch breaks, and shift end
- **Database**: Photo URLs are removed from shift records
- **Cloudinary**: Photos are deleted from Cloudinary storage
- **Schedule**: Runs automatically on the 1st of each month

## Storage Savings

With 15 employees taking 4 photos/day:
- **Without cleanup**: ~14 months until 25 GB limit
- **With cleanup**: Sustainable indefinitely (stays around 1.8 GB)

## Setup Instructions

### 1. Add Environment Variables

Add these to your `.env.local` and Vercel environment variables:

```env
# Cloudinary API credentials (for deleting photos)
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Cron job secret (generate a random string)
CRON_SECRET=your_random_secret_key_here
```

To get Cloudinary API credentials:
1. Go to https://cloudinary.com/console
2. Navigate to Settings → Access Keys
3. Copy API Key and API Secret

Generate a random secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Enable Vercel Cron Jobs

The cron job is already configured in `vercel.json`:
- **Schedule**: `0 0 1 * *` (1st day of each month at midnight)
- **Endpoint**: `/api/cleanup/shift-photos?months=12`
- **Action**: Deletes photos older than 12 months

After deploying to Vercel:
1. Go to your project dashboard
2. Navigate to "Cron Jobs" tab
3. Verify the job is listed and enabled

### 3. Manual Cleanup (Optional)

You can trigger cleanup manually using the API:

```bash
# Dry run (see what would be deleted without actually deleting)
curl -X POST "https://your-domain.com/api/cleanup/shift-photos?dryRun=true" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# Actual cleanup (12 months retention)
curl -X POST "https://your-domain.com/api/cleanup/shift-photos?months=12" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# Keep only 6 months
curl -X POST "https://your-domain.com/api/cleanup/shift-photos?months=6" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## Monitoring

### Check Cloudinary Usage

1. Go to https://cloudinary.com/console
2. View "Dashboard" to see:
   - Storage used
   - Bandwidth used this month
   - Transformations used

### View Cleanup Logs

In Vercel:
1. Go to project dashboard
2. Click "Functions" tab
3. Find `/api/cleanup/shift-photos`
4. View execution logs

## Customization

### Change Retention Period

Edit `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cleanup/shift-photos?months=6",  // Changed to 6 months
      "schedule": "0 0 1 * *"
    }
  ]
}
```

### Change Schedule

Cron schedule format: `minute hour day month dayOfWeek`

Examples:
- `0 0 1 * *` - 1st of every month at midnight
- `0 2 * * 0` - Every Sunday at 2 AM
- `0 0 1 1,7 *` - Jan 1st and July 1st at midnight

## Bandwidth Considerations

### Current Estimate
- **Upload**: ~1.8 GB/month
- **Download** (admin viewing): ~1.8 GB/month
- **Total**: ~3.6 GB/month (well below 25 GB limit)

### If You Hit Bandwidth Limit

1. **Reduce image quality** (in `utils/imageUpload.ts`):
   - Lower resolution to 1280×720
   - Reduce quality to 0.75

2. **Implement image optimization**:
   - Use Cloudinary's automatic format conversion
   - Enable lazy loading for photos
   - Thumbnail previews instead of full-size

3. **Upgrade Cloudinary** (if needed):
   - Plus plan: $89/month (100 GB storage + bandwidth)

## Troubleshooting

### Photos Not Deleting

Check:
1. `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET` are set
2. Credentials are correct
3. Check Vercel function logs for errors

### Cron Not Running

1. Verify cron job is enabled in Vercel dashboard
2. Check `CRON_SECRET` environment variable is set
3. View function logs for execution history

### Database Records Not Updating

Check MongoDB connection and permissions in function logs.

## Cost Analysis

### Current Setup (With Cleanup)
- **Storage**: ~1-2 GB (stable)
- **Bandwidth**: ~4 GB/month
- **Cost**: FREE ✅

### Without Cleanup
- **Storage**: Hits 25 GB in ~14 months
- **Need to upgrade**: $89/month
- **Annual cost**: $1,068

**Savings with cleanup**: $1,068/year! 💰
