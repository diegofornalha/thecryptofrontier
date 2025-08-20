import os
from typing import Dict, Any, List
import asyncio
import aiohttp
from datetime import datetime
import json

from llm_interface import LLMInterface, ClaudeLLM, GeminiLLM

class SimpleHybridBlogAgent:
    """
    Agente simples para criação de posts usando LLMs híbridos (Claude ou Gemini).
    """
    
    def __init__(self, llm: LLMInterface):
        self.llm = llm
        self.strapi_url = os.getenv('STRAPI_URL', 'http://localhost:1338')
        self.strapi_token = os.getenv('STRAPI_API_TOKEN')
        
    async def create_blog_post(self, topic: str, keywords: List[str] = None) -> Dict[str, Any]:
        """Cria um post completo com o LLM configurado em uma única chamada"""
        
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
        
        print(f"🤖 Enviando prompt para o LLM ({self.llm.__class__.__name__})...")
        llm_output = self.llm.generate_content(prompt)
        print(f"✅ Resposta do LLM recebida.")

        try:
            # Assumimos que o llm_output já é um dicionário JSON válido
            # ou que o método generate_content do LLM já fez o parsing.
            post_data = llm_output
            
            # Adiciona metadados
            post_data['createdBy'] = f'{self.llm.__class__.__name__.lower()}-agent'
            post_data['status'] = 'draft'
            
            return post_data
            
        except Exception as e:
            print(f"Erro ao processar resposta do LLM: {e}")
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
                'publishedAt': datetime.now().isoformat()}
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
                    print(f"Detalhes do erro: {await response.text()}")
                    return None

async def main():
    """Exemplo de uso"""
    import sys

    if len(sys.argv) < 4:
        print("Uso: python simple_hybrid_blog_agent.py <llm_choice> <topic> <keywords>")
        print("Exemplo: python simple_hybrid_blog_agent.py gemini \"O futuro da IA\" \"IA,futuro,tecnologia\"")
        return

    llm_choice = sys.argv[1]
    topic = sys.argv[2]
    keywords = sys.argv[3].split(',')

    llm_instance: LLMInterface
    if llm_choice.lower() == 'claude':
        llm_instance = ClaudeLLM()
    elif llm_choice.lower() == 'gemini':
        llm_instance = GeminiLLM()
    else:
        raise ValueError("Escolha de LLM inválida. Use 'claude' ou 'gemini'.")

    agent = SimpleHybridBlogAgent(llm_instance)
    
    # Cria um post
    post = await agent.create_blog_post(
        topic=topic,
        keywords=keywords
    )
    
    if post:
        print(f"Post criado: {post['title']}")
        
        # Publica no Strapi
        result = await agent.publish_to_strapi(post)
        if result:
            print(f"Post publicado com sucesso! ID: {result['data']['id']}")

if __name__ == "__main__":
    asyncio.run(main())