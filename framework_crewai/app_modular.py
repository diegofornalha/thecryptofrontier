#!/usr/bin/env python
import os
import streamlit as st
from pathlib import Path
import json
from datetime import datetime

# Importar apenas o que é necessário
from src.blog_automacao import BlogAutomacaoCrew
from src.blog_automacao.ui import load_css, render_sidebar, render_stats_column, render_article_item, render_rss_tab
from src.blog_automacao.logic import SessionManager, monitor_feeds, translate_article, publish_article, fetch_sanity_posts, get_db_posts, delete_db_post, clear_db, execute_full_flow

# Implementação inline do render_kanban_board para resolver o problema de importação
def render_kanban_board():
    """Render a simplified Kanban board interface for content workflow"""
    
    # Header
    st.markdown(
        """
        <h1 style="text-align: center; margin-bottom: 20px;">📋 Content Workflow</h1>
        <p style="text-align: center; margin-bottom: 30px;">Manage the content workflow from RSS to publication</p>
        """, 
        unsafe_allow_html=True
    )
    
    # Use tabs for kanban stages to avoid column nesting issues
    tab1, tab2, tab3 = st.tabs(["📥 Pending", "🔄 Translation", "🚀 Publication"])
    
    with tab1:
        render_pending_column_content()
    
    with tab2:
        render_translation_column_content()
        
    with tab3:
        render_publication_column_content()
        
def render_pending_column_content():
    """Renders the content of the Pending column without the header"""
    # Control buttons - simpler interface with emphasized buttons
    if st.button("📡 MONITOR RSS FEEDS", key="monitor_rss_btn", use_container_width=True, type="primary"):
        if monitor_feeds():
            st.success("RSS monitoring completed!")
            st.rerun()
        else:
            st.error("Error monitoring feeds")
    
    # Find articles to translate
    dir_posts = Path("posts_para_traduzir")
    if dir_posts.exists():
        articles = list(dir_posts.glob("para_traduzir_*.json"))
        
        if not articles:
            st.info("No pending articles found")
        else:
            st.success(f"{len(articles)} articles ready for translation")
            # Show each article card
            for article in articles:
                render_article_card(article, stage="pending")
    else:
        st.info("No pending articles found")

def render_translation_column_content():
    """Renders the content of the Translation column"""
    # Translation controls - avoid nested columns
    st.button("🔤 Translate Next", key="translate_next_btn", use_container_width=True, 
             on_click=lambda: translate_and_rerun())
    
    st.button("👁️ View Translated", key="view_translated_btn", use_container_width=True,
             on_click=lambda: st.rerun())
    
    # Find translated articles
    dir_posts = Path("posts_traduzidos")
    if dir_posts.exists():
        articles = [a for a in dir_posts.glob("*.json") if not a.name.startswith("para_traduzir_")]
        
        if not articles:
            st.info("No translated articles yet")
        else:
            st.success(f"{len(articles)} articles translated")
            # Show each article card
            for article in articles:
                render_article_card(article, stage="translated")
    else:
        st.info("No translated articles found")

def translate_and_rerun():
    """Helper function to translate article and rerun"""
    if translate_article():
        st.success("Article translated!")
        st.rerun()
    else:
        st.error("Translation failed or no articles")

def render_publication_column_content():
    """Renders the content of the Publication column"""
    # Publication controls - avoid nested columns
    st.button("📤 Publish Next", key="publish_next_btn", use_container_width=True,
             on_click=lambda: publish_and_rerun())
    
    st.button("🔄 Refresh Sanity", key="refresh_sanity_btn", use_container_width=True,
             on_click=lambda: refresh_sanity_and_rerun())
    
    # Show published articles from Sanity CMS
    posts = fetch_sanity_posts()
    
    if not posts:
        st.info("No published articles found in Sanity")
    else:
        # Show the 5 most recently published
        recent_posts = sorted(
            posts, 
            key=lambda p: p.get("publishedAt", ""), 
            reverse=True
        )[:5]
        
        st.success(f"{len(posts)} articles published to Sanity")
        
        for post in recent_posts:
            render_published_card(post)

def publish_and_rerun():
    """Helper function to publish article and rerun"""
    if publish_article():
        st.success("Article published to Sanity!")
        st.rerun()
    else:
        st.error("Publication failed or no articles")
        
def refresh_sanity_and_rerun():
    """Helper function to refresh Sanity cache and rerun"""
    SessionManager.clear_sanity_cache()
    st.rerun()

