#!/usr/bin/env python
"""
Interface Streamlit para o Blog Automação

Este aplicativo oferece uma interface visual para gerenciar o fluxo de automação
do blog de criptomoedas, permitindo:
- Monitorar feeds RSS
- Traduzir artigos
- Publicar no Sanity CMS
- Visualizar logs e estatísticas
"""

import os
import sys
import time
import glob
import json
import streamlit as st
from datetime import datetime
from pathlib import Path
import requests
import asyncio
import subprocess

# Adiciona o diretório src ao path para importar o módulo blog_automacao
sys.path.append(os.path.abspath('.'))
from src.blog_automacao import BlogAutomacaoCrew

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
    st.session_state.crew = None
if 'last_run' not in st.session_state:
    st.session_state.last_run = None
if 'log_messages' not in st.session_state:
    st.session_state.log_messages = []
if 'sanity_posts' not in st.session_state:
    st.session_state.sanity_posts = []
if 'last_posts_fetch' not in st.session_state:
    st.session_state.last_posts_fetch = None
if 'post_to_delete' not in st.session_state:
    st.session_state.post_to_delete = None
if 'post_to_index' not in st.session_state:
    st.session_state.post_to_index = None
if 'post_to_edit' not in st.session_state:
    st.session_state.post_to_edit = None

# Função para inicializar a crew
def inicializar_crew():
    st.session_state.crew = BlogAutomacaoCrew()
    st.session_state.log_messages.append(f"[{datetime.now().strftime('%H:%M:%S')}] Crew inicializada com sucesso!")
    return st.session_state.crew

# Função para adicionar log
def add_log(message):
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    st.session_state.log_messages.append(f"[{timestamp}] {message}")

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
        dir_posts = Path("posts_traduzidos")
        arquivos = list(dir_posts.glob("para_traduzir_*.md"))
        
        if not arquivos:
            add_log("Nenhum artigo encontrado para traduzir.")
            return False
        
        add_log(f"Iniciando tradução de {len(arquivos)} artigos...")
        
        for arquivo in arquivos:
            add_log(f"Traduzindo: {arquivo.name}")
            try:
                result = crew.traducao_crew().kickoff(inputs={"arquivo_markdown": str(arquivo)})
                add_log(f"Artigo traduzido: {arquivo.name}")
            except Exception as e:
                add_log(f"Erro ao traduzir {arquivo.name}: {str(e)}")
        
        st.session_state.last_run = datetime.now()
        return True

# Função para publicar artigos
def publicar_artigos():
    with st.spinner("Publicando artigos..."):
        crew = st.session_state.crew or inicializar_crew()
        
        # Verificar se há artigos traduzidos para publicar
        dir_posts = Path("posts_traduzidos")
        arquivos = list(dir_posts.glob("*.md"))
        arquivos = [a for a in arquivos if not a.name.startswith("para_traduzir_")]
        
        if not arquivos:
            add_log("Nenhum artigo traduzido encontrado para publicar.")
            return False
        
        add_log(f"Iniciando publicação de {len(arquivos)} artigos...")
        
        for arquivo in arquivos:
            add_log(f"Publicando: {arquivo.name}")
            try:
                result = crew.publicacao_crew().kickoff(inputs={"arquivo_markdown": str(arquivo)})
                add_log(f"Artigo publicado: {arquivo.name}")
            except Exception as e:
                add_log(f"Erro ao publicar {arquivo.name}: {str(e)}")
        
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
        
        # Passo 2: Tradução
        traduzir_artigos()
        
        # Passo 3: Publicação
        publicar_artigos()
        
        add_log("Fluxo completo finalizado!")
        st.session_state.last_run = datetime.now()
        # Atualizar a contagem de posts
        buscar_posts_do_sanity(refresh=True)
        return True

# Função para buscar estatísticas
def obter_estatisticas():
    stats = {}
    
    # Artigos para traduzir
    dir_posts = Path("posts_traduzidos")
    stats["para_traduzir"] = len(list(dir_posts.glob("para_traduzir_*.md")))
    
    # Artigos traduzidos
    stats["traduzidos"] = len([a for a in dir_posts.glob("*.md") if not a.name.startswith("para_traduzir_")])
    
    # Artigos publicados - usar a contagem do Sanity quando disponível
    if st.session_state.sanity_posts:
        stats["publicados"] = len(st.session_state.sanity_posts)
    else:
        dir_publicados = Path("posts_publicados")
        stats["publicados"] = len(list(dir_publicados.glob("*.md")))
    
    return stats

# Função para excluir post do Sanity
def excluir_post_do_sanity(post_id, post_title):
    try:
        # Duas opções: usar script existente ou API diretamente
        usar_script = True
        
        if usar_script:
            script_path = "agentes_crewai/scripts/editar-postagem/excluir-postagem.js"
            
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
        script_path = "agentes_crewai/scripts/editar-postagem/indexar-conteudo.js"
        
        # Verificar se o script existe
        if not os.path.exists(script_path):
            add_log(f"Erro: Script não encontrado em {script_path}")
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
        script_path = "agentes_crewai/scripts/editar-postagem/indexar-sanity-para-algolia.js"
        
        # Verificar se o script existe
        if not os.path.exists(script_path):
            add_log(f"Erro: Script não encontrado em {script_path}")
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

# Interface principal
st.markdown('<h1 class="main-header">Blog Automação - The Crypto Frontier</h1>', unsafe_allow_html=True)
st.markdown('<p>Sistema de automação para o blog The Crypto Frontier usando CrewAI</p>', unsafe_allow_html=True)

