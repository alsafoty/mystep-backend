# MyStep API - Vercel Deployment Guide

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **MongoDB Atlas**: Set up a MongoDB Atlas cluster
3. **Environment Variables**: Prepare your production environment variables

## Deployment Steps

### 1. Install Vercel CLI (Optional)
```bash
npm i -g vercel
```

### 2. Set Up Environment Variables

In your Vercel dashboard, add these environment variables:

**IMPORTANT**: Add these in your Vercel project dashboard under Settings > Environment Variables

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/mystep?retryWrites=true&w=majority` |
| `JWT_SECRET` | Secret key for JWT tokens | `your-super-secret-jwt-key` |
| `JWT_EXPIRE` | JWT token expiration | `7d` |
| `CLIENT_URL` | Your frontend domain | `https://your-frontend.vercel.app` |
| `NODE_ENV` | Environment | `production` |

**Steps to add environment variables in Vercel:**
1. Go to your Vercel dashboard
2. Select your project
3. Click on "Settings" tab
4. Click on "Environment Variables" in the sidebar
5. Add each variable name and value
6. Make sure to select "Production", "Preview", and "Development" environments
7. Click "Save"

### 3. Deploy to Vercel

#### Option A: Git Integration (Recommended)
1. Push your code to GitHub/GitLab/Bitbucket
2. Connect your repository to Vercel
3. Vercel will automatically deploy on every push

#### Option B: CLI Deployment
```bash
cd Back-end
vercel --prod
```

### 4. Configure Custom Domain (Optional)

In Vercel dashboard:
1. Go to your project settings
2. Navigate to "Domains"
3. Add your custom domain

## API Endpoints

After deployment, your API will be available at:
- Health Check: `https://your-api.vercel.app/api/health`
- Root: `https://your-api.vercel.app/`
- Authentication: `https://your-api.vercel.app/api/auth`
- Users: `https://your-api.vercel.app/api/users`
- Learning Paths: `https://your-api.vercel.app/api/learning-path`

## Important Notes

1. **Entry Point**: The main entry point is `index.js` in the root directory (Vercel standard)
2. **Serverless Functions**: Vercel uses serverless functions, so connection pooling is optimized for this environment
3. **Cold Starts**: First request after inactivity may be slower
4. **Function Timeout**: Maximum execution time is 30 seconds (configurable)
5. **Database Connections**: MongoDB connections are cached to improve performance

## Troubleshooting

### Common Issues:

1. **Environment Variables Missing**
   - Ensure all required environment variables are set in Vercel dashboard
   - Check variable names match exactly

2. **MongoDB Connection Issues**
   - Verify MongoDB URI is correct
   - Ensure MongoDB Atlas allows connections from 0.0.0.0/0 (all IPs)
   - Check if your cluster is running

3. **CORS Issues**
   - Update `CLIENT_URL` environment variable
   - Add your frontend domain to CORS configuration

4. **Function Timeout**
   - Check for long-running operations
   - Optimize database queries
   - Consider breaking down complex operations

## Monitoring

- View logs in Vercel dashboard under "Functions" tab
- Monitor performance and errors
- Set up alerts for critical issues

## Environment Variables Security

- Never commit `.env` files to version control
- Use Vercel environment variables for production secrets
- Rotate JWT secrets regularly
- Use MongoDB Atlas connection strings with strong passwords

## Local Development vs Production

- Local: Uses `server.js` with traditional Express server
- Production: Uses `api/index.js` as serverless function
- Both share the same route handlers and middleware