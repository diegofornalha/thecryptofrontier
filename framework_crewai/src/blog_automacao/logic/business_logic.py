#!/usr/bin/env python
import os
import json
import shutil
import re
import uuid
import requests
import frontmatter
import sqlite3
import yaml
import streamlit as st
from datetime import datetime, date
from pathlib import Path
import traceback

from .session_manager import SessionManager

# Cache para buscar posts do Sanity
@st.cache_data(ttl=300)  # Cache por 5 minutos
def fetch_sanity_posts(refresh=False):
    """Busca posts do Sanity CMS com cache."""
    # Se já temos posts e não é para atualizar, retorna os posts já carregados
    current_time = datetime.now()
    if (not refresh and 
        st.session_state.sanity_posts and 
        st.session_state.last_posts_fetch and 
        (current_time - st.session_state.last_posts_fetch).total_seconds() < 300):  # Cache de 5 minutos
        return st.session_state.sanity_posts
    
    try:
        # Obter credenciais do Sanity
        project_id = os.environ.get("NEXT_PUBLIC_SANITY_PROJECT_ID") or os.environ.get("SANITY_PROJECT_ID")
        dataset = os.environ.get("NEXT_PUBLIC_SANITY_DATASET") or "production"
        api_version = os.environ.get("NEXT_PUBLIC_SANITY_API_VERSION") or "2023-05-03"
        
        if not project_id:
            # Tentar obter do .env
            try:
                with open(".env", "r") as f:
                    for line in f:
                        if "SANITY_PROJECT_ID" in line or "NEXT_PUBLIC_SANITY_PROJECT_ID" in line:
                            parts = line.strip().split("=")
                            if len(parts) > 1:
                                project_id = parts[1].strip().strip('"').strip("'")
                                break
            except Exception as e:
                SessionManager.add_log(f"Erro ao ler arquivo .env: {e}")
        
        if not project_id:
            SessionManager.add_log("Erro: ID do projeto Sanity não encontrado")
            return []
        
        # Montar URL da API
        url = f"https://{project_id}.api.sanity.io/v{api_version}/data/query/{dataset}?query=*%5B_type%20%3D%3D%20%22post%22%5D%7B%0A%20%20_id%2C%0A%20%20title%2C%0A%20%20slug%2C%0A%20%20publishedAt%2C%0A%20%20excerpt%2C%0A%20%20%22estimatedReadingTime%22%3A%20round%28length%28pt%3A%3Atext%28content%29%29%20%2F%205%20%2F%20180%29%0A%7D%20%7C%20order%28publishedAt%20desc%29"
        
        # Fazer a requisição
        SessionManager.add_log("Buscando posts do Sanity CMS...")
        response = requests.get(url)
        
        if response.status_code == 200:
            posts = response.json().get("result", [])
            SessionManager.add_log(f"Posts encontrados: {len(posts)}")
            st.session_state.sanity_posts = posts
            st.session_state.last_posts_fetch = current_time
            return posts
        else:
            SessionManager.add_log(f"Erro na requisição: {response.status_code}")
            return []
    
    except Exception as e:
        SessionManager.add_log(f"Erro ao buscar posts: {str(e)}")
        return []

def monitor_feeds():
    """Executa o monitoramento de feeds RSS."""
    with st.spinner("Monitorando feeds RSS..."):
        crew = SessionManager.get_crew()
        SessionManager.add_log("Iniciando monitoramento de feeds RSS...")
        
        try:
            result = crew.monitoramento_crew().kickoff(inputs={})
            SessionManager.add_log(f"Monitoramento concluído: {result.raw[:100]}...")
            SessionManager.update_last_run()
            return True
        except Exception as e:
            SessionManager.add_log(f"Erro no monitoramento: {str(e)}")
            return False

