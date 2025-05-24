#!/bin/bash

# Navigate to the docs directory
cd "$(dirname "$0")"

# Install dependencies
echo "Installing dependencies..."
npm install

# Start the development server
echo "Starting development server..."
npm run dev
