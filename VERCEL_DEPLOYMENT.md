# Vercel Deployment Guide

## Prerequisites

- [Vercel Account](https://vercel.com/signup)
- [Vercel CLI](https://vercel.com/docs/cli) (optional but recommended)
- Node.js 22+ and pnpm 10+ installed locally

---

## Quick Start Deployment

### Option 1: Deploy via GitHub (Recommended)

1. **Connect Repository to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Click "Import Git Repository"
   - Select `Darkhearted007/osanvault-africa`
   - Click "Import"

2. **Configure Project**
   - **Framework Preset**: Other
   - **Root Directory**: `./` (leave as root)
   - **Build Command**: Already configured in `vercel.json`
   - **Output Directory**: Already configured in `vercel.json`
   - **Install Command**: Already configured in `vercel.json`

3. **Set Environment Variables** (see below)

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (~3-5 minutes)
   - Visit your deployment URL

### Option 2: Deploy via CLI

```bash
# Install Vercel CLI globally
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from repository root
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? [Your account]
# - Link to existing project? No
# - What's your project's name? osanvault-africa
# - In which directory is your code located? ./
# - Want to override the settings? No (uses vercel.json)

# Deploy to production
vercel --prod
```

---

## Environment Variables Setup

### Step 1: Create Vercel Postgres Database

**Via Dashboard:**
1. Go to your project in Vercel Dashboard
2. Click "Storage" tab
3. Click "Create Database"
4. Select "Postgres"
5. Name it `osanvault-db`
6. Select region (closest to your users)
7. Click "Create"

**Via CLI:**
```bash
vercel postgres create osanvault-db
```

This automatically creates and populates these environment variables:
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`
- `POSTGRES_USER`
- `POSTGRES_HOST`
- `POSTGRES_PASSWORD`
- `POSTGRES_DATABASE`

### Step 2: Map Database URL

Add this environment variable to map Vercel's Postgres to your app:

**Via Dashboard:**
1. Project → Settings → Environment Variables
2. Add variable:
   - Key: `DATABASE_URL`
   - Value: `${POSTGRES_PRISMA_URL}` (references the auto-created variable)
   - Environment: Production, Preview, Development

**Via CLI:**
```bash
vercel env add DATABASE_URL production
# Enter: ${POSTGRES_PRISMA_URL}

vercel env add DATABASE_URL preview
# Enter: ${POSTGRES_PRISMA_URL}
```

### Step 3: Add Required Environment Variables

**SESSION_SECRET**
```bash
# Generate a secure secret
openssl rand -base64 32

# Add to Vercel
vercel env add SESSION_SECRET production
# Paste the generated secret
```

**POLYGON_RPC_URL**
```bash
# Get from Alchemy (https://dashboard.alchemy.com/)
# 1. Create account/login
# 2. Create new app → Polygon Amoy Testnet
# 3. Copy the HTTPS URL

vercel env add POLYGON_RPC_URL production
# Enter: https://polygon-amoy.g.alchemy.com/v2/YOUR_API_KEY
```

**GITHUB_PAT** (Optional - for GitHub sync)
```bash
# Generate at: GitHub → Settings → Developer settings → Personal access tokens
vercel env add GITHUB_PAT production
# Enter: github_pat_...
```

### Step 4: Initialize Database Schema

After deployment, you need to push the database schema:

```bash
# Pull environment variables locally
vercel env pull .env.local

# Push database schema
pnpm --filter @workspace/db run push

# Seed database with demo data
pnpm --filter @workspace/scripts run seed
```

---

## Project Structure for Vercel

```
osanvault-africa/
├── vercel.json              # Vercel deployment configuration
├── .vercelignore            # Files to exclude from deployment
├── artifacts/
│   ├── osanvault/           # Frontend app (deployed to Vercel)
│   │   ├── src/
│   │   ├── package.json
│   │   └── vite.config.ts
│   └── api-server/          # Backend API (separate Vercel project)
├── lib/
│   └── db/                  # Database schema (used during build)
└── contracts/               # Smart contracts (not deployed to Vercel)
```

**Note**: The frontend (`artifacts/osanvault`) is deployed to Vercel. The API server (`artifacts/api-server`) should be deployed separately as a Vercel Serverless Function or Node.js server.

---

## Deploying the API Server (Optional)

The API server can be deployed separately:

### Option A: Separate Vercel Project

1. Create new Vercel project for API
2. Point to same repository
3. Set Root Directory: `artifacts/api-server`
4. Set Build Command: `pnpm --filter @workspace/api-server run build`
5. Set Output Directory: `dist`
6. Add same environment variables
7. Update `vercel.json` rewrites to point to API URL

### Option B: Vercel Serverless Functions

Convert Express routes to serverless functions (requires code refactoring).

---

## Custom Domain Setup

1. Go to Project → Settings → Domains
2. Add your domain (e.g., `osanvaultafrica.com`)
3. Add DNS records as instructed by Vercel
4. Wait for DNS propagation (~24-48 hours)
5. SSL certificate is automatically provisioned

---

## Deployment Workflow

### Automatic Deployments

Vercel automatically deploys:
- **Production**: Every push to `main` branch
- **Preview**: Every push to other branches
- **Preview**: Every pull request

Each deployment gets a unique URL for testing.

### Manual Deployments

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# Deploy specific branch
vercel --prod --branch develop
```

---

## Local Development with Vercel

```bash
# Link local project to Vercel project
vercel link

# Pull environment variables
vercel env pull .env.local

# Run development server
pnpm --filter @workspace/osanvault run dev

# Or use Vercel Dev (simulates Vercel environment)
vercel dev
```

---

## Monitoring & Logs

### View Deployment Logs

**Via Dashboard:**
- Project → Deployments → Click deployment → View Function Logs

**Via CLI:**
```bash
# View latest deployment logs
vercel logs

# Follow logs in real-time
vercel logs --follow
```

### Analytics

- Project → Analytics
- View page views, visitors, performance metrics

---

## Troubleshooting

### Build Fails

**Error**: `Cannot find module '@workspace/...'`

**Solution**: Ensure pnpm workspace is installed correctly
```json
// vercel.json already includes:
"installCommand": "pnpm install --frozen-lockfile"
```

### Database Connection Fails

**Error**: `DATABASE_URL must be set`

**Solution**: Verify environment variables
```bash
# Check if DATABASE_URL is set
vercel env ls

# Add if missing
vercel env add DATABASE_URL production
```

### RPC Connection Fails

**Error**: `Failed to connect to Polygon Amoy`

**Solution**: 
1. Check Alchemy/Infura dashboard for API key status
2. Verify `POLYGON_RPC_URL` is set correctly
3. Check if you've exceeded free tier limits

---

## Performance Optimization

### Edge Caching

Static assets are automatically cached at the edge. Configure cache headers in `vercel.json`.

### Image Optimization

Use Vercel's Image Optimization:
```tsx
import Image from 'next/image' // If using Next.js
// Or use native <img> with optimized formats (WebP, AVIF)
```

### Bundle Size

Monitor bundle size:
```bash
pnpm --filter @workspace/osanvault run build
# Check dist/ folder size
```

---

## Security Best Practices

✅ **Environment Variables**: Never commit `.env` files
✅ **API Keys**: Use Vercel Environment Variables (encrypted at rest)
✅ **Database**: Use connection pooling (`POSTGRES_PRISMA_URL`)
✅ **RPC Keys**: Restrict by domain in Alchemy/Infura dashboard
✅ **Private Keys**: Never deploy mainnet private keys

---

## Cost Estimation (Vercel Pro Plan)

| Resource | Free Tier | Pro Plan ($20/mo) |
|----------|-----------|-------------------|
| Bandwidth | 100 GB | 1 TB |
| Build Time | 100 hours | 400 hours |
| Serverless Functions | 100 GB-hrs | 1,000 GB-hrs |
| Postgres Storage | 256 MB | 512 MB (add-on) |

**Current project**: Should fit comfortably in Free tier during development.

---

## Next Steps

1. ✅ Deploy to Vercel
2. ✅ Set up environment variables
3. ✅ Initialize database schema
4. ✅ Seed demo data
5. ✅ Test deployment thoroughly
6. ✅ Configure custom domain (optional)
7. ✅ Set up analytics monitoring

---

## Support

- **Vercel Documentation**: https://vercel.com/docs
- **Vercel Discord**: https://vercel.com/discord
- **Project Issues**: https://github.com/Darkhearted007/osanvault-africa/issues
