# Deployment Guide

This guide will walk you through deploying the Cement Production Planner to Railway (backend + database) and GitHub Pages (frontend).

---

## Prerequisites

✅ GitHub repository: `cement-production-planner` (created)  
✅ Railway account with PostgreSQL database (created)  
✅ Database URL: `postgresql://postgres:tBdpfUPskSRtiAjArradePStXzdNgLYq@ballast.proxy.rlwy.net:11972/railway`

---

## Step 1: Upload Code to GitHub

### Option A: Using Git Command Line

1. **Clone your repository locally:**
```bash
git clone https://github.com/stefanozullian-design/cement-production-planner.git
cd cement-production-planner
```

2. **Copy all the files I provided into this folder**

3. **Add and commit files:**
```bash
git add .
git commit -m "Initial commit: Backend API + Database schema + Frontend config"
git push origin main
```

### Option B: Using GitHub Web Interface

1. Go to https://github.com/stefanozullian-design/cement-production-planner
2. Click "Add file" → "Upload files"
3. Drag and drop all the folders/files
4. Click "Commit changes"

---

## Step 2: Set Up Database Schema

1. **Go to Railway:** https://railway.app
2. **Click on your PostgreSQL service**
3. **Click "Data" tab**
4. **Click "Query" button**
5. **Copy the entire contents of `backend/database/schema.sql`**
6. **Paste into the SQL editor**
7. **Click "Run" or press Ctrl+Enter**

You should see:
```
✓ Tables created successfully
✓ Indexes created
✓ Views created
✓ Triggers created
```

---

## Step 3: Deploy Backend to Railway

### 3.1: Create New Service

1. In Railway dashboard, click **"+ New"**
2. Select **"GitHub Repo"**
3. Connect to your GitHub account (if not connected)
4. Select repository: **`cement-production-planner`**
5. Railway will detect the repo

### 3.2: Configure Service

1. **Root Directory:** `/backend`
   - Click "Settings" → "Service Settings"
   - Set "Root Directory" to `backend`

2. **Environment Variables:**
   - Click "Variables" tab
   - Add variable: `DATABASE_URL`
   - Value: `postgresql://postgres:tBdpfUPskSRtiAjArradePStXzdNgLYq@ballast.proxy.rlwy.net:11972/railway`

3. **Deploy:**
   - Railway will auto-deploy
   - Wait ~2 minutes for build to complete

### 3.3: Get Your API URL

After deployment completes:

1. Click on your backend service
2. Go to "Settings" → "Networking"
3. Click "Generate Domain"
4. You'll get a URL like: `https://cement-production-planner-production.up.railway.app`

**Copy this URL - you'll need it for frontend!**

---

## Step 4: Update Frontend Configuration

1. **Open `frontend/config.js`**

2. **Update the API_BASE_URL:**

Change from:
```javascript
API_BASE_URL: 'http://localhost:3000/api',
```

To:
```javascript
API_BASE_URL: 'https://your-app-name.up.railway.app/api',
```

(Replace with your actual Railway URL)

3. **Commit and push:**
```bash
git add frontend/config.js
git commit -m "Update API URL for production"
git push origin main
```

---

## Step 5: Deploy Frontend to GitHub Pages

1. **Go to your repository on GitHub:**
   https://github.com/stefanozullian-design/cement-production-planner

2. **Go to Settings → Pages**

3. **Configure source:**
   - Source: **Deploy from a branch**
   - Branch: **main**
   - Folder: **/frontend**

4. **Click "Save"**

5. **Wait ~2 minutes**

6. **Your site will be live at:**
   ```
   https://stefanozullian-design.github.io/cement-production-planner/
   ```

---

## Step 6: Test the Deployment

### Test Backend API

1. **Open in browser:**
   ```
   https://your-app.up.railway.app/api/health
   ```

2. **You should see:**
   ```json
   {
     "status": "OK",
     "message": "Cement Production Planner API",
     "timestamp": "2024-02-17T..."
   }
   ```

### Test Frontend

1. **Open in browser:**
   ```
   https://stefanozullian-design.github.io/cement-production-planner/
   ```

2. **Open browser console (F12)**

3. **Check for errors**

4. **Try creating a product:**
   - Go to Tab 1 - Products & Recipes
   - Click "+ Add New Product"
   - Check if it saves to database

---

## Step 7: Migrate Existing Data (Optional)

If you have existing data in localStorage that you want to keep:

1. **Open your current app (the one with data)**

2. **Open browser console (F12)**

3. **Run this script to export data:**
```javascript
const exportData = {
    products: JSON.parse(localStorage.getItem('products') || '{}'),
    equipment: JSON.parse(localStorage.getItem('flowDesigner.equipment') || '[]'),
    campaigns: JSON.parse(localStorage.getItem('campaigns') || '{}'),
    demand: JSON.parse(localStorage.getItem('demandPlan') || '{}')
};

console.log(JSON.stringify(exportData, null, 2));
// Copy the output
```

4. **Save the output to a file: `migration-data.json`**

5. **I'll provide a migration script to import this data into Railway**

---

## Troubleshooting

### Backend not deploying?

**Check Railway logs:**
1. Click backend service
2. Go to "Deployments" tab
3. Click latest deployment
4. View logs for errors

**Common issues:**
- Missing `DATABASE_URL` environment variable
- Wrong root directory (should be `/backend`)
- Package.json missing dependencies

### Frontend not loading?

**Check browser console (F12):**
- Look for CORS errors
- Check if API_BASE_URL is correct
- Verify Railway backend is running

**Common issues:**
- API URL not updated in `config.js`
- Backend not deployed yet
- CORS not enabled (should be enabled in server.js)

### Database connection errors?

**Verify DATABASE_URL:**
```
postgresql://postgres:tBdpfUPskSRtiAjArradePStXzdNgLYq@ballast.proxy.rlwy.net:11972/railway
```

Should have:
- Username: `postgres`
- Password: `tBdpfUPskSRtiAjArradePStXzdNgLYq`
- Host: `ballast.proxy.rlwy.net`
- Port: `11972`
- Database: `railway`

---

## Monitoring & Maintenance

### Check Railway Usage

1. Go to Railway dashboard
2. Check your free $5 credit usage
3. Monitor database size (500 MB limit on free tier)

### View Backend Logs

1. Click backend service in Railway
2. Go to "Logs" tab
3. See real-time API requests

### Update Code

To deploy updates:

```bash
# Make changes to code
git add .
git commit -m "Update: description of changes"
git push origin main
```

Railway will auto-deploy new changes.

---

## Cost Estimate

**Current (Free Tier):**
- Railway: $5/month credit (covers PostgreSQL + Backend)
- GitHub Pages: Free
- **Total: $0/month**

**When you exceed free tier:**
- Railway: ~$5-15/month (depends on usage)
- Can migrate to Azure anytime

---

## Next Steps

After deployment:

1. ✅ Test all features (products, equipment, campaigns)
2. ✅ Migrate existing data from localStorage
3. ✅ Set up daily backups (Railway provides automatic backups)
4. ✅ Add more calculation endpoints as needed
5. ✅ Monitor usage and performance

---

## Support

If you encounter issues:

1. Check Railway logs
2. Check browser console (F12)
3. Verify all URLs are correct
4. Test API endpoints directly with Postman or curl

**You can ask me for help at any step!** 🚀
