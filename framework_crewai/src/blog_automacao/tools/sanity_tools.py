"""
Ferramentas para interação com o Sanity CMS.
"""

import os
import uuid
import json
import time
from pathlib import Path
from crewai.tools.base_tool import Tool
import frontmatter
import requests
from datetime import datetime
from pydantic import Field
from typing import Optional, Dict, Any, List

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


class SanityFormatTool(Tool):
    """Ferramenta para formatar conteúdo de acordo com o schema do Sanity CMS."""
    
    def __init__(self):
        """Inicializa a ferramenta de formatação para o Sanity."""
        super().__init__(
            name="SanityFormatTool",
            description="Formata o conteúdo traduzido para o formato JSON específico do schema do Sanity CMS.",
            func=self._run,
            return_direct=False
        )
    
    def _get_field_name(self, schema, target_name):
        """Busca o nome real de um campo no schema pelo nome alvo."""
        if not schema or not isinstance(schema, dict):
            print(f"Aviso: Schema inválido fornecido para buscar o campo '{target_name}'.")
            return target_name

        for field in schema.get('fields', []):
            if isinstance(field, dict) and field.get('name') == target_name:
                return field.get('name')
        # Se não encontrar, retorna o nome original
        print(f"Aviso: Campo '{target_name}' não encontrado no schema '{schema.get('name')}'. Usando nome original.")
        return target_name
    
    def criar_slug(self, titulo):
        """Cria um slug a partir do título."""
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
    
    def formatar_conteudo_em_blocos(self, conteudo: str) -> List[Dict[str, Any]]:
        """Converte o conteúdo em blocos de Portable Text para o Sanity.
        
        Args:
            conteudo: Texto do conteúdo a ser formatado
            
        Returns:
            Lista de blocos no formato Portable Text
        """
        if not conteudo:
            return []
            
        # Divide o conteúdo em parágrafos (assume que parágrafos são separados por linhas em branco)
        paragrafos = conteudo.split('\n\n')
        blocos = []
        
        for paragrafo in paragrafos:
            paragrafo_limpo = paragrafo.strip()
            if not paragrafo_limpo:
                continue
                
            # Gerar um ID único para o bloco
            bloco_id = str(uuid.uuid4()).replace('-', '')
            
            # Identificar o estilo do bloco (normal, h1, h2, h3, blockquote, etc.)
            estilo = 'normal'  # Estilo padrão
            texto = paragrafo_limpo
            
            # Detectar cabeçalhos
            if paragrafo_limpo.startswith('# '):
                estilo = 'h1'
                texto = paragrafo_limpo[2:].strip()
            elif paragrafo_limpo.startswith('## '):
                estilo = 'h2'
                texto = paragrafo_limpo[3:].strip()
            elif paragrafo_limpo.startswith('### '):
                estilo = 'h3'
                texto = paragrafo_limpo[4:].strip()
            elif paragrafo_limpo.startswith('#### '):
                estilo = 'h4'
                texto = paragrafo_limpo[5:].strip()
            elif paragrafo_limpo.startswith('>'):
                estilo = 'blockquote'
                texto = paragrafo_limpo[1:].strip()
            
            # Criar o bloco
            bloco = {
                '_key': bloco_id,
                '_type': 'block',
                'style': estilo,
                'children': [
                    {
                        '_key': str(uuid.uuid4()).replace('-', ''),
                        '_type': 'span',
                        'marks': [],
                        'text': texto
                    }
                ],
                'markDefs': []
            }
            
            blocos.append(bloco)
        
        return blocos
    
    def _run(self, json_content=None, json_file=None):
        """Formata o conteúdo para o schema do Sanity.
        
        Args:
            json_content: Conteúdo JSON como string ou dicionário
            json_file: Caminho para o arquivo JSON
            
        Returns:
            Dicionário com o JSON formatado para o Sanity
        """
        try:
            # Carregar o conteúdo
            if json_file:
                with open(json_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
            elif json_content:
                if isinstance(json_content, str):
                    data = json.loads(json_content)
                else:
                    data = json_content
            else:
                return {"error": "É necessário fornecer json_content ou json_file"}
            
            # Obter o schema do post
            schema_name = 'post'
            target_schema = loaded_schemas.get(schema_name)
            if not target_schema:
                return {"error": f"Schema '{schema_name}' não encontrado nos schemas gerados"}
            
            # Extrair dados necessários
            content_text = data.get('content_text_traduzido', '')
            frontmatter_traduzido = data.get('frontmatter_traduzido', {})
            frontmatter_original = data.get('frontmatter_original', {})
            
            # Título
            titulo = frontmatter_traduzido.get('title', '')
            if not titulo:
                return {"error": "Título não encontrado em frontmatter_traduzido"}
            
            # Slug
            slug = frontmatter_traduzido.get('slug', '')
            if not slug:
                slug = self.criar_slug(titulo)
            
            # Data de publicação
            data_publicacao = frontmatter_traduzido.get('published_date', datetime.now().isoformat())
            
            # Excerpt (resumo)
            excerpt = ''
            if content_text:
                primeiro_paragrafo = content_text.split('\n\n')[0].strip()
                excerpt = primeiro_paragrafo[:300] # Limitar a 300 caracteres
            
            # Formatação do conteúdo em blocos
            blocos_conteudo = self.formatar_conteudo_em_blocos(content_text)
            
            # Em vez de usar referências, vamos usar campos simples
            # Convertendo categorias e tags para strings simples
            category_names = []
            if 'category' in frontmatter_traduzido:
                categoria = frontmatter_traduzido['category']
                if isinstance(categoria, str):
                    category_names.append(categoria)
                elif isinstance(categoria, list):
                    category_names.extend(categoria)
                
            # Tags como array de strings
            tag_names = []
            if 'tags' in frontmatter_traduzido:
                if isinstance(frontmatter_traduzido['tags'], list):
                    tag_names = frontmatter_traduzido['tags']
            
            # Autor (usa um valor padrão)
            autor_ref = "ca38a3d5-cba1-47a0-aa29-4af17a15e17c"  # ID padrão do autor
            
            # Fonte original
            fonte_original = {
                'url': frontmatter_original.get('url', ''),
                'title': frontmatter_original.get('title', ''),
                'site': frontmatter_original.get('site', '')
            }
            
            # Montar o documento final
            timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
            documento_sanity = {
                '_type': 'post',
                '_id': f'drafts.post-{timestamp}',
                'title': titulo,
                'slug': {
                    '_type': 'slug',
                    'current': slug
                },
                'publishedAt': data_publicacao,
                'excerpt': excerpt,
                'content': blocos_conteudo
            }
            
            # Adicionar categorias como array de strings simples
            if category_names:
                documento_sanity['categoryNames'] = category_names
                
            # Adicionar tags como array de strings simples
            if tag_names:
                documento_sanity['tagNames'] = tag_names
                
            # Adicionar autor como string simples (em vez de referência)
            autor_nome = frontmatter_traduzido.get('author', 'Autor Desconhecido')
            documento_sanity['authorName'] = autor_nome
            
            # Adicionar fonte original
            documento_sanity['originalSource'] = fonte_original
            
            # Opcional: SEO metadata se disponível
            if 'seo_meta_description' in frontmatter_traduzido:
                documento_sanity['seo'] = {
                    'meta_title': titulo,
                    'meta_description': frontmatter_traduzido['seo_meta_description']
                }
            
            return {
                'success': True,
                'formatted_document': documento_sanity
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }


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
    
    def _run(self, json_file=None, json_content=None):
        """Publica conteúdo no Sanity CMS usando os schemas gerados."""
        if not json_file and not json_content:
            return {"error": "É necessário fornecer um arquivo JSON ou conteúdo JSON"}

        if not loaded_schemas:
             return {"error": "Schemas gerados não foram carregados. Verifique a importação e a geração."}

        try:
            # Carregar o conteúdo do documento Sanity
            if json_file:
                with open(json_file, 'r', encoding='utf-8') as f:
                    documento = json.load(f)
            elif json_content:
                if isinstance(json_content, str):
                    documento = json.loads(json_content)
                else:  # Assume que é um dicionário
                    documento = json_content
            
            # Verificar se é um documento formatado ou um documento bruto
            if '_type' not in documento:
                # É um documento bruto, precisa ser formatado
                sanity_format_tool = SanityFormatTool()
                resultado_formatacao = sanity_format_tool._run(json_content=documento)
                
                if not resultado_formatacao.get('success', False):
                    return {"error": f"Falha ao formatar o documento: {resultado_formatacao.get('error', 'Erro desconhecido')}"}
                
                documento = resultado_formatacao['formatted_document']
            
            # Enviar para Sanity API
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
                        "createOrReplace": documento
                    }
                ]
            }

            response = requests.post(url, headers=headers, json=body)

            # Processar Resposta
            if response.status_code == 200:
                result = response.json()
                if json_file:
                    try:
                        # Mover o arquivo para posts_publicados
                        arquivo_path = Path(json_file)
                        nome_arquivo = arquivo_path.name
                        
                        # Substituir prefixo 'formatado_' por 'publicado_'
                        if nome_arquivo.startswith('formatado_'):
                            nome_publicado = nome_arquivo.replace('formatado_', 'publicado_')
                        else:
                            nome_publicado = f"publicado_{nome_arquivo}"
                        
                        # Criar diretório posts_publicados se não existir
                        dest_dir = arquivo_path.parent.parent / "posts_publicados"
                        dest_dir.mkdir(exist_ok=True)
                        
                        # Caminho completo para o arquivo de destino
                        dest_file = dest_dir / nome_publicado
                        
                        # Copiar o arquivo (em vez de mover, para manter o original)
                        import shutil
                        shutil.copy2(arquivo_path, dest_file)
                        
                        print(f"Arquivo copiado para: {dest_file}")
                        
                        return {
                            "success": True,
                            "document_id": documento.get('_id', ''),
                            "result": result,
                            "arquivo_publicado": str(dest_file)
                        }
                    except Exception as e:
                        print(f"Erro ao copiar arquivo '{json_file}': {e}")
                        return {
                            "success": True,
                            "document_id": documento.get('_id', ''),
                            "result": result,
                            "warning": f"Erro ao copiar arquivo: {str(e)}"
                        }
                else:
                    return {
                        "success": True,
                        "document_id": documento.get('_id', ''),
                        "result": result
                    }
            else:
                error_detail = response.text
                try:
                    error_json = response.json()
                    error_detail = json.dumps(error_json, indent=2)
                except:
                    pass
                
                return {
                    "success": False,
                    "error": f"Erro na API do Sanity: {response.status_code}",
                    "details": error_detail
                }
        
        except Exception as e:
            import traceback
            return {
                "success": False,
                "error": f"Erro ao processar ou publicar o documento: {str(e)}",
                "traceback": traceback.format_exc()
            } 