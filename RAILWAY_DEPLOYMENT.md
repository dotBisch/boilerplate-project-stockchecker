# Railway Deployment Guide

This guide will help you deploy the Stock Price Checker application to Railway.

## Prerequisites

1. A Railway account (sign up at [railway.app](https://railway.app))
2. A MongoDB database (MongoDB Atlas recommended)
3. Your code pushed to a Git repository (GitHub, GitLab, etc.)

## Step-by-Step Deployment

### 1. Set Up MongoDB Database

If you don't have a MongoDB database yet:

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a free cluster
3. Create a database user
4. Whitelist all IP addresses (0.0.0.0/0) for Railway access
5. Get your connection string (it should look like: `mongodb+srv://username:password@cluster.mongodb.net/database`)

### 2. Deploy to Railway

1. Go to [Railway](https://railway.app) and sign in
2. Click "New Project"
3. Select "Deploy from GitHub repo" (or GitLab/Bitbucket)
4. Connect your repository
5. Railway will automatically detect this is a Node.js project

### 3. Configure Environment Variables

In your Railway project dashboard:

1. Go to the "Variables" tab
2. Add the required environment variable:
   - `DB`: Your MongoDB connection string
   
   Example: `mongodb+srv://username:password@cluster.mongodb.net/stockchecker`

### 4. Deploy

Railway will automatically:
- Install dependencies using `npm install`
- Start your application using `npm start`
- Assign a public URL

## Troubleshooting Common Issues

### Build Fails

**Issue**: "Cannot find module" errors
**Solution**: Make sure all dependencies are listed in `package.json` dependencies (not devDependencies)

**Issue**: Node version conflicts
**Solution**: The `engines` field in `package.json` specifies Node.js >=18.0.0

### Database Connection Issues

**Issue**: "Database connection error"
**Solution**: 
- Verify your `DB` environment variable is set correctly
- Ensure your MongoDB cluster allows connections from all IPs (0.0.0.0/0)
- Check that your MongoDB user has read/write permissions

### Application Not Starting

**Issue**: Application crashes on startup
**Solution**:
- Check the Railway logs in your project dashboard
- Ensure the `start` script in `package.json` is correct: `"start": "node server.js"`
- Verify all required environment variables are set

### Port Issues

**Issue**: "Port already in use" or similar
**Solution**: Railway automatically sets the `PORT` environment variable. Your app listens on `process.env.PORT || 3000` which is already configured correctly.

## Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DB` | Yes | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/stockchecker` |
| `PORT` | No | Application port (auto-set by Railway) | `3000` |
| `NODE_ENV` | No | Node environment | `production` |

## Files Added for Railway Deployment

- `railway.json`: Railway-specific configuration
- `.railwayignore`: Files to exclude from deployment
- `.env.example`: Environment variables template
- Updated `package.json` with engines specification

## Testing Your Deployment

Once deployed, test these endpoints:

1. `GET /` - Should show the homepage
2. `GET /api/stock-prices?stock=GOOG` - Should return Google stock data
3. `GET /api/stock-prices?stock=GOOG&like=true` - Should return stock data with likes

## Support

If you continue to have issues:

1. Check Railway logs in your project dashboard
2. Verify all environment variables are set correctly
3. Ensure your MongoDB database is accessible
4. Check that your Git repository is up to date

## Production Considerations

- Enable MongoDB authentication and use strong passwords
- Consider adding rate limiting for the API endpoints
- Monitor your application performance in Railway dashboard
- Set up proper error logging and monitoring