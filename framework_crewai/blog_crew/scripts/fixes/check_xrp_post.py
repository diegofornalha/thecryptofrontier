#!/usr/bin/env python3
"""
Check if the XRP 647x post exists
"""

import os
import requests
from dotenv import load_dotenv

load_dotenv()

SANITY_PROJECT_ID = "uvuq2a47"
SANITY_API_TOKEN = os.environ.get("SANITY_API_TOKEN")
SANITY_API_VERSION = "2023-05-03"

def check_post():
    # Simple query to check the specific post
    slug = "xrp-alta-de-647x-no-market-cap-de-apenas-us-17-milhoes-o-que-sabemos"
    
    query = f'*[_type == "post" && slug.current == "{slug}"][0]'
    encoded_query = requests.utils.quote(query)
    
    url = f"https://{SANITY_PROJECT_ID}.api.sanity.io/v{SANITY_API_VERSION}/data/query/production?query={encoded_query}"
    
    headers = {}
    if SANITY_API_TOKEN:
        headers["Authorization"] = f"Bearer {SANITY_API_TOKEN}"
    
    print(f"Checking for post with slug: {slug}")
    
    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        result = response.json().get("result")
        if result:
            print(f"\n✅ Post exists!")
            print(f"ID: {result.get('_id')}")
            print(f"Title: {result.get('title')}")
            print(f"Created: {result.get('_createdAt')}")
            print(f"Has content: {'Yes' if result.get('content') else 'No'}")
            
            # Check content structure
            if result.get('content'):
                content = result['content']
                print(f"\nContent analysis:")
                print(f"- Number of blocks: {len(content)}")
                
                # Check for links
                link_count = 0
                for block in content:
                    if block.get('markDefs'):
                        link_count += len([m for m in block['markDefs'] if m.get('_type') == 'link'])
                
                print(f"- Number of links: {link_count}")
                
                # Show first block
                if content:
                    first_block = content[0]
                    if first_block.get('children'):
                        first_text = first_block['children'][0].get('text', '')[:100]
                        print(f"- First text: {first_text}...")
            
            return result
        else:
            print("❌ Post not found")
    else:
        print(f"❌ Error {response.status_code}: {response.text[:200]}")
    
    return None

if __name__ == "__main__":
    check_post()