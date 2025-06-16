#!/usr/bin/env python3
"""
MVP: Agente de Blog Simples com Claude
Substitui CrewAI com uma implementação direta e eficiente
"""
import os
from typing import Dict, Any, List
from anthropic import Anthropic
import asyncio
import aiohttp
from datetime import datetime
import json

class SimpleBlogAgent:
    """Agente simples para criação de posts usando Claude"""
    
    def __init__(self):
        self.client = Anthropic(api_key=os.getenv('ANTHROPIC_API_KEY'))
        self.strapi_url = os.getenv('STRAPI_URL', 'http://localhost:1338')
        self.strapi_token = os.getenv('STRAPI_API_TOKEN')
        
    async def create_blog_post(self, topic: str, keywords: List[str] = None) -> Dict[str, Any]:
        """Cria um post completo com Claude em uma única chamada"""
        
        prompt = f"""
        Crie um post de blog completo sobre: {topic}
        
        Palavras-chave para SEO: {', '.join(keywords or [])}
        
        O post deve incluir:
        1. Título atrativo e otimizado para SEO
        2. Meta descrição (150-160 caracteres)
        3. Introdução envolvente
        4. Corpo do artigo bem estruturado com subtítulos
        5. Conclusão com call-to-action
        6. Tags relevantes
        
        Formato de resposta JSON:
        {{
            "title": "título do post",
            "slug": "url-amigavel",
            "excerpt": "resumo do post",
            "content": "conteúdo completo em markdown",
            "seo": {{
                "metaTitle": "título para SEO",
                "metaDescription": "descrição para SEO"
            }},
            "tags": ["tag1", "tag2"],
            "categories": ["categoria1"]
        }}
        """
        
        # Chama Claude
        response = self.client.messages.create(
            model="claude-3-sonnet-20240229",  # Mais barato e rápido
            messages=[{
                "role": "user",
                "content": prompt
            }],
            max_tokens=4000,
            temperature=0.7
        )
        
        # Parse da resposta
        try:
            # Extrai JSON da resposta
            content = response.content[0].text
            json_start = content.find('{')
            json_end = content.rfind('}') + 1
            post_data = json.loads(content[json_start:json_end])
            
            # Adiciona metadados
            post_data['createdBy'] = 'claude-agent'
            post_data['status'] = 'draft'
            
            return post_data
            
        except Exception as e:
            print(f"Erro ao processar resposta: {e}")
            return None
    
    async def publish_to_strapi(self, post_data: Dict[str, Any]) -> Dict[str, Any]:
        """Publica o post no Strapi via API"""
        
        headers = {
            'Authorization': f'Bearer {self.strapi_token}',
            'Content-Type': 'application/json'
        }
        
        # Prepara dados para Strapi
        strapi_data = {
            'data': {
                'title': post_data['title'],
                'slug': post_data['slug'],
                'content': post_data['content'],
                'excerpt': post_data['excerpt'],
                'seo': post_data.get('seo'),
                'tags': post_data.get('tags', []),
                'categories': post_data.get('categories', []),
                'status': 'published',
                'publishedAt': datetime.now().isoformat()
            }
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{self.strapi_url}/api/posts",
                headers=headers,
                json=strapi_data
            ) as response:
                if response.status in [200, 201]:
                    return await response.json()
                else:
                    print(f"Erro ao publicar: {response.status}")
                    return None

async def main():
    """Exemplo de uso"""
    agent = SimpleBlogAgent()
    
    # Cria um post
    post = await agent.create_blog_post(
        topic="Inteligência Artificial no Marketing Digital",
        keywords=["IA marketing", "automação marketing", "marketing digital AI"]
    )
    
    if post:
        print(f"Post criado: {post['title']}")
        
        # Publica no Strapi
        result = await agent.publish_to_strapi(post)
        if result:
            print(f"Post publicado com sucesso! ID: {result['data']['id']}")

if __name__ == "__main__":
    asyncio.run(main())