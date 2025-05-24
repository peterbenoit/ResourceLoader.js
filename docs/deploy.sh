#!/bin/bash

# Build the documentation site
echo "Building documentation site..."
npm run build

# Navigate up to the main project directory for deployment
cd ..

# Deploy to Vercel
echo "Deploying to Vercel..."
vercel --prod

echo "Deployment complete!"
