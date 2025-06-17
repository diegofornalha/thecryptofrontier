#!/usr/bin/env python3
"""
Publisher Agent - Adaptado para Claude CLI
Responsável por publicar conteúdo no Strapi
"""
import os
import aiohttp
import json
from typing import Dict, Any
from datetime import datetime
from .base_agent import BaseClaudeAgent


class PublisherAgent(BaseClaudeAgent):
    """Agente responsável por publicar conteúdo no Strapi"""
    
    def __init__(self):
        super().__init__(
            name="Publisher",
            role="Especialista em Publicação Digital",
            goal="Publicar conteúdo otimizado no Strapi com máxima eficiência",
            backstory="""Você é um especialista em publicação digital com
            experiência em CMS, SEO e distribuição de conteúdo."""
        )
        
        # Configurações Strapi
        self.strapi_url = os.getenv('STRAPI_URL', 'http://localhost:1338')
        self.strapi_token = os.getenv('STRAPI_API_TOKEN')
    
    def execute(self, task: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Executa tarefa de publicação"""
        # Publisher trabalha diferente - publica direto, não cria tarefa
        return {
            "status": "ready",
            "agent": self.name,
            "note": "Publisher agent publishes directly to Strapi"
        }
    
    async def publish_to_strapi(self, post_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Publica post diretamente no Strapi
        
        Args:
            post_data: Dados do post para publicar
            
        Returns:
            Resultado da publicação
        """
        headers = {
            'Authorization': f'Bearer {self.strapi_token}',
            'Content-Type': 'application/json'
        }
        
        # Preparar dados para Strapi v5
        strapi_data = {
            'data': {
                'title': post_data.get('title'),
                'slug': post_data.get('slug') or self._generate_slug(post_data.get('title', '')),
                'content': post_data.get('content'),
                'excerpt': post_data.get('excerpt'),
                'seo': post_data.get('seo'),
                'tags': post_data.get('tags', []),
                'categories': post_data.get('categories', []),
                'status': 'published',
                'publishedAt': datetime.now().isoformat()
            }
        }
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.strapi_url}/api/posts",
                    headers=headers,
                    json=strapi_data
                ) as response:
                    
                    if response.status in [200, 201]:
                        result = await response.json()
                        
                        # Log de sucesso
                        self._log_publication(result['data'])
                        
                        return {
                            "success": True,
                            "post_id": result['data']['id'],
                            "url": f"{self.strapi_url}/api/posts/{result['data']['id']}",
                            "published_at": result['data']['attributes']['publishedAt'],
                            "message": "Post publicado com sucesso!"
                        }
                    else:
                        error_text = await response.text()
                        return {
                            "success": False,
                            "error": f"Erro {response.status}: {error_text}",
                            "message": "Falha ao publicar post"
                        }
                        
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "message": "Erro de conexão com Strapi"
            }
    
    def _generate_slug(self, title: str) -> str:
        """Gera slug a partir do título"""
        import re
        
        # Remove caracteres especiais e converte para lowercase
        slug = title.lower()
        slug = re.sub(r'[^\w\s-]', '', slug)
        slug = re.sub(r'[\s_-]+', '-', slug)
        slug = re.sub(r'^-+|-+$', '', slug)
        
        return slug
    
    def _log_publication(self, post_data: Dict[str, Any]):
        """Registra publicação em log"""
        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "post_id": post_data.get('id'),
            "title": post_data.get('attributes', {}).get('title'),
            "status": "published"
        }
        
        log_file = self.outputs_dir / "publication_log.json"
        
        # Carrega log existente
        if log_file.exists():
            with open(log_file, 'r') as f:
                logs = json.load(f)
        else:
            logs = []
        
        # Adiciona nova entrada
        logs.append(log_entry)
        
        # Salva log atualizado
        with open(log_file, 'w') as f:
            json.dump(logs, f, indent=2)
    
    def format_for_strapi(self, content: Dict[str, Any]) -> Dict[str, Any]:
        """
        Formata conteúdo para publicação no Strapi
        Pode ser usado como tarefa para Claude CLI se necessário
        """
        task_description = f"""
## Formatar Conteúdo para Publicação

### Conteúdo Original:
```json
{json.dumps(content, indent=2, ensure_ascii=False)}
```

### Formatação Requerida:

1. **Validar Campos Obrigatórios**
   - title (máximo 255 caracteres)
   - slug (URL-friendly)
   - content (Markdown válido)
   - excerpt (máximo 300 caracteres)

2. **Otimizar SEO**
   - metaTitle (50-60 caracteres)
   - metaDescription (150-160 caracteres)
   - Verificar keywords

3. **Formatar Markdown**
   - Headers hierárquicos
   - Links funcionais
   - Imagens com alt text
   - Listas formatadas

4. **Categorização**
   - Tags relevantes (5-7)
   - Categoria principal
   - Relacionamentos

### Output Esperado:
JSON formatado pronto para API do Strapi v5
"""
        
        return self.create_task(task_description, content)