# Sidebar para controles
with st.sidebar:
    st.markdown('<h2 class="sub-header">Controles</h2>', unsafe_allow_html=True)
    
    # Inicialização
    if st.button("Inicializar Crew", key="init_crew"):
        inicializar_crew()
    
    # Última execução
    if st.session_state.last_run:
        st.info(f"Última execução: {st.session_state.last_run.strftime('%Y-%m-%d %H:%M:%S')}")
    
    st.markdown("---")
    
    # Ações
    st.markdown('<h3>Ações</h3>', unsafe_allow_html=True)
    
    # Operações individuais
    st.markdown('<h4>Operações Individuais</h4>', unsafe_allow_html=True)
    
    col1, col2, col3 = st.columns(3)
    
    with col1:
        if st.button("Monitorar", key="btn_monitorar"):
            monitorar_feeds()
    
    with col2:
        if st.button("Traduzir", key="btn_traduzir"):
            traduzir_artigos()
    
    with col3:
        if st.button("Publicar", key="btn_publicar"):
            publicar_artigos()
    
    # Fluxo completo
    st.markdown('<h4>Fluxo Completo</h4>', unsafe_allow_html=True)
    
    if st.button("Executar Fluxo Completo", key="btn_fluxo_completo"):
        executar_fluxo_completo()
    
    # Operações do Algolia
    st.markdown('<h4>Operações Algolia</h4>', unsafe_allow_html=True)
    
    if st.button("Indexar Todos Posts", key="btn_indexar_todos"):
        indexar_todos_posts_no_algolia()
    
    # Modo contínuo
    st.markdown('<h4>Modo Contínuo</h4>', unsafe_allow_html=True)
    
    interval = st.slider("Intervalo (minutos)", min_value=5, max_value=120, value=30, step=5)
    
    if 'running_continuous' not in st.session_state:
        st.session_state.running_continuous = False
    
    if st.button("Iniciar Monitoramento Contínuo" if not st.session_state.running_continuous else "Parar Monitoramento", key="btn_continuous"):
        st.session_state.running_continuous = not st.session_state.running_continuous
        
        if st.session_state.running_continuous:
            add_log(f"Iniciando monitoramento contínuo a cada {interval} minutos")
        else:
            add_log("Monitoramento contínuo interrompido")

# Removido diálogo de confirmação para exclusão direta

# Conteúdo principal
col_stats, col_content = st.columns([1, 3])

with col_stats:
    st.markdown('<h2 class="sub-header">Estatísticas</h2>', unsafe_allow_html=True)
    
    # Garantir que temos dados atualizados do Sanity
    buscar_posts_do_sanity()
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
    tab1, tab2, tab3, tab4 = st.tabs(["Logs", "Artigos", "Sanity CMS", "Configuração"])
    
    with tab1:
        st.markdown('<h2 class="sub-header">Logs</h2>', unsafe_allow_html=True)
        
        # Limpar logs
        if st.button("Limpar Logs"):
            st.session_state.log_messages = []
        
        # Exibir logs
        log_text = "\n".join(st.session_state.log_messages)
        st.code(log_text)
    
    with tab2:
        st.markdown('<h2 class="sub-header">Artigos</h2>', unsafe_allow_html=True)
        
        # Subtabs para diferentes estados
        subtab1, subtab2, subtab3 = st.tabs(["Para Traduzir", "Traduzidos", "Publicados"])
        
        with subtab1:
            dir_posts = Path("posts_traduzidos")
            artigos = list(dir_posts.glob("para_traduzir_*.md"))
            
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
            artigos = [a for a in dir_posts.glob("*.md") if not a.name.startswith("para_traduzir_")]
            
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
            artigos = list(dir_publicados.glob("*.md"))
            
            if not artigos:
                st.info("Nenhum artigo publicado.")
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
        st.markdown('<h2 class="sub-header">Posts no Sanity CMS</h2>', unsafe_allow_html=True)
        
        # Botões para operações em lote
        col1, col2 = st.columns(2)
        with col1:
            if st.button("Atualizar Posts do Sanity", key="refresh_sanity"):
                st.session_state.sanity_posts = []
                st.session_state.last_posts_fetch = None
        with col2:
            if st.button("Indexar Todos no Algolia", key="index_all_algolia"):
                indexar_todos_posts_no_algolia()
        
        # Buscar e exibir posts
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
                        if st.button("Ver Detalhes", key=f"view_{i}"):
                            st.session_state.post_to_edit = post
                            # Exibir modal com detalhes completos futuramente
    
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
                    "https://cointelegraph.com/rss",
                    "https://www.coindesk.com/arc/outboundfeeds/rss/",
                    "https://decrypt.co/feed"
                ]
        
        feeds_str = "\n".join(feeds)
        new_feeds = st.text_area("Feeds RSS (um por linha)", feeds_str, height=200)
        
        if st.button("Salvar Feeds"):
            try:
                new_feeds_list = [f for f in new_feeds.split("\n") if f.strip()]
                with open(feeds_file, "w", encoding="utf-8") as f:
                    json.dump(new_feeds_list, f, indent=2)
                add_log("Feeds RSS salvos com sucesso!")
                st.success("Feeds RSS salvos com sucesso!")
            except Exception as e:
                add_log(f"Erro ao salvar feeds: {str(e)}")
                st.error(f"Erro ao salvar feeds: {str(e)}")

# Modo contínuo (se estiver ativo)
if st.session_state.running_continuous:
    # Verificar quando foi a última execução
    current_time = datetime.now()
    
    if st.session_state.last_run:
        time_diff = (current_time - st.session_state.last_run).total_seconds() / 60
        
        # Se já passou o intervalo definido, executar novamente
        if time_diff >= interval:
            st.experimental_rerun()
    else:
        # Se nunca executou, executar agora
        executar_fluxo_completo()
        st.experimental_rerun()

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