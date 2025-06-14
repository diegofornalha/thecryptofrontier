#!/usr/bin/env python3
"""
Publish posts to the new Strapi project
"""

import os
import json
import requests
from pathlib import Path
from datetime import datetime
from dotenv import load_dotenv

# Load environment
load_dotenv()

strapi_PROJECT_ID = "z4sx85c6"
strapi_DATASET = "production"
strapi_API_VERSION = "2023-05-03"

# Import formatting
import sys
sys.path.append(str(Path(__file__).parent))
from simple_pipeline import format_content_blocks, create_slug

def publish_all_posts():
    """Publish all posts from pipeline to new project"""
    
    # Get token from environment
    strapi_API_TOKEN = os.environ.get("strapi_API_TOKEN")
    
    if not strapi_API_TOKEN:
        print("❌ strapi_API_TOKEN not found in environment")
        print("Please set it in .env file")
        return
    
    print(f"🚀 Publishing to new Strapi project")
    print(f"Project ID: {strapi_PROJECT_ID}")
    print(f"Token length: {len(strapi_API_TOKEN)}")
    print(f"Token prefix: {strapi_API_TOKEN[:20]}...")
    
    # Find all posts
    posts_dir = Path("posts_processados")
    post_files = list(posts_dir.glob("post_*.json"))
    
    if not post_files:
        print("No posts found")
        return
    
    print(f"\nFound {len(post_files)} posts to publish")
    
    success_count = 0
    
    for post_file in post_files:
        try:
            with open(post_file, 'r', encoding='utf-8') as f:
                article = json.load(f)
            
            if 'title_pt' not in article:
                print(f"⏭️  Skipping {post_file.name} - not translated")
                continue
            
            print(f"\n📤 Publishing: {article['title_pt'][:50]}...")
            
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
                "publishedAt": article.get('published', datetime.now().isoformat()) + "Z",
                "excerpt": article['summary_pt'][:200] if 'summary_pt' in article else article.get('summary', '')[:200],
                "content": format_content_blocks(article['content_pt']),
                "author": {
                    "_type": "reference",
                    "_ref": "crypto-frontier"
                }
            }
            
            # Add original source if available
            if 'link' in article:
                document["originalSource"] = {
                    "url": article['link'],
                    "title": article.get('title', ''),
                    "site": "The Crypto Basic"
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
                print(f"✅ Success!")
                print(f"🔗 https://thecryptofrontier-blog.strapi.studio/desk/post;{doc_id}")
                success_count += 1
            else:
                print(f"❌ Error {response.status_code}: {response.text[:100]}")
                
        except Exception as e:
            print(f"❌ Error processing {post_file.name}: {str(e)}")
    
    print(f"\n{'='*60}")
    print(f"✅ Published {success_count}/{len(post_files)} posts successfully")
    print(f"\n🎉 Studio URL: https://thecryptofrontier-blog.strapi.studio")

if __name__ == "__main__":
    publish_all_posts()