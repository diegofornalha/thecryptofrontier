#!/bin/bash

# Deploy Sanity Studio script
echo "Deploying Sanity Studio..."

# Use the existing hostname
echo "thecryptofrontier" | npx sanity deploy

echo "Deploy complete!"
echo "Studio URL: https://thecryptofrontier.sanity.studio"