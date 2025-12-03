# Quick Vercel Environment Variables Setup

## Setting Up Environment Variables for Branch-Based Deployment

When adding environment variables in Vercel, you need to specify which environment they apply to:

### 1. Go to Vercel Dashboard
- Select your project
- Go to **Settings** → **Environment Variables**

### 2. Add Variables with Correct Environments

#### Production MongoDB (main branch only)
```
Name: MONGODB_URI_PROD
Value: mongodb+srv://rdquilicotwork_db_user:Nmc82k2nUiYnETtd@cluster0.rtvfur0.mongodb.net/soi-inventory?retryWrites=true&w=majority&appName=Cluster0
Environment: ☑ Production only
```

#### Development MongoDB (staging/preview branches)
```
Name: MONGODB_URI_DEV
Value: mongodb://localhost:27017/soi-inventory
(or your staging MongoDB Atlas URI)
Environment: ☑ Preview only
```

#### Shared Variables (all environments)
```
Name: ADMIN_PASSWORD
Value: vAoNeMx2
Environment: ☑ Production ☑ Preview ☑ Development
```

```
Name: JWT_SECRET_KEY
Value: hO2ih8AoVpMIlY9oyqY3yIqbIaoUX409Wq8zyRRfuvf6UR6MoqScyoI+X2J0Sf0wY6UJVdgVhodbF5rbiWo2vQ==
Environment: ☑ Production ☑ Preview ☑ Development
```

```
Name: NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
Value: soi-inventory
Environment: ☑ Production ☑ Preview ☑ Development
```

```
Name: NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
Value: shift_photos_unsigned
Environment: ☑ Production ☑ Preview ☑ Development
```

### 3. Understanding Vercel Environments

| Environment | Git Branch | MongoDB Used | URL Pattern |
|------------|------------|--------------|-------------|
| **Production** | `main` | `MONGODB_URI_PROD` | `your-app.vercel.app` |
| **Preview** | `staging`, `dev`, etc. | `MONGODB_URI_DEV` | `your-app-git-staging-xxx.vercel.app` |
| **Development** | Local | `MONGODB_URI_DEV` | `localhost:3000` |

### 4. Vercel Automatic Behavior

- Push to `main` → Production deployment with prod MongoDB
- Push to `staging` → Preview deployment with dev MongoDB
- Each PR/branch gets its own preview URL
- No manual switching needed!

### 5. After Adding Variables

Click **Redeploy** to apply the new environment variables to existing deployments.
