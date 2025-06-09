#!/usr/bin/env python3
"""
Script para testar conexão e publicação no Sanity
"""

import os
import requests
import json
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

# Config
SANITY_PROJECT_ID = os.environ.get("SANITY_PROJECT_ID")
SANITY_API_TOKEN = os.environ.get("SANITY_API_TOKEN")
SANITY_DATASET = "production"
SANITY_API_VERSION = "2023-05-03"

print("🔧 Configuração:")
print(f"Project ID: {SANITY_PROJECT_ID}")
print(f"Token: {SANITY_API_TOKEN[:10]}...{SANITY_API_TOKEN[-10:] if SANITY_API_TOKEN else 'NOT SET'}")
print(f"Dataset: {SANITY_DATASET}")
print()

# 1. Testar query simples
print("📋 Testando query no Sanity...")
query_url = f"https://{SANITY_PROJECT_ID}.api.sanity.io/v{SANITY_API_VERSION}/data/query/{SANITY_DATASET}"
headers = {"Authorization": f"Bearer {SANITY_API_TOKEN}"}

query = {"query": "*[_type == 'post'][0..2]{title, _id}"}
response = requests.get(query_url, headers=headers, params=query)

print(f"Status: {response.status_code}")
if response.status_code == 200:
    data = response.json()
    print(f"✅ Query OK! Posts encontrados: {len(data.get('result', []))}")
    for post in data.get('result', []):
        print(f"  - {post.get('title', 'Sem título')} ({post.get('_id')})")
else:
    print(f"❌ Erro: {response.text}")
print()

# 2. Verificar categorias
print("📁 Verificando categorias...")
query = {"query": "*[_type == 'category']{title, _id, slug}"}
response = requests.get(query_url, headers=headers, params=query)

if response.status_code == 200:
    categories = response.json().get('result', [])
    print(f"Categorias encontradas: {len(categories)}")
    for cat in categories:
        print(f"  - {cat.get('title')} ({cat.get('_id')})")
else:
    print(f"❌ Erro ao buscar categorias: {response.text}")
print()

# 3. Verificar autores
print("👤 Verificando autores...")
query = {"query": "*[_type == 'author']{name, _id}"}
response = requests.get(query_url, headers=headers, params=query)

if response.status_code == 200:
    authors = response.json().get('result', [])
    print(f"Autores encontrados: {len(authors)}")
    for author in authors:
        print(f"  - {author.get('name')} ({author.get('_id')})")
else:
    print(f"❌ Erro ao buscar autores: {response.text}")
print()

# 4. Criar categoria se não existir
print("🏷️ Verificando categoria 'crypto-news'...")
mutation_url = f"https://{SANITY_PROJECT_ID}.api.sanity.io/v{SANITY_API_VERSION}/data/mutate/{SANITY_DATASET}"

mutations = {
    "mutations": [{
        "createIfNotExists": {
            "_type": "category",
            "_id": "category-crypto-news",
            "title": "Crypto News",
            "slug": {
                "_type": "slug",
                "current": "crypto-news"
            },
            "description": "Latest cryptocurrency news and updates"
        }
    }]
}

response = requests.post(mutation_url, headers={
    "Content-Type": "application/json",
    "Authorization": f"Bearer {SANITY_API_TOKEN}"
}, json=mutations)

if response.status_code == 200:
    print("✅ Categoria 'crypto-news' verificada/criada")
else:
    print(f"❌ Erro ao criar categoria: {response.text}")
print()

# 5. Criar autor padrão se não existir
print("👤 Verificando autor padrão...")
mutations = {
    "mutations": [{
        "createIfNotExists": {
            "_type": "author",
            "_id": "author-default",
            "name": "Crypto News",
            "slug": {
                "_type": "slug",
                "current": "crypto-news"
            },
            "bio": "Automated news aggregator for cryptocurrency updates"
        }
    }]
}

response = requests.post(mutation_url, headers={
    "Content-Type": "application/json",
    "Authorization": f"Bearer {SANITY_API_TOKEN}"
}, json=mutations)

if response.status_code == 200:
    print("✅ Autor padrão verificado/criado")
else:
    print(f"❌ Erro ao criar autor: {response.text}")
print()

# 6. Testar publicação simples
print("📝 Testando publicação de post...")
test_post = {
    "_type": "post",
    "_id": f"post-test-{int(datetime.now().timestamp())}",
    "title": "Test Post - Pipeline Validation",
    "slug": {
        "_type": "slug",
        "current": f"test-post-{int(datetime.now().timestamp())}"
    },
    "publishedAt": datetime.now().isoformat() + "Z",
    "excerpt": "This is a test post to validate Sanity connection",
    "content": [{
        "_type": "block",
        "_key": "block1",
        "style": "normal",
        "markDefs": [],
        "children": [{
            "_type": "span",
            "_key": "span1",
            "text": "This is a test paragraph to validate the pipeline connection to Sanity.",
            "marks": []
        }]
    }],
    "author": {
        "_type": "reference",
        "_ref": "author-default"
    },
    "categories": [{
        "_type": "reference",
        "_ref": "category-crypto-news"
    }]
}

mutations = {
    "mutations": [{
        "create": test_post
    }]
}

response = requests.post(mutation_url, headers={
    "Content-Type": "application/json",
    "Authorization": f"Bearer {SANITY_API_TOKEN}"
}, json=mutations)

if response.status_code == 200:
    print("✅ Post de teste publicado com sucesso!")
    result = response.json()
    print(f"ID: {result.get('results', [{}])[0].get('id', 'Unknown')}")
else:
    print(f"❌ Erro ao publicar: {response.status_code}")
    print(f"Resposta: {response.text}")

print("\n✨ Teste concluído!")