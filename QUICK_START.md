# Quick Start Guide - Gallery Delete Fix

## Setup in 5 Minutes

### Step 1: Backend Environment
```bash
cd backend

# Edit .env file
nano .env  # or use your editor

# REQUIRED changes:
# MONGODB_URI=your_mongodb_connection_string
# SUPABASE_SERVICE_KEY=your_supabase_service_role_key
```

### Step 2: Install & Run Backend
```bash
# From backend directory
npm install
npm run dev

# Expected output:
# ✓ MongoDB connected successfully
# ✓ Server running on port 5000
# ✓ Gallery API available at http://localhost:5000/api/gallery
```

### Step 3: Test Backend API
```bash
# In another terminal
curl http://localhost:5000/api/health
# Response: {"status":"ok","message":"Server is running"}

# Test gallery endpoint (should be empty initially)
curl http://localhost:5000/api/gallery
# Response: {"success":true,"data":[],"count":0}
```

### Step 4: Frontend Development
```bash
# From project root (not backend directory)
npm install
npm run dev

# Goes to http://localhost:5173 (or displays port)
```

### Step 5: Test Upload/Delete Flow

**Navigate to Admin Panel** (`/admin`)

1. **Upload Test Image**
   - Click "Upload Image" button
   - Select a JPG/PNG file
   - Should appear in Admin gallery immediately
   - Should also appear in public Gallery page

2. **Check Database**
   - In backend terminal, you'll see logs:
     ```
     [Gallery POST] Creating record for: 1715623456-image.jpg
     [Gallery POST] Created new record: 1715623456-image.jpg
     ```

3. **Delete Test Image**
   - Hover over image in Admin panel
   - Click "Delete" button
   - Confirm dialog
   - Image should disappear immediately from Admin
   - Image should disappear from Gallery (if in another tab, it auto-refreshes)

4. **Verify Deletion**
   - Backend logs should show:
     ```
     [Gallery DELETE] Processing deletion for ID: ...
     [Gallery DELETE] Removed from Supabase Storage: ...
     ```
   - Check MongoDB: image should have `status: "deleted"`
   - Refresh Gallery page: image stays deleted ✓

## Environment Files Reference

### backend/.env (Local Development)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/salon_gallery
SUPABASE_URL=https://xidistookwiyhlipygnp.supabase.co
SUPABASE_SERVICE_KEY=your_key_here
NODE_ENV=development
```

### .env.local (Frontend - Local)
```
VITE_API_URL=http://localhost:5000/api
```

### For Production (Vercel Deployment)
Update your Vercel Environment Variables:
- **Backend Variables** (on Vercel for backend project):
  - `MONGODB_URI`
  - `SUPABASE_SERVICE_KEY`
  - `SUPABASE_URL`

- **Frontend Variables** (on Vercel for frontend project):
  - `VITE_API_URL=https://your-backend-url.vercel.app/api`

## Monitoring

### Backend Logs
```bash
npm run dev  # Watch for real-time logs
```

Look for:
- `[Gallery GET]` - Image fetch requests
- `[Gallery POST]` - Image upload records
- `[Gallery DELETE]` - Image deletion
- `[Gallery BATCH]` - Bulk operations

### Browser Console
Press `F12` → Console tab

Look for:
- `[Gallery] Fetching images...`
- `[Admin Gallery] Loaded X images`
- `[Admin] Uploading...`
- `[Admin] Deleting...`

### Network Tab
Press `F12` → Network tab

Watch API calls:
- `GET /api/gallery` - Fetch images (blue/success)
- `POST /api/gallery` - Create record (green)
- `DELETE /api/gallery/ID` - Delete image (red)

## Troubleshooting

### Backend won't start
```bash
# Check MongoDB connection
echo $MONGODB_URI  # Should show a valid connection string

# Check Supabase credentials
cat .env | grep SUPABASE
```

### Images not saving
```bash
# Check .env.local in root
cat .env.local

# Should show:
# VITE_API_URL=http://localhost:5000/api

# Restart frontend:
npm run dev
```

### Images not deleting
```bash
# Check backend logs for errors
npm run dev  # Look for [Gallery DELETE] errors

# Verify MongoDB is running:
# If using Atlas: check connection string
# If using local: mongod should be running
```

### CORS Error
```
Access to XMLHttpRequest from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Solution**: Backend/routes/gallery.js already has `cors()` middleware. If still failing:
- Check backend is running: `curl http://localhost:5000/api/health`
- Check VITE_API_URL matches backend URL

### Images disappear after refresh
- This is expected if MongoDB isn't connected
- Check MONGODB_URI in backend/.env
- Images are stored in DB, not browser cache

## Next Steps

1. **Test both delete & upload** with multiple images
2. **Test across browser tabs** - open Gallery in one tab, delete from Admin in another
3. **Deploy backend** to Vercel or your hosting
4. **Update VITE_API_URL** in frontend .env for production
5. **Monitor logs** in production to catch any issues

## Data Integrity Check

After testing, verify:
1. ✅ Upload: File in Supabase Storage + Record in MongoDB
2. ✅ Gallery Page: Shows only active images (status: "active")
3. ✅ Delete: Removes from Storage, marks as deleted in DB
4. ✅ Refresh: Deleted images stay deleted
5. ✅ Cross-tab: Deleting in Admin auto-refreshes Gallery in other tab

All working? **The gallery delete bug is FIXED!** 🎉
