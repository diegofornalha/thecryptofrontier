#!/bin/bash

# Strapi Health Check - Guardian Monitor
# Verifica saúde do sistema continuamente

echo "🛡️ Guardian - Monitoramento de Saúde do Strapi"
echo "============================================="

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# URLs
LOCAL_URL="http://localhost:1337"
PUBLIC_URL="https://ale-blog.agentesintegrados.com"

# Função para checar URL
check_url() {
    local url=$1
    local name=$2
    
    if curl -s -f -o /dev/null "$url"; then
        echo -e "${GREEN}✓ $name está respondendo${NC}"
        return 0
    else
        echo -e "${RED}✗ $name não está respondendo${NC}"
        return 1
    fi
}

# Função para checar API
check_api() {
    local endpoint=$1
    local name=$2
    
    response=$(curl -s -w "\n%{http_code}" "$PUBLIC_URL/api/$endpoint")
    http_code=$(echo "$response" | tail -n1)
    
    if [ "$http_code" = "200" ]; then
        echo -e "${GREEN}✓ API $name: OK (200)${NC}"
    elif [ "$http_code" = "403" ]; then
        echo -e "${YELLOW}⚠ API $name: Bloqueada (403) - Permissões não configuradas${NC}"
    elif [ "$http_code" = "404" ]; then
        echo -e "${RED}✗ API $name: Não encontrada (404)${NC}"
    else
        echo -e "${RED}✗ API $name: Erro ($http_code)${NC}"
    fi
}

# 1. Checar Docker
echo -e "\n${BLUE}1. Status do Docker:${NC}"
if docker ps | grep -q strapi-cms; then
    echo -e "${GREEN}✓ Container Strapi rodando${NC}"
    docker ps | grep strapi | awk '{print "   ID: " $1 " | Status: " $5 " " $6 " " $7}'
else
    echo -e "${RED}✗ Container Strapi não está rodando${NC}"
fi

if docker ps | grep -q strapi-postgres; then
    echo -e "${GREEN}✓ Container PostgreSQL rodando${NC}"
else
    echo -e "${RED}✗ Container PostgreSQL não está rodando${NC}"
fi

# 2. Checar URLs
echo -e "\n${BLUE}2. Conectividade:${NC}"
check_url "$LOCAL_URL" "Strapi Local"
check_url "$PUBLIC_URL" "Strapi Público"
check_url "$PUBLIC_URL/admin" "Admin Panel"

# 3. Checar APIs
echo -e "\n${BLUE}3. Status das APIs:${NC}"
check_api "posts" "Posts"
check_api "authors" "Authors"
check_api "pages" "Pages"

# 4. Uso de recursos
echo -e "\n${BLUE}4. Uso de Recursos:${NC}"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}" | grep -E "(CONTAINER|strapi)"

# 5. Logs recentes
echo -e "\n${BLUE}5. Últimos logs (erros):${NC}"
docker logs strapi-cms --tail 20 2>&1 | grep -i error || echo -e "${GREEN}✓ Nenhum erro recente${NC}"

# 6. Espaço em disco
echo -e "\n${BLUE}6. Espaço em Disco:${NC}"
df -h | grep -E "(Filesystem|/$)" | awk '{print $1 "\t" $2 "\t" $3 "\t" $4 "\t" $5}'

# Resumo
echo -e "\n${BLUE}=============================================${NC}"
echo -e "${BLUE}Resumo da Saúde:${NC}"

health_score=0
total_checks=6

# Calcular score
docker ps | grep -q strapi-cms && ((health_score++))
docker ps | grep -q strapi-postgres && ((health_score++))
curl -s -f -o /dev/null "$PUBLIC_URL" && ((health_score++))
curl -s -f -o /dev/null "$PUBLIC_URL/admin" && ((health_score++))
[ "$(curl -s -o /dev/null -w "%{http_code}" "$PUBLIC_URL/api/posts")" != "500" ] && ((health_score++))
[ "$(docker logs strapi-cms --tail 20 2>&1 | grep -i error | wc -l)" -eq 0 ] && ((health_score++))

percentage=$((health_score * 100 / total_checks))

if [ $percentage -ge 80 ]; then
    echo -e "${GREEN}Sistema saudável: $percentage%${NC}"
elif [ $percentage -ge 60 ]; then
    echo -e "${YELLOW}Sistema parcialmente saudável: $percentage%${NC}"
else
    echo -e "${RED}Sistema com problemas: $percentage%${NC}"
fi

echo -e "${BLUE}=============================================${NC}"
echo "Guardian finalizado às $(date '+%H:%M:%S')"