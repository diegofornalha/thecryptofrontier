#!/usr/bin/env python3
"""
Script para publicar conteúdo no Sanity CMS.
Inspirado no script JavaScript fornecido pelo usuário.
"""

import os
import json
import logging
import requests
from datetime import datetime
import re
import random
import string
from pathlib import Path
import shutil
from dotenv import load_dotenv

# Carregar variáveis de ambiente do arquivo .env
load_dotenv()

# Configuração de logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("sanity_publisher")

# Configurações do Sanity
SANITY_CONFIG = {
    "project_id": os.environ.get("SANITY_PROJECT_ID", "brby2yrg"),
    "dataset": os.environ.get("SANITY_DATASET", "production"),
    "api_version": os.environ.get("SANITY_API_VERSION", "2023-05-03")
}

# Token de API do Sanity
SANITY_API_TOKEN = os.environ.get("SANITY_API_TOKEN")

# Função para criar um slug a partir de um título
def criar_slug(titulo):
    """Cria um slug a partir de um título"""
    # Normalizar para remover acentos
    slug = titulo.lower()
    # Remover caracteres especiais
    slug = re.sub(r'[^\w\s-]', '', slug)
    # Substituir espaços por traços
    slug = re.sub(r'\s+', '-', slug)
    return slug

# Função para gerar uma chave aleatória para o Sanity
def gerar_chave():
    """Gera uma chave aleatória para o Sanity"""
    return ''.join(random.choice(string.ascii_lowercase + string.digits) for _ in range(8))

# Função para converter texto em formato Portable Text do Sanity
def texto_para_portable_text(texto):
    """Converte texto em formato Portable Text do Sanity"""
    # Dividir o texto em parágrafos
    paragrafos = [p.strip() for p in texto.split("\n\n") if p.strip()]
    
    # Criar blocos no formato do Sanity
    blocos = []
    for paragrafo in paragrafos:
        bloco = {
            "_type": "block",
            "_key": gerar_chave(),
            "style": "normal",
            "markDefs": [],
            "children": [
                {
                    "_type": "span",
                    "_key": gerar_chave(),
                    "text": paragrafo,
                    "marks": []
                }
            ]
        }
        blocos.append(bloco)
    
    return blocos

# Função para converter HTML em formato Portable Text do Sanity
def html_para_portable_text(html):
    """Converte HTML em formato Portable Text do Sanity"""
    # Abordagem simplificada: remover tags HTML e converter para blocos de texto
    limpo = re.sub(r'<p>', '', html)
    limpo = re.sub(r'</p>', '\n\n', limpo)
    limpo = re.sub(r'<[^>]*>', '', limpo)
    
    # Dividir em parágrafos e filtrar vazios
    paragrafos = [p.strip() for p in re.split(r'\n\n+', limpo) if p.strip()]
    
    # Criar blocos no formato do Sanity
    blocos = []
    for paragrafo in paragrafos:
        bloco = {
            "_type": "block",
            "_key": gerar_chave(),
            "style": "normal",
            "markDefs": [],
            "children": [
                {
                    "_type": "span",
                    "_key": gerar_chave(),
                    "text": paragrafo,
                    "marks": []
                }
            ]
        }
        blocos.append(bloco)
    
    return blocos

