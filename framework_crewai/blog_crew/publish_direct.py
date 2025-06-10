#!/usr/bin/env python3
"""
Publish directly to Sanity API
"""

import os
import json
import requests
from datetime import datetime

# Load environment variables
SANITY_PROJECT_ID = os.environ.get("SANITY_PROJECT_ID", "brby2yrg")
SANITY_API_TOKEN = os.environ.get("SANITY_API_TOKEN")
SANITY_DATASET = "production"
SANITY_API_VERSION = "2023-05-03"

def publish_to_sanity(post_data):
    """Publish directly to Sanity API"""
    
    if not SANITY_API_TOKEN:
        return {"success": False, "error": "SANITY_API_TOKEN not set"}
    
    # API URL
    url = f"https://{SANITY_PROJECT_ID}.api.sanity.io/v{SANITY_API_VERSION}/data/mutate/{SANITY_DATASET}"
    
    # Headers
    headers = {
        "Authorization": f"Bearer {SANITY_API_TOKEN}",
        "Content-Type": "application/json",
    }
    
    # Ensure required fields
    if "author" not in post_data or not post_data["author"]:
        post_data["author"] = {
            "_type": "reference",
            "_ref": "crypto-frontier"
        }
    
    # Add document ID if not present
    if "_id" not in post_data:
        import uuid
        post_data["_id"] = f"drafts.{str(uuid.uuid4())}"
    
    # Create mutation
    mutations = [{
        "createOrReplace": post_data
    }]
    
    # Send request
    try:
        response = requests.post(url, json={"mutations": mutations}, headers=headers)
        response.raise_for_status()
        
        result = response.json()
        if "results" in result and len(result["results"]) > 0:
            created_doc = result["results"][0]
            return {
                "success": True,
                "_id": created_doc.get("id", created_doc.get("_id")),
                "response": result
            }
        else:
            return {"success": False, "error": "No results returned", "response": result}
            
    except Exception as e:
        return {"success": False, "error": str(e)}

def main():
    # Load test post
    with open('test_post_links_converted.json', 'r', encoding='utf-8') as f:
        post_data = json.load(f)
    
    print("📤 Publishing test post to Sanity...")
    print(f"Title: {post_data['title']}")
    print(f"Slug: {post_data['slug']['current']}")
    
    result = publish_to_sanity(post_data)
    
    if result['success']:
        print(f"\n✅ Post published successfully!")
        print(f"ID: {result['_id']}")
        print(f"\n🔗 View at: https://thecryptofrontier.com/post/{post_data['slug']['current']}")
    else:
        print(f"\n❌ Error: {result['error']}")
        if 'response' in result:
            print(f"Response: {json.dumps(result['response'], indent=2)}")

if __name__ == "__main__":
    main()