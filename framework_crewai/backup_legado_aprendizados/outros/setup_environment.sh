#!/bin/bash

# Script de configuração para o sistema de automação de blog
# Este script instala as dependências e configura o ambiente

set -e # Parar em caso de erro

echo "🚀 Configurando ambiente para sistema de automação de blog"

# Verificar python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 não encontrado. Por favor instale o Python 3.8 ou superior."
    exit 1
fi

PYTHON_VERSION=$(python3 -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')
if (( $(echo "$PYTHON_VERSION < 3.8" | bc -l) )); then
    echo "❌ Python 3.8 ou superior é necessário. Versão detectada: $PYTHON_VERSION"
    exit 1
fi

echo "✅ Python versão $PYTHON_VERSION encontrado"

# Verificar Redis
REDIS_INSTALLED=false
if command -v redis-cli &> /dev/null; then
    if redis-cli ping &> /dev/null; then
        echo "✅ Redis encontrado e funcionando"
        REDIS_INSTALLED=true
    else
        echo "⚠️ Redis instalado mas não está em execução"
    fi
else
    echo "⚠️ Redis não encontrado. Recomendamos instalar o Redis para funcionalidade completa."
    echo "  Você pode instalar o Redis com: sudo apt-get install redis-server (Ubuntu/Debian)"
    echo "  ou: brew install redis (macOS)"
fi

# Criar ambiente virtual
echo "🔄 Criando ambiente virtual..."
if [ -d "venv" ]; then
    echo "⚠️ Ambiente virtual existente encontrado. Deseja recriar? (s/N)"
    read -r response
    if [[ "$response" =~ ^([sS]|[sS][iI][mM])$ ]]; then
        rm -rf venv
        python3 -m venv venv
        echo "✅ Ambiente virtual recriado"
    else
        echo "🔄 Usando ambiente virtual existente"
    fi
else
    python3 -m venv venv
    echo "✅ Ambiente virtual criado"
fi

# Ativar ambiente virtual
echo "🔄 Ativando ambiente virtual..."
source venv/bin/activate

# Instalar dependências
echo "🔄 Instalando dependências..."
pip install --upgrade pip
pip install -r requirements.txt

# Se o Redis não está instalado, instalar redis-py com modo de simulação
if [ "$REDIS_INSTALLED" = false ]; then
    echo "🔄 Instalando redis-py com suporte a modo de simulação..."
    pip install fakeredis
fi

# Verificar variáveis de ambiente
echo "🔄 Verificando variáveis de ambiente..."
ENV_FILE=".env"
if [ ! -f "$ENV_FILE" ]; then
    echo "⚠️ Arquivo .env não encontrado. Criando um modelo..."
    cat > "$ENV_FILE" << EOL
# Variáveis de ambiente para o sistema de automação de blog

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
# REDIS_PASSWORD=sua_senha_redis

# Sanity CMS
# SANITY_PROJECT_ID=seu_id_do_projeto
# SANITY_API_TOKEN=seu_token_api

# LLM - Google Gemini Pro
# GEMINI_API_KEY=sua_chave_api_gemini
EOL
    echo "✅ Arquivo .env criado"
    echo "⚠️ Por favor, edite o arquivo .env e configure as variáveis necessárias"
else
    echo "✅ Arquivo .env encontrado"
fi

# Criar diretórios de saída
echo "🔄 Criando diretórios de dados..."
mkdir -p output/published
mkdir -p output/errors
mkdir -p output/pending
mkdir -p posts_para_traduzir
mkdir -p posts_traduzidos
mkdir -p posts_formatados
mkdir -p posts_publicados
mkdir -p logs

# Verificar se o Gemini está configurado
if grep -q "GEMINI_API_KEY=" "$ENV_FILE" && ! grep -q "GEMINI_API_KEY=sua_chave_api_gemini" "$ENV_FILE"; then
    echo "✅ API Key do Gemini encontrada"
else
    echo "⚠️ GEMINI_API_KEY não configurada no arquivo .env."
    echo "  Você precisará dessa chave para que o CrewAI funcione corretamente."
    echo "  Obtenha uma em: https://ai.google.dev/"
fi

# Testar conexão Redis
if [ "$REDIS_INSTALLED" = true ]; then
    echo "🔄 Testando conexão com Redis..."
    if python -c "from redis_tools import redis_client; print('REDIS OK' if redis_client and redis_client.ping() else 'REDIS ERROR')"; then
        echo "✅ Conexão com Redis funcionando"
    else
        echo "❌ Erro ao conectar com Redis. Verifique as configurações no arquivo .env"
    fi
fi

echo "
🎉 Configuração concluída!

Para iniciar:
1. Ative o ambiente virtual: source venv/bin/activate
2. Adicione artigos à fila: python enqueue_demo_article.py
3. Processe a fila: python process_article_queue.py

Para mais informações, consulte o README.md
"