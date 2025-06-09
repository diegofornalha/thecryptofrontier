#!/usr/bin/env python3
"""
Streamlit App para executar diferentes pipelines de blog
"""

import streamlit as st
import subprocess
import os
import sys
import json
from pathlib import Path
from datetime import datetime
import time

# Adicionar diretório ao path
sys.path.append(str(Path(__file__).parent))

# Configuração da página
st.set_page_config(
    page_title="Blog Crypto Pipeline Manager",
    page_icon="🚀",
    layout="wide"
)

# Título principal
st.title("🚀 Blog Crypto Pipeline Manager")
st.markdown("---")

# Sidebar com informações
with st.sidebar:
    st.header("ℹ️ Informações")
    st.info("""
    **Próxima execução do cron:**
    17:00 UTC (20:00 São Paulo)
    
    **Pipeline atual no cron:**
    simple_pipeline.py
    """)
    
    # Verificar variáveis de ambiente
    st.header("🔧 Status do Ambiente")
    env_vars = {
        "GOOGLE_API_KEY": "Google Gemini (Tradução)",
        "OPENAI_API_KEY": "OpenAI (Imagens)",
        "SANITY_PROJECT_ID": "Sanity (CMS)",
        "SANITY_API_TOKEN": "Sanity (Auth)"
    }
    
    all_configured = True
    for var, desc in env_vars.items():
        if os.environ.get(var):
            st.success(f"✅ {desc}")
        else:
            st.error(f"❌ {desc}")
            all_configured = False

# Opções de pipeline
st.header("📋 Escolha o Pipeline")

# Criar 3 colunas para os 3 pipelines
col1, col2, col3 = st.columns(3)

with col1:
    st.subheader("1️⃣ Pipeline CrewAI Original")
    st.markdown("""
    **Arquivo:** `run_pipeline.py`
    - ✅ Usa agentes inteligentes
    - ✅ Estrutura modular
    - ⚠️ Correção aplicada para salvar arquivos
    """)
    if st.button("🚀 Executar CrewAI Original", key="crewai"):
        pipeline_choice = "crewai"
    
    st.subheader("2️⃣ Pipeline Enhanced")
    st.markdown("""
    **Arquivo:** `run_pipeline_enhanced.py`
    - ✅ Cache de imagens
    - ✅ Processamento paralelo
    - ✅ Retry automático
    - ❌ Precisa dependências extras
    """)
    if st.button("⚡ Executar Enhanced", key="enhanced"):
        pipeline_choice = "enhanced"

with col3:
    st.subheader("3️⃣ Pipeline Simplificado")
    st.markdown("""
    **Arquivo:** `simple_pipeline.py`
    - ✅ Código direto e simples
    - ✅ Menos dependências
    - ✅ Mais confiável
    - ⭐ **Recomendado**
    """)
    if st.button("🎯 Executar Simplificado", key="simple", type="primary"):
        pipeline_choice = "simple"

# Configurações de execução
st.markdown("---")
st.header("⚙️ Configurações")

col_config1, col_config2, col_config3 = st.columns(3)

with col_config1:
    article_limit = st.number_input(
        "Número de artigos",
        min_value=1,
        max_value=10,
        value=3,
        help="Quantos artigos processar"
    )

with col_config2:
    verbose = st.checkbox(
        "Modo detalhado",
        value=True,
        help="Mostrar logs detalhados"
    )

with col_config3:
    dry_run = st.checkbox(
        "Modo teste",
        value=False,
        help="Simular execução sem publicar"
    )

# Área de execução
st.markdown("---")

# Container para logs
log_container = st.container()

