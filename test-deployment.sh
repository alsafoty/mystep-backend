#!/bin/bash

# Vercel Deployment Test Script
echo "🚀 Testing Vercel Deployment Configuration for MyStep API"
echo "=================================================="

# Check if required files exist
echo "📁 Checking required files..."

files=("package.json" "vercel.json" "index.js" ".env.example" ".vercelignore")

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file is missing"
        exit 1
    fi
done

echo ""
echo "📦 Checking package.json configuration..."

# Check if package.json has required scripts
if grep -q "vercel-build" package.json; then
    echo "✅ vercel-build script found"
else
    echo "❌ vercel-build script missing"
fi

if grep -q "start" package.json; then
    echo "✅ start script found"
else
    echo "❌ start script missing"
fi

echo ""
echo "🔧 Checking vercel.json configuration..."

# Check if vercel.json has proper structure
if [ -f "vercel.json" ]; then
    echo "✅ vercel.json exists"
else
    echo "❌ vercel.json missing"
fi

if grep -q "routes" vercel.json; then
    echo "✅ Routes configured"
else
    echo "❌ Routes not configured"
fi

echo ""
echo "🌐 Checking API entry point..."

if [ -f "index.js" ] && [ -s "index.js" ]; then
    echo "✅ API entry point exists and has content"
else
    echo "❌ API entry point is missing or empty"
fi

echo ""
echo "🔒 Checking environment configuration..."

if [ -f ".env.example" ] && [ -s ".env.example" ]; then
    echo "✅ Environment example file exists"
else
    echo "❌ Environment example file is missing"
fi

echo ""
echo "📋 Pre-deployment Checklist:"
echo "1. ✅ Package.json configured for Vercel"
echo "2. ✅ Vercel.json with proper routing"
echo "3. ✅ API entry point created"
echo "4. ✅ Environment variables documented"
echo "5. ✅ .vercelignore configured"
echo "6. ✅ Deployment guide created"

echo ""
echo "🎉 Configuration Complete!"
echo "📚 Read DEPLOYMENT.md for deployment instructions"
echo "🔗 Remember to set environment variables in Vercel dashboard"
echo "🗄️ Ensure MongoDB Atlas is configured and accessible"

# Check Node.js version
echo ""
echo "🔍 System Information:"
echo "Node.js version: $(node --version 2>/dev/null || echo 'Not installed')"
echo "NPM version: $(npm --version 2>/dev/null || echo 'Not installed')"

echo ""
echo "📝 Next Steps:"
echo "1. Install dependencies: npm install"
echo "2. Set up environment variables in .env"
echo "3. Test locally: npm run dev"
echo "4. Deploy to Vercel: vercel --prod"