def translate_article(arquivo_json=None):
    """Traduz um artigo específico ou o primeiro disponível."""
    with st.spinner("Traduzindo artigo..."):
        crew = SessionManager.get_crew()
        
        # Se não foi especificado um arquivo, buscar o primeiro disponível
        if not arquivo_json:
            dir_posts = Path("posts_para_traduzir")
            if not dir_posts.exists():
                dir_posts = Path("posts_traduzidos")  # Fallback para compatibilidade
                
            arquivos = list(dir_posts.glob("para_traduzir_*.json"))
            
            if not arquivos:
                SessionManager.add_log("Nenhum artigo encontrado para traduzir.")
                return False
            
            # Ordenar por nome para pegar o mais antigo primeiro
            arquivos.sort()
            arquivo_json = arquivos[0]  # Pegar apenas o primeiro arquivo
        
        SessionManager.add_log(f"Iniciando tradução do artigo: {arquivo_json.name}")
        
        try:
            # Ler o arquivo para determinar seu formato
            with open(arquivo_json, "r", encoding="utf-8") as f:
                conteudo = f.read()
            
            # Tentar como JSON primeiro
            try:
                dados_json = json.loads(conteudo)
                inputs = {"arquivo_json": str(arquivo_json)}
                SessionManager.add_log(f"Arquivo detectado como JSON: {arquivo_json.name}")
            except json.JSONDecodeError:
                # Tentar como markdown com frontmatter
                frontmatter_match = re.match(r'---\s*(.*?)\s*---', conteudo, re.DOTALL)
                if frontmatter_match:
                    SessionManager.add_log(f"Arquivo detectado com frontmatter: {arquivo_json.name}")
                    # Extrair metadados do frontmatter
                    frontmatter_content = frontmatter_match.group(1).strip()
                    if frontmatter_content.startswith('{'):
                        metadata = json.loads(frontmatter_content)
                    else:
                        metadata = yaml.safe_load(frontmatter_content)
                    
                    # Extrair título e URL
                    titulo = metadata.get('title') or metadata.get('titulo') or "Sem título"
                    url = metadata.get('original_link') or metadata.get('link') or metadata.get('url') or ""
                    
                    inputs = {
                        "arquivo_markdown": str(arquivo_json),
                        "titulo": titulo,
                        "url": url,
                        "conteudo": conteudo
                    }
                else:
                    # Não tem frontmatter, usar como texto simples
                    SessionManager.add_log(f"Arquivo sem estrutura reconhecida, usando como texto puro: {arquivo_json.name}")
                    inputs = {
                        "arquivo_markdown": str(arquivo_json),
                        "conteudo": conteudo
                    }
            
            # Executar a tradução
            resultado = crew.traducao_crew().kickoff(inputs=inputs)
            SessionManager.add_log(f"✅ Tradução concluída para {arquivo_json.name}")
            SessionManager.update_last_run()
            return True
            
        except Exception as e:
            SessionManager.add_log(f"❌ Erro ao traduzir {arquivo_json.name}: {str(e)}")
            SessionManager.add_log(f"Trace: {traceback.format_exc()}")
            return False

def publish_article(arquivo_json=None):
    """Publica um artigo traduzido no Sanity CMS."""
    with st.spinner("Publicando artigo..."):
        # Se não foi especificado um arquivo, buscar o primeiro disponível
        if not arquivo_json:
            dir_posts = Path("posts_traduzidos")
            arquivos = [a for a in dir_posts.glob("*.json") if not a.name.startswith("para_traduzir_")]
            
            if not arquivos:
                SessionManager.add_log("Nenhum artigo traduzido encontrado para publicar.")
                return False
            
            # Ordenar por data de modificação para pegar o mais antigo primeiro
            arquivos.sort(key=lambda x: x.stat().st_mtime)
            arquivo_json = arquivos[0]
        
        SessionManager.add_log(f"Iniciando publicação direta do artigo: {arquivo_json.name}")
        
        # Tentar publicar usando o método direto
        crew = SessionManager.get_crew()
        try:
            sucesso, mensagem = publish_direct(arquivo_json)
            
            if sucesso:
                SessionManager.add_log(f"✅ {mensagem}")
                
                # Mover o arquivo para a pasta posts_publicados
                dir_publicados = Path("posts_publicados")
                if not dir_publicados.exists():
                    dir_publicados.mkdir(exist_ok=True)
                    
                arquivo_destino = dir_publicados / arquivo_json.name.replace("traduzido_", "publicado_")
                try:
                    # Usar shutil para garantir que funcione entre sistemas de arquivos
                    shutil.copy2(arquivo_json, arquivo_destino)
                    # Só excluir o original se a cópia foi bem-sucedida
                    if arquivo_destino.exists():
                        arquivo_json.unlink()
                    SessionManager.add_log(f"✅ Arquivo movido para posts_publicados: {arquivo_json.name}")
                except Exception as e:
                    SessionManager.add_log(f"⚠️ Aviso: Não foi possível mover o arquivo: {str(e)}")
            else:
                SessionManager.add_log(f"❌ Erro ao publicar: {mensagem}")
                
                # Tentar via CrewAI como fallback
                try:
                    SessionManager.add_log("Tentando publicar usando CrewAI como alternativa...")
                    
                    # Ler o conteúdo do arquivo
                    with open(arquivo_json, "r", encoding="utf-8") as f:
                        conteudo = f.read()
                        
                    # Passar para a publicação
                    result = crew.publicacao_crew().kickoff(inputs={
                        "arquivo_json": str(arquivo_json)
                    })
                    
                    SessionManager.add_log(f"✅ Artigo publicado com sucesso via CrewAI: {arquivo_json.name}")
                    return True
                except Exception as e:
                    SessionManager.add_log(f"❌ Erro na publicação via CrewAI: {str(e)}")
                    return False
            
            SessionManager.update_last_run()
            # Limpar o cache de posts para forçar atualização
            SessionManager.clear_sanity_cache()
            return sucesso
        
        except Exception as e:
            SessionManager.add_log(f"❌ Erro ao publicar {arquivo_json.name}: {str(e)}")
            return False

