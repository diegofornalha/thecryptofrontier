#!/bin/bash
# Sistema Unificado de Monitoramento
# Criado: 2025-06-16

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# URLs dos serviços
FRONTEND_URL="http://localhost:3300"
STRAPI_URL="http://localhost:1337/admin"
GUARDIAN_URL="http://localhost:3003/health"
MEM0_URL="http://localhost:3002/health"
WEBHOOK_URL="http://localhost:8000/health"
DASHBOARD_URL="http://localhost:5000"

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}       Sistema Unificado de Monitoramento - The Crypto Frontier${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Função para verificar serviço
check_service() {
    local name=$1
    local url=$2
    local response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)
    
    if [ "$response" = "200" ] || [ "$response" = "301" ] || [ "$response" = "302" ]; then
        echo -e "${GREEN}✓${NC} $name: ${GREEN}Online${NC} (HTTP $response)"
    else
        echo -e "${RED}✗${NC} $name: ${RED}Offline${NC} (HTTP $response)"
    fi
}

# Verificar Docker
echo -e "${YELLOW}🐳 Docker Status${NC}"
echo "─────────────────────────────────────"
docker_count=$(docker ps -q | wc -l)
echo -e "Containers rodando: ${GREEN}$docker_count${NC}"
echo ""

# Verificar serviços principais
echo -e "${YELLOW}🌐 Serviços Principais${NC}"
echo "─────────────────────────────────────"
check_service "Frontend" "$FRONTEND_URL"
check_service "Strapi Admin" "$STRAPI_URL"
check_service "Guardian API" "$GUARDIAN_URL"
check_service "Memory Service" "$MEM0_URL"
check_service "Webhook Server" "$WEBHOOK_URL"
check_service "Dashboard" "$DASHBOARD_URL"
echo ""

# Verificar uso de recursos
echo -e "${YELLOW}💻 Recursos do Sistema${NC}"
echo "─────────────────────────────────────"
# CPU
cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
echo -e "CPU: ${BLUE}${cpu_usage}%${NC}"

# Memória
mem_total=$(free -h | awk '/^Mem:/ {print $2}')
mem_used=$(free -h | awk '/^Mem:/ {print $3}')
mem_percent=$(free | awk '/^Mem:/ {printf("%.1f", $3/$2 * 100)}')
echo -e "Memória: ${BLUE}$mem_used${NC} / $mem_total (${BLUE}${mem_percent}%${NC})"

# Disco
disk_usage=$(df -h / | awk 'NR==2 {print $5}')
disk_used=$(df -h / | awk 'NR==2 {print $3}')
disk_total=$(df -h / | awk 'NR==2 {print $2}')
echo -e "Disco: ${BLUE}$disk_used${NC} / $disk_total (${BLUE}$disk_usage${NC})"
echo ""

# Verificar logs recentes
echo -e "${YELLOW}📋 Logs Recentes (Últimos 5 min)${NC}"
echo "─────────────────────────────────────"

# Guardian logs
if [ -f "/home/strapi/thecryptofrontier/logs/guardian.log" ]; then
    guardian_errors=$(find /home/strapi/thecryptofrontier/logs/guardian.log -mmin -5 -exec grep -c "ERROR" {} \; 2>/dev/null || echo "0")
    echo -e "Guardian Errors: ${guardian_errors}"
fi

# Container logs com erros
echo -e "\nContainers com erros recentes:"
for container in $(docker ps --format "{{.Names}}"); do
    errors=$(docker logs "$container" 2>&1 | tail -100 | grep -ci "error" || true)
    if [ "$errors" -gt 0 ]; then
        echo -e "  ${RED}⚠${NC} $container: $errors erros"
    fi
done
echo ""

# Status do banco de dados
echo -e "${YELLOW}🗄️ Status do Banco de Dados${NC}"
echo "─────────────────────────────────────"
if docker exec thecryptofrontier-postgres pg_isready &>/dev/null; then
    echo -e "PostgreSQL: ${GREEN}Operacional${NC}"
    
    # Contar posts
    post_count=$(docker exec thecryptofrontier-postgres psql -U strapi -d strapi -t -c "SELECT COUNT(*) FROM posts;" 2>/dev/null || echo "N/A")
    echo -e "Total de posts: ${BLUE}${post_count// /}${NC}"
else
    echo -e "PostgreSQL: ${RED}Offline${NC}"
fi
echo ""

# Memórias do sistema
echo -e "${YELLOW}🧠 Sistema de Memória${NC}"
echo "─────────────────────────────────────"
mem0_stats=$(curl -s http://localhost:3002/stats 2>/dev/null | jq -r '.total_memories // "N/A"' || echo "N/A")
echo -e "Total de memórias: ${BLUE}$mem0_stats${NC}"
echo ""

# Resumo final
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}📊 Resumo${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

# Calcular status geral
online_services=0
total_services=6

for url in "$FRONTEND_URL" "$STRAPI_URL" "$GUARDIAN_URL" "$MEM0_URL" "$WEBHOOK_URL" "$DASHBOARD_URL"; do
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)
    if [ "$response" = "200" ] || [ "$response" = "301" ] || [ "$response" = "302" ]; then
        ((online_services++))
    fi
done

health_percent=$((online_services * 100 / total_services))

if [ $health_percent -ge 80 ]; then
    echo -e "Saúde do Sistema: ${GREEN}$health_percent%${NC} ✨"
elif [ $health_percent -ge 60 ]; then
    echo -e "Saúde do Sistema: ${YELLOW}$health_percent%${NC} ⚠️"
else
    echo -e "Saúde do Sistema: ${RED}$health_percent%${NC} 🚨"
fi

echo -e "Serviços Online: $online_services/$total_services"
echo ""
echo -e "${BLUE}Última verificação: $(date '+%Y-%m-%d %H:%M:%S')${NC}"