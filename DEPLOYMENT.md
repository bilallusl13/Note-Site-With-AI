# 🚀 Deployment Guide

## GitHub Repository Setup

### 1. Create GitHub Repository
```bash
# Go to https://github.com/new
# Repository name: ai-notion-clone
# Description: AI-Powered Notion Clone with Next.js and Django ML
# Public repository (recommended for portfolio)
```

### 2. Connect Local Repository
```bash
git remote add origin https://github.com/YOUR_USERNAME/ai-notion-clone.git
git push -u origin main
```

## Vercel Deployment

### 1. Connect to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click "New Project"
4. Import your `ai-notion-clone` repository

### 2. Configure Build Settings
- **Framework Preset**: Next.js
- **Root Directory**: `./notion`
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### 3. Environment Variables
Add these in Vercel Dashboard → Settings → Environment Variables:

```env
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
DATABASE_URL=postgresql://username:password@hostname:port/database
GEMINI_API_KEY=your-gemini-api-key-from-google-ai
NODE_ENV=production
```

### 4. Database Setup (Recommended)
#### Option 1: Vercel Postgres (Recommended)
1. Go to Vercel Dashboard → Storage → Create Database
2. Select "Postgres"
3. Copy the DATABASE_URL from the created database
4. Add it to environment variables

#### Option 2: Supabase (Free Alternative)
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Go to Settings → Database
4. Copy connection string
5. Add to Vercel environment variables

### 5. Deploy
```bash
# Push to trigger deployment
git push origin main
```

## ML Backend Deployment (Optional)

### Railway Deployment
1. Go to [railway.app](https://railway.app)
2. Connect GitHub repository
3. Select `mlproject` folder
4. Add environment variables:
   ```env
   DJANGO_SECRET_KEY=your-django-secret-key
   DJANGO_DEBUG=false
   DJANGO_ALLOWED_HOSTS=your-domain.railway.app
   ```

### Render Deployment
1. Go to [render.com](https://render.com)
2. Create new Web Service
3. Connect GitHub repository
4. Build Command: `pip install -r requirements.txt`
5. Start Command: `python manage.py runserver 0.0.0.0:$PORT`

## DNS & Domain (Optional)

### Custom Domain Setup
1. Buy domain from Namecheap, GoDaddy, etc.
2. In Vercel Dashboard → Settings → Domains
3. Add your custom domain
4. Update DNS records as instructed

## Post-Deployment Checklist

- [ ] Test authentication flow
- [ ] Verify database connections
- [ ] Test AI chat functionality
- [ ] Check all API endpoints
- [ ] Test responsive design
- [ ] Verify environment variables
- [ ] Check error logging
- [ ] Test demo user creation

## Monitoring & Analytics

### Add Vercel Analytics
```bash
npm install @vercel/analytics
```

### Error Monitoring
- Set up Sentry for error tracking
- Add performance monitoring
- Set up uptime monitoring

## Security Considerations

- [ ] Use strong JWT secret (32+ characters)
- [ ] Enable HTTPS only
- [ ] Set secure headers
- [ ] Validate all inputs
- [ ] Rate limit API endpoints
- [ ] Regular security updates

## Troubleshooting

### Common Issues:
1. **Build Fails**: Check Node.js version compatibility
2. **Database Connection**: Verify DATABASE_URL format
3. **API Errors**: Check environment variables
4. **AI Not Working**: Verify GEMINI_API_KEY

### Debug Commands:
```bash
# Check build locally
npm run build

# Test database connection
npx prisma db push

# Verify environment
echo $DATABASE_URL
```

## Success! 🎉

Your AI-Powered Notion Clone is now live! Share it with:
- Portfolio websites
- LinkedIn posts
- GitHub README
- Social media
- Job applications

**Demo URL**: https://your-app.vercel.app