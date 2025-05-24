# ResourceLoader.js Documentation Site

This is the documentation site for ResourceLoader.js, a flexible JavaScript library for dynamically loading resources.

## Development

To run the documentation site locally:

1. Navigate to the docs directory
2. Run the setup script:

```bash
./setup.sh
```

Or manually:

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

## Building for Production

To build the site for production:

```bash
npm run build
```

This will create a `dist` folder with the built site.

## Deployment

This site is configured for deployment on Vercel. You can deploy it in one of several ways:

### Using the Deploy Script

```bash
# Make the script executable (first time only)
chmod +x ./deploy.sh

# Run the deploy script
./deploy.sh
```

### Manual Deployment

```bash
# Build the site
npm run build

# Deploy using Vercel CLI
cd ..
vercel --prod
```

### GitHub Integration

Simply push to your GitHub repository and connect it with Vercel in the Vercel dashboard.

## Structure

-   `src/views/` - Vue components for each page
-   `public/` - Static assets including ResourceLoader.js itself
-   `src/assets/` - CSS and other assets for the site
