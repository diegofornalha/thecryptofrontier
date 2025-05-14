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
            # Verificar se existem feeds configurados
            feeds = load_feeds()
            if not feeds:
                SessionManager.add_log("❌ Nenhum feed RSS configurado! Adicione feeds em 'feeds.json'")
                return False
                
            SessionManager.add_log(f"Encontrados {len(feeds)} feeds configurados: {', '.join([f['name'] for f in feeds])}")
            
            # Executar o monitoramento
            result = crew.monitoramento_crew().kickoff(inputs={})
            
            # Verificar resultado
            result_str = str(result.raw)
            if "[]" in result_str and len(result_str) < 10:
                SessionManager.add_log("⚠️ Nenhum novo artigo encontrado nos feeds")
            else:
                # Contar arquivos criados no diretório posts_para_traduzir
                dir_posts = Path("posts_para_traduzir")
                if dir_posts.exists():
                    arquivos_antes = set(dir_posts.glob("para_traduzir_*.json"))
                    
                    # Se o resultado contém novos artigos, verificar a diferença
                    arquivos_depois = set(dir_posts.glob("para_traduzir_*.json"))
                    novos_arquivos = arquivos_depois - arquivos_antes
                    
                    if novos_arquivos:
                        SessionManager.add_log(f"✅ {len(novos_arquivos)} novos artigos adicionados para tradução!")
                    else:
                        SessionManager.add_log("⚠️ Nenhum novo artigo adicionado para tradução")
            
            SessionManager.add_log(f"Monitoramento concluído com resultado: {result.raw[:100]}...")
            SessionManager.update_last_run()
            return True
        except Exception as e:
            SessionManager.add_log(f"Erro no monitoramento: {str(e)}")
            import traceback
            SessionManager.add_log(f"Trace: {traceback.format_exc()}")
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
        
        # Verificar se o arquivo já está traduzido
        if isinstance(arquivo_json, str):
            arquivo_json = Path(arquivo_json)
        
        # Verificar se existe um arquivo traduzido com o mesmo nome, mas sem o prefixo
        arquivo_base = arquivo_json.stem
        if arquivo_base.startswith("para_traduzir_"):
            arquivo_base = arquivo_base.replace("para_traduzir_", "")
            
        # Checar se existe arquivo traduzido no diretório posts_traduzidos
        dir_traduzidos = Path("posts_traduzidos")
        if dir_traduzidos.exists():
            possivel_traduzido = dir_traduzidos / f"traduzido_{arquivo_base}.json"
            if possivel_traduzido.exists():
                SessionManager.add_log(f"⚠️ AVISO: Este artigo já foi traduzido anteriormente: {possivel_traduzido}")
                # Perguntar se deseja traduzir novamente
                return False
        
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
            
            # Após traduzir com sucesso, mover o arquivo original para um diretório de processados
            # para evitar processamento duplicado
            try:
                processados_dir = Path("posts_processados")
                processados_dir.mkdir(exist_ok=True, parents=True)
                
                # Criar nome para arquivo processado
                arquivo_processado = processados_dir / f"processado_{arquivo_json.name}"
                
                # Mover arquivo para diretório de processados apenas se ele está em posts_para_traduzir
                if "posts_para_traduzir" in str(arquivo_json):
                    import shutil
                    shutil.copy2(arquivo_json, arquivo_processado)
                    SessionManager.add_log(f"Arquivo original movido para: {arquivo_processado}")
                    
                    # Opcionalmente, remover o arquivo original
                    # arquivo_json.unlink()
            except Exception as move_error:
                SessionManager.add_log(f"⚠️ Aviso ao mover arquivo: {str(move_error)}")
            
            SessionManager.update_last_run()
            return True
            
        except Exception as e:
            SessionManager.add_log(f"❌ Erro ao traduzir {arquivo_json.name}: {str(e)}")
            SessionManager.add_log(f"Trace: {traceback.format_exc()}")
            return False

