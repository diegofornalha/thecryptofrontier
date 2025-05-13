#!/usr/bin/env python
import os
import sys
import time
import glob
import json
import streamlit as st
from datetime import datetime, date
from pathlib import Path
import requests
import asyncio
import subprocess
import shutil
import uuid
import frontmatter

# Adiciona o diretório src ao path para importar o módulo blog_automacao
sys.path.append(os.path.abspath('.'))
from src.blog_automacao import BlogAutomacaoCrew

# Função para adicionar log
def add_log(message):
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    if 'log_messages' in st.session_state:
        st.session_state.log_messages.append(f"[{timestamp}] {message}")

# Configuração da página
st.set_page_config(
    page_title="Blog Automação - The Crypto Frontier",
    page_icon="📰",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Estilos
st.markdown("""
    <style>
    .main-header {
        font-size: 2.5rem;
        color: #1E88E5;
    }
    .sub-header {
        font-size: 1.5rem;
        color: #0D47A1;
    }
    .info-box {
        background-color: #E3F2FD;
        padding: 1rem;
        border-radius: 0.5rem;
        margin-bottom: 1rem;
    }
    .success-box {
        background-color: #E8F5E9;
        padding: 1rem;
        border-radius: 0.5rem;
        margin-bottom: 1rem;
    }
    .warning-box {
        background-color: #FFF3E0;
        padding: 1rem;
        border-radius: 0.5rem;
        margin-bottom: 1rem;
    }
    .post-card {
        background-color: #FFFFFF;
        border: 1px solid #E0E0E0;
        border-radius: 0.5rem;
        padding: 1rem;
        margin-bottom: 1rem;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .post-title {
        font-size: 1.2rem;
        font-weight: bold;
        color: #0D47A1;
        margin-bottom: 0.5rem;
    }
    .post-meta {
        font-size: 0.9rem;
        color: #757575;
        margin-bottom: 0.5rem;
    }
    .post-excerpt {
        font-size: 1rem;
        color: #333333;
    }
    .post-actions {
        margin-top: 0.5rem;
        display: flex;
        gap: 0.5rem;
    }
    .btn-action {
        padding: 0.25rem 0.5rem;
        border-radius: 0.25rem;
        font-size: 0.85rem;
        cursor: pointer;
    }
    .btn-delete {
        background-color: #f44336;
        color: white;
    }
    .btn-index {
        background-color: #4CAF50;
        color: white;
    }
    .btn-edit {
        background-color: #2196F3;
        color: white;
    }
    </style>
""", unsafe_allow_html=True)

# Inicialização de sessão
if 'crew' not in st.session_state:
    st.session_state.crew = BlogAutomacaoCrew()
    add_log(f"[{datetime.now().strftime('%H:%M:%S')}] Crew inicializada automaticamente!")
if 'last_run' not in st.session_state:
    st.session_state.last_run = None
if 'log_messages' not in st.session_state:
    st.session_state.log_messages = []
if 'sanity_posts' not in st.session_state:
    st.session_state.sanity_posts = []
if 'last_posts_fetch' not in st.session_state:
    st.session_state.last_posts_fetch = None
# Removida variável post_to_delete, não necessária mais
if 'post_to_index' not in st.session_state:
    st.session_state.post_to_index = None
if 'post_to_edit' not in st.session_state:
    st.session_state.post_to_edit = None
if 'active_tab' not in st.session_state:
    st.session_state.active_tab = "Logs"

# Função para inicializar a crew
def inicializar_crew():
    st.session_state.crew = BlogAutomacaoCrew()
    st.session_state.log_messages.append(f"[{datetime.now().strftime('%H:%M:%S')}] Crew inicializada com sucesso!")
    return st.session_state.crew

# Função para monitorar feeds RSS
def monitorar_feeds():
    with st.spinner("Monitorando feeds RSS..."):
        crew = st.session_state.crew or inicializar_crew()
        add_log("Iniciando monitoramento de feeds RSS...")
        
        try:
            result = crew.monitoramento_crew().kickoff(inputs={})
            add_log(f"Monitoramento concluído: {result.raw[:100]}...")
            st.session_state.last_run = datetime.now()
            return True
        except Exception as e:
            add_log(f"Erro no monitoramento: {str(e)}")
            return False

# Função para traduzir artigos
def traduzir_artigos():
    with st.spinner("Traduzindo artigos..."):
        crew = st.session_state.crew or inicializar_crew()
        
        # Verificar se há artigos para traduzir
        dir_posts = Path("posts_para_traduzir")
        if not dir_posts.exists():
            dir_posts = Path("posts_traduzidos")  # Fallback para compatibilidade
            
        arquivos = list(dir_posts.glob("para_traduzir_*.json"))
        
        if not arquivos:
            add_log("Nenhum artigo encontrado para traduzir.")
            return False
        
        # Ordenar por nome para pegar o mais antigo primeiro
        arquivos.sort()
        arquivo = arquivos[0]  # Pegar apenas o primeiro arquivo
        
        add_log(f"Iniciando tradução de 1 artigo: {arquivo.name}")
        
        try:
            # Vamos ler o arquivo primeiro para verificar o formato e extrair dados essenciais
            with open(arquivo, "r", encoding="utf-8") as f:
                conteudo = f.read()
            
            # Verificar se o conteúdo tem o formato YAML ou JSON
            import re
            import json
            import yaml
            
            # Extrair o frontmatter (conteúdo entre ---)
            frontmatter_match = re.match(r'---\s*(.*?)\s*---', conteudo, re.DOTALL)
            if frontmatter_match:
                frontmatter_content = frontmatter_match.group(1).strip()
                
                # Tentar determinar se é JSON ou YAML
                try:
                    # Tentar como JSON primeiro
                    if frontmatter_content.startswith('{'):
                        metadata = json.loads(frontmatter_content)
                        formato = "JSON"
                    else:
                        # Tentar como YAML
                        metadata = yaml.safe_load(frontmatter_content)
                        formato = "YAML"
                    
                    add_log(f"Formato detectado: {formato}. Metadados: {list(metadata.keys())}")
                    
                    # Extrair título - tentar várias chaves possíveis
                    titulo = metadata.get('title') or metadata.get('titulo') or "Sem título"
                    url = metadata.get('original_link') or metadata.get('link') or metadata.get('url') or ""
                    
                    add_log(f"Título detectado: {titulo}")
                    add_log(f"URL detectada: {url}")
                    
                    # Adicionar mapeamento explícito para os campos necessários
                    inputs = {
                        "arquivo_markdown": str(arquivo),
                        "titulo": titulo,  # Explicitar o título para que a template não falhe
                        "url": url,       # Explicitar a URL se necessária
                        "conteudo": conteudo  # Passar o conteúdo completo
                    }
                    
                    add_log(f"Enviando para tradução com parâmetros: {inputs.keys()}")
                    result = crew.traducao_crew().kickoff(inputs=inputs)
                    add_log(f"✅ Artigo traduzido com sucesso: {arquivo.name}")
                    
                except Exception as e:
                    import traceback
                    add_log(f"❌ Erro ao processar metadados do arquivo: {str(e)}")
                    add_log(f"Trace: {traceback.format_exc()}")
                    return False
            else:
                add_log(f"❌ Formato de arquivo inválido: Não foi encontrado frontmatter delimitado por ---")
                return False
            
        except Exception as e:
            import traceback
            add_log(f"❌ Erro ao traduzir {arquivo.name}: {str(e)}")
            add_log(f"Trace: {traceback.format_exc()}")
            return False
        
        st.session_state.last_run = datetime.now()
        return True

# Função para publicar diretamente no Sanity, baseada no código JS legado
def publicar_post_direto(arquivo_markdown):
    """
    Publica um post diretamente no Sanity CMS sem usar o CrewAI.
    Baseado no código legado publicar_posts_markdown.js
    """
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
        slug = criar_slug(post.get('title'))
        
        # Preparar o documento para o Sanity (diretamente via API Sanity)
        project_id = os.environ.get("NEXT_PUBLIC_SANITY_PROJECT_ID") or os.environ.get("SANITY_PROJECT_ID")
        dataset = os.environ.get("NEXT_PUBLIC_SANITY_DATASET") or "production"
        api_version = os.environ.get("NEXT_PUBLIC_SANITY_API_VERSION") or "2023-05-03"
        token = os.environ.get("SANITY_DEV_TOKEN")
        
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
        import json
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
            add_log(f"Erro ao serializar JSON: {str(e)}")
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
            add_log(f"Resposta do Sanity: {resultado}")
            # Usar o ID do documento que foi enviado, já que sabemos isso
            return True, f"Post publicado com sucesso! ID: {doc_id}"
        else:
            return False, f"Erro API Sanity: {response.status_code} - {response.text}"
            
    except Exception as e:
        import traceback
        return False, f"Erro ao publicar post: {str(e)}\n{traceback.format_exc()}"

def criar_slug(titulo):
    """Cria um slug a partir do título"""
    import re
    # Converter para minúsculas
    slug = titulo.lower()
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

# Função para publicar artigos
def publicar_artigos():
    with st.spinner("Publicando artigos..."):
        # Verificar se há artigos traduzidos para publicar
        dir_posts = Path("posts_traduzidos")
        arquivos = [a for a in dir_posts.glob("*.json") if not a.name.startswith("para_traduzir_")]
        
        if not arquivos:
            add_log("Nenhum artigo traduzido encontrado para publicar.")
            return False
        
        # Ordenar por data de modificação para pegar o mais antigo primeiro
        arquivos.sort(key=lambda x: x.stat().st_mtime)
        arquivo = arquivos[0]  # Pegar apenas o primeiro arquivo
        
        add_log(f"Iniciando publicação direta de 1 artigo: {arquivo.name}")
        
        # Tentar publicar diretamente sem passar pela CrewAI
        sucesso, mensagem = publicar_post_direto(arquivo)
        
        if sucesso:
            add_log(f"✅ {mensagem}")
            
            # Mover o arquivo para a pasta posts_publicados após publicação bem-sucedida
            dir_publicados = Path("posts_publicados")
            if not dir_publicados.exists():
                dir_publicados.mkdir(exist_ok=True)
                
            arquivo_destino = dir_publicados / arquivo.name
            try:
                # Usar shutil para garantir que funcione entre sistemas de arquivos
                shutil.copy2(arquivo, arquivo_destino)
                # Só excluir o original se a cópia foi bem-sucedida
                if arquivo_destino.exists():
                    arquivo.unlink()
                add_log(f"✅ Arquivo movido para posts_publicados: {arquivo.name}")
            except Exception as e:
                add_log(f"⚠️ Aviso: Não foi possível mover o arquivo: {str(e)}")
        else:
            add_log(f"❌ Erro ao publicar {arquivo.name}: {mensagem}")
            
            # Se falhar o método direto, tentar pelo CrewAI como fallback
            add_log("Tentando publicar usando CrewAI como alternativa...")
            try:
                crew = st.session_state.crew or inicializar_crew()
                
                # Ler o conteúdo do arquivo Markdown
                with open(arquivo, "r", encoding="utf-8") as f:
                    conteudo_markdown = f.read()
                    
                # Passar todos os parâmetros necessários com o mesmo conteúdo
                # O processo de publicação precisa dos 3 parâmetros mesmo que sejam idênticos
                result = crew.publicacao_crew().kickoff(inputs={
                    "arquivo_markdown": str(arquivo),
                    "conteudo_formatado": conteudo_markdown,
                    "conteudo_editado": conteudo_markdown,
                    "conteudo_otimizado": conteudo_markdown
                })
                
                add_log(f"✅ Artigo publicado com sucesso via CrewAI: {arquivo.name}")
                
                # Mover o arquivo para a pasta posts_publicados
                if not arquivo_destino.exists():  # Se já não foi movido antes
                    shutil.copy2(arquivo, arquivo_destino)
                    if arquivo_destino.exists():
                        arquivo.unlink()
                    add_log(f"✅ Arquivo movido para posts_publicados: {arquivo.name}")
            except Exception as e:
                add_log(f"❌ Erro na publicação via CrewAI: {str(e)}")
                return False
        
        st.session_state.last_run = datetime.now()
        # Limpar o cache de posts para forçar atualização
        st.session_state.sanity_posts = []
        st.session_state.last_posts_fetch = None
        return True

# Função para executar o fluxo completo
def executar_fluxo_completo():
    with st.spinner("Executando fluxo completo..."):
        add_log("Iniciando fluxo completo...")
        
        # Passo 1: Monitoramento
        monitorar_feeds()
        
        # Passo 2: Verificar se há arquivos para traduzir
        dir_para_traduzir = Path("posts_para_traduzir")
        if not dir_para_traduzir.exists():
            dir_para_traduzir = Path("posts_traduzidos")
        
        arquivos_para_traduzir = list(dir_para_traduzir.glob("para_traduzir_*.json"))
        if arquivos_para_traduzir:
            add_log(f"Encontrados {len(arquivos_para_traduzir)} artigos para traduzir. Traduzindo o primeiro...")
            traduzir_artigos()
        else:
            add_log("Nenhum artigo encontrado para traduzir após monitoramento.")
        
        # Passo 3: Verificar se há arquivos traduzidos para publicar
        dir_traduzidos = Path("posts_traduzidos")
        arquivos_traduzidos = [a for a in dir_traduzidos.glob("*.json") if not a.name.startswith("para_traduzir_")]
        
        if arquivos_traduzidos:
            add_log(f"Encontrados {len(arquivos_traduzidos)} artigos traduzidos. Publicando o primeiro...")
            publicar_artigos()
        else:
            add_log("Nenhum artigo traduzido encontrado para publicar.")
        
        add_log("Fluxo completo finalizado!")
        st.session_state.last_run = datetime.now()
        # Atualizar a contagem de posts
        buscar_posts_do_sanity(refresh=True)
        return True

# Função para buscar estatísticas
def obter_estatisticas():
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

# Função para excluir post do Sanity
def excluir_post_do_sanity(post_id, post_title):
    try:
        # Duas opções: usar script existente ou API diretamente
        usar_script = True
        
        if usar_script:
            script_path = "scripts/excluir-postagem.js"
            
            # Verificar se o script existe
            if not os.path.exists(script_path):
                add_log(f"Erro: Script não encontrado em {script_path}")
                return False
            
            # Modificar temporariamente o script para incluir apenas o ID desejado
            temp_script = modificar_script_exclusao(script_path, post_id)
            if not temp_script:
                add_log(f"Erro ao preparar script para exclusão do post {post_id}")
                return False
            
            # Executar o script Node.js com o ID do post
            add_log(f"Iniciando exclusão de 1 post...")
            add_log(f"Excluindo post ID: {post_id}...")
            
            process = subprocess.Popen(
                ["node", temp_script],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            
            stdout, stderr = process.communicate()
            
            # Limpar arquivo temporário
            try:
                os.remove(temp_script)
            except:
                pass
            
            # Processar a saída
            if process.returncode == 0:
                # Adicionar linhas do stdout ao log
                for line in stdout.splitlines():
                    if line.strip():
                        add_log(line.strip())
                
                add_log(f"✅ Post '{post_title}' excluído com sucesso!")
                add_log(f"✅ Processo concluído: Post excluído com sucesso.")
                add_log(f"👉 Esta operação também acionará o webhook que removerá o post do Algolia automaticamente.")
                
                # Atualizar a lista de posts
                st.session_state.sanity_posts = []
                st.session_state.last_posts_fetch = None
                return True
            else:
                add_log(f"❌ Erro ao excluir post: {stderr}")
                return False
        else:
            # Alternativa: usar API diretamente (implementação futura)
            add_log(f"Implementação direta de API para exclusão não disponível.")
            return False
    
    except Exception as e:
        add_log(f"❌ Erro ao executar script de exclusão: {str(e)}")
        return False

# Função para modificar temporariamente o script de exclusão
def modificar_script_exclusao(script_path, post_id):
    try:
        # Ler o script original
        with open(script_path, "r") as f:
            conteudo = f.read()
        
        # Modificar o array de IDs para conter apenas o ID desejado
        import re
        padrao = r"const POST_IDS = \[.*?\];"
        substituicao = f"const POST_IDS = ['{post_id}'];"
        
        novo_conteudo = re.sub(padrao, substituicao, conteudo, flags=re.DOTALL)
        
        # Criar arquivo temporário
        temp_file = f"{script_path}.temp"
        with open(temp_file, "w") as f:
            f.write(novo_conteudo)
        
        return temp_file
    except Exception as e:
        add_log(f"Erro ao modificar script: {str(e)}")
        return None

# Função para indexar post no Algolia
def indexar_post_no_algolia(post_id, post_title):
    try:
        script_path = "scripts/indexar-conteudo.js"
        
        # Verificar se o script existe
        if not os.path.exists(script_path):
            # Tentar alternativa verificar_posts.js que também pode indexar
            script_path = "verificar_posts.js"
            if not os.path.exists(script_path):
                add_log(f"Erro: Script de indexação não encontrado")
                return False
        
        # Executar o script Node.js
        add_log(f"Indexando post '{post_title}' no Algolia...")
        process = subprocess.Popen(
            ["node", script_path, post_id],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        stdout, stderr = process.communicate()
        
        if process.returncode == 0:
            add_log(f"Post '{post_title}' indexado com sucesso no Algolia!")
            return True
        else:
            add_log(f"Erro ao indexar post: {stderr}")
            return False
    
    except Exception as e:
        add_log(f"Erro ao executar script de indexação: {str(e)}")
        return False

# Função para indexar todos os posts no Algolia
def indexar_todos_posts_no_algolia():
    try:
        script_path = "scripts/indexar-sanity-para-algolia.js"
        
        # Verificar se o script existe
        if not os.path.exists(script_path):
            # Tentar alternativa verificar_posts.js que também pode indexar
            script_path = "verificar_posts.js"
            if not os.path.exists(script_path):
                add_log(f"Erro: Script de indexação não encontrado")
                return False
        
        # Executar o script Node.js
        add_log("Indexando todos os posts no Algolia...")
        process = subprocess.Popen(
            ["node", script_path],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        stdout, stderr = process.communicate()
        
        if process.returncode == 0:
            add_log("Todos os posts indexados com sucesso no Algolia!")
            return True
        else:
            add_log(f"Erro ao indexar posts: {stderr}")
            return False
    
    except Exception as e:
        add_log(f"Erro ao executar script de indexação: {str(e)}")
        return False

# Função para buscar posts do Sanity CMS
def buscar_posts_do_sanity(refresh=False):
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
                add_log(f"Erro ao ler arquivo .env: {e}")
        
        if not project_id:
            add_log("Erro: ID do projeto Sanity não encontrado")
            return []
        
        # Montar URL da API
        url = f"https://{project_id}.api.sanity.io/v{api_version}/data/query/{dataset}?query=*%5B_type%20%3D%3D%20%22post%22%5D%7B%0A%20%20_id%2C%0A%20%20title%2C%0A%20%20slug%2C%0A%20%20publishedAt%2C%0A%20%20excerpt%2C%0A%20%20%22estimatedReadingTime%22%3A%20round%28length%28pt%3A%3Atext%28content%29%29%20%2F%205%20%2F%20180%29%0A%7D%20%7C%20order%28publishedAt%20desc%29"
        
        # Fazer a requisição
        add_log("Buscando posts do Sanity CMS...")
        response = requests.get(url)
        
        if response.status_code == 200:
            posts = response.json().get("result", [])
            add_log(f"Posts encontrados: {len(posts)}")
            st.session_state.sanity_posts = posts
            st.session_state.last_posts_fetch = current_time
            return posts
        else:
            add_log(f"Erro na requisição: {response.status_code}")
            return []
    
    except Exception as e:
        add_log(f"Erro ao buscar posts: {str(e)}")
        return []

# Função para indexar um único artigo no Algolia
def indexar_artigo_individual():
    with st.spinner("Indexando artigo..."):
        # Verificar se há posts no Sanity para indexar
        posts = buscar_posts_do_sanity()
        
        if not posts:
            add_log("Nenhum post encontrado no Sanity CMS para indexar.")
            return False
        
        # Ordenar por data de publicação (mais recente primeiro)
        posts.sort(key=lambda p: p.get("publishedAt", ""), reverse=True)
        
        # Pegar o post mais recente para indexar
        post = posts[0]
        post_id = post.get("_id")
        post_title = post.get("title", "Sem título")
        
        add_log(f"Indexando post mais recente: '{post_title}'")
        
        if indexar_post_no_algolia(post_id, post_title):
            add_log(f"✅ Post '{post_title}' indexado com sucesso no Algolia!")
            return True
        else:
            return False

# Interface principal
st.markdown('<h1 class="main-header">Blog Automação - The Crypto Frontier</h1>', unsafe_allow_html=True)
st.markdown('<p>Sistema de automação para o blog The Crypto Frontier usando CrewAI</p>', unsafe_allow_html=True)

# Sidebar para controles
with st.sidebar:
    st.markdown('<h2 class="sub-header">Controles</h2>', unsafe_allow_html=True)
    
    # Botão para ver logs
    if st.button("Ver Logs", key="view_logs"):
        st.session_state.active_tab = "Logs"
        st.experimental_rerun()
    
    # Última execução
    if st.session_state.last_run:
        st.info(f"Última execução: {st.session_state.last_run.strftime('%Y-%m-%d %H:%M:%S')}")
    
    st.markdown("---")
    
    # Ações
    st.markdown('<h3>Ações</h3>', unsafe_allow_html=True)
    
    # Operações disponíveis
    col1, col2, col3 = st.columns(3)
    
    with col1:
        if st.button("Traduzir", key="btn_traduzir"):
            traduzir_artigos()
    
    with col2:
        if st.button("Publicar", key="btn_publicar"):
            publicar_artigos()
    
    with col3:
        if st.button("Indexar", key="btn_indexar"):
            indexar_artigo_individual()

# Removido diálogo de confirmação para exclusão direta

# Conteúdo principal
col_stats, col_content = st.columns([1, 3])

with col_stats:
    st.markdown('<h2 class="sub-header">Estatísticas</h2>', unsafe_allow_html=True)
    
    # Obter estatísticas sem buscar do Sanity
    stats = obter_estatisticas()
    
    st.markdown('<div class="info-box">', unsafe_allow_html=True)
    st.metric("Artigos para traduzir", stats["para_traduzir"])
    st.markdown('</div>', unsafe_allow_html=True)
    
    st.markdown('<div class="info-box">', unsafe_allow_html=True)
    st.metric("Artigos traduzidos", stats["traduzidos"])
    st.markdown('</div>', unsafe_allow_html=True)
    
    st.markdown('<div class="success-box">', unsafe_allow_html=True)
    st.metric("Artigos publicados", stats["publicados"])
    st.markdown('</div>', unsafe_allow_html=True)

with col_content:
    # Tabs para diferentes visualizações
    if 'active_tab' not in st.session_state:
        st.session_state.active_tab = "Logs"
        
    tab1, tab2, tab3, tab4 = st.tabs(["Logs", "Artigos", "Sanity CMS", "Configuração"])
    
    # Detectar qual tab está ativa
    # Como o Streamlit não permite detectar diretamente, usar a seleção para atualizar variáveis de sessão
    
    with tab1:
        st.session_state.active_tab = "Logs"
        st.markdown('<h2 class="sub-header">Logs</h2>', unsafe_allow_html=True)
        
        # Limpar logs
        if st.button("Limpar Logs"):
            st.session_state.log_messages = []
        
        # Exibir logs
        log_text = "\n".join(st.session_state.log_messages)
        st.code(log_text)
    
    with tab2:
        st.session_state.active_tab = "Artigos"
        st.markdown('<h2 class="sub-header">Artigos</h2>', unsafe_allow_html=True)
        
        # Subtabs para diferentes estados
        subtab1, subtab2, subtab3 = st.tabs(["Para Traduzir", "Traduzidos", "Publicados"])
        
        with subtab1:
            # Verificar primeiro em posts_para_traduzir e se não existir, verificar em posts_traduzidos
            dir_posts = Path("posts_para_traduzir")
            if not dir_posts.exists():
                dir_posts = Path("posts_traduzidos")
                
            artigos = list(dir_posts.glob("para_traduzir_*.json"))
            
            if not artigos:
                st.info("Nenhum artigo para traduzir.")
            else:
                for arquivo in artigos:
                    with st.expander(arquivo.name):
                        try:
                            with open(arquivo, "r", encoding="utf-8") as f:
                                conteudo = f.read()
                            st.code(conteudo[:500] + "...", language="markdown")
                        except Exception as e:
                            st.error(f"Erro ao ler arquivo: {str(e)}")
        
        with subtab2:
            dir_posts = Path("posts_traduzidos")
            artigos = [a for a in dir_posts.glob("*.json") if not a.name.startswith("para_traduzir_")]
            
            if not artigos:
                st.info("Nenhum artigo traduzido.")
            else:
                for arquivo in artigos:
                    with st.expander(arquivo.name):
                        try:
                            with open(arquivo, "r", encoding="utf-8") as f:
                                conteudo = f.read()
                            st.code(conteudo[:500] + "...", language="markdown")
                        except Exception as e:
                            st.error(f"Erro ao ler arquivo: {str(e)}")
        
        with subtab3:
            dir_publicados = Path("posts_publicados")
            if not dir_publicados.exists():
                st.info("Diretório de posts publicados não encontrado.")
            else:
                artigos = list(dir_publicados.glob("*.json"))
                
                if not artigos:
                    st.info("Nenhum artigo publicado localmente.")
                else:
                    for arquivo in artigos:
                        with st.expander(arquivo.name):
                            try:
                                with open(arquivo, "r", encoding="utf-8") as f:
                                    conteudo = f.read()
                                st.code(conteudo[:500] + "...", language="markdown")
                            except Exception as e:
                                st.error(f"Erro ao ler arquivo: {str(e)}")
    
    with tab3:
        st.session_state.active_tab = "Sanity CMS"
        st.markdown('<h2 class="sub-header">Posts no Sanity CMS</h2>', unsafe_allow_html=True)
        
        # Botão para atualizar posts
        if st.button("Atualizar Posts do Sanity", key="refresh_sanity"):
            st.session_state.sanity_posts = []
            st.session_state.last_posts_fetch = None
        
        # Apenas nesta tab devemos buscar posts do Sanity
        posts = buscar_posts_do_sanity()
        
        if not posts:
            st.info("Nenhum post encontrado no Sanity CMS ou não foi possível conectar.")
        else:
            # Filtros
            st.markdown("### Filtros")
            filter_col1, filter_col2 = st.columns(2)
            with filter_col1:
                search_term = st.text_input("Buscar por título", "")
            with filter_col2:
                sort_by = st.selectbox("Ordenar por", ["Data (mais recente)", "Data (mais antigo)", "Título (A-Z)", "Título (Z-A)"])
            
            # Aplicar filtros e ordenação
            if search_term:
                filtered_posts = [p for p in posts if search_term.lower() in p.get("title", "").lower()]
            else:
                filtered_posts = posts
            
            # Ordenação
            if sort_by == "Data (mais recente)":
                filtered_posts.sort(key=lambda p: p.get("publishedAt", ""), reverse=True)
            elif sort_by == "Data (mais antigo)":
                filtered_posts.sort(key=lambda p: p.get("publishedAt", ""))
            elif sort_by == "Título (A-Z)":
                filtered_posts.sort(key=lambda p: p.get("title", "").lower())
            elif sort_by == "Título (Z-A)":
                filtered_posts.sort(key=lambda p: p.get("title", "").lower(), reverse=True)
            
            # Exibir posts
            st.markdown(f"### {len(filtered_posts)} Posts Encontrados")
            
            for i, post in enumerate(filtered_posts):
                with st.container():
                    # CSS style para o card
                    html_card = f"""
                    <div class="post-card">
                        <div class="post-title">{post.get('title', 'Sem título')}</div>
                        <div class="post-meta">
                            Publicado em: {datetime.fromisoformat(post.get('publishedAt', datetime.now().isoformat())).strftime('%d/%m/%Y')} | 
                            Slug: {post.get('slug', {}).get('current', 'sem-slug')} | 
                            Tempo de leitura: {post.get('estimatedReadingTime', 1)} min
                        </div>
                        <div class="post-excerpt">{post.get('excerpt', 'Sem resumo disponível.') if post.get('excerpt') else 'Sem resumo disponível.'}...</div>
                    </div>
                    """
                    st.markdown(html_card, unsafe_allow_html=True)
                    
                    # Botões de ações para o post
                    col1, col2, col3 = st.columns(3)
                    with col1:
                        if st.button("Excluir", key=f"delete_{i}", type="primary"):
                            # Chamar diretamente a função de exclusão sem pedir confirmação
                            excluir_post_do_sanity(post.get("_id"), post.get("title", "Sem título"))
                            # Forçar atualização da página depois de alguns segundos
                            time.sleep(1)
                            st.rerun()
                    with col2:
                        if st.button("Indexar no Algolia", key=f"index_{i}"):
                            indexar_post_no_algolia(post.get("_id"), post.get("title", "Sem título"))
                    with col3:
                        post_slug = post.get('slug', {}).get('current', '')
                        post_url = f"https://thecryptofrontier.com/post/{post_slug}"
                        # Usar html para abrir em nova aba
                        st.markdown(f'<a href="{post_url}" target="_blank"><button style="background-color: #2196F3; color: white; border: none; border-radius: 0.25rem; padding: 0.25rem 0.5rem; font-size: 0.85rem; cursor: pointer;">Ver Detalhes</button></a>', unsafe_allow_html=True)
    
    with tab4:
        st.markdown('<h2 class="sub-header">Configuração</h2>', unsafe_allow_html=True)
        
        st.markdown("### Feeds RSS")
        
        # Exibir e editar feeds RSS
        feeds_file = Path("feeds.json")
        
        if feeds_file.exists():
            try:
                with open(feeds_file, "r", encoding="utf-8") as f:
                    feeds = json.load(f)
            except:
                feeds = []
        else:
            feeds = []
        
        # Se feeds estiver vazio, usar padrão da classe RssFeedTool
        if not feeds and st.session_state.crew:
            try:
                tool = st.session_state.crew.monitor().tools[0]
                feeds = tool.default_feeds
            except:
                feeds = [
                    "https://thecryptobasic.com/feed",
                ]
        
        # Verificar se feeds é uma lista de strings ou de dicionários
        if feeds and isinstance(feeds[0], dict):
            # Se for dicionário, extrair as URLs
            feeds_str = "\n".join([feed.get("url", "") for feed in feeds])
        else:
            # Se for lista de strings
            feeds_str = "\n".join(feeds)
            
        new_feeds = st.text_area("Feeds RSS (um por linha)", feeds_str, height=200)
        
        if st.button("Salvar Feeds"):
            try:
                new_feeds_list = [f for f in new_feeds.split("\n") if f.strip()]
                # Converter para o formato de objeto com name e url
                formatted_feeds = []
                for feed_url in new_feeds_list:
                    # Extrair um nome simples da URL
                    feed_name = feed_url.split("//")[-1].split("/")[0].replace("www.", "")
                    formatted_feeds.append({
                        "name": feed_name,
                        "url": feed_url
                    })
                
                with open(feeds_file, "w", encoding="utf-8") as f:
                    json.dump(formatted_feeds, f, indent=2)
                add_log("Feeds RSS salvos com sucesso!")
                st.success("Feeds RSS salvos com sucesso!")
            except Exception as e:
                add_log(f"Erro ao salvar feeds: {str(e)}")
                st.error(f"Erro ao salvar feeds: {str(e)}")



# Footer
st.markdown("---")
st.markdown(
    """
    <div style="text-align: center">
        <p>Blog Automação - The Crypto Frontier | Desenvolvido com CrewAI</p>
    </div>
    """, 
    unsafe_allow_html=True
)

