#!/usr/bin/env python3
"""
Blog Agent usando Claude CLI - Custo Zero
Executa tarefas através do Claude instalado localmente
"""
import subprocess
import json
import os
from typing import Dict, Any, List
from datetime import datetime
import asyncio
import aiohttp

class ClaudeCLIBlogAgent:
    """
    Agente que usa Claude CLI ao invés de API
    Totalmente gratuito!
    """
    
    def __init__(self):
        self.strapi_url = os.getenv('STRAPI_URL', 'http://localhost:1338')
        self.strapi_token = os.getenv('STRAPI_API_TOKEN')
        self.tasks_dir = "/home/strapi/thecryptofrontier/claude-agents/tasks"
        os.makedirs(self.tasks_dir, exist_ok=True)
    
    def create_task_file(self, task_type: str, context: Dict[str, Any]) -> str:
        """Cria arquivo de tarefa para Claude CLI processar"""
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{self.tasks_dir}/{task_type}_{timestamp}.md"
        
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

Salve o resultado em: `{self.tasks_dir}/output_{timestamp}.json`

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
"""
        }
        
        content = templates.get(task_type, "Tarefa não definida")
        
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(content)
        
        return filename
    
    def execute_with_claude_cli(self, task_file: str) -> str:
        """
        Executa tarefa usando Claude CLI
        Simula como seria a execução via CLI
        """
        
        # Comando para executar com Claude CLI
        # Na prática, você executaria manualmente ou via script
        command = f"""
        # Para executar manualmente:
        # 1. Abra o Claude CLI
        # 2. Cole o conteúdo do arquivo: {task_file}
        # 3. Claude processará e retornará o resultado
        # 4. Salve o output no arquivo especificado
        """
        
        print(f"📋 Tarefa criada: {task_file}")
        print("🤖 Execute com Claude CLI para processar")
        
        return task_file
    
    async def process_claude_output(self, output_file: str) -> Dict[str, Any]:
        """Processa o output do Claude e publica no Strapi"""
        
        try:
            with open(output_file, 'r', encoding='utf-8') as f:
                post_data = json.load(f)
            
            # Publica no Strapi
            return await self.publish_to_strapi(post_data)
            
        except FileNotFoundError:
            print(f"⏳ Aguardando Claude processar: {output_file}")
            return None
        except json.JSONDecodeError:
            print(f"❌ Erro ao ler JSON: {output_file}")
            return None
    
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
                    return None

# Script para monitorar e processar outputs
async def monitor_outputs():
    """Monitora outputs do Claude e publica automaticamente"""
    
    agent = ClaudeCLIBlogAgent()
    processed = set()
    
    while True:
        # Verifica arquivos de output
        output_files = [f for f in os.listdir(agent.tasks_dir) 
                       if f.startswith('output_') and f.endswith('.json')]
        
        for output_file in output_files:
            if output_file not in processed:
                full_path = os.path.join(agent.tasks_dir, output_file)
                result = await agent.process_claude_output(full_path)
                
                if result:
                    processed.add(output_file)
                    # Move para pasta de processados
                    os.rename(full_path, 
                             os.path.join(agent.tasks_dir, 'processed', output_file))
        
        # Aguarda 30 segundos antes de verificar novamente
        await asyncio.sleep(30)

# Exemplo de uso
async def create_blog_post_task(topic: str, keywords: List[str]):
    """Cria tarefa para Claude CLI processar"""
    
    agent = ClaudeCLIBlogAgent()
    
    context = {
        'topic': topic,
        'keywords': keywords,
        'style': 'profissional mas acessível'
    }
    
    task_file = agent.create_task_file('create_post', context)
    
    print(f"""
    ✅ Tarefa criada com sucesso!
    
    📋 Arquivo: {task_file}
    
    🤖 Próximos passos:
    1. Abra o arquivo em um editor
    2. Copie o conteúdo
    3. Cole no Claude CLI
    4. Salve o resultado no arquivo de output especificado
    5. O monitor publicará automaticamente no Strapi
    
    💡 Dica: Use 'python monitor_outputs.py' para publicação automática
    """)

if __name__ == "__main__":
    # Exemplo: Criar tarefa
    asyncio.run(create_blog_post_task(
        topic="Como a IA está revolucionando o atendimento ao cliente",
        keywords=["IA atendimento", "chatbot", "automação suporte", "customer service AI"]
    ))