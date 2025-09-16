# Cloudflare Pages Deployment Guide

## Prerequisites
1. Cloudflare account
2. Your production Clerk Publishable Key
3. Backend running at https://devruntime.superatom.ai/

## Environment Variables Setup

Before deploying, update `.env.production` with your actual values:
- `VITE_CLERK_PUBLISHABLE_KEY` - Your Clerk production publishable key

## Deployment Steps

### Option 1: Using Cloudflare Pages Dashboard

1. **Build the project locally:**
   ```bash
   cd apps/frontend
   pnpm install
   pnpm build
   ```

2. **Go to Cloudflare Pages Dashboard:**
   - Navigate to https://dash.cloudflare.com/
   - Select "Pages" from the sidebar
   - Click "Create a project"
   - Choose "Upload assets"

3. **Upload the dist folder:**
   - Upload the `apps/frontend/dist` folder
   - Name your project (e.g., "superatom-frontend")

4. **Set Environment Variables in Cloudflare:**
   - Go to Settings → Environment variables
   - Add production variables:
     - `VITE_CLERK_PUBLISHABLE_KEY` = your_production_key
     - `VITE_API_URL` = https://devruntime.superatom.ai

### Option 2: Using Wrangler CLI

1. **Install Wrangler globally:**
   ```bash
   npm install -g wrangler
   ```

2. **Login to Cloudflare:**
   ```bash
   wrangler login
   ```

3. **Build the project:**
   ```bash
   cd apps/frontend
   pnpm install
   pnpm build
   ```

4. **Deploy to Cloudflare Pages:**
   ```bash
   wrangler pages deploy dist --project-name=superatom-frontend
   ```

### Option 3: GitHub Integration (Recommended for CI/CD)

1. **Connect GitHub repo to Cloudflare Pages:**
   - Go to Cloudflare Pages Dashboard
   - Click "Create a project"
   - Choose "Connect to Git"
   - Select your GitHub repository

2. **Configure build settings:**
   - Framework preset: None
   - Build command: `cd apps/frontend && pnpm install && pnpm build`
   - Build output directory: `apps/frontend/dist`
   - Root directory: `/`

3. **Set environment variables:**
   - Add all production environment variables in Cloudflare Pages settings

## Post-Deployment Checklist

- [ ] Verify CORS is configured on backend to accept requests from your Cloudflare domain
- [ ] Test authentication flow (login/signup)
- [ ] Test organization creation and switching
- [ ] Test API calls to backend
- [ ] Check browser console for any errors

## Backend CORS Configuration

Ensure your backend at https://devruntime.superatom.ai/ has CORS configured to accept requests from your Cloudflare Pages domain:

```javascript
// Example CORS configuration for NestJS
app.enableCors({
  origin: [
    'http://localhost:5173', // Local development
    'https://your-project.pages.dev', // Cloudflare Pages domain
    'https://your-custom-domain.com' // Your custom domain if any
  ],
  credentials: true,
});
```

## Custom Domain (Optional)

1. Go to your Cloudflare Pages project
2. Navigate to "Custom domains"
3. Add your custom domain
4. Update DNS records as instructed

## Troubleshooting

### Issue: API calls failing
- Check CORS configuration on backend
- Verify VITE_API_URL is correct in Cloudflare environment variables
- Check network tab for specific error messages

### Issue: Authentication not working
- Verify VITE_CLERK_PUBLISHABLE_KEY is set correctly
- Check Clerk dashboard for production domain configuration
- Ensure Clerk production instance is configured for your Cloudflare domain

### Issue: Build failing
- Ensure all dependencies are installed
- Check TypeScript errors with `pnpm tsc --noEmit`
- Verify Node version compatibility