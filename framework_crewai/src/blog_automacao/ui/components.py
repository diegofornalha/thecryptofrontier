#!/usr/bin/env python
import streamlit as st
from datetime import datetime
from pathlib import Path
import json

from ..logic.session_manager import SessionManager
from ..logic.business_logic import get_stats, load_feeds, save_feeds

def load_css():
    """Carrega o CSS do arquivo externo."""
    with open("static/style.css", "r") as f:
        st.markdown(f"<style>{f.read()}</style>", unsafe_allow_html=True)


# Componentes da Sidebar
def render_sidebar():
    """Renderiza a barra lateral do app."""
    # Botão para limpar cache
    if st.button("🧹 Limpar Cache", key="limpar_cache_sidebar"):
        SessionManager.clear_cache()
        st.experimental_rerun()
    
    # Botão para ver logs
    if st.button("Ver Logs", key="view_logs_sidebar"):
        SessionManager.toggle_show_logs()
        st.experimental_rerun()
    
    # Última execução
    if st.session_state.last_run:
        st.info(f"Última execução: {st.session_state.last_run.strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Exibir logs na barra lateral se a opção estiver ativada
    if st.session_state.get('show_logs', False):
        st.markdown("---")
        st.markdown('<h3>Logs do Sistema</h3>', unsafe_allow_html=True)
        
        # Limpar logs
        if st.button("Limpar Logs", key="clear_logs_sidebar"):
            SessionManager.clear_logs()
            st.experimental_rerun()
        
        # Exibir logs em uma área de texto expansível
        log_text = "\n".join(st.session_state.log_messages)
        with st.expander("Ver logs completos", expanded=True):
            st.code(log_text)


# Componentes de estatísticas
def render_stats_column():
    """Renderiza a coluna de estatísticas."""
    st.markdown('<h2 class="sub-header">Estatísticas por Agente</h2>', unsafe_allow_html=True)
    
    # Obter estatísticas
    stats = get_stats()
    
    # Agente Monitor
    st.markdown('<h4>Agente Monitor</h4>', unsafe_allow_html=True)
    st.markdown('<div class="info-box">', unsafe_allow_html=True)
    st.metric("Artigos identificados", stats["para_traduzir"])
    st.markdown('</div>', unsafe_allow_html=True)
    
    # Agente Tradutor
    st.markdown('<h4>Agente Tradutor</h4>', unsafe_allow_html=True)
    st.markdown('<div class="info-box">', unsafe_allow_html=True)
    st.metric("Artigos traduzidos", stats["traduzidos"])
    st.markdown('</div>', unsafe_allow_html=True)
    
    # Agente Publisher
    st.markdown('<h4>Agente Publisher</h4>', unsafe_allow_html=True)
    st.markdown('<div class="success-box">', unsafe_allow_html=True)
    st.metric("Artigos publicados", stats["publicados"])
    st.markdown('</div>', unsafe_allow_html=True)


# Componente para listar posts para tradução
def render_article_item(arquivo, tipo="traducao"):
    """Renderiza um item de artigo em um expander."""
    with st.expander(arquivo.name):
        try:
            with open(arquivo, "r", encoding="utf-8") as f:
                conteudo = f.read()
            
            # Exibir o conteúdo do arquivo
            col1, col2 = st.columns([4, 1])
            with col1:
                st.code(conteudo[:500] + "...", language="markdown")
            
            with col2:
                # Botões dependendo do tipo de artigo
                if tipo == "para_traduzir":
                    if st.button("Traduzir", key=f"traduzir_direto_{arquivo.name}"):
                        from ..logic.business_logic import translate_article
                        with st.spinner(f"Traduzindo {arquivo.name}..."):
                            if translate_article(arquivo):
                                st.success(f"Artigo traduzido com sucesso: {arquivo.name}")
                                st.experimental_rerun()
                            else:
                                st.error(f"Erro ao traduzir {arquivo.name}")
                
                elif tipo == "traduzido":
                    if st.button("Publicar", key=f"publicar_direto_{arquivo.name}"):
                        from ..logic.business_logic import publish_article
                        with st.spinner(f"Publicando {arquivo.name}..."):
                            if publish_article(arquivo):
                                st.success(f"Artigo publicado com sucesso: {arquivo.name}")
                                st.experimental_rerun()
                            else:
                                st.error(f"Erro ao publicar {arquivo.name}")
                
                # Botão para remover (comum para todos os tipos)
                if st.button("Remover", key=f"remover_{tipo}_{arquivo.name}"):
                    try:
                        import shutil
                        # Mover o arquivo para a pasta de arquivos ignorados
                        dir_ignorados = Path("posts_ignorados")
                        dir_ignorados.mkdir(parents=True, exist_ok=True)
                        
                        # Mover para a pasta de ignorados em vez de deletar permanentemente
                        shutil.move(str(arquivo), str(dir_ignorados / arquivo.name))
                        
                        SessionManager.add_log(f"✅ Arquivo {arquivo.name} removido")
                        st.success(f"Arquivo removido: {arquivo.name}")
                        st.experimental_rerun()  # Recarregar a página para atualizar a lista
                    except Exception as e:
                        SessionManager.add_log(f"❌ Erro ao remover arquivo {arquivo.name}: {str(e)}")
                        st.error(f"Erro ao remover arquivo: {str(e)}")
        except Exception as e:
            st.error(f"Erro ao ler arquivo: {str(e)}")


# Componente de aba Feed RSS
def render_rss_tab():
    """Renderiza a aba de configuração de RSS."""
    st.markdown('<h2 class="sub-header">Configuração do Sistema</h2>', unsafe_allow_html=True)
    
    st.markdown("### Feeds RSS")
    
    # Carregar feeds
    feeds = load_feeds()
    
    # Verificar o formato e extrair URLs
    if feeds and isinstance(feeds[0], dict):
        feeds_str = "\n".join([feed.get("url", "") for feed in feeds])
    else:
        feeds_str = "\n".join(feeds)
        
    # Campo de texto para editar feeds
    new_feeds = st.text_area("Feeds RSS (um por linha)", feeds_str, height=200)
    
    # Botão para salvar
    if st.button("Salvar Feeds"):
        new_feeds_list = [f for f in new_feeds.split("\n") if f.strip()]
        if save_feeds(new_feeds_list):
            st.success("Feeds RSS salvos com sucesso!")
        else:
            st.error("Erro ao salvar feeds")


# Componente para renderizar o post no formato card
def render_post_card(post, index):
    """Renderiza um card de post do Sanity CMS."""
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
            if st.button("Excluir", key=f"delete_{index}", type="primary"):
                from ..logic.business_logic import delete_sanity_post
                delete_sanity_post(post.get("_id"), post.get("title", "Sem título"))
                # Forçar atualização da página depois de alguns segundos
                import time
                time.sleep(1)
                st.rerun()
        with col2:
            if st.button("Indexar no Algolia", key=f"index_{index}"):
                from ..logic.business_logic import index_algolia_post
                index_algolia_post(post.get("_id"), post.get("title", "Sem título"))
        with col3:
            post_slug = post.get('slug', {}).get('current', '')
            post_url = f"https://thecryptofrontier.com/post/{post_slug}"
            # Usar html para abrir em nova aba
            st.markdown(f'<a href="{post_url}" target="_blank"><button style="background-color: #2196F3; color: white; border: none; border-radius: 0.25rem; padding: 0.25rem 0.5rem; font-size: 0.85rem; cursor: pointer;">Ver Detalhes</button></a>', unsafe_allow_html=True) 