#!/usr/bin/env python3
"""
Update the existing XRP post with new content
"""

import os
import json
import requests
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

strapi_PROJECT_ID = "z4sx85c6"
strapi_API_TOKEN = os.environ.get("strapi_API_TOKEN")
strapi_API_VERSION = "2023-05-03"

def update_xrp_post():
    """Update the existing XRP post with new content from pipeline"""
    
    # Load the new XRP Covid post
    post_file = Path("posts_processados/post_1749561224_xrp-a-covid-das-financas---gary-cardone.json")
    
    if not post_file.exists():
        print(f"❌ File not found: {post_file}")
        return
    
    with open(post_file, 'r', encoding='utf-8') as f:
        article = json.load(f)
    
    print(f"📝 Updating XRP post with: {article['title_pt']}")
    
    # Import formatting
    import sys
    sys.path.append(str(Path(__file__).parent))
    from simple_pipeline import format_content_blocks
    
    # Use PATCH to update the existing post
    mutations = {
        "mutations": [{
            "patch": {
                "id": "u2j02c8l4v7yQNRMq6yn20",  # ID do post existente
                "set": {
                    "title": article['title_pt'],
                    "excerpt": article['summary_pt'][:200],
                    "content": format_content_blocks(article['content_pt'])
                }
            }
        }]
    }
    
    # Send request
    url = f"https://{strapi_PROJECT_ID}.api.strapi.io/v{strapi_API_VERSION}/data/mutate/production"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {strapi_API_TOKEN}"
    }
    
    response = requests.post(url, headers=headers, json=mutations)
    
    if response.status_code == 200:
        print(f"✅ Post updated successfully!")
        print(f"🔗 View at: https://thecryptofrontier.com/post/xrp-alta-de-647x-no-market-cap-de-apenas-us-17-milhoes-o-que-sabemos")
        
        # Show what was updated
        result = response.json()
        print(f"\nUpdate result: {json.dumps(result, indent=2)}")
        
        return True
    else:
        print(f"❌ Error {response.status_code}: {response.text}")
        return False

if __name__ == "__main__":
    update_xrp_post()