# Função para verificar se categoria existe e criar se necessário
async def verificar_e_criar_categoria(categoria):
    """Verifica se categoria existe e cria se necessário"""
    # Normalizar categoria para criar slug
    categoria_slug = criar_slug(categoria)
    categoria_id = f"category-{categoria_slug}"
    
    # URL da API do Sanity
    project_id = SANITY_CONFIG["project_id"]
    dataset = SANITY_CONFIG["dataset"]
    api_version = SANITY_CONFIG["api_version"]
    
    # Configuração de autenticação
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {SANITY_API_TOKEN}"
    }
    
    # Verificar se categoria existe
    query_url = f"https://{project_id}.api.sanity.io/v{api_version}/data/query/{dataset}?query=*[_type==\"category\"&&_id==\"{categoria_id}\"][0]"
    response = requests.get(query_url, headers=headers)
    
    if response.status_code == 200:
        result = response.json()
        if result.get("result"):
            logger.info(f"Categoria '{categoria}' já existe")
            return categoria_id
    
    # Criar categoria
    logger.info(f"Criando categoria '{categoria}'...")
    mutation_url = f"https://{project_id}.api.sanity.io/v{api_version}/data/mutate/{dataset}"
    
    documento = {
        "_type": "category",
        "_id": categoria_id,
        "title": categoria,
        "slug": {
            "_type": "slug",
            "current": categoria_slug
        }
    }
    
    mutations = {
        "mutations": [
            {
                "createIfNotExists": documento
            }
        ]
    }
    
    try:
        response = requests.post(mutation_url, headers=headers, json=mutations)
        
        if response.status_code == 200:
            logger.info(f"Categoria '{categoria}' criada com sucesso")
            return categoria_id
        else:
            logger.error(f"Erro ao criar categoria: {response.status_code}")
            logger.error(response.text)
            return categoria_id  # Retorna ID mesmo assim para não quebrar o fluxo
    except Exception as e:
        logger.error(f"Erro ao criar categoria: {str(e)}")
        return categoria_id  # Retorna ID mesmo assim para não quebrar o fluxo

# Função para verificar se tag existe e criar se necessário
async def verificar_e_criar_tag(tag):
    """Verifica se tag existe e cria se necessário"""
    # Normalizar tag para criar slug
    tag_slug = criar_slug(tag)
    tag_id = f"tag-{tag_slug}"
    
    # URL da API do Sanity
    project_id = SANITY_CONFIG["project_id"]
    dataset = SANITY_CONFIG["dataset"]
    api_version = SANITY_CONFIG["api_version"]
    
    # Configuração de autenticação
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {SANITY_API_TOKEN}"
    }
    
    # Verificar se tag existe
    query_url = f"https://{project_id}.api.sanity.io/v{api_version}/data/query/{dataset}?query=*[_type==\"tag\"&&_id==\"{tag_id}\"][0]"
    response = requests.get(query_url, headers=headers)
    
    if response.status_code == 200:
        result = response.json()
        if result.get("result"):
            logger.info(f"Tag '{tag}' já existe")
            return tag_id
    
    # Criar tag
    logger.info(f"Criando tag '{tag}'...")
    mutation_url = f"https://{project_id}.api.sanity.io/v{api_version}/data/mutate/{dataset}"
    
    documento = {
        "_type": "tag",
        "_id": tag_id,
        "name": tag,
        "slug": {
            "_type": "slug",
            "current": tag_slug
        }
    }
    
    mutations = {
        "mutations": [
            {
                "createIfNotExists": documento
            }
        ]
    }
    
    try:
        response = requests.post(mutation_url, headers=headers, json=mutations)
        
        if response.status_code == 200:
            logger.info(f"Tag '{tag}' criada com sucesso")
            return tag_id
        else:
            logger.error(f"Erro ao criar tag: {response.status_code}")
            logger.error(response.text)
            return tag_id  # Retorna ID mesmo assim para não quebrar o fluxo
    except Exception as e:
        logger.error(f"Erro ao criar tag: {str(e)}")
        return tag_id  # Retorna ID mesmo assim para não quebrar o fluxo

