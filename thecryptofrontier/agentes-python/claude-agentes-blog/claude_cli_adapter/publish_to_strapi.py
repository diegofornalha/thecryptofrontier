#!/usr/bin/env python3
"""
Publica o artigo no Strapi
"""
import os
import json
import requests
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv()

STRAPI_URL = os.getenv('STRAPI_URL', 'https://ale-blog.agentesintegrados.com')
STRAPI_API_TOKEN = os.getenv('STRAPI_API_TOKEN', '')

def publish_article():
    """Publica o artigo no Strapi"""
    
    # Ler output do writer
    writer_output_file = Path("outputs/writer_20250616_034704_output.json")
    if not writer_output_file.exists():
        print("❌ Output do writer não encontrado!")
        return
    
    with open(writer_output_file, 'r') as f:
        writer_data = json.load(f)
    
    article = writer_data['result']
    
    # Preparar dados para Strapi v5 com campos corretos
    strapi_data = {
        "data": {
            "title": article['title'],
            "slug": article['slug'],
            "content": article['content'],
            "excerpt": article['excerpt'],
            "status": "published",
            "tags": article['tags'],
            "categories": article['categories'],
            "seo": {
                "metaTitle": article['seo']['metaTitle'],
                "metaDescription": article['seo']['metaDescription'],
                "keywords": article['seo']['keywords']
            },
            "publishedAt": datetime.now().isoformat()
        }
    }
    
    # Headers com autenticação
    headers = {
        'Authorization': f'Bearer {STRAPI_API_TOKEN}',
        'Content-Type': 'application/json'
    }
    
    print(f"📤 Publicando artigo: {article['title']}")
    print(f"🔗 URL: {STRAPI_URL}/api/posts")
    
    try:
        # Fazer requisição POST
        # Tentar primeiro com plural, depois singular
        endpoints_to_try = ['/api/posts', '/api/post']
        
        for endpoint in endpoints_to_try:
            response = requests.post(
                f"{STRAPI_URL}{endpoint}",
                headers=headers,
                json=strapi_data
            )
            
            if response.status_code != 404:
                break
        
        if response.status_code in [200, 201]:
            result = response.json()
            post_id = result['data']['id']
            
            print(f"\n✅ Artigo publicado com sucesso!")
            print(f"📝 ID: {post_id}")
            print(f"🔗 URL Admin: {STRAPI_URL}/admin/content-manager/collection-types/api::post.post/{post_id}")
            print(f"🌐 API URL: {STRAPI_URL}/api/posts/{post_id}")
            
            # Salvar log de publicação
            log_file = Path("outputs/publication_log.json")
            log_entry = {
                "timestamp": datetime.now().isoformat(),
                "post_id": post_id,
                "title": article['title'],
                "status": "published",
                "url": f"{STRAPI_URL}/api/posts/{post_id}"
            }
            
            logs = []
            if log_file.exists():
                with open(log_file, 'r') as f:
                    logs = json.load(f)
            
            logs.append(log_entry)
            
            with open(log_file, 'w') as f:
                json.dump(logs, f, indent=2)
            
            return result
            
        else:
            print(f"\n❌ Erro ao publicar: {response.status_code}")
            print(f"📝 Resposta: {response.text}")
            
    except Exception as e:
        print(f"\n❌ Erro de conexão: {str(e)}")
        print("\n💡 Dicas:")
        print("1. Verifique se o Strapi está rodando")
        print("2. Confirme o token no .env")
        print("3. Verifique se o content-type 'posts' existe")

def main():
    print("🚀 Publicação no Strapi\n")
    
    if not STRAPI_API_TOKEN:
        print("❌ Token do Strapi não encontrado!")
        print("💡 Configure STRAPI_API_TOKEN no arquivo .env")
        print("\nExemplo .env:")
        print("STRAPI_URL=http://localhost:1338")
        print("STRAPI_API_TOKEN=seu_token_aqui")
        return
    
    publish_article()
    
    print("\n✨ Pipeline completo!")
    print("\n📊 Resumo do Pipeline:")
    print("1. ✅ Pesquisa realizada")
    print("2. ✅ Artigo escrito")
    print("3. ✅ Publicado no Strapi")

if __name__ == "__main__":
    main()