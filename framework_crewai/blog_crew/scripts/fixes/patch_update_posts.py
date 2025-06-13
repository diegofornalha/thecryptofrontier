#!/usr/bin/env python3
"""
Update existing posts using PATCH instead of CREATE
"""

import os
import json
import requests
from pathlib import Path
from dotenv import load_dotenv

# Load environment
load_dotenv()

SANITY_PROJECT_ID = os.environ.get("SANITY_PROJECT_ID", "z4sx85c6")
SANITY_DATASET = "production"
SANITY_API_TOKEN = os.environ.get("SANITY_API_TOKEN")
SANITY_API_VERSION = "2021-03-25"

def get_existing_post(slug):
    """Check if a post already exists"""
    query = f'*[_type == "post" && slug.current == "{slug}"][0]'
    url = f"https://{SANITY_PROJECT_ID}.api.sanity.io/v{SANITY_API_VERSION}/data/query/{SANITY_DATASET}?query={query}"
    
    headers = {"Authorization": f"Bearer {SANITY_API_TOKEN}"}
    
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        result = response.json().get("result")
        return result if result else None
    return None

def update_post_content(post_file):
    """Update an existing post or create if doesn't exist"""
    
    # Load post data
    with open(post_file, 'r', encoding='utf-8') as f:
        article = json.load(f)
    
    # Import formatting function
    import sys
    sys.path.append(str(Path(__file__).parent))
    from simple_pipeline import format_content_blocks, create_slug
    
    slug = create_slug(article['title_pt'])
    
    # Check if post exists
    existing = get_existing_post(slug)
    
    if existing:
        print(f"📝 Updating existing post: {article['title_pt']}")
        
        # Use PATCH to update
        mutations = {
            "mutations": [{
                "patch": {
                    "id": existing["_id"],
                    "set": {
                        "title": article['title_pt'],
                        "excerpt": article['summary_pt'][:200],
                        "content": format_content_blocks(article['content_pt']),
                        "publishedAt": existing.get("publishedAt", "2025-06-10T13:00:00Z")
                    }
                }
            }]
        }
    else:
        print(f"✨ Creating new post: {article['title_pt']}")
        
        # Create new document
        doc_id = f"post-{slug}"
        mutations = {
            "mutations": [{
                "createOrReplace": {
                    "_type": "post",
                    "_id": doc_id,
                    "title": article['title_pt'],
                    "slug": {
                        "_type": "slug",
                        "current": slug
                    },
                    "publishedAt": "2025-06-10T13:00:00Z",
                    "excerpt": article['summary_pt'][:200],
                    "content": format_content_blocks(article['content_pt']),
                    "author": {
                        "_type": "reference",
                        "_ref": "crypto-frontier"
                    }
                }
            }]
        }
    
    # Send request
    url = f"https://{SANITY_PROJECT_ID}.api.sanity.io/v{SANITY_API_VERSION}/data/mutate/{SANITY_DATASET}"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {SANITY_API_TOKEN}"
    }
    
    response = requests.post(url, headers=headers, json=mutations)
    
    if response.status_code == 200:
        print(f"✅ Success!")
        print(f"🔗 View at: https://thecryptofrontier.com/post/{slug}")
        return True
    else:
        print(f"❌ Error {response.status_code}: {response.text[:200]}")
        return False

def main():
    # Get the XRP post
    post_file = Path("posts_processados/post_1749561224_xrp-a-covid-das-financas---gary-cardone.json")
    
    if not post_file.exists():
        print(f"❌ File not found: {post_file}")
        return
    
    update_post_content(post_file)

if __name__ == "__main__":
    main()