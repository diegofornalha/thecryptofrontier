#!/bin/bash

# Script para testar o webhook do Strapi
# Testa tanto localmente quanto pela URL pública

echo "=== Teste do Webhook CrewAI ==="
echo "Timestamp: $(date)"
echo ""

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Variáveis
WEBHOOK_URL="https://webhook-crewai.agentesintegrados.com"
LOCAL_URL="http://localhost:8002"
SECRET="crew-ai-webhook-secret-2025"

# Função para testar endpoint
test_endpoint() {
    local url=$1
    local endpoint=$2
    local method=${3:-GET}
    
    echo -e "${YELLOW}Testando $method $url$endpoint${NC}"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\nHTTP_CODE:%{http_code}" "$url$endpoint")
    else
        response=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST "$url$endpoint" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $SECRET" \
            -H "X-Strapi-Event: test.webhook" \
            -d '{"event": "test.webhook", "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}')
    fi
    
    http_code=$(echo "$response" | grep -o "HTTP_CODE:[0-9]*" | cut -d: -f2)
    body=$(echo "$response" | sed '/HTTP_CODE:/d')
    
    if [ "$http_code" = "200" ]; then
        echo -e "${GREEN}✓ Status: $http_code${NC}"
        echo "$body" | python3 -m json.tool 2>/dev/null || echo "$body"
    else
        echo -e "${RED}✗ Status: $http_code${NC}"
        echo "$body"
    fi
    echo ""
}

# 1. Verificar se o container está rodando
echo -e "${YELLOW}1. Status do Container${NC}"
container_status=$(docker ps --filter "name=crewai-webhook-server" --format "table {{.Names}}\t{{.Status}}")
if [ -n "$container_status" ]; then
    echo -e "${GREEN}✓ Container está rodando${NC}"
    echo "$container_status"
else
    echo -e "${RED}✗ Container não está rodando${NC}"
    exit 1
fi
echo ""

# 2. Testar endpoint de saúde local
echo -e "${YELLOW}2. Teste Local (porta 8002)${NC}"
test_endpoint "$LOCAL_URL" "/"
test_endpoint "$LOCAL_URL" "/health"

# 3. Testar endpoint público
echo -e "${YELLOW}3. Teste Público (webhook-crewai.agentesintegrados.com)${NC}"
test_endpoint "$WEBHOOK_URL" "/"
test_endpoint "$WEBHOOK_URL" "/health"

# 4. Ver eventos recebidos
echo -e "${YELLOW}4. Eventos Recebidos${NC}"
test_endpoint "$WEBHOOK_URL" "/webhook/events"

# 5. Enviar webhook de teste
echo -e "${YELLOW}5. Enviando Webhook de Teste${NC}"
test_endpoint "$WEBHOOK_URL" "/webhook/test" "POST"

# 6. Simular webhook do Strapi
echo -e "${YELLOW}6. Simulando Webhook do Strapi${NC}"
strapi_payload='{
  "event": "entry.create",
  "createdAt": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'",
  "model": "post",
  "uid": "api::post.post",
  "entry": {
    "id": 999,
    "documentId": "test-document-id",
    "title": "Post de Teste via Script",
    "slug": "post-teste-script",
    "content": "Este é um post de teste enviado via script",
    "publishedAt": null,
    "status": "draft"
  }
}'

echo "Enviando payload do Strapi..."
response=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST "$WEBHOOK_URL/webhook/strapi" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $SECRET" \
    -H "X-Strapi-Event: entry.create" \
    -d "$strapi_payload")

http_code=$(echo "$response" | grep -o "HTTP_CODE:[0-9]*" | cut -d: -f2)
body=$(echo "$response" | sed '/HTTP_CODE:/d')

if [ "$http_code" = "200" ]; then
    echo -e "${GREEN}✓ Webhook processado com sucesso (Status: $http_code)${NC}"
    echo "$body" | python3 -m json.tool
else
    echo -e "${RED}✗ Erro no webhook (Status: $http_code)${NC}"
    echo "$body"
fi

echo ""
echo -e "${YELLOW}7. Verificando logs do container${NC}"
echo "Últimas 10 linhas de log:"
docker logs crewai-webhook-server --tail 10

echo ""
echo "=== Teste concluído ==="