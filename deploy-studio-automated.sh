#!/bin/bash
# Automated Sanity Studio deployment

echo "🚀 Deploying Sanity Studio..."
echo "Project ID: uvuq2a47"
echo "Hostname: thecryptofrontier-blog"

# Use expect to automate the interactive prompts
expect << EOF
spawn npx sanity deploy
expect "Select existing studio hostname"
send "\r"
expect "Studio hostname:"
send "thecryptofrontier-blog\r"
expect eof
EOF

echo "✅ Deploy process initiated!"