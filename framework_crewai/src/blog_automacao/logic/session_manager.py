#!/usr/bin/env python
import streamlit as st
from datetime import datetime
from src.blog_automacao import BlogAutomacaoCrew

class SessionManager:
    """Classe para gerenciar o estado da sessão Streamlit e logs."""
    
    @staticmethod
    def initialize_session():
        """Inicializa todos os componentes necessários da sessão."""
        if 'crew' not in st.session_state:
            st.session_state.crew = BlogAutomacaoCrew()
            SessionManager.add_log(f"[{datetime.now().strftime('%H:%M:%S')}] Crew inicializada automaticamente!")
        if 'last_run' not in st.session_state:
            st.session_state.last_run = None
        if 'log_messages' not in st.session_state:
            st.session_state.log_messages = []
        if 'sanity_posts' not in st.session_state:
            st.session_state.sanity_posts = []
        if 'last_posts_fetch' not in st.session_state:
            st.session_state.last_posts_fetch = None
        if 'post_to_index' not in st.session_state:
            st.session_state.post_to_index = None
        if 'post_to_edit' not in st.session_state:
            st.session_state.post_to_edit = None
        if 'active_tab' not in st.session_state:
            st.session_state.active_tab = "Monitoramento"
        if 'show_logs' not in st.session_state:
            st.session_state.show_logs = False
    
    @staticmethod
    def get_crew():
        """Retorna a instância atual da crew, inicializando se necessário."""
        # Usamos st.cache_resource para manter uma única instância da Crew
        # entre reruns do Streamlit, o que é mais eficiente
        return SessionManager._get_crew_singleton()
        
    @st.cache_resource
    def _get_crew_singleton():
        """Cria uma única instância da BlogAutomacaoCrew que persiste entre refreshes.
        
        Este método é decorado com st.cache_resource para garantir que a instância
        da Crew (que inclui conexões com APIs como Google Gemini) seja reutilizada,
        evitando inicializações desnecessárias e economizando recursos.
        """
        crew = BlogAutomacaoCrew() 
        return crew
    
    @staticmethod
    def add_log(message):
        """Adiciona uma mensagem ao log com timestamp."""
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        if 'log_messages' in st.session_state:
            st.session_state.log_messages.append(f"[{timestamp}] {message}")
    
    @staticmethod
    def clear_logs():
        """Limpa todos os logs."""
        if 'log_messages' in st.session_state:
            st.session_state.log_messages = []
    
    @staticmethod
    def update_last_run():
        """Atualiza o timestamp da última execução."""
        st.session_state.last_run = datetime.now()
    
    @staticmethod
    def clear_cache():
        """Limpa todos os caches do Streamlit."""
        st.cache_data.clear()
        st.cache_resource.clear()
    
    @staticmethod
    def toggle_show_logs():
        """Alterna a visibilidade dos logs."""
        st.session_state.show_logs = not st.session_state.get('show_logs', False)
    
    @staticmethod
    def clear_sanity_cache():
        """Limpa o cache de posts do Sanity."""
        st.session_state.sanity_posts = []
        st.session_state.last_posts_fetch = None 