# Deployment Guide

This guide explains how to deploy the Lorcana Paths application to Vercel with proper environment configuration.

## 🚀 Frontend Deployment (Vercel)

### Prerequisites
- Vercel account
- GitHub repository connected to Vercel
- Backend API deployed and accessible

### Environment Variables

Set the following environment variables in your Vercel dashboard:

```bash
VITE_API_URL=https://your-backend-api-domain.com/api
```

**For production with lorcanapaths.com:**
```bash
VITE_API_URL=https://lorcanapaths.com/api
```

### Deployment Steps

1. **Connect Repository to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Select the `apps/total-path-ui` directory as the root directory

2. **Configure Build Settings:**
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Set Environment Variables:**
   - Go to Project Settings → Environment Variables
   - Add `VITE_API_URL` with your backend API URL
   - Make sure it's enabled for Production, Preview, and Development

4. **Deploy:**
   - Click "Deploy" or push to your main branch
   - Vercel will automatically build and deploy

## 🔧 Backend Deployment

### Option 1: Vercel Serverless Functions
If your backend is a simple Express.js app, you can deploy it as Vercel serverless functions.

### Option 2: Separate Backend Service
Deploy your backend to a service like:
- Railway
- Render
- DigitalOcean App Platform
- AWS/GCP/Azure

Make sure to:
- Enable CORS for your frontend domain
- Set up proper environment variables
- Configure your domain to point to the backend

## 🌐 Domain Configuration

### Frontend (lorcanapaths.com)
1. In Vercel, go to your project settings
2. Add your custom domain: `lorcanapaths.com`
3. Configure DNS records as instructed by Vercel

### Backend API
1. Set up a subdomain like `api.lorcanapaths.com`
2. Update the `VITE_API_URL` environment variable to use this subdomain
3. Configure CORS to allow requests from `lorcanapaths.com`

## 🔍 Testing Deployment

### Local Testing
```bash
# Test with production API URL
VITE_API_URL=https://your-api-domain.com/api npm run dev
```

### Production Testing
1. Deploy to Vercel
2. Check browser console for any API errors
3. Verify all features work correctly
4. Test API calls in Network tab

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors:**
   - Ensure your backend has CORS configured for your frontend domain
   - Check that the API URL is correct

2. **Environment Variables Not Working:**
   - Verify variables are set in Vercel dashboard
   - Check that variable names start with `VITE_`
   - Redeploy after changing environment variables

3. **API Calls Failing:**
   - Check the Network tab in browser dev tools
   - Verify the API URL is correct
   - Ensure backend is running and accessible

### Debug Mode
Add this to your API config to see what URL is being used:

```javascript
console.log('API Base URL:', API_BASE)
console.log('Environment:', import.meta.env.MODE)
```

## 📝 Environment Files

The project includes these environment files:
- `.env.development` - Local development settings
- `.env.production` - Production settings (overridden by Vercel)
- `.env.example` - Template for local development

## 🔄 Continuous Deployment

Once set up, Vercel will automatically deploy when you push to your main branch. Make sure to:
- Test changes locally first
- Update environment variables if needed
- Monitor deployment logs for any issues
