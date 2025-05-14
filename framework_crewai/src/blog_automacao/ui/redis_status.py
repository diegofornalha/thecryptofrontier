#!/usr/bin/env python
import streamlit as st
import time
from datetime import datetime
import pandas as pd
import traceback
import sys
import os

# Adicionar diretório pai ao path para importar redis_tools
parent_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../.."))
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

from redis_tools import RedisArticleQueue, redis_client, get_redis_client

@st.cache_data(ttl=10)  # Cache por 10 segundos
def get_queue_stats():
    """Obtém estatísticas da fila Redis com cache."""
    try:
        queue = RedisArticleQueue()
        stats = queue.get_queue_stats()
        return stats
    except Exception as e:
        st.error(f"Erro ao obter estatísticas da fila: {str(e)}")
        return {"pending": 0, "processing": 0, "completed": 0, "error": 0, "error_message": str(e)}

@st.cache_data(ttl=60)  # Cache por 1 minuto
def get_queue_items(queue_name, max_items=10):
    """Obtém itens de uma fila específica com cache."""
    try:
        if not redis_client:
            return []
            
        # Obter itens da fila
        queue_key = f"articles_{queue_name}"
        items = redis_client.lrange(queue_key, 0, max_items - 1)
        
        # Converter para objetos
        parsed_items = []
        for item in items:
            try:
                import json
                data = json.loads(item)
                # Simplificar para exibição
                simplified = {
                    "id": data.get("id", ""),
                    "title": data.get("title", "Sem título"),
                    "timestamp": data.get(f"{queue_name}_timestamp", datetime.now().isoformat()),
                }
                parsed_items.append(simplified)
            except Exception as e:
                parsed_items.append({"id": "erro", "title": f"Erro ao decodificar: {str(e)}", "timestamp": ""})
        
        return parsed_items
    
    except Exception as e:
        st.error(f"Erro ao obter itens da fila {queue_name}: {str(e)}")
        return []

def render_redis_status():
    """Renderiza o painel de status do Redis."""
    st.markdown("## Status do Redis")
    
    # Verificar conexão Redis
    redis_status = ""
    redis_color = ""
    try:
        if redis_client and redis_client.ping():
            redis_status = "✅ Conectado"
            redis_color = "green"
        else:
            redis_status = "⚠️ Desconectado"
            redis_color = "red"
    except Exception as e:
        redis_status = f"❌ Erro: {str(e)}"
        redis_color = "red"
    
    # Exibir status
    st.markdown(f"<p style='color: {redis_color};'><b>Status:</b> {redis_status}</p>", unsafe_allow_html=True)
    
    # Obter estatísticas
    stats = get_queue_stats()
    
    # Exibir estatísticas em colunas
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        st.metric("Pendentes", stats.get("pending", 0))
    with col2:
        st.metric("Em Processamento", stats.get("processing", 0))
    with col3:
        st.metric("Concluídos", stats.get("completed", 0))
    with col4:
        st.metric("Erros", stats.get("error", 0))
    
    # Botão para atualizar
    if st.button("Atualizar Estatísticas"):
        # Força recálculo do cache
        st.cache_data.clear()
        stats = get_queue_stats()
        st.success("Estatísticas atualizadas!")
    
    # Abas para cada fila
    tab1, tab2, tab3, tab4 = st.tabs(["Pendentes", "Em Processamento", "Concluídos", "Erros"])
    
    # Aba de Pendentes
    with tab1:
        _render_queue_items("to_process")
    
    # Aba de Em Processamento
    with tab2:
        _render_queue_items("processing")
    
    # Aba de Concluídos
    with tab3:
        _render_queue_items("completed")
    
    # Aba de Erros
    with tab4:
        _render_queue_items("error")
    
    # Recuperar artigos travados
    st.markdown("### Manutenção da Fila")
    recover_col1, recover_col2 = st.columns([3, 1])
    
    with recover_col1:
        recovery_time = st.slider(
            "Tempo máximo de processamento (segundos)",
            min_value=60,
            max_value=7200,
            value=3600,
            step=60
        )
    
    with recover_col2:
        if st.button("Recuperar Artigos Travados"):
            try:
                queue = RedisArticleQueue()
                recovered = queue.recover_stalled_articles(recovery_time)
                if recovered > 0:
                    st.success(f"Recuperados {recovered} artigos travados!")
                else:
                    st.info("Nenhum artigo travado encontrado.")
            except Exception as e:
                st.error(f"Erro ao recuperar artigos: {str(e)}")
                st.code(traceback.format_exc())

def _render_queue_items(queue_name):
    """Renderiza os itens de uma fila específica."""
    items = get_queue_items(queue_name)
    
    if not items:
        st.info(f"Nenhum item na fila '{queue_name}'")
        return
    
    # Converter para DataFrame para exibição mais limpa
    df = pd.DataFrame(items)
    
    # Formatar timestamp
    if "timestamp" in df.columns:
        df["timestamp"] = pd.to_datetime(df["timestamp"]).dt.strftime("%Y-%m-%d %H:%M:%S")
    
    # Exibir tabela
    st.dataframe(df)

if __name__ == "__main__":
    st.set_page_config(page_title="Redis Status", layout="wide")
    render_redis_status()