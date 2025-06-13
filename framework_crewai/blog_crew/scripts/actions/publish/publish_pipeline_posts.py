#!/usr/bin/env python3
"""
Publish posts from pipeline with proper formatting
"""

import os
import json
import requests
from pathlib import Path
from datetime import datetime

# Use token from environment
SANITY_API_TOKEN = os.environ.get("SANITY_API_TOKEN")
SANITY_PROJECT_ID = "z4sx85c6"
SANITY_DATASET = "production"
SANITY_API_VERSION = "2023-05-03"

# Import the formatting function from simple_pipeline
import sys
sys.path.append(str(Path(__file__).parent))
from simple_pipeline import format_content_blocks, create_slug

def publish_to_sanity(post_file):
    """Publish a single post to Sanity"""
    
    # Load post data
    with open(post_file, 'r', encoding='utf-8') as f:
        article = json.load(f)
    
    print(f"\n📤 Publishing: {article['title_pt']}")
    
    # Create document
    doc_id = f"post-{create_slug(article['title_pt'])}"
    
    document = {
        "_type": "post",
        "_id": doc_id,
        "title": article['title_pt'],
        "slug": {
            "_type": "slug",
            "current": create_slug(article['title_pt'])
        },
        "publishedAt": datetime.now().isoformat() + "Z",
        "excerpt": article['summary_pt'][:200],
        "content": format_content_blocks(article['content_pt']),
        "author": {
            "_type": "reference",
            "_ref": "crypto-frontier"
        },
        "originalSource": {
            "url": article['link'],
            "title": article['title'],
            "site": "The Crypto Basic"
        }
    }
    
    # API request
    url = f"https://{SANITY_PROJECT_ID}.api.sanity.io/v{SANITY_API_VERSION}/data/mutate/{SANITY_DATASET}"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {SANITY_API_TOKEN}"
    }
    
    mutations = {
        "mutations": [{
            "createOrReplace": document
        }]
    }
    
    try:
        response = requests.post(url, headers=headers, json=mutations)
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Success! Document ID: {doc_id}")
            print(f"🔗 View at: https://thecryptofrontier.com/post/{document['slug']['current']}")
            return True
        else:
            print(f"❌ Error {response.status_code}: {response.text[:200]}")
            return False
            
    except Exception as e:
        print(f"❌ Exception: {e}")
        return False

def main():
    """Publish all recent posts from pipeline"""
    
    posts_dir = Path("posts_processados")
    
    # Find recent posts (created today)
    recent_posts = []
    for post_file in posts_dir.glob("post_17495612*.json"):
        recent_posts.append(post_file)
    
    if not recent_posts:
        print("No recent posts found")
        return
    
    print(f"Found {len(recent_posts)} posts to publish")
    
    success_count = 0
    for post_file in recent_posts:
        if publish_to_sanity(post_file):
            success_count += 1
    
    print(f"\n✅ Published {success_count}/{len(recent_posts)} posts successfully")

if __name__ == "__main__":
    main()