def check_duplicate_post(title, guid=None):
    """
    Verifica se já existe um post com título similar no Sanity CMS.
    Retorna True se encontrar um post similar, False caso contrário.
    """
    # Obter tokens e configurações do Sanity
    project_id = os.environ.get("NEXT_PUBLIC_SANITY_PROJECT_ID") or os.environ.get("SANITY_PROJECT_ID", "brby2yrg")
    dataset = os.environ.get("NEXT_PUBLIC_SANITY_DATASET", "production")
    api_version = os.environ.get("NEXT_PUBLIC_SANITY_API_VERSION", "2023-05-03")
    token = os.environ.get("SANITY_DEV_TOKEN", "")
    
    # Se não encontrou o token DEV, verificar outros tokens
    if not token:
        token = os.environ.get("SANITY_API_TOKEN", "")
    if not token:
        token = os.environ.get("SANITY_DEPLOY_TOKEN", "")
    
    # Remover quebras de linha do token
    token = token.replace('\n', '')
    
    # Formatar título para busca
    # Remove aspas e caracteres especiais para evitar erros na consulta
    search_title = title.replace('"', '').replace("'", "").strip()
    
    # Construir URL da API com consulta GROQ para posts com título similar
    url = f"https://{project_id}.api.sanity.io/v{api_version}/data/query/{dataset}?query=*[_type == 'post' && title match '{search_title}*']"
    
    # Definir headers com token
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    try:
        # Fazer requisição à API
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        
        # Analisar resultado
        posts = response.json().get('result', [])
        
        if posts:
            print(f"⚠️ ATENÇÃO: Encontrados {len(posts)} posts similares no Sanity:")
            for i, post in enumerate(posts, 1):
                post_id = post.get('_id', 'ID não disponível')
                post_title = post.get('title', 'Título não disponível')
                print(f"  {i}. ID: {post_id}, Título: {post_title}")
            
            return True
        
        return False
        
    except Exception as e:
        print(f"Erro ao verificar duplicatas: {e}")
        # Em caso de erro, é melhor continuar o processo
        return False

