#!/bin/bash
# Script to deploy Sanity Studio with the new project

cd /home/sanity/thecryptofrontier

# Create a new hostname for the studio
echo "Deploying Sanity Studio..."
echo "Creating new studio hostname: thecryptofrontier-new"

# Use expect or echo to automate the deploy
npx sanity deploy --yes