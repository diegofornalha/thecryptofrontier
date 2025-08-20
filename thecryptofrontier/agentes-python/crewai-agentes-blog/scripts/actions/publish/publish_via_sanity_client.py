#!/usr/bin/env python3
"""
Publish using @strapi/client directly
"""

import os
import json
from pathlib import Path
import subprocess

def publish_post(post_file):
    """Publish a post using Strapi client via Node.js"""
    
    # Create a temporary Node.js script
    node_script = """
const strapiClient = require('@strapi/client');
const fs = require('fs');

const client = strapiClient({
    projectId: 'z4sx85c6',
    dataset: 'production',
    apiVersion: '2023-05-03',
    useCdn: false,
    token: process.env.strapi_API_TOKEN
});

// Read the post data
const postFile = process.argv[2];
const postData = JSON.parse(fs.readFileSync(postFile, 'utf8'));

// Create document for Strapi
const document = {
    _type: 'post',
    title: postData.title_pt,
    slug: {
        _type: 'slug',
        current: postData.filename.replace('.json', '').replace(/^post_\d+_/, '')
    },
    publishedAt: new Date().toISOString(),
    excerpt: postData.summary_pt.substring(0, 200),
    content: [
        {
            _type: 'block',
            _key: 'block1',
            style: 'normal',
            markDefs: [],
            children: [{
                _type: 'span',
                _key: 'span1',
                text: postData.content_pt.substring(0, 500) + '...',
                marks: []
            }]
        }
    ],
    author: {
        _type: 'reference',
        _ref: 'crypto-frontier'
    }
};

// Publish to Strapi
client.createOrReplace(document)
    .then(result => {
        console.log('Success:', JSON.stringify({
            id: result._id,
            title: result.title,
            slug: result.slug.current
        }));
    })
    .catch(err => {
        console.error('Error:', err.message);
        process.exit(1);
    });
"""
    
    # Save the Node script temporarily
    script_path = Path("temp_publish.js")
    with open(script_path, 'w') as f:
        f.write(node_script)
    
    try:
        # Run the Node script
        result = subprocess.run(
            ['node', str(script_path), str(post_file)],
            capture_output=True,
            text=True,
            env={**os.environ}
        )
        
        if result.returncode == 0:
            print(f"✅ Published successfully!")
            print(result.stdout)
            return True
        else:
            print(f"❌ Error publishing:")
            print(result.stderr)
            return False
            
    finally:
        # Clean up
        if script_path.exists():
            script_path.unlink()

def main():
    # Get the latest XRP post
    post_file = Path("posts_processados/post_1749561224_xrp-a-covid-das-financas---gary-cardone.json")
    
    if not post_file.exists():
        print(f"❌ File not found: {post_file}")
        return
    
    with open(post_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    print(f"📤 Publishing: {data['title_pt']}")
    
    if publish_post(post_file):
        print(f"\n🔗 View at: https://thecryptofrontier.com/post/{post_file.stem.replace('post_1749561224_', '')}")
    
if __name__ == "__main__":
    main()