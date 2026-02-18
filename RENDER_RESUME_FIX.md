# Resume Upload/Delete API - Render.com Fix

## Problem

Resume upload and delete APIs return 500 Internal Server Error on Render but work locally.

Error: `"Resume upload failed: Failed to upload resume to Cloudinary: Must supply api_key"`

## Solution Steps for Render

### Step 1: Verify Environment Variables

1. Go to https://dashboard.render.com
2. Select your web service
3. Click "Environment" in left sidebar
4. Verify these THREE variables exist with EXACT names:
   - `CLOUD_NAME`
   - `CLOUD_API_KEY`
   - `CLOUD_API_SECRET`

### Step 2: Check for Common Issues

**❌ Extra Spaces**

- Variable names must have NO spaces
- Wrong: ` CLOUD_NAME` or `CLOUD_NAME `
- Correct: `CLOUD_NAME`

**❌ Wrong Case**

- Render is case-sensitive
- Wrong: `cloud_name`, `Cloud_Name`
- Correct: `CLOUD_NAME`

**❌ Empty Values**

- Click "Edit" on each variable to verify value exists

### Step 3: Clear Cache & Redeploy

1. Go to "Manual Deploy" tab
2. Click "Clear build cache & deploy"
3. Wait for deployment to complete

### Step 4: Check Logs

After deployment, go to "Logs" tab and look for:

```
[Cloudinary Config] Checking environment variables...
[Cloudinary Config] CLOUD_NAME: ✓ Set
[Cloudinary Config] CLOUD_API_KEY: ✓ Set
[Cloudinary Config] CLOUD_API_SECRET: ✓ Set
[Cloudinary Config] Configuration complete
```

If you see `✗ Missing`, that variable isn't loaded by Render.

### Step 5: Test Health Endpoint

```bash
GET https://your-app.onrender.com/api/v1/health
```

Response should show:

```json
{
  "success": true,
  "environment": {
    "hasCloudName": true,
    "hasCloudApiKey": true,
    "hasCloudApiSecret": true
  }
}
```

If any shows `false`, that variable is not set in Render.

## Alternative: Environment Groups

If individual variables don't work:

1. In Render dashboard → "Environment Groups"
2. Create group "Cloudinary"
3. Add all three variables
4. Link group to your service
5. Redeploy

## Debug Checklist

- [ ] All three variables set in Render
- [ ] Variable names are EXACTLY: `CLOUD_NAME`, `CLOUD_API_KEY`, `CLOUD_API_SECRET`
- [ ] No extra spaces in names or values
- [ ] Cleared build cache and redeployed
- [ ] Checked logs for Cloudinary config messages
- [ ] Health endpoint shows all `true`

## Your Cloudinary Values

```
CLOUD_NAME=dlsuycdfj
CLOUD_API_KEY=433334597632452
CLOUD_API_SECRET=AiPcrumE-_TBS2MP0ppDOGXIlyE
```

## Code Changes Made

1. **Enhanced logging** - Shows which env vars are set/missing on startup
2. **Health endpoint** - `GET /api/v1/health` to verify configuration
3. **Better error messages** - Clearer debugging information
4. **Increased body limits** - 50MB for file uploads

## Next Steps

1. Deploy these code changes to Render
2. Check logs for Cloudinary config messages
3. Test health endpoint
4. Try resume upload/delete again

The logs will tell you exactly which variable is missing!
