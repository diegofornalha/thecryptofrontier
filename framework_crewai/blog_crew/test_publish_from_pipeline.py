#!/usr/bin/env python3
"""
Test publishing a post from the pipeline
"""

import json
import os
import requests
from pathlib import Path

# Load environment
SANITY_PROJECT_ID = os.environ.get("SANITY_PROJECT_ID", "brby2yrg")
SANITY_API_TOKEN = os.environ.get("SANITY_API_TOKEN")
SANITY_DATASET = "production"
SANITY_API_VERSION = "2023-05-03"

def test_publish():
    # Load the XRP post
    post_file = Path("posts_processados/post_1749561224_xrp-a-covid-das-financas---gary-cardone.json")
    
    with open(post_file, 'r', encoding='utf-8') as f:
        article = json.load(f)
    
    print(f"Testing publish for: {article['title_pt']}")
    
    # Create simple document
    document = {
        "_type": "post",
        "_id": f"drafts.test-xrp-covid-{int(os.urandom(4).hex(), 16)}",
        "title": article['title_pt'],
        "slug": {
            "_type": "slug", 
            "current": "xrp-covid-financas-teste"
        },
        "publishedAt": "2025-06-10T13:00:00Z",
        "excerpt": article['summary_pt'][:200],
        "content": [
            {
                "_type": "block",
                "_key": "block1",
                "style": "normal",
                "markDefs": [],
                "children": [{
                    "_type": "span",
                    "_key": "span1",
                    "text": "Teste de publicação do pipeline",
                    "marks": []
                }]
            }
        ]
    }
    
    # Try to publish
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
    
    print(f"URL: {url}")
    print(f"Token prefix: {SANITY_API_TOKEN[:10]}...")
    
    try:
        response = requests.post(url, headers=headers, json=mutations)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text[:500]}")
        
        if response.status_code == 403:
            print("\n⚠️  Error 403: Forbidden")
            print("Possible causes:")
            print("1. Token doesn't have write permissions")
            print("2. Token is for wrong dataset (production vs development)")
            print("3. Token has expired")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_publish()