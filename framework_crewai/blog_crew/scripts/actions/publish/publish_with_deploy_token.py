#!/usr/bin/env python3
"""
Publish using the deploy token
"""

import os
import json
import requests
from pathlib import Path
from datetime import datetime

# Use the deploy token
strapi_API_TOKEN = "skCrPsOJjFClmx28BTkCDT4gh0ucILwKHOdCLiI6dmK3vhAuVEj0BeUZeXlsDTYijvNyeQIsk1FyaVhWlnETobxJE35s9PLjBAdWDWBAP7YB4xCzFhEzYeEoKdjLqrZIdKIX1bEsfOOZ2dPHt7hM86BN0s8G6QKscOTpm86i34zXsNi34fJ5skpIRw0zxaggI1OrnbhXr7EaTWu3o2R1LxIE2KZwESzbxUcg7waOHG1EUXwxMg3sM0imfmUmyfgyxLrMEugG3nGbpLeMWWHYoWYsq02O2qJ5hIFYoCPEjQOyBbevEp34shXqbIrMPMO5r6q3Njtnd66WOtjAiHR6a6BBDUPxgMrXCooNml41"
strapi_PROJECT_ID = "z4sx85c6"
strapi_DATASET = "production"
strapi_API_VERSION = "2023-05-03"

# Import formatting
import sys
sys.path.append(str(Path(__file__).parent))
from simple_pipeline import format_content_blocks, create_slug

def publish_post(post_file):
    """Publish a single post"""
    
    with open(post_file, 'r', encoding='utf-8') as f:
        article = json.load(f)
    
    print(f"\n📤 Publishing: {article['title_pt']}")
    
    # Create document
    slug = create_slug(article['title_pt'])
    doc_id = f"post-{slug}"
    
    document = {
        "_type": "post",
        "_id": doc_id,
        "title": article['title_pt'],
        "slug": {
            "_type": "slug",
            "current": slug
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
    url = f"https://{strapi_PROJECT_ID}.api.strapi.io/v{strapi_API_VERSION}/data/mutate/{strapi_DATASET}"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {strapi_API_TOKEN}"
    }
    
    mutations = {
        "mutations": [{
            "createOrReplace": document
        }]
    }
    
    response = requests.post(url, headers=headers, json=mutations)
    
    if response.status_code == 200:
        print(f"✅ Success! Document ID: {doc_id}")
        print(f"🔗 View at: https://thecryptofrontier.com/post/{slug}")
        return True
    else:
        print(f"❌ Error {response.status_code}: {response.text[:200]}")
        return False

def main():
    print(f"Using Project ID: {strapi_PROJECT_ID}")
    print(f"Token length: {len(strapi_API_TOKEN)}")
    print(f"Token prefix: {strapi_API_TOKEN[:20]}...")
    
    # Find recent posts
    posts_dir = Path("posts_processados")
    recent_posts = list(posts_dir.glob("post_17495612*.json"))
    
    if not recent_posts:
        print("No recent posts found")
        return
    
    print(f"\nFound {len(recent_posts)} posts to publish")
    
    success_count = 0
    for post_file in recent_posts:
        if publish_post(post_file):
            success_count += 1
    
    print(f"\n✅ Published {success_count}/{len(recent_posts)} posts successfully")

if __name__ == "__main__":
    main()