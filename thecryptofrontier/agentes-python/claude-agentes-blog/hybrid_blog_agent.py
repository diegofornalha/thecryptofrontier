import json
import os
from typing import Dict, Any, List
from datetime import datetime
import asyncio
import aiohttp

from llm_interface import LLMInterface, ClaudeLLM, GeminiLLM

class HybridBlogAgent:
    """
    Agente de blog híbrido que pode usar Claude CLI ou Gemini (via simulação).
    """
    
    def __init__(self, llm: LLMInterface):
        self.llm = llm
        self.strapi_url = os.getenv('STRAPI_URL', 'http://localhost:1338')
        self.strapi_token = os.getenv('STRAPI_API_TOKEN')
        self.tasks_dir = "/home/strapi/thecryptofrontier/claude-agents/tasks" # Manter para compatibilidade ou remover se não for mais necessário
        os.makedirs(self.tasks_dir, exist_ok=True)
    
    def create_llm_prompt(self, task_type: str, context: Dict[str, Any]) -> str:
        """Cria o prompt para o LLM baseado no tipo de tarefa e contexto."""
        
        # Template baseado no tipo de tarefa
        templates = {
            "create_post": f"""
# Tarefa: Criar Post de Blog

## Contexto
- Tópico: {context.get('topic')}
- Palavras-chave: {', '.join(context.get('keywords', []))}
- Estilo: {context.get('style', 'profissional e acessível')}

## Instruções

Por favor, crie um post de blog completo com:

1. **Título** (máximo 60 caracteres, otimizado para SEO)
2. **Slug** (URL amigável)
3. **Meta Descrição** (150-160 caracteres)
4. **Conteúdo** (1500-2000 palavras em Markdown)
   - Introdução engajante
   - 5-7 seções com subtítulos (H2, H3)
   - Exemplos práticos
   - Estatísticas relevantes
   - Conclusão com CTA
5. **Tags** (5-7 tags relevantes)
6. **Categorias** (1-2 categorias)

## Formato de Saída

Por favor, forneça a saída em formato JSON, conforme o exemplo abaixo:

```json
{{
    "title": "...",
    "slug": "...",
    "excerpt": "...",
    "content": "...",
    "seo": {{
        "metaTitle": "...",
        "metaDescription": "..."
    }},
    "tags": ["..."],
    "categories": ["..."]
}}
```
""",
            
            "enhance_content": f"""
# Tarefa: Melhorar Conteúdo Existente

## Conteúdo Original
{context.get('content')}

## Instruções

Melhore o conteúdo:
1. Clareza e fluidez
2. Otimização SEO
3. Engagement do leitor
4. Correção gramatical
5. Adicione CTAs relevantes

Mantenha o tom: {context.get('tone', 'profissional')}

## Formato de Saída

Por favor, forneça o conteúdo melhorado em formato Markdown.
""",
            
            "research_topic": f"""
# Tarefa: Pesquisar Tópico

## Tópico: {context.get('topic')}

## Áreas de Pesquisa
1. Tendências atuais
2. Estatísticas relevantes (2024-2025)
3. Cases de sucesso
4. Melhores práticas
5. Insights únicos

## Output
Compile um relatório estruturado com:
- Resumo executivo
- Principais descobertas
- Dados e estatísticas
- Recomendações
- Fontes (quando possível)

Por favor, forneça o relatório em formato Markdown.
"""
        }
        
        return templates.get(task_type, "Tarefa não definida")
    
    async def execute_llm_task(self, task_type: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Executa a tarefa usando o LLM configurado.
        """
        prompt = self.create_llm_prompt(task_type, context)
        print(f"🤖 Enviando prompt para o LLM ({self.llm.__class__.__name__})...")
        llm_output = self.llm.generate_content(prompt)
        print(f"✅ Resposta do LLM recebida.")
        return llm_output
    
    async def process_llm_output_and_publish(self, llm_output: Dict[str, Any]) -> Dict[str, Any]:
        """Processa o output do LLM e publica no Strapi"""
        
        # Assumimos que o llm_output já é um dicionário JSON válido
        # ou que o método generate_content do LLM já fez o parsing.
        post_data = llm_output
            
        # Publica no Strapi
        return await self.publish_to_strapi(post_data)
            
    async def publish_to_strapi(self, post_data: Dict[str, Any]) -> Dict[str, Any]:
        """Publica post no Strapi"""
        
        headers = {
            'Authorization': f'Bearer {self.strapi_token}',
            'Content-Type': 'application/json'
        }
        
        strapi_data = {
            'data': {
                'title': post_data.get('title'),
                'slug': post_data.get('slug'),
                'content': post_data.get('content'),
                'excerpt': post_data.get('excerpt'),
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
                    result = await response.json()
                    print(f"✅ Post publicado: {result['data']['id']}")
                    return result
                else:
                    print(f"❌ Erro ao publicar: {response.status}")
                    print(f"Detalhes do erro: {await response.text()}")
                    return None

# Exemplo de uso
async def create_blog_post_with_llm(llm_choice: str, topic: str, keywords: List[str]):
    """Cria tarefa para o LLM processar e publica no Strapi."""
    
    llm_instance: LLMInterface
    if llm_choice.lower() == 'claude':
        llm_instance = ClaudeLLM()
    elif llm_choice.lower() == 'gemini':
        llm_instance = GeminiLLM()
    else:
        raise ValueError("Escolha de LLM inválida. Use 'claude' ou 'gemini'.")

    agent = HybridBlogAgent(llm_instance)
    
    context = {
        'topic': topic,
        'keywords': keywords,
        'style': 'profissional mas acessível'
    }
    
    llm_output = await agent.execute_llm_task('create_post', context)
    
    if llm_output:
        await agent.process_llm_output_and_publish(llm_output)
    else:
        print("❌ Nenhuma saída do LLM para processar.")

if __name__ == "__main__":
    # Exemplo: Criar tarefa usando Gemini (simulado)
    asyncio.run(create_blog_post_with_llm(
        llm_choice="gemini",
        topic="O futuro das criptomoedas em 2025",
        keywords=["criptomoedas", "blockchain", "investimento", "tendências"]
    ))

    # Exemplo: Criar tarefa usando Claude (simulado)
    # asyncio.run(create_blog_post_with_llm(
    #     llm_choice="claude",
    #     topic="Impacto da regulamentação de cripto no Brasil",
    #     keywords=["regulamentação cripto", "Brasil", "legislação", "mercado"]
    # ))