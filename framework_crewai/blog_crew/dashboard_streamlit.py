"""
Dashboard Streamlit Simples para Blog Crew
"""
import streamlit as st
import json
import os
from pathlib import Path
from datetime import datetime, timedelta
import pandas as pd
from typing import Dict, List
from dotenv import load_dotenv

# Carregar variáveis de ambiente do .env
load_dotenv()

# Configuração da página
st.set_page_config(
    page_title="Blog Crew Dashboard",
    page_icon="📊",
    layout="wide"
)

# Título
st.title("📊 Blog Crew - Dashboard")
st.markdown("---")

# Funções auxiliares
def count_files_in_dir(directory: str) -> int:
    """Conta arquivos JSON em um diretório"""
    path = Path(directory)
    if path.exists():
        return len(list(path.glob("*.json")))
    return 0

def get_latest_files(directory: str, limit: int = 5) -> List[Dict]:
    """Obtém os arquivos mais recentes de um diretório"""
    path = Path(directory)
    files = []
    
    if path.exists():
        json_files = sorted(path.glob("*.json"), key=os.path.getmtime, reverse=True)
        
        for file in json_files[:limit]:
            try:
                with open(file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    data['_filename'] = file.name
                    data['_modified'] = datetime.fromtimestamp(os.path.getmtime(file))
                    files.append(data)
            except:
                continue
    
    return files

def read_log_tail(log_file: str, lines: int = 50) -> List[str]:
    """Lê as últimas linhas de um arquivo de log"""
    try:
        with open(log_file, 'r', encoding='utf-8') as f:
            return f.readlines()[-lines:]
    except:
        return []

# Layout em colunas
col1, col2, col3, col4 = st.columns(4)

# Métricas principais
with col1:
    total_rss = count_files_in_dir("posts_para_traduzir")
    st.metric("📰 Artigos RSS", total_rss)

with col2:
    total_translated = count_files_in_dir("posts_traduzidos")
    st.metric("🌐 Traduzidos", total_translated)

with col3:
    total_images = count_files_in_dir("posts_com_imagem")
    st.metric("🖼️ Com Imagem", total_images)

with col4:
    total_published = count_files_in_dir("posts_publicados")
    st.metric("✅ Publicados", total_published)

st.markdown("---")

# Tabs para diferentes visualizações
tab1, tab2, tab3, tab4 = st.tabs(["📈 Últimos Posts", "📋 Logs", "⚙️ Configuração", "🚀 Executar Pipeline"])

# Tab 1: Últimos Posts
with tab1:
    st.subheader("📰 Últimos Posts Processados")
    
    # Selecionar estágio
    stage = st.selectbox(
        "Selecione o estágio:",
        ["posts_publicados", "posts_com_imagem", "posts_formatados", "posts_traduzidos", "posts_para_traduzir"]
    )
    
    # Mostrar últimos arquivos
    latest_files = get_latest_files(stage, limit=10)
    
    if latest_files:
        for file in latest_files:
            with st.expander(f"📄 {file.get('_filename', 'Unknown')} - {file.get('_modified', 'Unknown')}"):
                # Mostrar título se existir
                if 'title' in file:
                    st.write(f"**Título**: {file['title']}")
                
                # Mostrar link se existir
                if 'link' in file:
                    st.write(f"**Link**: {file['link']}")
                
                # Mostrar imagem se existir
                if 'main_image' in file and file['main_image']:
                    st.write(f"**Imagem**: {file['main_image']}")
                
                # Mostrar JSON completo
                st.json(file)
    else:
        st.info(f"Nenhum arquivo encontrado em {stage}")

# Tab 2: Logs
with tab2:
    st.subheader("📋 Logs do Sistema")
    
    # Selecionar arquivo de log
    log_file = st.selectbox(
        "Selecione o arquivo de log:",
        ["pipeline.log", "crew_output.log", "rss_monitor.log", "monitor_startup.log"]
    )
    
    # Número de linhas
    num_lines = st.slider("Número de linhas:", min_value=10, max_value=200, value=50)
    
    # Botão para atualizar
    if st.button("🔄 Atualizar Logs"):
        st.experimental_rerun()
    
    # Mostrar logs
    log_lines = read_log_tail(log_file, num_lines)
    
    if log_lines:
        # Criar área de texto para logs
        log_text = "".join(log_lines)
        st.text_area("Logs:", value=log_text, height=400)
    else:
        st.warning(f"Arquivo {log_file} não encontrado ou vazio")

# Tab 3: Configuração
with tab3:
    st.subheader("⚙️ Configuração Atual")
    
    # Verificar variáveis de ambiente
    st.write("### 🔑 Variáveis de Ambiente (.env)")
    
    # Verificar se .env existe
    env_path = Path(".env")
    if env_path.exists():
        st.success(f"✅ Arquivo .env encontrado: {env_path.absolute()}")
    else:
        st.warning("⚠️ Arquivo .env não encontrado no diretório atual")
        st.info("💡 Criando .env de exemplo...")
        # Tentar copiar do diretório pai
        parent_env = Path("../../.env")
        if parent_env.exists():
            st.info(f"Copiando .env de {parent_env.absolute()}")
    
    # Lista completa de variáveis do .env
    env_vars = {
        "OPENAI_API_KEY": "🟢 Configurada" if os.getenv("OPENAI_API_KEY") else "🔴 Não configurada",
        "GOOGLE_API_KEY": "🟢 Configurada" if os.getenv("GOOGLE_API_KEY") else "🔴 Não configurada",
        "SANITY_PROJECT_ID": os.getenv("SANITY_PROJECT_ID", "Não configurado"),
        "SANITY_API_TOKEN": "🟢 Configurada" if os.getenv("SANITY_API_TOKEN") else "🔴 Não configurada",
        "SANITY_DATASET": os.getenv("SANITY_DATASET", "production"),
        "ALGOLIA_APP_ID": os.getenv("ALGOLIA_APP_ID", "Não configurado"),
        "ALGOLIA_API_KEY": "🟢 Configurada" if os.getenv("ALGOLIA_API_KEY") else "🔴 Não configurada",
        "ALGOLIA_INDEX_NAME": os.getenv("ALGOLIA_INDEX_NAME", "Não configurado"),
    }
    
    for var, value in env_vars.items():
        st.write(f"**{var}**: {value}")
    
    # Botão para recarregar variáveis
    if st.button("🔄 Recarregar .env"):
        load_dotenv(override=True)
        st.experimental_rerun()
    
    # Mostrar se precisa configurar alguma variável
    missing_vars = [var for var, value in env_vars.items() if "🔴" in str(value)]
    if missing_vars:
        st.error(f"⚠️ {len(missing_vars)} variáveis não configuradas: {', '.join(missing_vars)}")
        st.markdown("""
        **Para configurar:**
        1. Crie/edite o arquivo `.env` no diretório do blog_crew
        2. Adicione as variáveis faltantes
        3. Clique em 'Recarregar .env'
        """)
    else:
        st.success("✅ Todas as variáveis de ambiente estão configuradas!")
    
    st.write("### 📂 Diretórios")
    directories = [
        "posts_para_traduzir",
        "posts_traduzidos",
        "posts_formatados",
        "posts_com_imagem",
        "posts_publicados"
    ]
    
    for dir_name in directories:
        exists = "✅ Existe" if Path(dir_name).exists() else "❌ Não existe"
        count = count_files_in_dir(dir_name)
        st.write(f"**{dir_name}**: {exists} ({count} arquivos)")
    
    # Mostrar feeds RSS
    st.write("### 📡 Feeds RSS Configurados")
    try:
        with open("feeds.json", "r") as f:
            feeds = json.load(f)
            
        feeds_df = pd.DataFrame(feeds)
        st.dataframe(feeds_df[['name', 'url', 'active']])
    except:
        st.error("Erro ao carregar feeds.json")

# Tab 4: Executar Pipeline
with tab4:
    st.subheader("🚀 Executar Pipeline")
    
    st.warning("⚠️ Esta funcionalidade executa o pipeline diretamente. Use com cuidado!")
    
    # Seleção de pipeline
    pipeline_choice = st.selectbox(
        "Selecione o pipeline:",
        ["simple_pipeline.py", "run_pipeline.py", "run_pipeline_enhanced.py"]
    )
    
    # Número de artigos
    num_articles = st.number_input(
        "Número de artigos:",
        min_value=1,
        max_value=20,
        value=3
    )
    
    # Limpar arquivos antigos
    clean_files = st.checkbox("Limpar arquivos antigos", value=False)
    
    # Botão para executar
    if st.button("▶️ Executar Pipeline", type="primary"):
        # Verificar se todas as variáveis estão configuradas
        required_vars = ["OPENAI_API_KEY", "GOOGLE_API_KEY", "SANITY_PROJECT_ID", "SANITY_API_TOKEN"]
        missing = [v for v in required_vars if not os.getenv(v)]
        
        if missing:
            st.error(f"❌ Variáveis faltando: {', '.join(missing)}")
            st.stop()
        
        with st.spinner("Executando pipeline..."):
            import subprocess
            
            # Preparar ambiente com variáveis do .env
            env = os.environ.copy()
            
            # Montar comando
            if pipeline_choice == "simple_pipeline.py":
                env["ARTICLE_LIMIT"] = str(num_articles)
                cmd = f"python {pipeline_choice}"
            else:
                cmd = f"python {pipeline_choice} --limit {num_articles}"
                if clean_files:
                    cmd += " --clean"
            
            # Executar
            try:
                result = subprocess.run(
                    cmd,
                    shell=True,
                    capture_output=True,
                    text=True,
                    timeout=300,  # 5 minutos timeout
                    env=env  # Usar ambiente com variáveis do .env
                )
                
                if result.returncode == 0:
                    st.success("✅ Pipeline executado com sucesso!")
                    st.text_area("Saída:", value=result.stdout, height=300)
                else:
                    st.error("❌ Erro ao executar pipeline")
                    st.text_area("Erro:", value=result.stderr, height=300)
                    
            except subprocess.TimeoutExpired:
                st.error("⏱️ Timeout: Pipeline demorou mais de 5 minutos")
            except Exception as e:
                st.error(f"❌ Erro: {str(e)}")

# Rodapé
st.markdown("---")
st.markdown("🤖 **Blog Crew Dashboard** | Atualização automática a cada 5 minutos")

# Auto-refresh
st.markdown(
    """
    <script>
        setTimeout(function() {
            window.location.reload();
        }, 300000); // 5 minutos
    </script>
    """,
    unsafe_allow_html=True
)