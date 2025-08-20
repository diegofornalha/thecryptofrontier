#!/usr/bin/env python3
"""
Publish the test post with converted links to Strapi
"""

import json
import sys
import os

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from tools.strapi_tools_enhanced import publish_to_strapi_enhanced

def publish_test():
    # Load the test post
    with open('test_post_links_converted.json', 'r', encoding='utf-8') as f:
        post_data = json.load(f)
    
    print("📤 Publishing test post to Strapi...")
    print(f"Title: {post_data['title']}")
    print(f"Slug: {post_data['slug']['current']}")
    
    try:
        result = publish_to_strapi_enhanced(post_data)
        if result.get('success'):
            print(f"\n✅ Post published successfully!")
            print(f"ID: {result.get('_id')}")
            print(f"\n🔗 View at: https://thecryptofrontier.com/post/{post_data['slug']['current']}")
        else:
            print(f"\n❌ Error publishing: {result.get('error')}")
    except Exception as e:
        print(f"\n❌ Exception: {str(e)}")

if __name__ == "__main__":
    publish_test()