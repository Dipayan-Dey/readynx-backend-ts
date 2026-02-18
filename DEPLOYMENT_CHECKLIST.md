# Deployment Checklist - Resume API Fix

## What Was Changed

### 1. Enhanced Cloudinary Configuration

**File:** `src/config/cloudinary.ts`

- Added startup logging to show which environment variables are set
- Shows available CLOUD\* variables if any are missing
- Helps identify configuration issues immediately

### 2. Health Check Endpoint

**File:** `src/api/v1/routes/health.routes.ts` (NEW)

- Endpoint: `GET /api/v1/health`
- Returns status of all environment variables
- Masks sensitive values for security

### 3. Increased Body Size Limits

**File:** `src/app.ts`

- Increased JSON limit to 50MB
- Increased URL-encoded limit to 50MB
- Ensures large files can be uploaded

### 4. Better Error Handling

**File:** `src/services/integrations/cloudinary.service.ts`

- Validates environment variables before operations
- Detailed error logging
- Clear error messages

## Deploy to Render

### 1. Commit and Push Changes

```bash
git add .
git commit -m "fix: Add Cloudinary env validation and health endpoint"
git push origin main
```

### 2. Render Will Auto-Deploy

- Render detects the push
- Builds and deploys automatically
- Check "Events" tab for deployment status

### 3. Check Logs After Deployment

Look for these messages in Render logs:

```
[Cloudinary Config] Checking environment variables...
[Cloudinary Config] CLOUD_NAME: ✓ Set
[Cloudinary Config] CLOUD_API_KEY: ✓ Set
[Cloudinary Config] CLOUD_API_SECRET: ✓ Set
[Cloudinary Config] Configuration complete
```


```

### 5. Test Resume Upload

```bash
POST https://your-app.onrender.com/api/v1/profile/resume/upload
Authorization: Bearer YOUR_TOKEN
Content-Type: multipart/form-data

Body:
- resume: [your-file.pdf]
```

## If Still Not Working

### Check Render Environment Variables

1. Go to Render Dashboard
2. Your Service → Environment
3. Verify these exist:
   - `CLOUD_NAME` = `dlsuycdfj`
   - `CLOUD_API_KEY` = `433334597632452`
   - `CLOUD_API_SECRET` = `AiPcrumE-_TBS2MP0ppDOGXIlyE`

### Clear Build Cache

1. Manual Deploy tab
2. "Clear build cache & deploy"
3. Wait for completion

### Check Logs

The new logging will tell you EXACTLY which variable is missing:

- If you see `✗ Missing` → that variable isn't set in Render
- If you see `✓ Set` → that variable is configured correctly

## Environment Variables Needed

```env
# MongoDB
MONGO_URI=your_mongo_uri

# JWT
JWT_SECRET=your_jwt_secret

# Cloudinary (REQUIRED for resume upload)
CLOUD_NAME=dlsuycdfj
CLOUD_API_KEY=433334597632452
CLOUD_API_SECRET=AiPcrumE-_TBS2MP0ppDOGXIlyE

# Other APIs
GROQ_API_KEY=your_groq_key
GEMINI_API_KEY=your_gemini_key
GOOGLE_CLIENT_ID=your_google_client_id
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_secret
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_secret

# URLs
FRONTEND_URL=https://your-frontend.netlify.app
BACKEND_URL=https://your-backend.onrender.com
```

## Success Indicators

✅ Logs show all Cloudinary variables as "✓ Set"
✅ Health endpoint returns all `true` values
✅ Resume upload returns 200 status
✅ Resume delete returns 200 status

## Troubleshooting

**Problem:** Logs show `✗ Missing` for Cloudinary variables
**Solution:** Add them in Render Environment tab, then redeploy

**Problem:** Health endpoint shows `false` for Cloudinary variables
**Solution:** Variable names might have typos or extra spaces

**Problem:** Still getting "Must supply api_key" error
**Solution:** Clear build cache and redeploy

**Problem:** Upload works but file is corrupted
**Solution:** Already fixed with 50MB body limit increase