def publish_direct(arquivo_markdown):
    """Publica um post diretamente no Sanity CMS sem usar o CrewAI."""
    try:
        # Ler arquivo markdown
        with open(arquivo_markdown, "r", encoding="utf-8") as f:
            conteudo = f.read()
        
        # Parsear o frontmatter (cabeçalho YAML)
        post = frontmatter.loads(conteudo)
        
        # Verificar se temos título
        if not post.get('title'):
            return False, "Arquivo sem título no front matter"
        
        # Criar slug do título
        slug = create_slug(post.get('title'))
        
        # Preparar o documento para o Sanity (diretamente via API Sanity)
        project_id = os.environ.get("NEXT_PUBLIC_SANITY_PROJECT_ID") or os.environ.get("SANITY_PROJECT_ID")
        dataset = os.environ.get("NEXT_PUBLIC_SANITY_DATASET") or "production"
        api_version = os.environ.get("NEXT_PUBLIC_SANITY_API_VERSION") or "2023-05-03"
        token = os.environ.get("SANITY_DEV_TOKEN")
        
        # Se não encontrou o token DEV, verificar outros tokens
        if not token:
            token = os.environ.get("SANITY_API_TOKEN")
        if not token:
            token = os.environ.get("SANITY_DEPLOY_TOKEN")
        
        if not project_id or not token:
            # Tentar ler do .env
            try:
                with open(".env", "r") as f:
                    for line in f:
                        if "SANITY_PROJECT_ID" in line or "NEXT_PUBLIC_SANITY_PROJECT_ID" in line:
                            parts = line.strip().split("=")
                            if len(parts) > 1:
                                project_id = parts[1].strip().strip('"').strip("'")
                        elif "SANITY_DEV_TOKEN" in line:
                            parts = line.strip().split("=")
                            if len(parts) > 1:
                                token = parts[1].strip().strip('"').strip("'")
                        elif "SANITY_API_TOKEN" in line:
                            parts = line.strip().split("=")
                            if len(parts) > 1:
                                token = parts[1].strip().strip('"').strip("'")
                        elif "SANITY_DEPLOY_TOKEN" in line:
                            parts = line.strip().split("=")
                            if len(parts) > 1:
                                token = parts[1].strip().strip('"').strip("'")
            except Exception as e:
                return False, f"Erro ao ler arquivo .env: {e}"
        
        if not project_id or not token:
            return False, "Credenciais do Sanity não encontradas"
        
        # Gerar ID único para o post
        doc_id = f"post-{datetime.now().strftime('%Y%m%d%H%M%S')}"
        
        # Extrair o primeiro parágrafo como excerpt
        excerpt = post.content.split('\n\n')[0] if post.content else ""
        
        # Transformar data em string ISO, se necessário
        published_date = post.get('date')
        # Detectar e converter diferentes formatos de data para string ISO
        if published_date:
            if isinstance(published_date, datetime):
                published_date = published_date.isoformat()
            elif isinstance(published_date, str):
                # Se já é string, verificar se tem formato ISO
                if not published_date.endswith('Z') and 'T' in published_date:
                    # Já parece ser ISO mas podemos garantir
                    try:
                        published_date = datetime.fromisoformat(published_date).isoformat()
                    except:
                        pass
            else:
                # Se não for nem string nem datetime, usar data atual
                published_date = datetime.now().isoformat()
        else:
            # Se não tiver data, usar a atual
            published_date = datetime.now().isoformat()
        
        # Formatamos o conteúdo de forma simplificada para iniciar
        # Para um formato completo, seria necessário converter o markdown para blocos Sanity
        documento = {
            "_type": "post",
            "_id": doc_id,
            "title": post.get('title'),
            "slug": {
                "_type": "slug",
                "current": slug
            },
            "excerpt": excerpt.strip()[:160],
            "content": [
                {
                    "_type": "block",
                    "_key": str(uuid.uuid4()).replace('-', ''),
                    "style": "normal",
                    "children": [
                        {
                            "_type": "span",
                            "_key": str(uuid.uuid4()).replace('-', ''),
                            "text": post.content,
                            "marks": []
                        }
                    ],
                    "markDefs": []
                }
            ],
            "publishedAt": published_date
        }
        
        # Enviar para o Sanity
        url = f"https://{project_id}.api.sanity.io/v{api_version}/data/mutate/{dataset}"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {token}"
        }
        
        # Converter o documento para JSON, garantindo que todas as datas sejam strings
        try:
            payload_json = json.dumps({
                "mutations": [
                    {
                        "create": documento
                    }
                ]
            })
        except TypeError as e:
            # Se falhar, tente encontrar campos problemáticos
            SessionManager.add_log(f"Erro ao serializar JSON: {str(e)}")
            # Verificar campos e converter problemas comuns
            for key, value in documento.items():
                if isinstance(value, (datetime, date)):
                    documento[key] = value.isoformat()
            
            # Tentar novamente
            payload_json = json.dumps({
                "mutations": [
                    {
                        "create": documento
                    }
                ]
            })
        
        response = requests.post(url, headers=headers, data=payload_json)
        
        if response.status_code == 200:
            resultado = response.json()
            # Debugar a estrutura da resposta para entender o formato
            SessionManager.add_log(f"Resposta do Sanity: {resultado}")
            # Usar o ID do documento que foi enviado, já que sabemos isso
            return True, f"Post publicado com sucesso! ID: {doc_id}"
        else:
            return False, f"Erro API Sanity: {response.status_code} - {response.text}"
            
    except Exception as e:
        return False, f"Erro ao publicar post: {str(e)}\n{traceback.format_exc()}"

