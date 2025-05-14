#!/bin/bash

echo "Testando conectividade dos serviços..."
echo "----------------------------------------"

echo "1. Testando conexão direta ao Streamlit (porta 8501)..."
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8501

echo "2. Testando conexão via Caddy ao Streamlit (porta 8080/streamlit)..."
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8080/streamlit

echo "3. Testando conexão via Caddy à raiz (deve redirecionar para /streamlit)..."
curl -s -o /dev/null -L -w "%{http_code}\n" http://localhost:8080/

echo "4. Verificando status dos contêineres..."
docker-compose ps

echo "----------------------------------------"
echo "Testes concluídos!"