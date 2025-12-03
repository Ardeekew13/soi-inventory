# Deployment Guide - Vercel + MongoDB Atlas

## ✅ Current Setup Status

Your project uses **branch-based environments**:
- **`main` branch** → Production → Uses `MONGODB_URI_PROD` (MongoDB Atlas)
- **`staging` branch** → Development/Preview → Uses `MONGODB_URI_DEV` (Local MongoDB or Atlas Dev)
- **Local** → Development → Uses `MONGODB_URI_DEV` (Local MongoDB)

Vercel automatically detects the branch and sets the appropriate environment.

---

## 📋 Prerequisites Checklist

### MongoDB Atlas Setup (Complete these first)
- [x] Created MongoDB Atlas account
- [x] Created database user (`rdquilicotwork_db_user`)
- [x] Got connection string
- [ ] **Important**: Add `0.0.0.0/0` to Network Access (for Vercel)
  - Go to MongoDB Atlas → Network Access → Add IP Address
  - Select "Allow Access from Anywhere"
  - This is needed because Vercel uses dynamic IPs

### Vercel Setup
- [ ] Create Vercel account at https://vercel.com
- [ ] Install Vercel CLI (optional but recommended)
- [ ] Connect GitHub repository to Vercel

---

## 🚀 Deployment Steps

### **Step 1: Allow Vercel IPs in MongoDB Atlas**

1. Go to MongoDB Atlas Dashboard
2. Click **Network Access** (left sidebar)
3. Click **+ ADD IP ADDRESS**
4. Select **ALLOW ACCESS FROM ANYWHERE** (or add `0.0.0.0/0`)
5. Click **Confirm**

> **Why?** Vercel deployments use dynamic IPs, so we need to allow all IPs

---

### **Step 2: Push Your Code to GitHub**

```bash
# Make sure you're on the staging branch
git status

# Add all changes
git add .

# Commit your changes
git commit -m "Setup production MongoDB and prepare for Vercel deployment"

# Push to GitHub
git push origin staging
```

---

### **Step 3: Deploy to Vercel**

#### **Option A: Deploy via Vercel Dashboard (Recommended for first time)**

1. Go to https://vercel.com and sign in
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository (`Ardeekew13/soi-inventory`)
4. Configure your project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

5. **Add Environment Variables** (Click "Environment Variables"):

**For Production (main branch):**
```env
MONGODB_URI_PROD=mongodb+srv://rdquilicotwork_db_user:Nmc82k2nUiYnETtd@cluster0.rtvfur0.mongodb.net/soi-inventory?retryWrites=true&w=majority&appName=Cluster0

ADMIN_PASSWORD=vAoNeMx2

JWT_SECRET_KEY=hO2ih8AoVpMIlY9oyqY3yIqbIaoUX409Wq8zyRRfuvf6UR6MoqScyoI+X2J0Sf0wY6UJVdgVhodbF5rbiWo2vQ==

NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=soi-inventory

NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=shift_photos_unsigned
```

**For Preview/Staging (staging branch):**
```env
MONGODB_URI_DEV=mongodb://localhost:27017/soi-inventory
# Or use a separate MongoDB Atlas cluster for staging:
# MONGODB_URI_DEV=mongodb+srv://...@staging-cluster.mongodb.net/soi-inventory-staging

ADMIN_PASSWORD=vAoNeMx2

JWT_SECRET_KEY=hO2ih8AoVpMIlY9oyqY3yIqbIaoUX409Wq8zyRRfuvf6UR6MoqScyoI+X2J0Sf0wY6UJVdgVhodbF5rbiWo2vQ==

NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=soi-inventory

NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=shift_photos_unsigned
```

> **Important**: In Vercel, select which environment each variable applies to:
> - `MONGODB_URI_PROD` → Select **Production** only
> - `MONGODB_URI_DEV` → Select **Preview** only
> - Other variables → Select **All** (Production, Preview, Development)

6. Click **Deploy**
7. Wait 2-3 minutes for deployment to complete

---

#### **Option B: Deploy via Vercel CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy (first time will ask configuration questions)
vercel

# For production deployment
vercel --prod
```

When asked, configure:
- Set up and deploy? **Y**
- Which scope? Select your account
- Link to existing project? **N** (first time)
- What's your project's name? **soi-inventory**
- In which directory is your code located? **.**
- Want to override the settings? **N**

---

### **Step 4: Add Environment Variables via CLI (Alternative)**

If you deployed via CLI, add environment variables:

```bash
# Add production MongoDB URI
vercel env add MONGODB_URI_PROD production

