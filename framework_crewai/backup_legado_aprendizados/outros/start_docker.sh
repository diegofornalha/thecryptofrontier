#!/bin/bash
# Script para iniciar a aplicação Streamlit e Redis via Docker

# Verificar se o arquivo .env existe
if [ -f .env ]; then
    echo "Arquivo .env encontrado"
else
    echo "Arquivo .env não encontrado. Certifique-se de criar um com as variáveis necessárias:"
    echo "GEMINI_API_KEY=sua_chave_api"
    echo "SANITY_PROJECT_ID=seu_id_projeto"
    echo "SANITY_API_TOKEN=seu_token_api"
    exit 1
fi

# As variáveis de ambiente serão carregadas do arquivo .env pelo docker-compose

# Criar diretórios necessários
mkdir -p posts_para_traduzir
mkdir -p posts_traduzidos
mkdir -p posts_formatados
mkdir -p posts_publicados
mkdir -p output/published
mkdir -p output/errors

# Iniciar os contêineres Docker
echo "Iniciando contêineres Docker..."
docker-compose down
docker-compose up -d

echo "Aguardando serviços iniciarem..."
sleep 5

# Verificar status dos contêineres
docker-compose ps

echo ""
echo "Aplicação Streamlit disponível em: http://localhost:8501"
echo "Redis disponível na porta 6381"
echo ""
echo "Para visualizar logs do Streamlit:"
echo "docker-compose logs -f streamlit"
echo ""
echo "Para visualizar logs do processador de fila:"
echo "docker-compose logs -f queue-processor"
echo ""
echo "Para parar os contêineres:"
echo "docker-compose down"