#!/usr/bin/env python3
"""
Publish posts to the new Sanity Studio
"""

import os
import json
import requests
from pathlib import Path
from datetime import datetime

# Configuration for new project
SANITY_PROJECT_ID = "uvuq2a47"
SANITY_DATASET = "production"
SANITY_API_VERSION = "2023-05-03"

# You'll need to update this with a valid token from the new project
SANITY_API_TOKEN = os.environ.get("SANITY_API_TOKEN")

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
    
    response = requests.post(url, headers=headers, json=mutations)
    
    if response.status_code == 200:
        print(f"✅ Success! Document ID: {doc_id}")
        print(f"🔗 View at: https://thecryptofrontier.com/post/{slug}")
        return True
    else:
        print(f"❌ Error {response.status_code}: {response.text[:200]}")
        return False

def main():
    print("=" * 60)
    print("PUBLICAÇÃO DE POSTS NO NOVO SANITY STUDIO")
    print("=" * 60)
    print(f"Studio URL: https://thecryptofrontier-blog.sanity.studio")
    print(f"Project ID: {SANITY_PROJECT_ID}")
    print(f"Dataset: {SANITY_DATASET}")
    
    if not SANITY_API_TOKEN:
        print("\n⚠️  IMPORTANTE: Você precisa criar um token de API no novo projeto!")
        print("\n📝 Passos:")
        print("1. Acesse: https://www.sanity.io/manage/project/uvuq2a47/api")
        print("2. Clique em 'Add API token'")
        print("3. Nome: 'Blog Pipeline Token'")
        print("4. Permissions: 'Editor'")
        print("5. Copie o token e adicione ao .env como SANITY_API_TOKEN")
        return
    
    print(f"\nToken configurado: {SANITY_API_TOKEN[:20]}...")
    
    # Find recent posts
    posts_dir = Path("posts_processados")
    recent_posts = list(posts_dir.glob("post_17495612*.json"))
    
    if not recent_posts:
        print("\n❌ Nenhum post recente encontrado")
        return
    
    print(f"\n📚 {len(recent_posts)} posts prontos para publicar:")
    for i, post in enumerate(recent_posts, 1):
        with open(post, 'r', encoding='utf-8') as f:
            data = json.load(f)
        print(f"   {i}. {data['title_pt']}")
    
    print("\n🚀 Iniciando publicação...")
    
    success_count = 0
    for post_file in recent_posts:
        if publish_post(post_file):
            success_count += 1
    
    print(f"\n{'='*60}")
    print(f"✅ Publicados com sucesso: {success_count}/{len(recent_posts)} posts")
    
    if success_count > 0:
        print(f"\n🎉 Posts publicados no novo Studio!")
        print(f"   Acesse: https://thecryptofrontier-blog.sanity.studio")

if __name__ == "__main__":
    main()