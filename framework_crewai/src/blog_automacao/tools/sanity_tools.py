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

# Importar os schemas gerados
try:
    # Tentativa de importação relativa (assumindo estrutura src/blog_automacao/tools -> src/generated_sanity_schemas)
    from ...generated_sanity_schemas import loaded_schemas
except ImportError:
    # Fallback se a execução for de um local diferente (ex: testes)
    # Isso pode precisar de ajuste dependendo de como o script é executado.
    print("Aviso: Falha na importação relativa dos schemas gerados. Tentando importação direta.")
    # Tenta adicionar o diretório src ao path se necessário
    import sys
    src_path = Path(__file__).parent.parent.parent # Vai para src/
    if str(src_path) not in sys.path:
        sys.path.insert(0, str(src_path))
    try:
        from generated_sanity_schemas import loaded_schemas
    except ImportError as e:
        print(f"ERRO CRÍTICO: Não foi possível importar 'loaded_schemas' de 'generated_sanity_schemas'. Verifique a geração e o PYTHONPATH. Erro: {e}")
        loaded_schemas = {} # Define como vazio para evitar erros posteriores, mas a ferramenta falhará


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
            description="Publica um documento formatado corretamente (geralmente um 'post') no Sanity CMS.",
            func=self._run,
            return_direct=False
        )
        
        # Tentar usar variáveis de ambiente se disponíveis
        self.project_id = os.environ.get("NEXT_PUBLIC_SANITY_PROJECT_ID", os.environ.get("SANITY_PROJECT_ID", self.project_id))
        self.dataset = os.environ.get("NEXT_PUBLIC_SANITY_DATASET", "production")
        self.api_version = os.environ.get("NEXT_PUBLIC_SANITY_API_VERSION", "2023-05-03")
        self.token = os.environ.get("SANITY_API_TOKEN", self.token)
        # Verificar também SANITY_DEV_TOKEN e SANITY_DEPLOY_TOKEN
        if not self.token:
            self.token = os.environ.get("SANITY_DEV_TOKEN", self.token)
        if not self.token:
            self.token = os.environ.get("SANITY_DEPLOY_TOKEN", self.token)
        
        if not self.project_id or not self.token:
            print("⚠️ Aviso: Configurações do Sanity incompletas (SANITY_PROJECT_ID, SANITY_API_TOKEN/SANITY_DEV_TOKEN/SANITY_DEPLOY_TOKEN). A publicação pode falhar.")
    
    def _get_field_name(self, schema, target_name):
        """Busca o nome real de um campo no schema pelo nome alvo."""
        if not schema or not isinstance(schema, dict):
            print(f"Aviso: Schema inválido fornecido para buscar o campo '{target_name}'.")
            return target_name

        for field in schema.get('fields', []):
            if isinstance(field, dict) and field.get('name') == target_name:
                return field.get('name')
        # Se não encontrar, retorna o nome original (poderia lançar erro)
        print(f"Aviso: Campo '{target_name}' não encontrado explicitamente no schema '{schema.get('name')}'. Usando nome original.")
        return target_name
    
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
        """Converte markdown em blocos de Portable Text para o Sanity (simplificado)."""
        paragrafos = conteudo.split('\n\n')
        blocos = []

        for paragrafo in paragrafos:
            paragrafo_limpo = paragrafo.strip()
            if not paragrafo_limpo:
                continue

            bloco_id = str(uuid.uuid4()).replace('-', '')
            style = 'normal'
            texto = paragrafo_limpo

            if paragrafo_limpo.startswith('### '):
                style = 'h3'
                texto = paragrafo_limpo[4:]
            elif paragrafo_limpo.startswith('## '):
                style = 'h2'
                texto = paragrafo_limpo[3:]
            elif paragrafo_limpo.startswith('# '):
                style = 'h1'
                texto = paragrafo_limpo[2:]
            # Adicionar mais estilos (blockquote, listas, etc.) se necessário

            blocos.append({
                '_type': 'block',
                '_key': bloco_id,
                'style': style,
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

        return blocos
    
    def _run(self, markdown_file=None, markdown_content=None):
        """Publica conteúdo no Sanity CMS usando os schemas gerados."""
        if not markdown_file and not markdown_content:
            return {"error": "É necessário fornecer um arquivo markdown ou conteúdo markdown"}

        if not loaded_schemas:
             return {"error": "Schemas gerados não foram carregados. Verifique a importação e a geração."}

        # --- Obter Schema --- 
        schema_name = 'post' # Assumindo que esta ferramenta sempre publica posts
        target_schema = loaded_schemas.get(schema_name)
        if not target_schema:
            return {"error": f"Schema '{schema_name}' não encontrado nos schemas gerados."}
        schema_type_name = target_schema.get('name', schema_name)

        try:
            # --- Processar Input --- 
            if markdown_file:
                arquivo_path = Path(markdown_file)
                if not arquivo_path.exists():
                    return {"error": f"Arquivo não encontrado: {markdown_file}"}
                post = frontmatter.load(arquivo_path)
            else:
                post = frontmatter.loads(markdown_content)

            conteudo = post.content
            metadata = post.metadata

            # --- Extrair Dados --- 
            titulo_field = self._get_field_name(target_schema, 'title')
            titulo = metadata.get(titulo_field, metadata.get('title')) # Fallback para 'title'
            if not titulo:
                return {"error": f"Metadado '{titulo_field}' (ou 'title') não encontrado"}

            slug_field = self._get_field_name(target_schema, 'slug')
            slug = self.criar_slug(titulo)

            excerpt_field = self._get_field_name(target_schema, 'excerpt')
            excerpt = conteudo.split('\n\n')[0].strip() if conteudo else ""

            content_field = self._get_field_name(target_schema, 'content')
            blocos = self.formatar_markdown_em_blocos(conteudo)

            published_at_field = self._get_field_name(target_schema, 'publishedAt')
            published_at = metadata.get("date", datetime.now().isoformat())
            
            # --- Gerar ID e Documento Sanity --- 
            doc_id = f"{schema_type_name}-{datetime.now().strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:6]}"

            documento = {
                "_type": schema_type_name,
                "_id": doc_id,
                titulo_field: titulo,
                slug_field: {
                    "_type": "slug",
                    "current": slug
                },
                excerpt_field: excerpt,
                content_field: blocos,
                published_at_field: published_at
                # Adicionar outros campos aqui, buscando em metadata ou usando padrões
                # Exemplo (precisa lógica para obter author_id, category_refs, etc.):
                # self._get_field_name(target_schema, 'author'): {"_type": "reference", "_ref": author_id},
                # self._get_field_name(target_schema, 'categories'): [{ "_type": "reference", "_key": uuid.uuid4().hex, "_ref": cat_ref } for cat_ref in category_refs],
                # self._get_field_name(target_schema, 'tags'): [{ "_type": "reference", "_key": uuid.uuid4().hex, "_ref": tag_ref } for tag_ref in tag_refs],
                # self._get_field_name(target_schema, 'mainImage'): { ... } # Precisa construir o objeto da imagem
            }

            # --- Enviar para Sanity API --- 
            if not self.project_id or not self.token:
                 return {"error": "Configuração do Sanity (ID do Projeto ou Token) ausente."}
                 
            url = f"https://{self.project_id}.api.sanity.io/v{self.api_version}/data/mutate/{self.dataset}"
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self.token}"
            }
            body = {
                "mutations": [
                    {
                        "createOrReplace": documento # Usar createOrReplace pode ser mais seguro
                    }
                ]
            }

            response = requests.post(url, headers=headers, json=body)

            # --- Processar Resposta --- 
            if response.status_code == 200:
                result = response.json()
                if markdown_file:
                    try:
                        dest_dir = Path("posts_publicados")
                        dest_dir.mkdir(exist_ok=True)
                        dest_file = dest_dir / arquivo_path.name.replace("traduzido", "publicado")
                        arquivo_path.rename(dest_file)
                        print(f"Arquivo movido para: {dest_file}")
                    except Exception as e:
                        print(f"Erro ao mover arquivo '{arquivo_path.name}': {e}")

                return {
                    "success": True,
                    "message": "Post publicado/atualizado com sucesso no Sanity",
                    "id": doc_id,
                    "slug": slug,
                    "title": titulo
                }
            else:
                print(f"Erro ao publicar no Sanity ({response.status_code}): {response.text}")
                return {
                    "success": False,
                    "message": f"Erro ao publicar post no Sanity: {response.status_code}",
                    "details": response.text[:500] # Limitar tamanho dos detalhes
                }

        except Exception as e:
            import traceback
            print(f"Erro inesperado na SanityPublishTool: {e}\n{traceback.format_exc()}")
            return {
                "error": f"Erro inesperado ao processar/publicar: {str(e)}"
            } 