def render_article_card(article_path, stage="pending"):
    """
    Renders a card for an article
    
    Args:
        article_path: Path to the article JSON file
        stage: The workflow stage (pending, translated)
    """
    try:
        with open(article_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        # Extract title based on article stage
        if stage == "pending":
            if "frontmatter_original" in data:
                title = data["frontmatter_original"].get("title", "No Title")
            else:
                title = data.get("title", "No Title")
        else:
            if "frontmatter_traduzido" in data and data["frontmatter_traduzido"]:
                title = data["frontmatter_traduzido"].get("title", "No Title")
            elif "frontmatter_original" in data:
                title = data["frontmatter_original"].get("title", "No Title")
            else:
                title = data.get("title", "No Title")
        
        # Create card UI with consistent styling and appropriate actions
        with st.container():
            st.markdown(
                f"""
                <div style="border: 1px solid #ddd; border-left: 5px solid {get_stage_color(stage)}; 
                            padding: 10px; border-radius: 5px; margin-bottom: 10px; 
                            background-color: white;">
                    <div style="font-weight: bold; margin-bottom: 8px;">{title[:50]}{'...' if len(title) > 50 else ''}</div>
                    <div style="color: #666; font-size: 0.8em; margin-bottom: 5px;">
                        {article_path.name[:20]}...
                    </div>
                </div>
                """, 
                unsafe_allow_html=True
            )
            
            # Sem botões individuais para evitar inconsistências, usamos apenas os botões de ação coletiva no topo
    
    except Exception as e:
        st.error(f"Error loading article: {str(e)}")

def render_published_card(post):
    """
    Renders a card for a published article from Sanity
    
    Args:
        post: The Sanity post data
    """
    title = post.get("title", "No Title")
    published_at = post.get("publishedAt", "")
    post_id = post.get("_id", "")
    
    # Format date if available
    date_display = ""
    if published_at:
        try:
            date_obj = datetime.fromisoformat(published_at.replace('Z', '+00:00'))
            date_display = date_obj.strftime("%d/%m/%Y")
        except:
            date_display = published_at[:10]
    
    # Create card UI with consistent styling
    st.markdown(
        f"""
        <div style="border: 1px solid #ddd; border-left: 5px solid #28a745; 
                    padding: 10px; border-radius: 5px; margin-bottom: 10px; 
                    background-color: white;">
            <div style="font-weight: bold; margin-bottom: 8px;">{title[:50]}{'...' if len(title) > 50 else ''}</div>
            <div style="color: #666; font-size: 0.8em;">
                Published: {date_display}
            </div>
        </div>
        """, 
        unsafe_allow_html=True
    )

def get_stage_color(stage):
    """Returns a color code based on the article stage"""
    if stage == "pending":
        return "#ffc107"  # Yellow
    elif stage == "translated":
        return "#17a2b8"  # Blue
    else:
        return "#28a745"  # Green

# Configuração da página
st.set_page_config(
    page_title="Blog Automação - The Crypto Frontier",
    page_icon="📰",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Carrega o CSS externo
load_css()

# Inicialização da sessão
SessionManager.initialize_session()

# Interface principal
st.markdown('<h1 class="main-header">Blog Automação - The Crypto Frontier</h1>', unsafe_allow_html=True)
st.markdown('<p>Sistema de automação para o blog The Crypto Frontier usando CrewAI</p>', unsafe_allow_html=True)

# Sidebar para controles
with st.sidebar:
    render_sidebar()

# Conteúdo principal
col_stats, col_content = st.columns([1, 3])

with col_stats:
    render_stats_column()

with col_content:
    # Definição das abas
    tabs = [
        "Kanban", 
        "Agente Monitor", 
        "Agente Tradutor", 
        "Agente Publisher", 
        "RSS", 
        "Agente Monitor - BD",
        "Redis Status"
    ]
    
    tab0, tab1, tab2, tab3, tab4, tab5, tab6 = st.tabs(tabs)
    
    # Aba 0: Kanban
    with tab0:
        st.session_state.active_tab = "Kanban"
        render_kanban_board()
    
    # Aba 1: Agente Monitor
    with tab1:
        st.session_state.active_tab = "Monitoramento"
        st.markdown('<h2 class="sub-header">Agente Monitor</h2>', unsafe_allow_html=True)
        
        # Explicação do agente monitor
        st.markdown("""
        <div class="info-box">
        O <b>Agente Monitor</b> é responsável por:
        <ul>
            <li>Monitorar feeds RSS configurados de fontes de criptomoedas</li>
            <li>Filtrar apenas os artigos que não existem no banco de dados</li>
            <li>Salvar artigos relevantes em formato JSON na pasta 'posts_para_traduzir'</li>
            <li>Fornecer um resumo, tópicos e explicação da relevância para o público brasileiro</li>
        </ul>
        </div>
        """, unsafe_allow_html=True)
        
        # Botão para monitorar feeds
        if st.button("Monitorar Feeds RSS", key="monitorar_feeds_btn"):
            if monitor_feeds():
                st.success("Monitoramento de feeds concluído com sucesso!")
                st.rerun()
            else:
                st.error("Erro ao monitorar feeds.")
        
        # Verificar primeiro em posts_para_traduzir e se não existir, verificar em posts_traduzidos
        dir_posts = Path("posts_para_traduzir")
        if not dir_posts.exists():
            dir_posts = Path("posts_traduzidos")
        
        artigos = list(dir_posts.glob("para_traduzir_*.json"))
        
        if not artigos:
            st.info("Nenhum artigo identificado para tradução.")
        else:
            st.success(f"{len(artigos)} artigos identificados e prontos para tradução")
            for arquivo in artigos:
                render_article_item(arquivo, tipo="para_traduzir")
    
    # Aba 2: Agente Tradutor
    with tab2:
        st.session_state.active_tab = "Tradução"
        st.markdown('<h2 class="sub-header">Agente Tradutor</h2>', unsafe_allow_html=True)
        
        # Explicação do agente tradutor
        st.markdown("""
        <div class="info-box">
        O <b>Agente Tradutor</b> é responsável por:
        <ul>
            <li>Traduzir o conteúdo do inglês para português brasileiro</li>
            <li>Revisar e corrigir erros gramaticais e ortográficos</li>
            <li>Adaptar o conteúdo para o público brasileiro</li>
            <li>Criar metadados traduzidos (frontmatter)</li>
            <li>Salvar o arquivo traduzido</li>
        </ul>
        </div>
        """, unsafe_allow_html=True)
        
        # Botão para traduzir artigo
        if st.button("Traduzir Próximo Artigo", key="traduzir_proximo_btn"):
            if translate_article():
                st.success("Artigo traduzido com sucesso!")
                st.rerun()
            else:
                st.error("Erro ao traduzir artigo ou nenhum artigo disponível.")
        
        dir_posts = Path("posts_traduzidos")
        artigos = [a for a in dir_posts.glob("*.json") if not a.name.startswith("para_traduzir_")]
        
        if not artigos:
            st.info("Nenhum artigo traduzido ainda.")
        else:
            st.success(f"{len(artigos)} artigos traduzidos, prontos para publicação")
            for arquivo in artigos:
                render_article_item(arquivo, tipo="traduzido")
    
    # Aba 3: Agente Publisher
    with tab3:
        st.session_state.active_tab = "Publicação"
        st.markdown('<h2 class="sub-header">Agente Publisher</h2>', unsafe_allow_html=True)
        
        # Explicação do agente publisher
        st.markdown("""
        <div class="info-box">
        O <b>Agente Publisher</b> é responsável por:
        <ul>
            <li>Organizar o conteúdo traduzido conforme o schema do Sanity</li>
            <li>Converter o conteúdo para o formato Portable Text do Sanity</li>
            <li>Garantir total conformidade com o schema do projeto</li>
            <li>Publicar o artigo no CMS Sanity</li>
            <li>Resolver referências de categoria se necessário</li>
        </ul>
        </div>
        """, unsafe_allow_html=True)
        
        # Botão para publicar artigo
        if st.button("Publicar Próximo Artigo", key="publicar_proximo_btn"):
            if publish_article():
                st.success("Artigo publicado com sucesso!")
                st.rerun()
            else:
                st.error("Erro ao publicar artigo ou nenhum artigo disponível.")
        
        # Botão para atualizar posts
        if st.button("Atualizar Posts do Sanity", key="refresh_sanity"):
            SessionManager.clear_sanity_cache()
        
        # Buscando os posts publicados
        posts = fetch_sanity_posts()
        
        # Também mostrar os arquivos de posts publicados localmente
        dir_publicados = Path("posts_publicados")
        if dir_publicados.exists():
            arquivos_publicados = list(dir_publicados.glob("*.json"))
            if arquivos_publicados:
                st.success(f"{len(arquivos_publicados)} artigos marcados como publicados localmente")
                with st.expander("Ver arquivos locais de posts publicados"):
                    for arquivo in arquivos_publicados:
                        st.write(arquivo.name)
        
        # Exibir posts do Sanity CMS
        if not posts:
            st.info("Nenhum post encontrado no Sanity CMS ou não foi possível conectar.")
        else:
            st.success(f"{len(posts)} posts encontrados no Sanity CMS")
            
            # Filtros
            st.markdown("### Filtros")
            filter_col1, filter_col2 = st.columns(2)
            with filter_col1:
                search_term = st.text_input("Buscar por título", "")
            with filter_col2:
                sort_options = ["Data (mais recente)", "Data (mais antigo)", "Título (A-Z)", "Título (Z-A)"]
                sort_by = st.selectbox("Ordenar por", sort_options)
            
            # Aplicar filtros e ordenação
            if search_term:
                filtered_posts = [p for p in posts if search_term.lower() in p.get("title", "").lower()]
            else:
                filtered_posts = posts
            
            # Ordenação
            if sort_by == sort_options[0]:  # Data (mais recente)
                filtered_posts.sort(key=lambda p: p.get("publishedAt", ""), reverse=True)
            elif sort_by == sort_options[1]:  # Data (mais antigo)
                filtered_posts.sort(key=lambda p: p.get("publishedAt", ""))
            elif sort_by == sort_options[2]:  # Título (A-Z)
                filtered_posts.sort(key=lambda p: p.get("title", "").lower())
            elif sort_by == sort_options[3]:  # Título (Z-A)
                filtered_posts.sort(key=lambda p: p.get("title", "").lower(), reverse=True)
            
            # Exibir posts
            st.markdown(f"### {len(filtered_posts)} Posts Encontrados")
            
            for i, post in enumerate(filtered_posts):
                from src.blog_automacao.ui import render_post_card
                render_post_card(post, i)
    
    # Aba 4: RSS
    with tab4:
        st.session_state.active_tab = "RSS"
        render_rss_tab()

    # Aba 5: Agente Monitor - Banco de Dados
    with tab5:
        st.session_state.active_tab = "Banco de Dados"
        st.markdown('<h2 class="sub-header">Agente Monitor - Banco de Dados</h2>', unsafe_allow_html=True)
        
        # Explicação do agente monitor - banco de dados
        st.markdown("""
        <div class="info-box">
        Esta é a interface de banco de dados do <b>Agente Monitor</b> que gerencia:
        <ul>
            <li>Artigos capturados dos feeds RSS</li>
            <li>Filtro de artigos que já existem no sistema</li>
            <li>Seleção manual de conteúdo para tradução</li>
            <li>Gerenciamento do histórico de artigos processados</li>
        </ul>
        </div>
        """, unsafe_allow_html=True)
        
        # Ações de gerenciamento
        st.markdown("### Gerenciamento do Banco de Dados")
        col1, col2 = st.columns(2)
        with col1:
            if st.button("Atualizar Posts do Banco", key="refresh_db"):
                SessionManager.add_log("Atualizando visualização do banco de dados...")
        with col2:
            if st.button("Limpar Banco de Dados", type="primary", key="clear_db"):
                if clear_db():
                    st.success("Banco de dados limpo com sucesso!")
                    st.rerun()  # Recarregar a página
                else:
                    st.error("Erro ao limpar banco de dados.")
        
        # Obter posts do banco
        posts_db = get_db_posts()
        
        # Mostrar contagens
        st.success(f"Total de posts no banco de dados: {len(posts_db)}")
        
        # Filtros
        filter_col1, filter_col2 = st.columns(2)
        with filter_col1:
            search_term = st.text_input("Buscar por título", key="db_search")
        with filter_col2:
            sources = ["Todas"] + sorted(list(set([p.get("source", "Desconhecida") for p in posts_db if p.get("source")])))
            source_filter = st.selectbox("Filtrar por fonte", sources, key="db_source")
        
        # Aplicar filtros
        filtered_posts = posts_db
        if search_term:
            filtered_posts = [p for p in filtered_posts if search_term.lower() in p.get("title", "").lower()]
        if source_filter != "Todas":
            filtered_posts = [p for p in filtered_posts if p.get("source") == source_filter]
        
        # Mostrar posts em uma tabela
        if not filtered_posts:
            st.info("Nenhum post encontrado com os filtros atuais.")
        else:
            st.markdown(f"### {len(filtered_posts)} Posts Encontrados")
            
            # Exibir posts um a um com detalhes e botões de ação
            for i, post in enumerate(filtered_posts):
                with st.container():
                    col1, col2 = st.columns([4, 1])
                    
                    # Informações do post
                    with col1:
                        st.markdown(f"""
                        <div style="border: 1px solid #ddd; padding: 10px; border-radius: 5px; margin-bottom: 10px;">
                            <div style="font-weight: bold; font-size: 1.1em;">{post.get('title', 'Sem título')}</div>
                            <div style="color: #666; margin-top: 5px;">
                                <span style="margin-right: 15px;">ID: {post.get('id')}</span>
                                <span style="margin-right: 15px;">Fonte: {post.get('source', 'Desconhecida')}</span>
                                <span style="margin-right: 15px;">Processado: {post.get('processed_date', 'N/A')}</span>
                            </div>
                            <div style="margin-top: 5px;">
                                <a href="{post.get('link', '#')}" target="_blank">Ver artigo original</a>
                            </div>
                        </div>
                        """, unsafe_allow_html=True)
                    
                    # Botões de ação
                    with col2:
                        # Em vez de criar sub-colunas, colocar os botões um abaixo do outro
                        if st.button("Excluir", key=f"delete_db_{i}", type="primary"):
                            if delete_db_post(post.get('id')):
                                st.success(f"Post {post.get('id')} excluído!")
                                import time
                                time.sleep(1)
                                st.rerun()
                            else:
                                st.error("Erro ao excluir post.")
                        
                        if st.button("Traduzir", key=f"translate_db_{i}"):
                            # Iniciar processo de tradução manual
                            try:
                                import json
                                from pathlib import Path
                                from datetime import datetime
                                
                                # Criar JSON com estrutura para tradução
                                data_post = {
                                    "frontmatter_original": {
                                        "title": post.get('title', 'Sem Título Original'),
                                        "original_link": post.get('link', ''),
                                        "published_date": post.get('published_date', datetime.now().isoformat()),
                                        "source_name": post.get('source', 'Desconhecido'),
                                        "tags_originais": post.get('tags', []),
                                        "slug_original": post.get('slug', ''),
                                        "timestamp_captura": int(datetime.now().timestamp())
                                    },
                                    "content_text_original": post.get('content', ''),
                                    "content_html_original": post.get('content_html', ''),
                                    "resumo_original": post.get('summary', ''),
                                    "content_text_traduzido": None,
                                    "content_html_traduzido": None,
                                    "frontmatter_traduzido": None
                                }
                                
                                # Verificar se o diretório existe ou criar se necessário
                                dir_posts = Path("posts_para_traduzir")
                                dir_posts.mkdir(parents=True, exist_ok=True)
                                
                                # Gerar nome de arquivo único
                                timestamp_atual = int(datetime.now().timestamp())
                                arquivo_nome = f"para_traduzir_manual_{timestamp_atual}_{post.get('id')}.json"
                                caminho_arquivo = dir_posts / arquivo_nome
                                
                                # Salvar arquivo para tradução
                                with open(caminho_arquivo, "w", encoding="utf-8") as f:
                                    json.dump(data_post, f, ensure_ascii=False, indent=4)
                                
                                # Iniciar tradução
                                st.success(f"Artigo salvo para tradução: {arquivo_nome}")
                                st.rerun()
                                    
                            except Exception as e:
                                import traceback
                                SessionManager.add_log(f"Erro ao traduzir artigo: {str(e)}")
                                SessionManager.add_log(f"Trace: {traceback.format_exc()}")
                                st.error(f"Erro ao traduzir artigo: {str(e)}")
                                
    # Aba 6: Status do Redis
    with tab6:
        st.session_state.active_tab = "Redis Status"
        # Importamos o componente de status do Redis
        from src.blog_automacao.ui.redis_status import render_redis_status
        # Renderizamos o componente
        render_redis_status()

# Seção para fluxo completo
st.markdown("---")
if st.button("Executar Fluxo Completo", key="full_flow", type="primary"):
    if execute_full_flow():
        st.success("Fluxo completo executado com sucesso!")
    else:
        st.error("Erro ao executar fluxo completo.")

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