def create_slug(title):
    """Cria um slug a partir do título."""
    import re
    # Converter para minúsculas
    slug = title.lower()
    # Remover acentos
    import unicodedata
    slug = unicodedata.normalize('NFKD', slug).encode('ASCII', 'ignore').decode('utf-8')
    # Substituir espaços e caracteres especiais por hífen
    slug = re.sub(r'[^\w\s-]', '', slug)
    slug = re.sub(r'\s+', '-', slug)
    # Remover hífens duplicados
    slug = re.sub(r'-+', '-', slug)
    # Limitar tamanho
    return slug[:80]

def get_stats():
    """Obtém estatísticas do sistema."""
    stats = {}
    
    # Diretório para artigos não traduzidos
    dir_para_traduzir = Path("posts_para_traduzir")
    if not dir_para_traduzir.exists():
        dir_para_traduzir = Path("posts_traduzidos")
    
    # Diretório para artigos traduzidos
    dir_traduzidos = Path("posts_traduzidos")
    
    # Diretório para artigos publicados
    dir_publicados = Path("posts_publicados")
    if not dir_publicados.exists():
        dir_publicados = Path(".")
    
    # Artigos para traduzir
    stats["para_traduzir"] = len(list(dir_para_traduzir.glob("para_traduzir_*.json")))
    
    # Artigos traduzidos (não começam com "para_traduzir_")
    stats["traduzidos"] = len([a for a in dir_traduzidos.glob("*.json") if not a.name.startswith("para_traduzir_")])
    
    # Artigos publicados - usar a contagem do Sanity apenas ao visualizar a tab Sanity CMS
    if st.session_state.sanity_posts:
        stats["publicados"] = len(st.session_state.sanity_posts)
    else:
        stats["publicados"] = len(list(dir_publicados.glob("*.json")))
    
    return stats

# Funções para manipulação do banco de dados
def get_db_posts():
    """Retorna todos os posts processados do banco de dados."""
    db_path = "posts_database.sqlite"
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Verificar se a tabela existe
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='posts'")
        if not cursor.fetchone():
            conn.close()
            return []
        
        # Obter todos os posts ordenados por data de processamento (mais recentes primeiro)
        cursor.execute("""
        SELECT id, guid, title, link, processed_date, published_date, source, status
        FROM posts
        ORDER BY processed_date DESC
        """)
        
        # Converter para lista de dicionários
        columns = [col[0] for col in cursor.description]
        posts = [dict(zip(columns, row)) for row in cursor.fetchall()]
        
        conn.close()
        return posts
    except Exception as e:
        SessionManager.add_log(f"Erro ao consultar banco de dados: {e}")
        return []