# Função para publicar posts traduzidos no Sanity
async def publicar_posts_traduzidos():
    """Publica posts traduzidos no Sanity"""
    # Diretórios de trabalho
    diretorio_traduzidos = Path("posts_traduzidos")
    diretorio_publicados = Path("posts_publicados")
    
    # Verificar se diretório existe
    if not diretorio_traduzidos.exists():
        logger.error(f"Diretório {diretorio_traduzidos} não encontrado")
        return
    
    # Criar diretório de publicados se não existir
    if not diretorio_publicados.exists():
        diretorio_publicados.mkdir(parents=True)
    
    # Obter lista de arquivos traduzidos
    arquivos = [arquivo for arquivo in diretorio_traduzidos.glob("traduzido_*.json")]
    
    if not arquivos:
        logger.info("Nenhum arquivo traduzido encontrado para publicar")
        return
    
    logger.info(f"Encontrados {len(arquivos)} artigos para publicar")
    
    # ID do autor padrão (Alexandre Bianchi)
    autor_id = "ca38a3d5-cba1-47a0-aa29-4af17a15e17c"
    
    # Configuração do cliente Sanity
    project_id = SANITY_CONFIG["project_id"]
    dataset = SANITY_CONFIG["dataset"]
    api_version = SANITY_CONFIG["api_version"]
    
    # URL da API do Sanity
    url = f"https://{project_id}.api.sanity.io/v{api_version}/data/mutate/{dataset}"
    
    # Configuração de autenticação
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {SANITY_API_TOKEN}"
    }
    
    # Processar cada arquivo
    for arquivo in arquivos:
        try:
            logger.info(f"\nProcessando publicação de {arquivo.name}...")
            
            # Ler arquivo JSON
            with open(arquivo, "r", encoding="utf-8") as f:
                conteudo_arquivo = f.read()
            
            # Limpar conteúdo de caracteres de escape problemáticos
            conteudo_limpo = conteudo_arquivo.replace("\\$", "$").replace("\\'", "'")
            
            # Parsear JSON
            conteudo_json = json.loads(conteudo_limpo)
            
            # Extrair dados
            title = None
            content = None
            tags = []
            category = "Criptomoedas"
            slug = None
            published_at = datetime.now().isoformat()
            seo_description = ""
            seo_title = None
            
            # Tentar extrair de frontmatter_traduzido se existir
            if "frontmatter_traduzido" in conteudo_json:
                fm = conteudo_json["frontmatter_traduzido"]
                title = fm.get("title")
                tags = fm.get("tags", [])
                category = fm.get("category", "Criptomoedas")
                slug = fm.get("slug") or criar_slug(title) if title else None
                published_at = fm.get("published_date", published_at)
                seo_description = fm.get("seo_meta_description", "")
                seo_title = fm.get("seo_title", title)
            else:
                # Tentar extrair de outros campos
                title = conteudo_json.get("title_traduzido", "Sem título")
                tags = conteudo_json.get("tags", [])
                category = conteudo_json.get("category", "Criptomoedas")
                slug = conteudo_json.get("slug") or criar_slug(title)
                published_at = conteudo_json.get("publishedAt", published_at)
                seo_description = conteudo_json.get("seo_meta_description", "")
                seo_title = conteudo_json.get("seo_title", title)
            
            # Verificar dados obrigatórios
            if not title:
                logger.error(f"Título não encontrado em {arquivo.name}")
                continue
            
            # Garantir slug
            if not slug:
                slug = criar_slug(title)
            
            # Obter conteúdo para converter em Portable Text
            conteudo_para_converter = ""
            
            # Priorizar conteúdo HTML se disponível
            if "content_html_traduzido" in conteudo_json:
                conteudo_para_converter = conteudo_json["content_html_traduzido"]
                portable_text = html_para_portable_text(conteudo_para_converter)
            # Caso contrário, usar texto plano
            elif "content_text_traduzido" in conteudo_json:
                conteudo_para_converter = conteudo_json["content_text_traduzido"]
                portable_text = texto_para_portable_text(conteudo_para_converter)
            # Fallback
            else:
                conteudo_para_converter = "Conteúdo não disponível"
                portable_text = texto_para_portable_text(conteudo_para_converter)
            
            # Criar/verificar categoria
            categoria_id = await verificar_e_criar_categoria(category)
            
            # Criar/verificar tags
            tags_ids = []
            for tag in tags:
                tag_id = await verificar_e_criar_tag(tag)
                tags_ids.append(tag_id)
            
            # Converter tags para o formato correto (referências)
            tags_referencia = []
            for tag_id in tags_ids:
                tags_referencia.append({
                    "_type": "reference",
                    "_key": f"tag-{gerar_chave()}",
                    "_ref": tag_id
                })
            
            # Gerar ID do documento
            doc_id = f"post-{int(datetime.now().timestamp())}-{gerar_chave()}"
            
            # Preparar documento para Sanity
            documento = {
                "_type": "post",
                "_id": doc_id,
                "title": title,
                "slug": {
                    "_type": "slug",
                    "current": slug
                },
                "excerpt": conteudo_json.get("resumo_traduzido", title),
                "content": portable_text,
                "categories": [
                    {
                        "_type": "reference",
                        "_key": f"category-{gerar_chave()}",
                        "_ref": categoria_id
                    }
                ],
                "tags": tags_referencia,
                "author": {
                    "_type": "reference",
                    "_ref": autor_id
                },
                "publishedAt": published_at,
                "seo": {
                    "metaTitle": seo_title or title,
                    "metaDescription": seo_description or title
                }
            }
            
            # Preparar a mutação
            mutations = {
                "mutations": [
                    {
                        "createOrReplace": documento
                    }
                ]
            }
            
            # Publicar no Sanity
            logger.info(f"Publicando post '{title}'...")
            response = requests.post(url, headers=headers, json=mutations)
            
            if response.status_code == 200:
                result = response.json()
                document_id = result.get("results", [{}])[0].get("id")
                logger.info(f"Post publicado com sucesso! ID: {document_id}")
                
                # Mover arquivo para pasta de publicados
                caminho_publicado = diretorio_publicados / arquivo.name
                shutil.copy2(arquivo, caminho_publicado)
                
                # Renomear para indicar publicação
                novo_nome = caminho_publicado.with_name(
                    caminho_publicado.name.replace("traduzido_", "publicado_")
                )
                caminho_publicado.rename(novo_nome)
                
                logger.info(f"Arquivo {arquivo.name} movido para pasta de publicados")
            else:
                logger.error(f"Erro ao publicar post: {response.status_code}")
                logger.error(response.text)
        
        except Exception as e:
            logger.error(f"Erro ao publicar post {arquivo.name}: {str(e)}")
    
    logger.info("\nProcessamento de publicação concluído!")