# Add admin password
vercel env add ADMIN_PASSWORD production

# Add JWT secret
vercel env add JWT_SECRET_KEY production

# Add Cloudinary config
vercel env add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME production
vercel env add NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET production

# Add NODE_ENV
vercel env add NODE_ENV production
```

---

### **Step 5: Verify Deployment**

1. Vercel will give you a URL like: `https://soi-inventory-xxx.vercel.app`
2. Visit the URL
3. Test the login page
4. Check if MongoDB connection works
5. Try creating a transaction offline (test offline sync)

---

## 🌿 Branch Workflow

### How it Works:

```
staging branch → Vercel Preview → MONGODB_URI_DEV (Development DB)
     ↓
   Test & Review
     ↓
  Merge to main
     ↓
main branch → Vercel Production → MONGODB_URI_PROD (Production DB)
```

### Deployment Flow:

1. **Make changes on `staging` branch**
   ```bash
   git checkout staging
   # Make your changes
   git add .
   git commit -m "New feature"
   git push origin staging
   ```
   - Vercel automatically deploys to **Preview** environment
   - Uses `MONGODB_URI_DEV` (development database)
   - URL: `https://soi-inventory-git-staging-xxx.vercel.app`

2. **Test on staging preview**
   - Check all features work
   - Verify database connections
   - Test offline sync

3. **Merge to main for production**
   ```bash
   git checkout main
   git merge staging
   git push origin main
   ```
   - Vercel automatically deploys to **Production** environment
   - Uses `MONGODB_URI_PROD` (production database)
   - URL: `https://soi-inventory.vercel.app`

---

## 🔧 Post-Deployment Configuration

### Custom Domain (Optional)
1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

### Environment Variables per Branch
- **Production**: Main/master branch
- **Preview**: All other branches (staging, dev, etc.)

To set different values for preview:
```bash
vercel env add MONGODB_URI_DEV preview
```

---

## 🐛 Troubleshooting

### Error: "MongooseServerSelectionError"
**Solution**: Check MongoDB Atlas Network Access - make sure `0.0.0.0/0` is added

### Error: "Invalid connection string"
**Solution**: Make sure you added `/soi-inventory` database name in the URI

### Build fails on Vercel
**Solution**: Check Vercel build logs. Common issues:
- Missing environment variables
- TypeScript errors
- Missing dependencies

### Offline sync not working
**Solution**: 
- Check browser console for errors
- Verify service worker is registered
- Clear browser cache and localStorage

---

## 📊 Monitoring Your Deployment

### Vercel Dashboard
- **Deployments**: See all deployments and their status
- **Analytics**: Track page views and performance
- **Logs**: Real-time function logs for debugging

### MongoDB Atlas Dashboard
- **Metrics**: Database performance
- **Database Access**: Monitor connections
- **Network Access**: Check allowed IPs

---

## 🔄 Continuous Deployment

Vercel automatically deploys when you push to GitHub:

```bash
# Make changes
git add .
git commit -m "Your changes"
git push origin staging

# Vercel automatically deploys staging branch as preview
# Merge to main for production deployment
```

---

## 📝 Important Notes

1. **Never commit `.env` file** to Git (it's in `.gitignore`)
2. **Store secrets in Vercel Environment Variables**, not in code
3. **Use preview deployments** for testing before production
4. **MongoDB Atlas Free Tier**: 512MB storage, enough for ~10 years of typical usage
5. **Vercel Free Tier**: Unlimited deployments, 100GB bandwidth/month

---

## ✅ Quick Deploy Checklist

- [ ] MongoDB Atlas Network Access allows `0.0.0.0/0`
- [ ] Code pushed to GitHub
- [ ] Vercel project created
- [ ] All environment variables added to Vercel
- [ ] Deployment successful
- [ ] Website loads correctly
- [ ] Can login with default admin credentials
- [ ] Database operations work (create product, transaction)
- [ ] Offline sync works

---

## 🆘 Need Help?

- Vercel Docs: https://vercel.com/docs
- MongoDB Atlas Docs: https://docs.atlas.mongodb.com/
- Next.js Deployment: https://nextjs.org/docs/deployment

---

**Your Production URLs:**
- MongoDB Atlas: `cluster0.rtvfur0.mongodb.net`
- Vercel: (will be generated after deployment)