def delete_db_post(post_id):
    """Exclui um post do banco de dados pelo ID."""
    db_path = "posts_database.sqlite"
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Excluir o post
        cursor.execute("DELETE FROM posts WHERE id = ?", (post_id,))
        
        # Obter número de linhas afetadas
        rows_affected = cursor.rowcount
        
        conn.commit()
        conn.close()
        
        if rows_affected > 0:
            SessionManager.add_log(f"Post ID {post_id} excluído com sucesso.")
            return True
        else:
            SessionManager.add_log(f"Post ID {post_id} não encontrado.")
            return False
    
    except Exception as e:
        SessionManager.add_log(f"Erro ao excluir post: {e}")
        return False

def clear_db():
    """Limpa todos os posts do banco de dados."""
    db_path = "posts_database.sqlite"
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Obter contagem antes
        cursor.execute("SELECT COUNT(*) FROM posts")
        count_before = cursor.fetchone()[0]
        
        # Deletar todos os registros
        cursor.execute("DELETE FROM posts")
        
        # Reiniciar o autoincrement
        cursor.execute("DELETE FROM sqlite_sequence WHERE name='posts'")
        
        # Commit das alterações
        conn.commit()
        conn.close()
        
        SessionManager.add_log(f"Banco de dados limpo com sucesso. {count_before} posts removidos.")
        return True
    
    except Exception as e:
        SessionManager.add_log(f"Erro ao limpar banco de dados: {e}")
        return False

# Funções para manipulação de feeds RSS
@st.cache_data
def load_feeds():
    """Carrega os feeds RSS do arquivo feeds.json."""
    feeds_file = Path("feeds.json")
    
    if feeds_file.exists():
        try:
            with open(feeds_file, "r", encoding="utf-8") as f:
                feeds = json.load(f)
        except:
            feeds = []
    else:
        feeds = []
    
    # Se feeds estiver vazio, tentar usar padrão da classe RssFeedTool
    if not feeds:
        try:
            crew = SessionManager.get_crew()
            tool = crew.monitor().tools[0]
            feeds = tool.default_feeds
        except:
            feeds = [
                {"name": "thecryptobasic", "url": "https://thecryptobasic.com/feed"}
            ]
    
    return feeds

def save_feeds(feed_urls):
    """Salva os feeds RSS no arquivo feeds.json."""
    try:
        # Converter lista de URLs para o formato com name e url
        formatted_feeds = []
        for feed_url in feed_urls:
            if feed_url.strip():
                # Extrair um nome simples da URL
                feed_name = feed_url.split("//")[-1].split("/")[0].replace("www.", "")
                formatted_feeds.append({
                    "name": feed_name,
                    "url": feed_url
                })
        
        with open("feeds.json", "w", encoding="utf-8") as f:
            json.dump(formatted_feeds, f, indent=2)
        
        SessionManager.add_log("Feeds RSS salvos com sucesso!")
        return True
    except Exception as e:
        SessionManager.add_log(f"Erro ao salvar feeds: {str(e)}")
        return False

# Fluxo completo
def execute_full_flow():
    """Executa o fluxo completo de monitoramento, tradução e publicação."""
    with st.spinner("Executando fluxo completo..."):
        SessionManager.add_log("Iniciando fluxo completo...")
        
        # Passo 1: Monitoramento
        monitor_feeds()
        
        # Passo 2: Verificar se há arquivos para traduzir
        dir_para_traduzir = Path("posts_para_traduzir")
        if not dir_para_traduzir.exists():
            dir_para_traduzir = Path("posts_traduzidos")
        
        arquivos_para_traduzir = list(dir_para_traduzir.glob("para_traduzir_*.json"))
        if arquivos_para_traduzir:
            SessionManager.add_log(f"Encontrados {len(arquivos_para_traduzir)} artigos para traduzir. Traduzindo o primeiro...")
            translate_article()
        else:
            SessionManager.add_log("Nenhum artigo encontrado para traduzir após monitoramento.")
        
        # Passo 3: Verificar se há arquivos traduzidos para publicar
        dir_traduzidos = Path("posts_traduzidos")
        arquivos_traduzidos = [a for a in dir_traduzidos.glob("*.json") if not a.name.startswith("para_traduzir_")]
        
        if arquivos_traduzidos:
            SessionManager.add_log(f"Encontrados {len(arquivos_traduzidos)} artigos traduzidos. Publicando o primeiro...")
            publish_article()
        else:
            SessionManager.add_log("Nenhum artigo traduzido encontrado para publicar.")
        
        SessionManager.add_log("Fluxo completo finalizado!")
        SessionManager.update_last_run()
        # Atualizar a contagem de posts
        fetch_sanity_posts(refresh=True)
        return True 