# Função para executar pipeline
def run_pipeline(pipeline_type, limit, verbose, dry_run):
    """Executa o pipeline selecionado"""
    
    # Preparar comando baseado no tipo
    commands = {
        "crewai": ["python", "run_pipeline.py", "--limit", str(limit)],
        "enhanced": ["python", "run_pipeline_enhanced.py", "--limit", str(limit)],
        "simple": ["python", "simple_pipeline.py"]
    }
    
    if pipeline_type not in commands:
        st.error("Pipeline não reconhecido!")
        return
    
    cmd = commands[pipeline_type]
    
    # Adicionar flags
    if verbose and pipeline_type in ["crewai", "enhanced"]:
        cmd.append("--verbose")
    
    # Configurar ambiente
    env = os.environ.copy()
    env["ARTICLE_LIMIT"] = str(limit)
    
    if dry_run:
        env["DRY_RUN"] = "1"
        st.warning("🔧 Modo teste ativado - nada será publicado")
    
    # Ativar ambiente virtual
    venv_path = Path(__file__).parent / "venv"
    if venv_path.exists():
        if sys.platform == "win32":
            env["PATH"] = str(venv_path / "Scripts") + ";" + env.get("PATH", "")
        else:
            env["PATH"] = str(venv_path / "bin") + ":" + env.get("PATH", "")
    
    # Executar
    with st.spinner(f"🔄 Executando {pipeline_type} pipeline..."):
        try:
            # Criar arquivo de log temporário
            log_file = f"pipeline_run_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log"
            
            # Progress bar
            progress_bar = st.progress(0)
            status_text = st.empty()
            
            # Executar processo
            process = subprocess.Popen(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                env=env,
                cwd=Path(__file__).parent
            )
            
            # Container para logs em tempo real
            log_lines = []
            log_display = st.empty()
            
            # Ler saída em tempo real
            while True:
                line = process.stdout.readline()
                if line:
                    log_lines.append(line.strip())
                    
                    # Atualizar display (últimas 20 linhas)
                    log_display.code('\n'.join(log_lines[-20:]), language="text")
                    
                    # Atualizar progresso baseado em palavras-chave
                    if "RSS" in line or "feed" in line.lower():
                        progress_bar.progress(0.2)
                        status_text.text("📡 Lendo feeds RSS...")
                    elif "traduz" in line.lower() or "translat" in line.lower():
                        progress_bar.progress(0.4)
                        status_text.text("🌐 Traduzindo artigos...")
                    elif "imagem" in line.lower() or "image" in line.lower():
                        progress_bar.progress(0.6)
                        status_text.text("🎨 Gerando imagens...")
                    elif "public" in line.lower() or "sanity" in line.lower():
                        progress_bar.progress(0.8)
                        status_text.text("📤 Publicando no Sanity...")
                    elif "conclu" in line.lower() or "complete" in line.lower():
                        progress_bar.progress(1.0)
                        status_text.text("✅ Pipeline concluído!")
                
                # Verificar se processo terminou
                if process.poll() is not None:
                    break
            
            # Pegar código de saída
            return_code = process.wait()
            
            # Salvar log completo
            with open(log_file, 'w') as f:
                f.write('\n'.join(log_lines))
            
            if return_code == 0:
                st.success(f"✅ Pipeline executado com sucesso! Log salvo em: {log_file}")
                
                # Mostrar estatísticas
                st.subheader("📊 Estatísticas")
                col_stat1, col_stat2, col_stat3 = st.columns(3)
                
                # Contar arquivos processados
                posts_dirs = {
                    "posts_para_traduzir": "📥 Coletados",
                    "posts_traduzidos": "🌐 Traduzidos",
                    "posts_formatados": "📝 Formatados",
                    "posts_publicados": "✅ Publicados"
                }
                
                for dir_name, label in posts_dirs.items():
                    dir_path = Path(dir_name)
                    if dir_path.exists():
                        count = len(list(dir_path.glob("*.json")))
                        if "Coletados" in label:
                            col_stat1.metric(label, count)
                        elif "Traduzidos" in label:
                            col_stat2.metric(label, count)
                        elif "Publicados" in label:
                            col_stat3.metric(label, count)
                
            else:
                st.error(f"❌ Pipeline falhou com código: {return_code}")
                
        except Exception as e:
            st.error(f"❌ Erro ao executar pipeline: {str(e)}")

# Executar se algum botão foi clicado
if 'pipeline_choice' in locals():
    if not all_configured:
        st.error("⚠️ Configure todas as variáveis de ambiente antes de executar!")
    else:
        run_pipeline(pipeline_choice, article_limit, verbose, dry_run)

# Área de logs históricos
st.markdown("---")
st.header("📜 Logs Históricos")

# Listar logs disponíveis
log_files = sorted(Path.cwd().glob("pipeline*.log"), reverse=True)[:10]

if log_files:
    selected_log = st.selectbox(
        "Selecione um arquivo de log",
        options=log_files,
        format_func=lambda x: f"{x.name} - {datetime.fromtimestamp(x.stat().st_mtime).strftime('%d/%m/%Y %H:%M')}"
    )
    
    if st.button("📖 Ver log selecionado"):
        with open(selected_log, 'r') as f:
            log_content = f.read()
            st.code(log_content[-5000:], language="text")  # Últimas 5000 caracteres
else:
    st.info("Nenhum arquivo de log encontrado")

# Footer
st.markdown("---")
st.caption("🤖 Blog Crypto Pipeline Manager v1.0 | Desenvolvido com Streamlit")