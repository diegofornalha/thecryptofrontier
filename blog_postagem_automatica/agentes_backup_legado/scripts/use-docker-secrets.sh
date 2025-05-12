#!/bin/bash

# Script para demonstrar como usar Docker Secrets em contêineres

# Para iniciar o Docker Swarm (necessário para Docker Secrets)
echo "Iniciando Docker Swarm (se ainda não estiver inicializado)"
docker swarm init --advertise-addr 127.0.0.1 2>/dev/null || echo "Swarm já inicializado"

# Criar secrets a partir dos arquivos
echo "Criando Docker Secrets a partir dos arquivos"
docker secret create caddy_api_token secrets/caddy_api_token.txt 2>/dev/null || echo "Secret caddy_api_token já existe"
docker secret create frontier_api_key secrets/frontier_api_key.txt 2>/dev/null || echo "Secret frontier_api_key já existe"
docker secret create db_password secrets/db_password.txt 2>/dev/null || echo "Secret db_password já existe"
docker secret create tenant2_api_key secrets/tenant2_api_key.txt 2>/dev/null || echo "Secret tenant2_api_key já existe"

# Listar os secrets criados
echo -e "\nLista de Docker Secrets disponíveis:"
docker secret ls

# Como acessar os secrets dentro dos contêineres
echo -e "\nDentro dos contêineres, você pode acessar os secrets assim:"
echo "cat /run/secrets/caddy_api_token      # Para ler o token da API do Caddy"
echo "cat /run/secrets/frontier_api_key     # Para ler a chave da API do Frontier"
echo "cat /run/secrets/db_password          # Para ler a senha do banco de dados"
echo "cat /run/secrets/tenant2_api_key      # Para ler a chave da API do Tenant 2"

echo -e "\nEm aplicações Node.js, você pode acessar os secrets assim:"
echo "const fs = require('fs');"
echo "const caddyApiToken = fs.readFileSync('/run/secrets/caddy_api_token', 'utf8');"

echo -e "\nDeploy dos serviços com Docker Stack:"
echo "docker stack deploy -c docker-compose.yml cryptofrontier" 