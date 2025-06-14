#!/bin/bash

# Deploy Strapi Studio script
echo "Deploying Strapi Studio..."

# Use the existing hostname
echo "thecryptofrontier" | npx strapi deploy

echo "Deploy complete!"
echo "Studio URL: https://thecryptofrontier.strapi.studio"