def get_json_post_title(file_path):
    """
    Extrai o título de um arquivo JSON de post traduzido.
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Tentar obter o título do frontmatter traduzido
        if data.get('frontmatter_traduzido', {}).get('title'):
            return data['frontmatter_traduzido']['title']
        
        # Se não encontrar, tentar no frontmatter original
        if data.get('frontmatter_original', {}).get('title'):
            return data['frontmatter_original']['title']
        
        # Última tentativa
        if data.get('title'):
            return data['title']
            
        return None
    except Exception as e:
        print(f"Erro ao extrair título do JSON: {e}")
        return None

def publish_article(translated_file_path: Path):
    """
    Publica um artigo no Sanity a partir de um arquivo traduzido.
    """
    # Adicionar às variáveis de ambiente
    load_environment_variables()

    # Carregar a Crew
    crew = BlogAutomacaoCrew()
    
    # Validar arquivo
    if not translated_file_path.exists():
        print(f"Arquivo não encontrado: {translated_file_path}")
        return
        
    print(f"Publicando artigo traduzido: {translated_file_path}")
    
    # Verificar duplicatas apenas para arquivos JSON
    if translated_file_path.suffix.lower() == '.json':
        post_title = get_json_post_title(translated_file_path)
        if post_title and check_duplicate_post(post_title):
            print(f"Detectado artigo similar já publicado no Sanity. Cancelando publicação para evitar duplicata.")
            
            # Tentar obter o ID do artigo para atualizar o status
            article_id = None
            try:
                # Tentar extrair ID do nome do arquivo
                filename = translated_file_path.stem
                if filename.startswith("traduzido_"):
                    article_id = filename.split("_")[1]
                    
                if article_id and article_id.isdigit():
                    # Conectar ao banco de dados e atualizar status
                    conn = sqlite3.connect("posts_database.sqlite")
                    cursor = conn.cursor()
                    cursor.execute(
                        "UPDATE posts SET status = 'duplicate' WHERE id = ?",
                        (int(article_id),)
                    )
                    conn.commit()
                    conn.close()
                    print(f"Artigo marcado como duplicado no banco de dados.")
            except Exception as e:
                print(f"Erro ao atualizar status no banco de dados: {e}")
                
            return "Publicação cancelada: artigo duplicado detectado"
    
    try:
        # Obter ferramentas de publicação
        publication_tools = crew.publication_tools()
        
        if not publication_tools:
            print("Nenhuma ferramenta de publicação disponível!")
            raise ValueError("Nenhuma ferramenta de publicação disponível")
            
        # Pegar a primeira ferramenta de publicação
        sanity_tool = publication_tools[0]
        
        # Tentar publicar com a ferramenta
        try:
            print("Tentando publicar com a ferramenta SanityPublishTool...")
            result = sanity_tool._run(str(translated_file_path))
            print(f"Resultado da publicação: {result}")
            
            # Verificar se o caminho existe
            posts_dir = Path("posts_publicados")
            posts_dir.mkdir(exist_ok=True)
            
            # Determinar nome do arquivo
            published_file = posts_dir / f"publicado_{translated_file_path.stem.replace('traduzido_', '')}.json"
            
            # Copiar arquivo para o diretório de publicados
            import shutil
            shutil.copy(translated_file_path, published_file)
            
            # Atualizar banco de dados
            update_article_status(translated_file_path, 'published', str(published_file))
            
            return result
            
        except Exception as e:
            print(f"Erro ao publicar com SanityPublishTool: {e}")
            print("Tentando método alternativo de publicação via publish_direct...")
            
            # Tentativa alternativa: converter JSON para Markdown e publicar diretamente
            try:
                # Verificar se é um arquivo JSON
                if translated_file_path.suffix.lower() == '.json':
                    # Converter JSON para Markdown
                    print("Convertendo JSON para Markdown...")
                    
                    with open(translated_file_path, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                        
                    # Extrair dados
                    frontmatter = data.get('frontmatter_traduzido', {})
                    content = data.get('content_text_traduzido', '')
                    
                    if not frontmatter or not content:
                        raise ValueError("Dados traduzidos incompletos")
                        
                    # Criar conteúdo Markdown
                    markdown_content = "---\n"
                    markdown_content += f"title: \"{frontmatter.get('title', 'Sem título')}\"\n"
                    markdown_content += f"date: {frontmatter.get('published_date', datetime.now().isoformat())}\n"
                    
                    # Adicionar tags
                    tags = frontmatter.get('tags', [])
                    if tags:
                        markdown_content += "tags:\n"
                        for tag in tags:
                            markdown_content += f"  - {tag}\n"
                            
                    # Adicionar categoria
                    category = frontmatter.get('category', '')
                    if category:
                        markdown_content += f"category: {category}\n"
                        
                    # Adicionar descrição SEO
                    seo_description = frontmatter.get('seo_meta_description', '')
                    if seo_description:
                        markdown_content += f"seo_meta_description: \"{seo_description}\"\n"
                        
                    # Adicionar slug
                    slug = frontmatter.get('slug', '')
                    if slug:
                        markdown_content += f"slug: {slug}\n"
                        
                    # Fechar frontmatter
                    markdown_content += "---\n\n"
                    
                    # Adicionar conteúdo
                    markdown_content += content
                    
                    # Gerar caminho para arquivo Markdown
                    md_file_path = translated_file_path.with_suffix('.md')
                    
                    # Salvar arquivo Markdown
                    with open(md_file_path, 'w', encoding='utf-8') as f:
                        f.write(markdown_content)
                        
                    print(f"Arquivo Markdown criado: {md_file_path}")
                    
                    # Publicar com método direto
                    success, message = publish_direct(md_file_path)
                    
                    if success:
                        # Copiar para pasta de publicados
                        published_file = Path("posts_publicados") / f"publicado_{md_file_path.stem.replace('traduzido_', '')}.md"
                        Path("posts_publicados").mkdir(exist_ok=True)
                        
                        with open(md_file_path, 'r') as source:
                            with open(published_file, 'w') as dest:
                                dest.write(source.read())
                                
                        # Atualizar banco de dados
                        update_article_status(translated_file_path, 'published', str(published_file))
                        
                        print(f"Artigo publicado com sucesso via método alternativo! ID: {message}")
                        return f"Publicado com método alternativo: {message}"
                    else:
                        raise ValueError(f"Falha ao publicar com método alternativo: {message}")
                else:
                    # Se já for um arquivo Markdown, publicar diretamente
                    success, message = publish_direct(translated_file_path)
                    
                    if success:
                        # Copiar para pasta de publicados
                        published_file = Path("posts_publicados") / f"publicado_{translated_file_path.stem.replace('traduzido_', '')}.md"
                        Path("posts_publicados").mkdir(exist_ok=True)
                        
                        with open(translated_file_path, 'r') as source:
                            with open(published_file, 'w') as dest:
                                dest.write(source.read())
                                
                        # Atualizar banco de dados
                        update_article_status(translated_file_path, 'published', str(published_file))
                        
                        print(f"Artigo Markdown publicado com sucesso! ID: {message}")
                        return f"Publicado diretamente: {message}"
                    else:
                        raise ValueError(f"Falha ao publicar arquivo Markdown: {message}")
            
            except Exception as alt_e:
                print(f"Erro no método alternativo de publicação: {alt_e}")
                raise ValueError(f"Falha em ambos os métodos de publicação: {e} / {alt_e}")
                
    except Exception as e:
        print(f"Erro durante o processo de publicação: {e}")
        raise e

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

def index_algolia_post(post_id, post_title=None):
    """
    Indexa um post do Sanity no Algolia para pesquisa.
    
    Args:
        post_id (str): ID do post no Sanity
        post_title (str, optional): Título do post para logs
        
    Returns:
        bool: True se indexado com sucesso, False caso contrário
    """
    try:
        import os
        import requests
        import json
        
        SessionManager.add_log(f"🔍 Iniciando indexação no Algolia para post: {post_title or post_id}")
        
        # Verificar configurações do Algolia
        algolia_app_id = os.environ.get("NEXT_PUBLIC_ALGOLIA_APP_ID", "") or os.environ.get("ALGOLIA_APP_ID", "")
        # Para escrita, usamos a ADMIN ou WRITE API KEY
        algolia_api_key = os.environ.get("ALGOLIA_ADMIN_API_KEY", "") or os.environ.get("ALGOLIA_WRITE_API_KEY", "") or os.environ.get("ALGOLIA_API_KEY", "")
        algolia_index_name = os.environ.get("NEXT_PUBLIC_ALGOLIA_INDEX_NAME", "") or os.environ.get("ALGOLIA_INDEX_NAME", "posts")
        
        # Se não encontrou nas variáveis de ambiente, tentar ler do .env
        if not algolia_app_id or not algolia_api_key:
            try:
                with open(".env", "r") as f:
                    for line in f:
                        if "ALGOLIA_APP_ID" in line or "NEXT_PUBLIC_ALGOLIA_APP_ID" in line:
                            parts = line.strip().split("=")
                            if len(parts) > 1:
                                algolia_app_id = parts[1].strip().strip('"').strip("'")
                        elif "ALGOLIA_ADMIN_API_KEY" in line:
                            parts = line.strip().split("=")
                            if len(parts) > 1:
                                algolia_api_key = parts[1].strip().strip('"').strip("'")
                        elif "ALGOLIA_WRITE_API_KEY" in line and not algolia_api_key:
                            parts = line.strip().split("=")
                            if len(parts) > 1:
                                algolia_api_key = parts[1].strip().strip('"').strip("'")
                        elif "ALGOLIA_API_KEY" in line and not algolia_api_key:
                            parts = line.strip().split("=")
                            if len(parts) > 1:
                                algolia_api_key = parts[1].strip().strip('"').strip("'")
                        elif "ALGOLIA_INDEX_NAME" in line or "NEXT_PUBLIC_ALGOLIA_INDEX_NAME" in line:
                            parts = line.strip().split("=")
                            if len(parts) > 1:
                                algolia_index_name = parts[1].strip().strip('"').strip("'")
            except Exception as e:
                SessionManager.add_log(f"❌ Erro ao ler arquivo .env: {e}")
        
        # Verificar se temos as credenciais necessárias
        if not algolia_app_id or not algolia_api_key:
            SessionManager.add_log("❌ Credenciais do Algolia não encontradas")
            return False
        
        # Obter dados do post do Sanity
        project_id = os.environ.get("NEXT_PUBLIC_SANITY_PROJECT_ID") or os.environ.get("SANITY_PROJECT_ID", "brby2yrg")
        dataset = os.environ.get("NEXT_PUBLIC_SANITY_DATASET", "production")
        api_version = os.environ.get("NEXT_PUBLIC_SANITY_API_VERSION", "2023-05-03")
        token = os.environ.get("SANITY_DEV_TOKEN", "")
        
        # Se não encontrou o token DEV, verificar outros tokens
        if not token:
            token = os.environ.get("SANITY_API_TOKEN", "")
        if not token:
            token = os.environ.get("SANITY_DEPLOY_TOKEN", "")
        
        # URL para buscar o post específico
        post_query = f"*[_id == '{post_id}'][0]{{"
        post_query += "_id, title, slug, publishedAt, excerpt, "
        post_query += "\"content\": pt::text(content), \"estimatedReadingTime\": round(length(pt::text(content)) / 5 / 180)"
        post_query += "}"
        
        encoded_query = requests.utils.quote(post_query)
        url = f"https://{project_id}.api.sanity.io/v{api_version}/data/query/{dataset}?query={encoded_query}"
        
        # Headers para a requisição
        headers = {}
        if token:
            headers["Authorization"] = f"Bearer {token}"
        
        # Buscar o post
        SessionManager.add_log(f"🔄 Buscando post do Sanity: {post_id}")
        response = requests.get(url, headers=headers)
        
        if response.status_code != 200:
            SessionManager.add_log(f"❌ Erro ao buscar post do Sanity: {response.status_code} - {response.text}")
            return False
        
        post_data = response.json().get("result", {})
        
        if not post_data:
            SessionManager.add_log(f"❌ Post não encontrado no Sanity: {post_id}")
            return False
        
        # Preparar objeto para o Algolia
        algolia_object = {
            "objectID": post_data.get("_id", post_id),
            "title": post_data.get("title", "Sem título"),
            "content": post_data.get("content", ""),
            "excerpt": post_data.get("excerpt", ""),
            "slug": post_data.get("slug", {}).get("current", ""),
            "publishedAt": post_data.get("publishedAt", ""),
            "estimatedReadingTime": post_data.get("estimatedReadingTime", 0)
        }
        
        # URL da API do Algolia
        algolia_url = f"https://{algolia_app_id}-dsn.algolia.net/1/indexes/{algolia_index_name}/objects/{post_id}"
        
        # Headers para a API do Algolia
        algolia_headers = {
            "X-Algolia-API-Key": algolia_api_key,
            "X-Algolia-Application-Id": algolia_app_id,
            "Content-Type": "application/json"
        }
        
        # Enviar para o Algolia
        SessionManager.add_log(f"🔄 Enviando post para indexação no Algolia: {post_data.get('title', 'Sem título')}")
        algolia_response = requests.put(algolia_url, headers=algolia_headers, json=algolia_object)
        
        if algolia_response.status_code in [200, 201]:
            response_data = algolia_response.json()
            SessionManager.add_log(f"✅ Post indexado com sucesso no Algolia: {post_data.get('title', 'Sem título')}")
            SessionManager.add_log(f"✅ Detalhes da indexação: ObjectID: {response_data.get('objectID')}, TaskID: {response_data.get('taskID')}")
            print(f"✅ Post '{post_data.get('title', 'Sem título')}' indexado com sucesso no Algolia!")
            return True
        else:
            SessionManager.add_log(f"❌ Erro ao indexar no Algolia: {algolia_response.status_code} - {algolia_response.text}")
            print(f"❌ Erro ao indexar '{post_data.get('title', 'Sem título')}' no Algolia: {algolia_response.status_code}")
            return False
        
    except Exception as e:
        import traceback
        SessionManager.add_log(f"❌ Erro ao indexar post no Algolia: {str(e)}")
        SessionManager.add_log(f"Trace: {traceback.format_exc()}")
        return False

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

# Integração com Redis para o framework CrewAI
def enqueue_crewai_article(article_data, process_now=False):
    """
    Enfileira um artigo no Redis para processamento posterior ou imediato via CrewAI.
    
    Args:
        article_data: Dicionário com os dados do artigo
        process_now: Se True, processa imediatamente após enfileirar
        
    Returns:
        Resultado da operação (sucesso/erro)
    """
    try:
        # Importar o cliente Redis
        from ..tools.redis_tools import RedisArticleQueue
        queue = RedisArticleQueue()
        
        SessionManager.add_log(f"Enfileirando artigo: {article_data.get('title', 'Sem título')}")
        
        # Garantir que temos um ID
        if "id" not in article_data:
            import uuid
            article_data["id"] = f"crewai_{str(uuid.uuid4())[:8]}"
        
        # Enfileirar
        if queue.queue_article(article_data):
            SessionManager.add_log(f"✅ Artigo enfileirado com sucesso: {article_data.get('title', 'Sem título')}")
            
            # Processar imediatamente se solicitado
            if process_now:
                try:
                    from ..tools.process_queue import process_queue
                    # Processar apenas um artigo
                    process_queue(max_articles=1, interval=1)
                    SessionManager.add_log("✅ Artigo processado imediatamente")
                except Exception as e:
                    SessionManager.add_log(f"❌ Erro ao processar artigo imediatamente: {str(e)}")
            
            return True
        else:
            SessionManager.add_log(f"❌ Falha ao enfileirar artigo: {article_data.get('title', 'Sem título')}")
            return False
    
    except Exception as e:
        SessionManager.add_log(f"❌ Erro ao enfileirar artigo: {str(e)}")
        import traceback
        SessionManager.add_log(f"Trace: {traceback.format_exc()}")
        return False

# Fluxo completo
def start_translation_for_kanban(article_path=None):
    """
    Inicia o processo de tradução para um artigo específico ou o primeiro disponível
    para o fluxo Kanban.
    
    Args:
        article_path: Caminho para o arquivo a ser traduzido (opcional)
        
    Returns:
        Path do arquivo sendo traduzido ou None se falhar
    """
    # Se não foi especificado um arquivo, buscar o primeiro disponível
    if not article_path:
        dir_posts = Path("posts_para_traduzir")
        if not dir_posts.exists():
            dir_posts = Path("posts_traduzidos")  # Fallback para compatibilidade
            
        arquivos = list(dir_posts.glob("para_traduzir_*.json"))
        
        if not arquivos:
            SessionManager.add_log("Nenhum artigo encontrado para traduzir.")
            return None
        
        # Ordenar por nome para pegar o mais antigo primeiro
        arquivos.sort()
        article_path = arquivos[0]
    else:
        # Garantir que é um objeto Path
        article_path = Path(article_path)
        
    SessionManager.add_log(f"Artigo selecionado para tradução: {article_path.name}")
    return article_path

def complete_translation_for_kanban(article_path):
    """
    Completa a tradução de um artigo em progresso no fluxo Kanban.
    
    Args:
        article_path: Caminho para o arquivo que está sendo traduzido
        
    Returns:
        True se traduzido com sucesso, False caso contrário
    """
    if not isinstance(article_path, Path):
        article_path = Path(article_path)
        
    SessionManager.add_log(f"Completando tradução para {article_path}")
    
    # Executar a tradução normal
    return translate_article(article_path)

def publish_specific_article(article_path):
    """
    Publica um artigo específico no Sanity CMS.
    
    Args:
        article_path: Caminho para o arquivo traduzido a ser publicado
        
    Returns:
        True se publicado com sucesso, False caso contrário
    """
    if not isinstance(article_path, Path):
        article_path = Path(article_path)
        
    SessionManager.add_log(f"Publicando artigo específico: {article_path}")
    
    try:
        # Verificar se o artigo já está no formato correto
        with open(article_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            
        # Verificar duplicatas
        if "frontmatter_traduzido" in data and data["frontmatter_traduzido"]:
            title = data["frontmatter_traduzido"].get("title", "")
            if title and check_duplicate_post(title):
                SessionManager.add_log(f"⚠️ Artigo similar já existe no Sanity: {title}")
                return False
                
        # Usar função existente para publicar
        publish_article(article_path)
        return True
        
    except Exception as e:
        SessionManager.add_log(f"Erro ao publicar artigo específico: {str(e)}")
        return False

def execute_full_flow():
    """Executa o fluxo completo de monitoramento, tradução e publicação."""
    with st.spinner("Executando fluxo completo..."):
        SessionManager.add_log("Iniciando fluxo completo...")
        
        try:
            # Verificar se o Redis está disponível
            import sys
            import os
            parent_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../"))
            if parent_dir not in sys.path:
                sys.path.insert(0, parent_dir)
            
            from backup_legado_aprendizados.redis_tools import redis_client
            
            # Se o Redis estiver disponível, usamos a fila
            if redis_client and redis_client.ping():
                SessionManager.add_log("✅ Redis disponível. Usando sistema de filas.")
                
                # Passo 1: Monitoramento
                monitor_feeds()
                
                # Passo 2: Importar e usar process_article_queue
                try:
                    from backup_legado_aprendizados.process_article_queue import process_queue
                    # Processar até 3 artigos em sequência
                    SessionManager.add_log("📝 Processando artigos da fila...")
                    process_queue(max_articles=3, interval=1)
                    SessionManager.add_log("✅ Processamento de artigos concluído")
                except Exception as e:
                    SessionManager.add_log(f"❌ Erro ao processar artigos da fila: {str(e)}")
                    import traceback
                    SessionManager.add_log(f"Trace: {traceback.format_exc()}")
            
            else:
                SessionManager.add_log("⚠️ Redis não disponível. Usando fluxo de arquivos.")
                
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
            
        except Exception as e:
            SessionManager.add_log(f"❌ Erro ao executar fluxo completo: {str(e)}")
            import traceback
            SessionManager.add_log(f"Trace: {traceback.format_exc()}")
            return False

def delete_sanity_post(post_id, title=None):
    """
    Exclui um post do Sanity CMS pelo ID.
    
    Args:
        post_id (str): ID do post no Sanity
        title (str, opcional): Título do post para registro
        
    Returns:
        bool: True se excluído com sucesso, False caso contrário
    """
    try:
        # Verificar se o post_id é válido
        if not post_id:
            SessionManager.add_log("❌ Erro: ID do post não fornecido")
            return False
            
        SessionManager.add_log(f"🔄 Iniciando exclusão do post ID: {post_id}")
        
        # Obter credenciais do Sanity
        project_id = os.environ.get("NEXT_PUBLIC_SANITY_PROJECT_ID") or os.environ.get("SANITY_PROJECT_ID", "brby2yrg")
        dataset = os.environ.get("NEXT_PUBLIC_SANITY_DATASET", "production")
        api_version = os.environ.get("NEXT_PUBLIC_SANITY_API_VERSION", "2023-05-03")
        token = os.environ.get("SANITY_DEV_TOKEN", "")
        
        # Se não encontrou o token DEV, verificar outros tokens
        if not token:
            token = os.environ.get("SANITY_API_TOKEN", "")
        if not token:
            token = os.environ.get("SANITY_DEPLOY_TOKEN", "")
        
        # Remover quebras de linha do token
        token = token.replace('\n', '')
        
        if not token:
            # Tentar obter do arquivo .env
            try:
                with open(".env", "r") as f:
                    for line in f:
                        if "SANITY_DEV_TOKEN" in line or "SANITY_API_TOKEN" in line or "SANITY_DEPLOY_TOKEN" in line:
                            parts = line.strip().split("=")
                            if len(parts) > 1:
                                token = parts[1].strip().strip('"').strip("'")
                                break
            except Exception as env_error:
                SessionManager.add_log(f"❌ Erro ao ler arquivo .env: {env_error}")
                
        if not token:
            SessionManager.add_log("❌ Erro: Token do Sanity não encontrado")
            return False
            
        SessionManager.add_log(f"ℹ️ Usando projeto Sanity: {project_id}, dataset: {dataset}")
        
        # Construir URL da API para deleção
        url = f"https://{project_id}.api.sanity.io/v{api_version}/data/mutate/{dataset}"
        
        # Definir headers com token
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        # Lidar com IDs que têm "drafts." prefixo
        original_id = post_id
        if not post_id.startswith("drafts."):
            # Tentar excluir tanto o rascunho quanto o documento publicado
            draft_id = f"drafts.{post_id}"
            SessionManager.add_log(f"ℹ️ Tentando excluir também o rascunho com ID: {draft_id}")
            
            # Criar dados para excluir rascunho
            draft_data = {
                "mutations": [
                    {
                        "delete": {
                            "id": draft_id
                        }
                    }
                ]
            }
            
            # Tentar excluir o rascunho primeiro
            try:
                draft_response = requests.post(url, headers=headers, json=draft_data)
                draft_response.raise_for_status()
                SessionManager.add_log(f"✅ Rascunho excluído com sucesso (ID: {draft_id})")
            except Exception as draft_error:
                SessionManager.add_log(f"⚠️ Aviso ao excluir rascunho: {str(draft_error)}")
                # Continuar mesmo se falhar, pois pode não existir um rascunho
        
        # Dados para deleção do documento principal
        data = {
            "mutations": [
                {
                    "delete": {
                        "id": post_id
                    }
                }
            ]
        }
        
        # Fazer requisição à API
        SessionManager.add_log(f"🔄 Enviando requisição para excluir {post_id}")
        response = requests.post(url, headers=headers, json=data)
        
        # Exibir detalhes da resposta para debug
        if response.status_code != 200:
            SessionManager.add_log(f"⚠️ Resposta não-200: {response.status_code} - {response.text}")
        
        response.raise_for_status()
        response_json = response.json()
        SessionManager.add_log(f"📄 Resposta: {response_json}")
        
        # Verificar se a resposta indica sucesso
        if "results" in response_json and response_json["results"]:
            # Registrar sucesso
            title_info = f" '{title}'" if title else ""
            SessionManager.add_log(f"✅ Post{title_info} excluído com sucesso (ID: {post_id})")
            
            # Atualizar cache de posts
            if 'sanity_posts' in st.session_state:
                st.session_state.sanity_posts = [post for post in st.session_state.sanity_posts if post.get('_id') != post_id]
                SessionManager.add_log(f"✅ Cache de posts atualizado")
            
            return True
        else:
            SessionManager.add_log(f"⚠️ Resposta não contém resultados esperados: {response_json}")
            return False
        
    except Exception as e:
        SessionManager.add_log(f"❌ Erro ao excluir post: {str(e)}")
        import traceback
        SessionManager.add_log(f"🔍 Trace de erro: {traceback.format_exc()}")
        return False 