#!/bin/bash

# Script de deploy do Strapi v5 para produção
# Uso: ./deploy-strapi-v5.sh

set -e

echo "🚀 Deploy do Strapi v5 para produção"
echo "======================================"

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Diretório do projeto
PROJECT_DIR="/home/strapi/thecryptofrontier/strapi-v5-fresh"

# Função para verificar se comando foi executado com sucesso
check_status() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ $1${NC}"
    else
        echo -e "${RED}✗ $1 falhou${NC}"
        exit 1
    fi
}

# Navegar para o diretório do projeto
cd "$PROJECT_DIR"
check_status "Navegação para diretório do projeto"

# 1. Fazer backup antes do deploy
echo -e "\n${YELLOW}1. Criando backup de segurança...${NC}"
if [ -f "../scripts/strapi-backup.sh" ]; then
    bash ../scripts/strapi-backup.sh
    check_status "Backup criado"
else
    echo -e "${YELLOW}Aviso: Script de backup não encontrado${NC}"
fi

# 2. Parar containers existentes
echo -e "\n${YELLOW}2. Parando containers existentes...${NC}"
docker compose down
check_status "Containers parados"

# 3. Fazer pull das últimas alterações (se estiver usando git)
if [ -d ".git" ]; then
    echo -e "\n${YELLOW}3. Atualizando código do repositório...${NC}"
    git pull origin main || true
fi

# 4. Construir nova imagem
echo -e "\n${YELLOW}4. Construindo nova imagem Docker...${NC}"
docker compose build --no-cache
check_status "Imagem Docker construída"

# 5. Iniciar containers em modo produção
echo -e "\n${YELLOW}5. Iniciando containers em modo produção...${NC}"
NODE_ENV=production docker compose up -d
check_status "Containers iniciados"

# 6. Aguardar Strapi inicializar
echo -e "\n${YELLOW}6. Aguardando Strapi inicializar...${NC}"
sleep 10

# 7. Verificar se Strapi está rodando
echo -e "\n${YELLOW}7. Verificando status do Strapi...${NC}"
if docker exec strapi-v5 curl -f http://localhost:1337/_health >/dev/null 2>&1; then
    check_status "Strapi está rodando"
else
    echo -e "${RED}Strapi não está respondendo${NC}"
    echo "Logs do container:"
    docker logs strapi-v5 --tail 50
    exit 1
fi

# 8. Executar migrações se necessário
echo -e "\n${YELLOW}8. Verificando migrações do banco de dados...${NC}"
docker exec strapi-v5 npm run strapi migrate:run || true

# 9. Limpar recursos não utilizados
echo -e "\n${YELLOW}9. Limpando recursos Docker não utilizados...${NC}"
docker system prune -f
check_status "Limpeza concluída"

# 10. Mostrar informações do deploy
echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}✓ Deploy concluído com sucesso!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Informações do deploy:"
echo "- URL Admin: http://localhost:1338/admin"
echo "- Porta: 1338"
echo "- Ambiente: production"
echo ""
echo "Containers rodando:"
docker ps | grep strapi

echo -e "\n${YELLOW}Dica: Para verificar os logs, use:${NC}"
echo "docker logs strapi-v5 -f"