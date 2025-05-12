"""
Ferramentas para interação com o Sanity CMS.
"""

import os
import uuid
import json
from pathlib import Path
from crewai.tools.base_tool import Tool
import frontmatter
import requests
from datetime import datetime
from pydantic import Field
from typing import Optional

class SanityPublishTool(Tool):
    """Ferramenta para publicar conteúdo no Sanity CMS."""
    
    project_id: Optional[str] = Field(default=None)
    dataset: str = Field(default="production")
    token: Optional[str] = Field(default=None)
    api_version: str = Field(default="2023-05-03")
    
    def __init__(self):
        """Inicializa a ferramenta de publicação no Sanity."""
        super().__init__(
            name="SanityPublishTool",
            description="Ferramenta para publicar conteúdo no Sanity CMS.",
            func=self._run,
            return_direct=False
        )
        
        # Carrega as configurações do ambiente
        self.project_id = os.environ.get("SANITY_PROJECT_ID", self.project_id)
        self.dataset = os.environ.get("SANITY_DATASET", self.dataset)
        self.token = os.environ.get("SANITY_API_TOKEN", self.token)
        self.api_version = os.environ.get("SANITY_API_VERSION", self.api_version)
        
        # Verificar configurações
        if not self.project_id or not self.token:
            print("⚠️ Aviso: Configurações do Sanity incompletas. A publicação pode falhar.")
    
    def criar_slug(self, titulo):
        """Cria um slug a partir do título.
        
        Args:
            titulo: Título do artigo
            
        Returns:
            Slug para uso em URLs
        """
        import re
        from unicodedata import normalize
        
        # Normalizar para remover acentos
        slug = normalize('NFKD', titulo).encode('ASCII', 'ignore').decode('utf-8')
        # Converter para minúsculas
        slug = slug.lower()
        # Substituir espaços por hífens
        slug = re.sub(r'\s+', '-', slug)
        # Remover caracteres que não são alfanuméricos ou hífens
        slug = re.sub(r'[^a-z0-9\-]', '', slug)
        # Remover hífens múltiplos
        slug = re.sub(r'\-+', '-', slug)
        # Limitar tamanho
        slug = slug[:80]
        
        return slug
    
    def formatar_markdown_em_blocos(self, conteudo):
        """Converte markdown em blocos de Portable Text para o Sanity.
        
        Args:
            conteudo: Conteúdo em formato Markdown
            
        Returns:
            Lista de blocos em formato Portable Text
        """
        # Dividir em parágrafos
        paragrafos = conteudo.split('\n\n')
        blocos = []
        
        for paragrafo in paragrafos:
            if not paragrafo.strip():
                continue
            
            # Gerar ID único
            bloco_id = str(uuid.uuid4()).replace('-', '')
            
            # Verificar se é um cabeçalho
            if paragrafo.strip().startswith('# '):
                texto = paragrafo.strip().replace('# ', '')
                blocos.append({
                    '_type': 'block',
                    '_key': bloco_id,
                    'style': 'h1',
                    'children': [
                        {
                            '_type': 'span',
                            '_key': str(uuid.uuid4()).replace('-', ''),
                            'text': texto,
                            'marks': []
                        }
                    ],
                    'markDefs': []
                })
            elif paragrafo.strip().startswith('## '):
                texto = paragrafo.strip().replace('## ', '')
                blocos.append({
                    '_type': 'block',
                    '_key': bloco_id,
                    'style': 'h2',
                    'children': [
                        {
                            '_type': 'span',
                            '_key': str(uuid.uuid4()).replace('-', ''),
                            'text': texto,
                            'marks': []
                        }
                    ],
                    'markDefs': []
                })
            else:
                blocos.append({
                    '_type': 'block',
                    '_key': bloco_id,
                    'style': 'normal',
                    'children': [
                        {
                            '_type': 'span',
                            '_key': str(uuid.uuid4()).replace('-', ''),
                            'text': paragrafo.strip(),
                            'marks': []
                        }
                    ],
                    'markDefs': []
                })
        
        return blocos
    
    def _run(self, markdown_file=None, markdown_content=None):
        """Publica conteúdo no Sanity CMS.
        
        Args:
            markdown_file: Caminho para arquivo de markdown
            markdown_content: Conteúdo do markdown diretamente
            
        Returns:
            Informações sobre a publicação
        """
        if not markdown_file and not markdown_content:
            return {"error": "É necessário fornecer um arquivo ou conteúdo markdown"}
        
        try:
            # Obter conteúdo do arquivo ou usar o conteúdo fornecido
            if markdown_file:
                arquivo_path = Path(markdown_file)
                if not arquivo_path.exists():
                    return {"error": f"Arquivo não encontrado: {markdown_file}"}
                
                post = frontmatter.load(arquivo_path)
                conteudo = post.content
                metadata = post.metadata
            else:
                # Parse do conteúdo fornecido
                post = frontmatter.loads(markdown_content)
                conteudo = post.content
                metadata = post.metadata
            
            # Verificar se temos título
            if "title" not in metadata:
                return {"error": "Metadado 'title' não encontrado no arquivo"}
            
            titulo = metadata["title"]
            slug = self.criar_slug(titulo)
            
            # Extrair excerpt (primeiro parágrafo)
            excerpt = conteudo.split('\n\n')[0].strip() if conteudo else ""
            
            # Formatar em blocos Portable Text
            blocos = self.formatar_markdown_em_blocos(conteudo)
            
            # Gerar ID único para o post
            doc_id = f"post-{datetime.now().strftime('%Y%m%d%H%M%S')}"
            
            # Criar documento para o Sanity
            documento = {
                "_type": "post",
                "_id": doc_id,
                "title": titulo,
                "slug": {
                    "_type": "slug",
                    "current": slug
                },
                "excerpt": excerpt,
                "content": blocos,
                "publishedAt": metadata.get("date", datetime.now().isoformat())
            }
            
            # Endpoint da API Sanity
            url = f"https://{self.project_id}.api.sanity.io/v{self.api_version}/data/mutate/{self.dataset}"
            
            # Cabeçalhos da requisição
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self.token}"
            }
            
            # Corpo da requisição
            body = {
                "mutations": [
                    {
                        "create": documento
                    }
                ]
            }
            
            # Enviar requisição
            response = requests.post(url, headers=headers, json=body)
            
            # Verificar resposta
            if response.status_code == 200:
                result = response.json()
                
                # Se o arquivo foi fornecido, mover para pasta de publicados
                if markdown_file:
                    try:
                        dest_dir = Path("posts_publicados")
                        dest_dir.mkdir(exist_ok=True)
                        
                        dest_file = dest_dir / arquivo_path.name
                        arquivo_path.rename(dest_file)
                        
                        print(f"Arquivo movido para: {dest_file}")
                    except Exception as e:
                        print(f"Erro ao mover arquivo: {e}")
                
                return {
                    "success": True,
                    "message": "Post publicado com sucesso",
                    "id": doc_id,
                    "slug": slug,
                    "title": titulo
                }
            else:
                return {
                    "success": False,
                    "message": f"Erro ao publicar post: {response.status_code}",
                    "details": response.text
                }
                
        except Exception as e:
            return {
                "success": False,
                "message": f"Erro ao publicar post: {str(e)}"
            } 