# Função para publicar um único post no Sanity
def publicar_post(post_data):
    """Publica um único post no Sanity"""
    # URL da API do Sanity
    project_id = SANITY_CONFIG["project_id"]
    dataset = SANITY_CONFIG["dataset"]
    api_version = SANITY_CONFIG["api_version"]
    url = f"https://{project_id}.api.sanity.io/v{api_version}/data/mutate/{dataset}"
    
    # Configuração de autenticação
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {SANITY_API_TOKEN}"
    }
    
    # Preparar a mutação
    mutations = {
        "mutations": [
            {
                "create": post_data
            }
        ]
    }
    
    # Publicar no Sanity
    logger.info(f"Publicando post '{post_data.get('title')}'...")
    response = requests.post(url, headers=headers, json=mutations)
    
    if response.status_code == 200:
        result = response.json()
        document_id = result.get("results", [{}])[0].get("id")
        logger.info(f"Post publicado com sucesso! ID: {document_id}")
        return {
            "success": True,
            "document_id": document_id,
            "message": "Post publicado com sucesso!"
        }
    else:
        logger.error(f"Erro ao publicar post: {response.status_code}")
        logger.error(response.text)
        return {
            "success": False,
            "error": f"Erro HTTP {response.status_code}: {response.text}"
        }

# Execução principal
if __name__ == "__main__":
    import asyncio
    
    if not SANITY_API_TOKEN:
        logger.error("SANITY_API_TOKEN não configurado. Configure o token no arquivo .env")
        exit(1)
        
    logger.info("Iniciando publicação de posts no Sanity...")
    
    # Executar função assíncrona
    asyncio.run(publicar_posts_traduzidos()) 