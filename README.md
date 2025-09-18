# MyStep API - Vercel Deployment Guide

This backend API is configured for easy deployment on Vercel.

## 🚀 Quick Deploy to Vercel

### Prerequisites
- Vercel account
- MongoDB Atlas database
- Node.js 18+ locally (for development)

### 1. Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/mystep&root-directory=Back-end)

**Or manually:**

1. Fork/clone this repository
2. Install Vercel CLI: `npm i -g vercel`
3. Run `vercel` in the Back-end directory
4. Follow the prompts

### 2. Environment Variables

Set these environment variables in your Vercel dashboard:

```bash
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d
CLIENT_URL=https://your-frontend-domain.vercel.app
```

### 3. Configure CORS

Update the `CLIENT_URL` environment variable with your frontend domain:
- For development: `http://localhost:3000`
- For production: `https://your-frontend-domain.vercel.app`

## 📁 Project Structure

```
Back-end/
├── api/
│   └── index.js          # Vercel serverless entry point
├── routes/
│   ├── auth.js          # Authentication routes
│   ├── users.js         # User management routes
│   └── learningPath.js  # Learning path routes
├── models/
│   ├── User.js          # User model
│   └── LearningPath.js  # Learning path model
├── middleware/
│   └── auth.js          # Authentication middleware
├── server.js            # Local development server
├── vercel.json          # Vercel configuration
└── package.json
```

## 🔧 API Endpoints

Base URL: `https://your-api-domain.vercel.app`

### Health Check
- `GET /api/health` - API status

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user

### Learning Paths
- `GET /api/learning-path/:userId` - Get learning path
- `PUT /api/learning-path/:userId` - Update learning path
- `DELETE /api/learning-path/:userId/skill` - Delete skill

## 🛠️ Local Development

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your values
# Start development server
npm run dev

# Test the API
curl http://localhost:3001/api/health
```

## 🔐 Security Features

- **Helmet**: Security headers
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS**: Configured for specific origins
- **JWT Authentication**: Secure token-based auth
- **Input Validation**: Express validator middleware

## 📊 Monitoring & Debugging

### Vercel Functions Tab
Monitor your API performance in the Vercel dashboard under the "Functions" tab.

### Logs
View logs in real-time:
```bash
vercel logs
```

### Health Check
Test your deployment:
```bash
curl https://your-api-domain.vercel.app/api/health
```

## 🚨 Troubleshooting

### Common Issues

1. **MongoDB Connection Timeout**
   - Ensure your MongoDB Atlas cluster allows connections from anywhere (0.0.0.0/0)
   - Check your connection string format

2. **CORS Errors**
   - Add your frontend domain to the `CLIENT_URL` environment variable
   - Ensure the frontend is making requests to the correct API URL

3. **500 Internal Server Error**
   - Check Vercel function logs
   - Verify all environment variables are set

### Environment Variables Checklist
- [ ] `MONGODB_URI` is set and valid
- [ ] `JWT_SECRET` is set (use a strong, random string)
- [ ] `CLIENT_URL` matches your frontend domain
- [ ] `NODE_ENV` is set to "production"

## 📈 Performance Optimization

This API is optimized for Vercel's serverless environment:

- **Connection Pooling**: MongoDB connections are cached
- **Lightweight**: Minimal dependencies
- **Fast Cold Starts**: Optimized for serverless
- **Rate Limiting**: Prevents abuse

## 🔄 Updates & Maintenance

The API will automatically redeploy when you push changes to your repository (if connected to Git).

For manual redeployment:
```bash
vercel --prod
```

## 🌐 Frontend Integration

Update your frontend API base URL to point to your Vercel deployment:

```javascript
// For production
const API_BASE_URL = 'https://your-api-domain.vercel.app'

// For development  
const API_BASE_URL = 'http://localhost:3001'
```

## 📞 Support

If you encounter issues:
1. Check the Vercel function logs
2. Verify environment variables
3. Test the health endpoint
4. Review MongoDB Atlas network settings# mystep-backend
